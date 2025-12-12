import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gift, Calendar, Clock, Lock, Unlock, Share2, Copy, Check, Info, Sparkles, Star } from "lucide-react";

import DeleteButton from "@/components/DeleteButton";
import DrawButton from "@/components/DrawButton";
import ResultReveal from "@/components/ResultReveal";
import ParticipantTree from "@/components/ParticipantTree"; // New Tree Component
import { cookies } from "next/headers";

interface RoomPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("gift_user_id")?.value;

    const event = await db.event.findUnique({
        where: { slug },
        include: {
            participants: true,
        },
    });

    if (!event) {
        notFound();
    }

    const isOwner = userId && event.ownerId === userId;
    const myParticipant = event.participants.find((p: any) => p.userId === userId);

    return (
        // Theme Update: Full Screen Custom Tree
        <div className="min-h-screen font-sans relative overflow-x-hidden selection:bg-christmas-red/20 selection:text-christmas-red">
            {/* Full Screen Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Image Background */}
                <div className="absolute inset-0 bg-[url('/tree-bg.png')] bg-cover bg-center bg-fixed opacity-100"></div>
                {/* Subtle Overlay to ensure text readability if image is too bright/busy */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
            </div>

            <div className="max-w-5xl mx-auto p-6 md:p-12 relative z-10 space-y-10">
                {/* Header - Warm & Festive */}
                <div className="text-center space-y-4 py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-christmas-green/10 text-christmas-green rounded-full text-sm font-bold shadow-sm">
                        <Sparkles size={16} />
                        <span>ROOM CODE: {event.slug}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-christmas-red drop-shadow-sm flex items-center justify-center gap-4">
                        {event.title}
                        {isOwner && <span className="transform scale-75 opacity-50 hover:opacity-100 transition-opacity"><DeleteButton eventSlug={event.slug} /></span>}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        {event.description || "Welcome to the gift exchange! Gather around the tree."}
                    </p>
                </div>

                {/* Metrics Cards - Clean White with Warm Shadow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Gift, label: "預算", value: event.budget, color: "text-christmas-red bg-red-50" },
                        { icon: Calendar, label: "日期", value: event.date, color: "text-christmas-green bg-green-50" },
                        { icon: Clock, label: "狀態", value: event.status === "OPEN" ? "報名中" : "已抽出", color: "text-amber-600 bg-amber-50" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                            <div className={`p-3 rounded-full mb-3 ${item.color}`}>
                                <item.icon size={24} />
                            </div>
                            <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">{item.label}</span>
                            <span className="text-xl text-gray-800 font-bold mt-1">{item.value || "—"}</span>
                        </div>
                    ))}
                </div>

                {/* Action Area */}
                <div className="flex flex-col items-center justify-center gap-6 py-4">
                    {event.status === "OPEN" ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-4">
                                <Link
                                    href={`/join?code=${event.slug}`}
                                    className="px-8 py-3 rounded-full bg-christmas-green text-white font-bold shadow-lg shadow-emerald-900/10 hover:bg-emerald-800 transition-colors flex items-center gap-2"
                                >
                                    <Share2 size={18} /> 邀請朋友
                                </Link>
                                {isOwner && <DrawButton eventSlug={event.slug} />}
                            </div>
                            <p className="text-sm text-gray-400">分享代碼給朋友，讓他們加入！</p>
                        </div>
                    ) : (
                        myParticipant && (
                            <div className="w-full max-w-md mx-auto relative group perspective-1000">
                                <div className="absolute -inset-4 bg-gradient-to-r from-red-100 via-amber-100 to-red-100 rounded-[2rem] blur-xl opacity-50 animate-pulse-slow"></div>
                                <div className="relative bg-white p-8 rounded-[2rem] shadow-xl border-4 border-double border-red-50 text-center space-y-6">
                                    <div className="inline-block p-3 rounded-full bg-red-50 text-christmas-red mb-2">
                                        <Gift size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-display font-bold text-gray-800">神秘禮物對象</h3>
                                        <p className="text-gray-500 text-sm">嘘！別告訴其他人喔</p>
                                    </div>
                                    <ResultReveal slug={event.slug} nickname={myParticipant.name} />
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* The Tree */}
                <div className="border-t-4 border-dotted border-stone-200 pt-12">
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <h2 className="text-3xl font-display font-bold text-christmas-green flex items-center gap-3">
                            參加者名單
                            <span className="w-8 h-8 rounded-full bg-christmas-green text-white text-sm flex items-center justify-center shadow-sm font-sans">
                                {event.participants.length}
                            </span>
                        </h2>
                        {event.participants.length === 0 && (
                            <p className="text-gray-400">樹上空蕩蕩的，快來掛上裝飾吧！</p>
                        )}
                    </div>

                    <ParticipantTree
                        participants={event.participants.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            avatar: p.avatar,
                            userId: p.userId
                        }))}
                        currentUserId={userId}
                    />
                </div>
            </div>
        </div>
    );
}
