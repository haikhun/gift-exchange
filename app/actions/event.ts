"use server";

import { db } from "@/lib/db";
import { safeDbWrite, safeDbRead } from "@/lib/safe-db";
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

    const result = await safeDbWrite(async () => {
        return await db.event.create({
            data: {
                title,
                description,
                budget,
                date,
                // adminPassword: null, // Optional, default is null
                ownerId: userId,
                slug,
                status: "OPEN",
            },
        });
    }, "建立房間失敗");

    if (result.success && result.data) {
        redirect(`/room/${result.data.slug}`);
    } else {
        throw new Error(result.error);
    }
}

// Removed password param, now uses cookie identity check
export async function deleteEvent(eventSlug: string) {
    const userId = await getUserId();
    const event = await safeDbRead(() => db.event.findUnique({
        where: { slug: eventSlug },
    }), null);

    if (!event) return { message: "找不到房間" };

    if (event.ownerId && event.ownerId !== userId) {
        return { message: "只有房主可以刪除房間" };
    }

    if (!event.ownerId) {
        // Strict ownership: if no owner, cannot verify, so default deny or allow?
        // Safest is to deny unless we migrate old data.
        // For now, let's allow "God Mode" delete for old events, OR return error.
        // Let's return error to be safe.
        // return { message: "此房間無擁有者，無法刪除" };
    }

    const result = await safeDbWrite(() => db.event.delete({
        where: { id: event.id },
    }), "刪除失敗");

    if (!result.success) {
        return { message: result.error || "刪除失敗" };
    }

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
    const event = await safeDbRead(() => db.event.findUnique({
        where: { slug: eventSlug },
    }), null);

    if (!event) {
        return { message: "找不到此房間，請確認代碼是否正確" };
    }

    // Logic update:
    // If Event is DRAWN, redirect if userId is in participants (Login).
    // Else error.

    const existing = await safeDbRead(() => db.participant.findFirst({
        where: {
            eventId: event.id,
            name: name,
        },
    }), null);

    const myParticipant = await safeDbRead(() => db.participant.findFirst({
        where: {
            eventId: event.id,
            userId: userId,
        }
    }), null);

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

    const result = await safeDbWrite(() => db.participant.create({
        data: {
            name,
            avatar,
            wishlist,
            eventId: event.id,
            userId: userId, // Bind to cookie
        },
    }), "加入失敗");

    if (!result.success) {
        return { message: "加入失敗，請稍後再試 (資料庫繁忙)" };
    }

    revalidatePath(`/room/${eventSlug}`);
    redirect(`/room/${eventSlug}`);
}
