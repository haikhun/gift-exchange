"use server";

import { db } from "@/lib/db";
import { safeDbRead, safeDbWrite } from "@/lib/safe-db";
import { revalidatePath } from "next/cache";
import { type Participant } from "@prisma/client";

export const runtime = "nodejs";

// Fisher-Yates Shuffle
function shuffle(array: Participant[]): Participant[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export async function drawLottery(eventSlug: string) {
    const event = await safeDbRead(() => db.event.findUnique({
        where: { slug: eventSlug },
        include: { participants: true },
    }), null);

    if (!event) throw new Error("Event not found");
    if (event.status !== "OPEN") throw new Error("Event is not open");
    if (event.participants.length < 2) throw new Error("Need at least 2 participants");

    const participants = event.participants;
    const shuffled = shuffle(participants);

    // Hamiltonian Cycle: i -> i+1, last -> first
    // We need to update each participant with their targetId

    // Use a transaction to ensure atomicity
    // safeDbWrite handles the transaction promise
    const result = await safeDbWrite(async () => {
        return await db.$transaction(async (tx) => {
            for (let i = 0; i < shuffled.length; i++) {
                const current = shuffled[i];
                const next = shuffled[(i + 1) % shuffled.length]; // Wrap around for the last one

                await tx.participant.update({
                    where: { id: current.id },
                    data: { targetId: next.id }
                });
            }

            await tx.event.update({
                where: { id: event.id },
                data: { status: "DRAWN" }
            });
        });
    }, "Draw failed");

    if (!result.success) {
        throw new Error(result.error);
    }

    // ... continues below ...

    revalidatePath(`/room/${eventSlug}`);
}

export async function getMyResult(eventSlug: string, nickname: string) {
    // Basic verification: user must know their name and the room code
    // In a real app, this would use session auth.
    // Here we trust the nickname input (simple MVP).
    const event = await safeDbRead(() => db.event.findUnique({
        where: { slug: eventSlug },
        include: {
            participants: {
                include: {
                    target: true // Include the person they are sending TO
                }
            }
        }
    }), null);

    if (!event) throw new Error("Event not found");
    if (event.status !== "DRAWN") throw new Error("Draw not started yet");

    const me = event.participants.find((p: any) => p.name === nickname);
    if (!me) throw new Error("Participant not found");

    if (!me.target) throw new Error("Target not assigned (Data error?)");

    return {
        myTarget: me.target.name,
        targetWishlist: me.target.wishlist
    };
}
