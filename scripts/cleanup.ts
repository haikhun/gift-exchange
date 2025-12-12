
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("Cleaning up old events...");
    const deleted = await db.event.deleteMany({});
    console.log(`Deleted ${deleted.count} events.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
