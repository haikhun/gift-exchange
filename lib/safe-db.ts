import { db } from "@/lib/db";

// Helper to handle DB errors gracefully
// Vercel Serverless + Supabase (Free) can lead to connection timeouts or "too many clients" errors.
// This wrapper adds retry logic for writes and safe error returning for reads.

type SafeDbResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

const MAX_RETRIES = 2; // Retry once or twice (total attempts: 1 + 2 = 3)
const RETRY_DELAY_MS = 1000;

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if error is a connection issue that might resolve with a retry
function isRetryableError(e: any): boolean {
    const msg = e?.message || "";
    return (
        msg.includes("Can't reach database server") ||
        msg.includes("Connection terminated") ||
        msg.includes("timed out") ||
        msg.includes("P1001") || // Authentication failed (sometimes transient)
        msg.includes("P1002")    // Reach database server
    );
}

// Wrapper for write operations (Create, Update, Delete)
// Retries on connection failure.
export async function safeDbWrite<T>(
    operation: () => Promise<T>,
    errorMessage = "Database operation failed"
): Promise<SafeDbResult<T>> {
    let lastError: any;

    for (let i = 0; i <= MAX_RETRIES; i++) {
        try {
            const data = await operation();
            return { success: true, data };
        } catch (e: any) {
            // If it's a redirect (Next.js), throw it immediately (it's success)
            if (e.message === "NEXT_REDIRECT" || e.digest?.includes("NEXT_REDIRECT")) {
                throw e;
            }

            console.error(`DB Write Attempt ${i + 1} failed:`, e.message);
            lastError = e;

            if (isRetryableError(e) && i < MAX_RETRIES) {
                await delay(RETRY_DELAY_MS * (i + 1)); // Exponential-ish backoff
                continue;
            }

            // Non-retryable error or max retries reached
            break;
        }
    }

    return {
        success: false,
        error: `${errorMessage} (${lastError?.message?.substring(0, 50)}...)`
    };
}

// Wrapper for read operations (FindMany, FindUnique)
// Typically less critical to retry (user can refresh), but we catch errors to prevent crashes.
export async function safeDbRead<T>(
    operation: () => Promise<T>,
    fallbackValue: T
): Promise<T> {
    try {
        return await operation();
    } catch (e: any) {
        console.error("DB Read failed:", e.message);
        // Return fallback (e.g., null or empty array) so UI handles it gracefully
        return fallbackValue;
    }
}
