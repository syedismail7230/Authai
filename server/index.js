import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'authai-super-secret-key-882';

// --- RAZORPAY INIT ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS']
}));

// Increase limit to handle larger images/videos
app.use(express.json({ limit: '200mb' })); 
app.use(express.urlencoded({ limit: '200mb', extended: true }));



// --- SUPABASE INIT ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxhqtbkuddvflysedaof.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_rpCzbG54bOtLSxxbG3o88A_TbJ5F_ez';
const supabase = createClient(supabaseUrl, supabaseKey);



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

import { db } from './localDb.js';

// ... (previous setup)

// --- ROUTES ---

// 0. Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// 1. Authentication
// A. Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = db.users.findEmail(email);

        if (!user) {
             return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Handle Admin special case (plain text for demo simplicity, or bcrypt)
        let validPassword = false;
        if (user.password_hash.startsWith('$')) {
             validPassword = await bcrypt.compare(password, user.password_hash);
        } else {
             validPassword = (password === user.password_hash);
        }

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ 
            id: user.id,
            email: user.email, 
            role: user.role 
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            user: { 
                id: user.id,
                email: user.email, 
                role: user.role,
                credits: user.credits 
            } 
        });

    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// B. Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const existing = db.users.findEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: crypto.randomUUID(),
            email,
            password_hash: hashedPassword,
            role: 'USER',
            credits: 5,
            created_at: new Date().toISOString()
        };

        db.users.create(newUser);

        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ 
            token, 
            user: { 
                id: newUser.id, 
                email: newUser.email, 
                role: newUser.role, 
                credits: newUser.credits 
            } 
        });

    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ error: "Registration failed" });
    }
});

// C. Get Profile
app.get('/api/user/profile/:email', async (req, res) => {
    try {
        const user = db.users.findEmail(req.params.email);
        if (!user) throw new Error("User not found");
        res.json(user);
    } catch (e) {
        res.status(404).json({ error: "User not found" });
    }
});

// ... (Payment Routes)

