"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TreeParticipant {
    id: string;
    name: string;
    avatar?: string | null;
    userId?: string | null;
}

export default function ParticipantTree({
    participants,
    currentUserId
}: {
    participants: TreeParticipant[];
    currentUserId?: string;
}) {
    // Festive Christmas Tree Theme
    // Warm, cozy, and nostalgic

    return (
        <div className="relative flex flex-col items-center py-12 min-h-[600px] w-full overflow-hidden">

            {/* The Tree Illustration (Background) is now global in RoomPage */}
            {/* We keep the container for spacing but removed the image */}


            {/* Top Star */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-40 mb-12 text-yellow-400 drop-shadow-[0_4px_10px_rgba(234,179,8,0.5)]"
            >
                <Star size={64} fill="currentColor" strokeWidth={1} className="text-yellow-500" />
            </motion.div>

            {/* Participants Grid / Ornaments */}
            <div className="relative z-40 w-full max-w-4xl flex flex-wrap justify-center content-start gap-8 px-4 mt-8">
                {participants.map((p, index) => {
                    const isMe = p.userId === currentUserId;

                    return (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, type: "spring" }}
                            className="group relative"
                        >
                            <div className={`
                                flex flex-col items-center gap-2
                                transition-all duration-300 hover:scale-110
                            `}>
                                {/* Hook String */}
                                <div className="h-4 w-0.5 bg-yellow-600/50 -mb-1"></div>

                                {/* Ornament Ball */}
                                <div className={`
                                    w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold
                                    shadow-lg ring-2 ring-white/60 ring-offset-2 ring-offset-transparent
                                    ${isMe
                                        ? 'bg-gradient-to-br from-red-100 to-christmas-red text-white shadow-red-900/20'
                                        : 'bg-gradient-to-br from-white to-gray-100 text-christmas-green border border-gray-100'
                                    }
                                `}>
                                    {/* Shine Reflection */}
                                    <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full rotate-[-45deg]"></div>

                                    <span className="drop-shadow-sm">{p.name.charAt(0)}</span>
                                </div>

                                {/* Name Tag */}
                                <div className={`
                                    px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap
                                    ${isMe ? 'bg-christmas-red text-white' : 'bg-white/90 text-christmas-green'}
                                `}>
                                    {p.name}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {participants.length < 3 && (
                    <div className="absolute top-2/3 left-1/2 -translate-x-1/2 text-white/80 font-display text-2xl drop-shadow-md whitespace-nowrap animate-pulse">
                        Waiting for friends to decorate...
                    </div>
                )}
            </div>
        </div>
    );
}
