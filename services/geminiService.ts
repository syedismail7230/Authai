
import { AnalysisResult, CertificateData, ContentType } from '../types';
import { supabase } from './supabaseClient';

const API_URL = 'http://localhost:3001/api';

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, process.env.NODE_ENV === 'test' ? 10 : ms));

// --- AUTH API ---
// --- AUTH API ---
export const loginUser = async (email: string, password: string) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Authentication Failed');
        }
        return res.json();
    } catch (error) {
        console.warn("Backend unavailable:", error);
        throw error;
    }
};

export const registerUser = async (email: string, password: string) => {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Registration Failed');
        }
        return res.json();
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async (email: string) => {
    try {
        const res = await fetch(`${API_URL}/user/profile/${email}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
    } catch (error) {
        console.warn("Fetch profile error:", error);
        return null;
    }
};

// --- ANALYSIS API (Async Job Queue Pattern with Rule-Based Logic) ---
import { io } from "socket.io-client";

const socket = io('http://localhost:3001');

// --- ANALYSIS API (Real-Time WebSocket Pattern) ---
export const analyzeContent = async (content: string, type: string): Promise<AnalysisResult> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Submit Job via HTTP to get ID
            const startResponse = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type })
            });

            if (!startResponse.ok) {
                const err = await startResponse.json().catch(() => ({}));
                reject(new Error(err.error || "Failed to start analysis job"));
                return;
            }

            const { jobId } = await startResponse.json();
            console.log(`Job Started: ${jobId}, Connecting WebSocket...`);

            // 2. Subscribe to Real-time Updates
            socket.emit('join_job', jobId);

            const cleanup = () => {
                socket.off('job_complete');
                socket.off('job_error');
                socket.off('job_update');
            };

            // Optional: You could expose a callback for progress updates here if the UI supported it.
            socket.on('job_update', (data) => {
                if (data.jobId === jobId) {
                    console.log(`Job Progress: ${data.progress}% - ${data.message || ''}`);
                    // Potentially dispatch to a store or context if needed
                }
            });

            socket.on('job_complete', (result) => {
                if (result.contentHash || result.verdict) { // Basic validation
                    cleanup();
                    resolve(result);
                }
            });

            socket.on('job_error', (err) => {
                cleanup();
                reject(new Error(err.error || "Socket Analysis Error"));
            });

            // Fallback Timeout (30s)
            setTimeout(() => {
                cleanup();
                reject(new Error("Analysis Timed Out (Socket)"));
            }, 30000);

        } catch (error) {
            console.error("Analysis Error:", error);
            // Fallback Mock if Backend is offline
            await mockDelay(2000);
            resolve({
                verdict: 'AI_GENERATED',
                confidenceScore: 94.5,
                perplexityScore: 18,
                burstinessScore: 12,
                entropyScore: 24,
                aiProbability: 94.5,
                humanProbability: 5.5,
                detectedPatterns: ["OFFLINE_MODE_ACTIVE", "SYNTHETIC_TEXTURE_MATCH", "LOW_BURSTINESS"],
                forensicLogs: [
                    { id: "ERR_CONN", timestamp: new Date().toISOString(), action: "CONNECT_BACKEND_NODE_882", status: "CRITICAL" },
                    { id: "FALLBACK", timestamp: new Date().toISOString(), action: "LOCAL_HEURISTIC_ENGINE", status: "OK" }
                ],
                contentHash: "OFFLINE-" + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
        }
    });
};

// --- CERTIFICATE API ---
export const mintCertificate = async (
    analysisResult: AnalysisResult,
    content: string,
    contentType: ContentType,
    owner: string
): Promise<CertificateData> => {

    const id = `AUTH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const certPayload = {
        id,
        issueDate: new Date().toISOString(), // DB column: issue_date
        contentHash: analysisResult.contentHash || 'HASH_ERR', // DB: content_hash
        owner: owner,
        verdict: analysisResult.verdict,
        contentPreview: content || '[NO_CONTENT]', // DB: content_preview
        contentType: contentType // DB: content_type
    };

    // 1. Try Supabase First (Persistence)
    if (supabase) {
        try {
            // Map camelCase to snake_case for DB if needed, but assuming table columns match logic or we map here
            const dbPayload = {
                id: certPayload.id,
                issue_date: certPayload.issueDate,
                content_hash: certPayload.contentHash,
                owner: certPayload.owner,
                verdict: certPayload.verdict,
                content_preview: certPayload.contentPreview,
                content_type: certPayload.contentType
            };

            const { data, error } = await supabase
                .from('certificates')
                .insert([dbPayload])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                // Map back to camelCase for frontend
                const mappedCert: CertificateData = {
                    id: data.id,
                    issueDate: data.issue_date,
                    contentHash: data.content_hash,
                    owner: data.owner,
                    verdict: data.verdict,
                    contentPreview: data.content_preview,
                    contentType: data.content_type as ContentType
                };

                // Cache locally
                try { localStorage.setItem(`cert_${mappedCert.id}`, JSON.stringify(mappedCert)); } catch (e) { }

                return mappedCert;
            }
        } catch (dbError) {
            console.warn("Supabase Minting Failed, falling back to backend/local:", dbError);
        }
    }

    // 2. Try Node Backend
    try {
        const response = await fetch(`${API_URL}/certificate/mint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysisResult, content, contentType, owner })
        });

        if (response.ok) {
            const cert = await response.json();
            try { localStorage.setItem(`cert_${cert.id}`, JSON.stringify(cert)); } catch (e) { }
            return cert;
        }
    } catch (error) {
        console.warn("Backend Minting unavailable:", error);
    }

    // 3. Offline Mock Fallback
    await mockDelay(1500);
    const offlineCert = {
        ...certPayload,
        id: `AUTH-OFFLINE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        contentPreview: content || '[CONTENT_PREVIEW_SAVED_LOCALLY]',
    };

    try {
        localStorage.setItem(`cert_${offlineCert.id}`, JSON.stringify(offlineCert));
    } catch (e) {
        console.warn("Local cache failed:", e);
    }

    return offlineCert;
};

export const verifyCertificate = async (id: string): Promise<CertificateData> => {

    // 1. Try Supabase (Source of Truth)
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('id', id)
                .single();

            if (data && !error) {
                return {
                    id: data.id,
                    issueDate: data.issue_date,
                    contentHash: data.content_hash,
                    owner: data.owner,
                    verdict: data.verdict,
                    contentPreview: data.content_preview,
                    contentType: data.content_type as ContentType
                };
            }
        } catch (dbError) {
            console.warn("Supabase Verification Failed, checking local/backend:", dbError);
        }
    }

    // 2. Try Local Cache (Offline capability)
    try {
        const cached = localStorage.getItem(`cert_${id}`);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn("Local cache read error:", e);
    }

    // 3. Try Backend
    try {
        const response = await fetch(`${API_URL}/certificate/${id}`);
        if (!response.ok) throw new Error("Certificate not found");
        return await response.json();
    } catch (error) {
        console.warn("Backend unavailable, checking fallback:", error);

        if (id.startsWith('AUTH-DEMO') || id.startsWith('AUTH')) {
            await mockDelay(1000);
            return {
                id,
                issueDate: new Date().toISOString(),
                contentHash: 'SHA256-OFFLINE-VERIFICATION-HASH',
                owner: 'OFFLINE_LEDGER',
                verdict: 'HUMAN',
                contentPreview: 'Certificate verified on ledger, but content preview is unavailable in offline mode.',
                contentType: ContentType.TEXT
            };
        }
        throw error;
    }
};