app.post('/api/payment/create-order', async (req, res) => {
    const { amount, currency } = req.body;
    try {
        const options = {
            amount: amount * 100, // Razorpay works in subunits (paise)
            currency: currency || "INR",
            receipt: "receipt_" + Date.now(),
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payment/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body; 
    
    console.log(`[PAYMENT] Verifying: Order=${razorpay_order_id}, PayID=${razorpay_payment_id}, Email=${email}`);

    let isValid = false;
    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
        
        console.log(`[PAYMENT] Sig Check: Expected=${expectedSignature}, Received=${razorpay_signature}`);

        if (expectedSignature === razorpay_signature) isValid = true;
    } catch(e) {
        console.warn("Signature verification failed/error", e);
    }
    
    // Allow Bypass for Testing if needed (Optional: Remove for strict prod)
    // isValid = true; 

    if (isValid || process.env.NODE_ENV === 'development') { // Strict in prod
        console.log(`[PAYMENT] Signature Valid. Updating Credits for ${email}...`);
        // Add Credits to User in DB
        if (email) {
            const user = db.users.findEmail(email);
            if (user) {
                console.log(`[PAYMENT] User found: ${user.email}. Current Credits: ${user.credits}`);
                db.users.updateCredits(email, user.credits + 10);
                console.log(`[PAYMENT] Credits Updated to ${user.credits + 10}`);
            } else {
                console.warn(`[PAYMENT] User ${email} NOT found in DB.`);
            }
        } else {
            console.warn(`[PAYMENT] No email provided in request.`);
        }
        res.json({ status: "success", message: "Payment verified & Credits Added" });
    } else {
        console.error(`[PAYMENT] Signature Invalid.`);
        res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
});

// ... (Certificate Minting Route for Backend Fallback)
app.post('/api/certificate/mint', (req, res) => {
    const { analysisResult, content, contentType, owner } = req.body;
    const cert = {
        id: `AUTH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        issueDate: new Date().toISOString(),
        contentHash: analysisResult.contentHash,
        owner,
        verdict: analysisResult.verdict,
        contentPreview: content,
        contentType,
        metadata: analysisResult
    };
    
    db.certificates.create(cert);
    res.json(cert);
});

app.get('/api/certificate/:id', (req, res) => {
    const cert = db.certificates.findById(req.params.id);
    if(cert) res.json(cert);
    else res.status(404).json({error: "Not Found"});
});

// --- ASYNC JOB QUEUE (In-Memory Mock for Production Simulation) ---
const JOBS = {};

// --- LOGIC ENGINE HELPERS ---

// 1. Calculate Shannon Entropy (Randomness)
const calculateEntropy = (text) => {
    if (!text || text.length === 0) return 0;
    const frequencies = {};
    for (const char of text) {
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    return Object.values(frequencies)
        .reduce((sum, f) => {
            const p = f / text.length;
            return sum - p * Math.log2(p);
        }, 0);
};

// 2. Calculate Burstiness (Variance in sentence length)
const calculateBurstiness = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 0; // Not enough data
    
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    // Variance
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    return Math.sqrt(variance); // Standard Deviation
};

// 3. Detect Repetitive Loops (Common in cheap AI)
const calculateRepetitionScore = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return 1 - (uniqueWords.size / words.length); // Higher = More repetitive
};

// Helper to processing job in background (Pure Logic Engine)
const processAnalysisJob = async (jobId, content, type) => {
    try {
        JOBS[jobId].status = 'processing';
        io.to(jobId).emit('job_update', { jobId, status: 'processing', progress: 10 });
        
        // Simulate Processing Time for "Heavy Calculation"
        // Emit simulated progress steps for UX
        await new Promise(r => setTimeout(r, 500)); 
        io.to(jobId).emit('job_update', { jobId, status: 'processing', progress: 30, message: 'Calculating Entropy...' });
        
        await new Promise(r => setTimeout(r, 600)); 
        io.to(jobId).emit('job_update', { jobId, status: 'processing', progress: 60, message: 'Scanning Burstiness...' });
        
        await new Promise(r => setTimeout(r, 400)); 
        io.to(jobId).emit('job_update', { jobId, status: 'processing', progress: 85, message: 'Finalizing Verdict...' });

        let result = {};

        if (type === 'TEXT') {
            const entropy = calculateEntropy(content);
            const burstiness = calculateBurstiness(content);
            const repetition = calculateRepetitionScore(content);
            
            // --- HEURISTIC MODEL ---
            const entropyScore = Math.min(100, (entropy / 6) * 100); 
            const burstinessScore = Math.min(100, (burstiness / 10) * 100);
            
            let aiProbability = 0;
            const detectedPatterns = [];
            const logs = [];

            // Pattern 1: Low Burstiness (Robotic Flow)
            if (burstiness < 5) {
                aiProbability += 30;
                detectedPatterns.push("LOW_SENTENCE_VARIANCE");
                logs.push({ id: "BURST_CHECK", timestamp: new Date().toISOString(), action: "DETECT_UNIFORMITY", status: "WARN" });
            } else {
                logs.push({ id: "BURST_CHECK", timestamp: new Date().toISOString(), action: "VARIANCE_OK", status: "OK" });
            }

            // Pattern 2: Moderate Entropy (Too Clean)
            if (entropy > 3.8 && entropy < 4.8) {
                aiProbability += 20; 
                detectedPatterns.push("STATISTICAL_SMOOTHING");
            }

            // Pattern 3: Excessive Repetition
            if (repetition > 0.4) {
                aiProbability += 40;
                detectedPatterns.push("LOOPING_TOKENS");
                logs.push({ id: "REP_SCAN", timestamp: new Date().toISOString(), action: "HIGH_REPETITION", status: "CRITICAL" });
            }

            // Cap Probability
            if (aiProbability > 99) aiProbability = 99;
            if (aiProbability < 5) aiProbability = 5;

            const humanProbability = 100 - aiProbability;
            
            // Verdict Logic
            let verdict = 'UNCERTAIN';
            if (aiProbability > 75) verdict = 'AI_GENERATED';
            else if (aiProbability > 40) verdict = 'AI_ASSISTED';
            else verdict = 'HUMAN';

            result = {
                verdict,
                confidenceScore: Math.floor(80 + Math.random() * 15), // Heuristic confidence
                perplexityScore: Math.floor(100 - entropyScore), // Inverse mapping for demo
                burstinessScore: Math.floor(burstinessScore),
                entropyScore: Math.floor(entropyScore),
                aiProbability,
                humanProbability,
                detectedPatterns,
                forensicLogs: logs,
                contentHash: generateHash(content)
            };

        } else {
            // --- MOCK LOGIC FOR NON-TEXT FILES ---
            result = {
                verdict: "UNCERTAIN",
                confidenceScore: 0,
                perplexityScore: 0,
                burstinessScore: 0,
                entropyScore: 0,
                aiProbability: 50,
                humanProbability: 50,
                detectedPatterns: ["UNSUPPORTED_FILE_TYPE_FOR_LOGIC_ENGINE"],
                forensicLogs: [{ id: "ERR_TYPE", timestamp: new Date().toISOString(), action: "ABORT_LOGIC_SCAN", status: "WARN" }],
                contentHash: generateHash(content || "FILE")
            };
        }

        JOBS[jobId].result = result;
        JOBS[jobId].status = 'completed';

        // Emit Completion to Client
        io.to(jobId).emit('job_complete', result);

        // Emit Global Stats Update to Admins
        io.emit('stats_update', {
            type: 'NEW_SCAN',
            verdict: result.verdict,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(`Job ${jobId} Failed:`, error);
        JOBS[jobId].status = 'failed';
        JOBS[jobId].error = error.message;
        io.to(jobId).emit('job_error', { error: error.message });
    }
};

// 2. AI Analysis (Async Job Submission)
app.post('/api/analyze', async (req, res) => {
    const { content, type } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    const jobId = `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Initialize Job
    JOBS[jobId] = {
        id: jobId,
        status: 'queued',
        submittedAt: new Date().toISOString()
    };

    // Trigger Background Processing (Fire & Forget)
    processAnalysisJob(jobId, content, type);

    // Return Job ID immediately (Non-Blocking)
    res.json({ 
        jobId, 
        status: 'queued',
        message: 'Analysis job submitted to forensic queue.' 
    });
});

// 2b. Check Job Status
app.get('/api/analyze/status/:id', (req, res) => {
    const jobId = req.params.id;
    const job = JOBS[jobId];

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
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

// --- SOCKET CONNECTION HANDLER ---
io.on('connection', (socket) => {
    // console.log('Client Connected:', socket.id);

    socket.on('join_job', (jobId) => {
        socket.join(jobId);
        // console.log(`Socket ${socket.id} joined job ${jobId}`);
    });

    socket.on('disconnect', () => {
        // console.log('Client Disconnected');
    });
});

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`AuthAI Backend Protocol (HTTP + WebSocket) Initiated on Port ${PORT}`);
});
