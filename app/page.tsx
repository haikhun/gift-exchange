import { db } from "@/lib/db";
import { Gift, Users, Sparkles, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import Hero from "@/components/Hero";

export default async function Home() {
  const events = await db.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
    take: 20, // Limit to recent 20
  });

  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground relative overflow-hidden">
      {/* Background - moved to global or Hero, but let's keep simple structure */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-10 left-10 text-christmas-red/20 opacity-20">
          <Gift size={48} />
        </div>
      </div>

      <Hero />

      <div className="w-full max-w-4xl px-4 pb-20">
        <h2 className="text-2xl font-bold text-christmas-green mb-6 flex items-center gap-2">
          <Clock size={24} />
          近期活動 (Recent Events)
        </h2>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500">目前沒有活動，快來建立第一個吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event: any) => (
              <Link key={event.id} href={`/room/${event.slug}`}>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-christmas-gold/20 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-christmas-red transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${event.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                      event.status === 'DRAWN' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{event._count.participants} 人參加</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-christmas-red font-medium">
                      進入房間 <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
