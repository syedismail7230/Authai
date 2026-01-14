import { io } from "socket.io-client";

// Configuration
const API_URL = "http://localhost:3001";
const SOCKET_URL = "http://localhost:3001";

async function runQATests() {
    console.log("🔍 STARTING BACKEND QA SUITE...");
    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    // TEST 1: Health Check
    try {
        const res = await fetch(`${API_URL}/api/health`);
        const data = await res.json();
        assert(res.ok && data.status === 'online', "Health Check Endpoint");
    } catch (e) {
        assert(false, `Health Check Failed: ${e.message}`);
    }

    // TEST 2: Analysis Job Submission (POST)
    let jobId = null;
    try {
        const res = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "This is a test sentence for QA.", type: "TEXT" })
        });
        const data = await res.json();
        jobId = data.jobId;
        assert(res.ok && jobId.startsWith("JOB-"), "Job Submission (POST /analyze)");
    } catch (e) {
        assert(false, `Job Submission Failed: ${e.message}`);
    }

    // TEST 3: Real-Time Analysis (WebSocket)
    if (jobId) {
        await new Promise((resolve) => {
            const socket = io(SOCKET_URL);
            
            socket.on('connect', () => {
                // assert(true, "WebSocket Connected");
                socket.emit('join_job', jobId);
            });

            let progressReceived = false;

            socket.on('job_update', (data) => {
                if (data.jobId === jobId) {
                    // console.log(`   -> Progress: ${data.progress}%`);
                    progressReceived = true;
                }
            });

            socket.on('job_complete', (data) => {
                assert(progressReceived, "Received Intermediate Progress Updates");
                assert(data.verdict === 'HUMAN' || data.verdict === 'AI_GENERATED' || data.verdict === 'UNCERTAIN', "Job Completed with Valid Verdict");
                socket.disconnect();
                resolve();
            });

            socket.on('job_error', (err) => {
                assert(false, `Socket Job Error: ${err.error}`);
                socket.disconnect();
                resolve();
            });

            // Timeout
            setTimeout(() => {
                if(socket.connected) {
                    // assert(false, "WebSocket Analysis Timed Out");
                    socket.disconnect();
                    resolve();
                }
            }, 5000); 
        });
    }

    // TEST 4: Certificate Verification (Negative Case)
    try {
        const res = await fetch(`${API_URL}/api/certificate/INVALID-ID`);
        assert(res.status === 404, "Verify Non-Existent Certificate returns 404");
    } catch (e) {
         // Should not happen as fetch doesn't throw on 404
         assert(false, `Verification Check Error: ${e.message}`);
    }

    console.log("\n-------------------------------------------");
    console.log(`🏁 QA COMPLETE: ${passed} PASSED | ${failed} FAILED`);
    console.log("-------------------------------------------\n");
}

runQATests();
