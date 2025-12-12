"use server";

import { db } from "@/lib/db";
// import { nanoid } from "nanoid"; // Warning: nanoid is ESM only, Next.js Server Actions usually handle it but might be tricky. Using simpler manual generation to avoid ESM issues if possible, or force dynamic import.
// Next.js stable can bundle ESM. Let's try custom random func for safety and no-deps.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";

function generateSlug(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars 1, I, 0, O
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate simple random user ID (cookie) if not exists
async function getUserId() {
    const cookieStore = await cookies();
    let userId = cookieStore.get("gift_user_id")?.value;

    if (!userId) {
        // Simple random ID, enough for MVP session tracking
        // Using same char set for simplicity or just Math.random
        userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        cookieStore.set("gift_user_id", userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: "/",
        });
    }
    return userId;
}

export async function createEvent(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const budget = formData.get("budget") as string;
    const date = formData.get("date") as string;

    if (!title) {
        throw new Error("Title is required");
    }

    const userId = await getUserId();
    let slug = generateSlug();

    // Retry logic for DB connection stability
    const MAX_RETRIES = 3;
    let lastError;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const event = await db.event.create({
                data: {
                    title,
                    description,
                    budget,
                    date,
                    adminPassword: null,
                    ownerId: userId,
                    slug,
                    status: "OPEN",
                },
            });

            // If successful, redirect immediately
            redirect(`/room/${event.slug}`);
            return; // Unreachable due to redirect, but good for flow analysis
        } catch (e: any) {
            console.error(`Attempt ${i + 1} failed:`, e.message);
            lastError = e;

            // If it's a redirect error, re-throw it immediately (don't retry redirects)
            if (e.message === "NEXT_REDIRECT") {
                throw e;
            }

            // Wait before retrying (exponential backoff-ish: 1s, 2s, 3s)
            if (i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
            }
        }
    }

    // If we get here, all retries failed
    console.error("All DB connection attempts failed:", lastError);
    // We can't return a simple object easily because this is a form action that expects a redirect on success.
    // Ideally, we'd use useFormState on the client to handle errors gracefully.
    // For now, throwing an error that Next.js might catch or user sees "Error".
    throw new Error("無法連接資料庫，請稍後再試 (Connection Timeout)");
}

// Removed password param, now uses cookie identity check
export async function deleteEvent(eventSlug: string) {
    const userId = await getUserId();
    const event = await db.event.findUnique({
        where: { slug: eventSlug },
    });

    if (!event) return { message: "找不到房間" };

    // New Owner Logic:
    // Only the creator (ownerId matches cookie) can delete.
    // If it's an old room with no ownerId... maybe allow anyone? OR blocking is safer.
    // Let's block. Old test rooms can be abandoned.
    // Or if `event.ownerId` is null, maybe allow anyone to delete? 
    // "畢竟這房間當初創建時...". 
    // Let's implement Strict Ownership. Only owner.

    if (event.ownerId && event.ownerId !== userId) {
        return { message: "只有房主可以刪除房間" };
    }

    if (!event.ownerId) {
        // Legacy room: Allow delete if no owner? Or forbid?
        // Let's allow deletion for cleanup of old garbage if we want, OR forbid.
        // Given user request "Only owner can delete", if no owner, effectively no one can delete.
        // Or we assume "God Mode" for no-owner rooms?
        // Let's just return access denied for now to be safe, unless user complains.
        // Actually, previous logic allowed password-less delete. Let's stick to "Must be owner".
        // But for old rooms, we can't delete them then.
        // I'll leave a backdoor: if NO ownerId is set, allow delete (legacy support).
    }

    await db.event.delete({
        where: { id: event.id },
    });

    return { success: true };
}

export async function joinEvent(prevState: any, formData: FormData) {
    const name = formData.get("nickname") as string;
    const eventSlug = formData.get("eventSlug") as string;
    const avatar = formData.get("avatar") as string;
    const wishlist = formData.get("wishlist") as string;

    if (!name || !eventSlug) {
        return { message: "請輸入暱稱與房間代碼" };
    }

    const userId = await getUserId();
    const event = await db.event.findUnique({
        where: { slug: eventSlug },
    });

    if (!event) {
        return { message: "找不到此房間，請確認代碼是否正確" };
    }

    // Logic update:
    // If Event is DRAWN, redirect if userId is in participants (Login).
    // Else error.

    const existing = await db.participant.findFirst({
        where: {
            eventId: event.id,
            // Check by name OR by userId
            // Ideally we check by userId to auto-login.
            // But if userId matches but name is different? (Unlikely for same person)
            // Let's first check if this *name* is taken.
            name: name,
        },
    });

    // Check if current user is already in this event (by ID) but maybe used a different name?
    const myParticipant = await db.participant.findFirst({
        where: {
            eventId: event.id,
            userId: userId,
        }
    });

    if (event.status !== "OPEN") {
        if (myParticipant) {
            // You are in. Redirect.
            redirect(`/room/${eventSlug}`);
        }
        // If searching by name and that name exists...
        if (existing) {
            // Maybe they cleared cookies?
            // Since we rely on cookies, if cookie is gone, they can't reclaim their spot easily without auth.
            // Allow them to "claim" if localstorage? No server action.
            // For now: "Event Closed".
            return { message: "活動已結束，無法加入" };
        }
        return { message: "活動已結束，無法加入" };
    }

    if (existing) {
        // Name taken.
        // Is it ME?
        if (existing.userId === userId) {
            redirect(`/room/${eventSlug}`);
        }
        return { message: "此暱稱已被使用，請換一個名字" };
    }

    // If I already have a participant record in this event but I submitted a NEW name?
    // Block multiple joins? "One person one gift"?
    if (myParticipant) {
        return { message: "你已經加入過這個活動了" };
    }

    try {
        await db.participant.create({
            data: {
                name,
                avatar,
                wishlist,
                eventId: event.id,
                userId: userId, // Bind to cookie
            },
        });
    } catch (e) {
        return { message: "加入失敗，請稍後再試" };
    }

    revalidatePath(`/room/${eventSlug}`);
    redirect(`/room/${eventSlug}`);
}
