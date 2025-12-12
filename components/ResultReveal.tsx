"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useState } from "react";
import { getMyResult } from "@/app/actions/draw"; // We'll need to expose this or use a server component + form

// This component handles the ceremony
export default function ResultReveal({ slug, nickname }: { slug: string, nickname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [targetName, setTargetName] = useState<string | null>(null);
    const [targetWishlist, setTargetWishlist] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleOpen = async () => {
        setLoading(true);
        try {
            const result = await getMyResult(slug, nickname);
            setTargetName(result.myTarget);
            setTargetWishlist(result.targetWishlist);
            setIsOpen(true);
            // Trigger confetti here if possible
            import("canvas-confetti").then((confetti) => {
                confetti.default({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });
        } catch (e: any) {
            setError(e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (isOpen && targetName) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-4 border-christmas-gold"
            >
                <h3 className="text-xl text-gray-500 font-medium mb-4">你要送禮物的對象是...</h3>
                <h2 className="text-4xl md:text-6xl font-display font-bold text-christmas-red mb-6 animate-bounce">
                    {targetName}
                </h2>

                {targetWishlist ? (
                    <div className="bg-christmas-gold/10 p-4 rounded-xl mb-4 border border-christmas-gold/30">
                        <p className="text-xs text-christmas-gold font-bold uppercase tracking-widest mb-2">Wishlist</p>
                        <p className="text-gray-700 italic">"{targetWishlist}"</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 mb-4">這位朋友沒有留下許願清單</p>
                )}

                <p className="text-sm text-christmas-green">記得準備一份溫暖的禮物喔！</p>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {error && <p className="text-red-500 font-bold">{error}</p>}

            <motion.button
                onClick={handleOpen}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
            >
                <div className="absolute inset-0 bg-christmas-gold blur-xl opacity-50 group-hover:opacity-80 transition-opacity rounded-full animate-pulse"></div>
                <Gift size={120} className={`text-christmas-red relative z-10 ${loading ? 'animate-spin' : 'animate-bounce'}`} />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-christmas-red font-bold whitespace-nowrap">
                    {loading ? "尋找中..." : "點擊拆開禮物"}
                </span>
            </motion.button>
        </div>
    );
}
