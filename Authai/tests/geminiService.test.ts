import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeContent } from '../services/geminiService';

// 1. Mock Socket.io Client
const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();
const mockDisconnect = vi.fn();

// Mock the socket instance that is created at top-level of service
vi.mock("socket.io-client", () => {
    return {
        io: () => ({
            emit: mockEmit,
            on: mockOn,
            off: mockOff,
            disconnect: mockDisconnect,
            // To simulate server events, we'll expose a helper in the test
            _trigger: (event: string, data: any) => {
                // Find the callback registered for this event
                const call = mockOn.mock.calls.find(call => call[0] === event);
                if (call && call[1]) {
                    call[1](data);
                }
            }
        })
    };
});

// 2. Mock Fetch (for initial POST)
global.fetch = vi.fn();

describe('Forensic Analysis Service (WebSocket Engine)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits a job and waits for socket completion event', async () => {
        const mockJobId = "JOB-SOCKET-TEST";
        const mockResult = {
            verdict: "HUMAN",
            confidenceScore: 98,
            contentHash: "HASH123"
        };

        // A. Mock POST /analyze success
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ jobId: mockJobId })
        });

        // B. Start Analysis
        const analysisPromise = analyzeContent("Test content", "TEXT");

        // C. Simulate Socket Interaction
        // 1. Verify 'join_job' was emitted
        expect(mockEmit).toHaveBeenCalledWith('join_job', mockJobId);

        // 2. Locate the socket instance from our mock factory
        // Since we mocked the module, we can re-import it or access the mock implementation behavior.
        // However, a simpler way in this specific mock setup:
        // We know 'analyzeContent' attaches listeners. We need to trigger them.

        // Wait for async microtasks (fetch) to complete so listeners are attached
        await new Promise(resolve => setTimeout(resolve, 0));

        // 3. Trigger 'job_complete' event
        const joinCall = mockOn.mock.calls.find(c => c[0] === 'job_complete');
        if (joinCall) joinCall[1](mockResult);

        // D. Await result
        const result = await analysisPromise;

        expect(result).toEqual(mockResult);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles initialization errors gracefully', async () => {
        // Mock POST Failure
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: "Server Busy" })
        });

        await expect(analyzeContent("Fail content", "TEXT")).rejects.toThrow("Server Busy");
    });
});

