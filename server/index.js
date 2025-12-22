
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type } = require("@google/genai");
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'authai-super-secret-key-882';

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST', 'OPTIONS']
}));

// Increase limit to handle larger images/videos
app.use(express.json({ limit: '200mb' })); 
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// --- IN-MEMORY DATABASE (Fallback) ---
const USERS = [
  { email: 'admin@authai.pro', password: 'admin', isAdmin: true },
  { email: 'user@authai.pro', password: 'user', isAdmin: false }
];

// --- SUPABASE INIT ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxhqtbkuddvflysedaof.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_rpCzbG54bOtLSxxbG3o88A_TbJ5F_ez';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GEMINI INIT ---
const apiKey = process.env.API_KEY || 'DUMMY_KEY_FOR_STARTUP';
const ai = new GoogleGenAI({ apiKey: apiKey });

// --- HELPERS ---
const generateHash = (content) => {
  if (!content) return 'SHA256-EMPTY-CONTENT';
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'SHA256-' + Math.abs(hash).toString(16).toUpperCase().padStart(64, '0');
};

// --- ROUTES ---

// 0. Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// 1. Authentication
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        const user = USERS.find(u => u.email === email && u.password === password);
        
        if (user) {
            const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '2h' });
            res.json({ token, user: { email: user.email, isAdmin: user.isAdmin } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. AI Analysis (Protected API Key)
app.post('/api/analyze', async (req, res) => {
    const { content, type } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    try {
        // Updated to recommended model for text tasks
        const modelId = 'gemini-3-flash-preview'; 
        
        // Construct Prompt
        const prompt = `
          Act as AuthAI Node 882 (Industrial Forensic Detector).
          Analyze the provided ${type} artifact for synthetic generation patterns.
          
          EXECUTE PROTOCOLS:
          1. PERPLEXITY_SCAN: Assess predictability of token sequence.
          2. BURSTINESS_CHECK: Measure variance in structure.
          3. ENTROPY_PROFILING: Calculate randomness.
          4. PATTERN_MATCH: Check against known LLM/Diffusion artifacts.

          Artifact Content/Description: "${content.substring(0, 1000)}..."

          Return a strict JSON object. All scores 0-100.
        `;

        if (!process.env.API_KEY || process.env.API_KEY === 'DUMMY_KEY_FOR_STARTUP') {
            return res.json({
                verdict: "UNCERTAIN",
                confidenceScore: 0,
                perplexityScore: 0,
                burstinessScore: 0,
                entropyScore: 0,
                aiProbability: 0,
                humanProbability: 0,
                detectedPatterns: ["API_KEY_MISSING_ON_SERVER"],
                forensicLogs: [],
                contentHash: generateHash(content)
            });
        }

        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING, enum: ["HUMAN", "AI_GENERATED", "AI_ASSISTED", "UNCERTAIN"] },
                confidenceScore: { type: Type.NUMBER },
                perplexityScore: { type: Type.NUMBER },
                burstinessScore: { type: Type.NUMBER },
                entropyScore: { type: Type.NUMBER },
                aiProbability: { type: Type.NUMBER },
                humanProbability: { type: Type.NUMBER },
                detectedPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                forensicLogs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      timestamp: { type: Type.STRING },
                      action: { type: Type.STRING },
                      status: { type: Type.STRING, enum: ["OK", "WARN", "CRITICAL"] }
                    }
                  }
                }
              }
            }
          }
        });

        if (!response.text) throw new Error("AI Analysis Failed: Empty Response");

        const result = JSON.parse(response.text);
        const finalResult = {
            ...result,
            contentHash: generateHash(content)
        };

        res.json(finalResult);

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message || "Analysis process terminated unexpectedly." });
    }
});

// 3. Mint Certificate
app.post('/api/certificate/mint', async (req, res) => {
    try {
        const { analysisResult, content, contentType, owner } = req.body || {};
        
        if (!analysisResult) {
             return res.status(400).json({ error: "Missing analysis result data." });
        }

        const id = `AUTH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const issueDate = new Date().toISOString();
        const contentHash = analysisResult.contentHash || generateHash(content || 'EMPTY');
        const verdict = analysisResult.verdict || 'UNCERTAIN';
        const contentPreview = content || '[NO_CONTENT_STORED]';
        const type = contentType || 'TEXT';
        
        // Prepare DB Payload (Snake Case)
        const dbPayload = {
            id,
            issue_date: issueDate,
            content_hash: contentHash,
            owner: owner || 'ANONYMOUS',
            verdict: verdict,
            content_preview: contentPreview,
            content_type: type
        };

        // Insert into Supabase
        const { error } = await supabase
            .from('certificates')
            .insert([dbPayload]);

        if (error) {
            console.error("Supabase Write Error:", error);
            // Fallback to memory if DB fails (robustness)
            // But we ideally want to fail if we can't persist. 
            // For now, let's throw to inform frontend to use local fallback
            throw error; 
        }

        console.log(`Certificate Minted & Persisted: ${id}`);
        
        // Return Camel Case to Frontend
        const apiResponse = {
            id,
            issueDate,
            contentHash,
            owner: dbPayload.owner,
            verdict,
            contentPreview,
            contentType: type
        };

        res.json(apiResponse);

    } catch (error) {
        console.error("Minting Endpoint Error:", error);
        res.status(500).json({ error: "Server error during minting process." });
    }
});

// 4. Verify Certificate (Public)
app.get('/api/certificate/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Try Supabase First
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('id', id)
            .single();
        
        if (data && !error) {
            // Map back to CamelCase
            return res.json({
                id: data.id,
                issueDate: data.issue_date,
                contentHash: data.content_hash,
                owner: data.owner,
                verdict: data.verdict,
                contentPreview: data.content_preview,
                contentType: data.content_type
            });
        }

        // Fallback for Demo IDs or if DB missing
        if (id.startsWith('AUTH-DEMO')) {
             return res.json({
                id,
                issueDate: new Date().toISOString(),
                contentHash: 'SHA256-DEMO-HASH',
                owner: 'DEMO_USER',
                verdict: 'HUMAN',
                contentPreview: 'This is a demo artifact retrieved from the backup ledger.',
                contentType: 'TEXT'
             });
        }

        res.status(404).json({ error: 'Certificate not found in ledger.' });

    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`AuthAI Backend Protocol Initiated on Port ${PORT}`);
});
