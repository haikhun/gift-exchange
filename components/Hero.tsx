"use client";

import { motion } from "framer-motion";
import { Gift, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <div className="w-full flex flex-col items-center justify-center p-4 py-20 relative">
            {/* Decorative Background Component usually would be separate but kept inline for simplicity if not complex */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-2xl mx-auto space-y-8"
            >
                <div className="space-y-4">
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-christmas-red drop-shadow-sm">
                        Secret Santa
                    </h1>
                    <p className="text-xl md:text-2xl text-christmas-green/80 font-medium font-sans">
                        交換禮物，傳遞溫暖
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                        最簡單、最溫馨的線上交換禮物平台。
                        <br />
                        只需兩步驟，輕鬆與好友分享節日驚喜。
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                    <Link
                        href="/create"
                        className="group px-8 py-4 bg-christmas-red text-white rounded-full font-bold text-lg shadow-lg hover:bg-red-700 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        <Gift size={20} className="group-hover:rotate-12 transition-transform" />
                        發起活動
                    </Link>
                    <Link
                        href="/join"
                        className="group px-8 py-4 bg-white border-2 border-christmas-green text-christmas-green rounded-full font-bold text-lg shadow-sm hover:bg-gray-50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        <Users size={20} className="group-hover:scale-110 transition-transform" />
                        加入房間
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
