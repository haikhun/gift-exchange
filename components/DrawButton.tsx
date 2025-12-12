"use client";

import { drawLottery } from "@/app/actions/draw";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function DrawButton({ eventSlug }: { eventSlug: string }) {
    const [loading, setLoading] = useState(false);

    const handleDraw = async () => {
        if (!confirm("確定要開始抽選嗎？一旦開始將無法新增成員。")) return;
        setLoading(true);
        try {
            await drawLottery(eventSlug);
        } catch (error) {
            alert("抽選失敗，請稍後再試: " + error);
            setLoading(false);
        }
    };

    return (
        <motion.button
            onClick={handleDraw}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-christmas-green to-teal-800 text-white rounded-full font-bold shadow-lg hover:shadow-xl disabled:opacity-50"
        >
            <Sparkles size={20} />
            {loading ? "抽選中..." : "開始抽選"}
        </motion.button>
    );
}
