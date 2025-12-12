"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { type Participant } from "@prisma/client";

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
    const event = await db.event.findUnique({
        where: { slug: eventSlug },
        include: { participants: true },
    });

    if (!event) throw new Error("Event not found");
    if (event.status !== "OPEN") throw new Error("Event is not open");
    if (event.participants.length < 2) throw new Error("Need at least 2 participants");

    const participants = event.participants;
    const shuffled = shuffle(participants);

    // Hamiltonian Cycle: i -> i+1, last -> first
    // We need to update each participant with their targetId

    // Use a transaction to ensure atomicity
    await db.$transaction(async (tx) => {
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

    revalidatePath(`/room/${eventSlug}`);
}

export async function getMyResult(eventSlug: string, nickname: string) {
    // Basic verification: user must know their name and the room code
    // In a real app, this would use session auth.
    // Here we trust the nickname input (simple MVP).
    const event = await db.event.findUnique({
        where: { slug: eventSlug },
        include: {
            participants: {
                include: {
                    target: true // Include the person they are sending TO
                }
            }
        }
    });

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
