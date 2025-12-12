"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { createEvent } from "@/app/actions/event";

export default function CreateFunction() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-christmas-gold/20"
            >
                <div className="flex items-center justify-center mb-6 text-christmas-red">
                    <Gift size={40} />
                </div>
                <h1 className="text-3xl font-display font-bold text-center text-christmas-green mb-2">
                    建立新房間
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    填寫活動資訊，邀請朋友加入
                </p>

                <form action={createEvent} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            活動名稱
                        </label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="Ex: 2024 公司聖誕交換禮物"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-red focus:ring-christmas-red focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                預算範圍
                            </label>
                            <input
                                name="budget"
                                type="text"
                                placeholder="Ex: 300-500元"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-red focus:ring-christmas-red focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                活動日期
                            </label>
                            <input
                                name="date"
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-red focus:ring-christmas-red focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            活動說明
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="有什麼規則想先說清楚的嗎？"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-red focus:ring-christmas-red focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                        ></textarea>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-christmas-red text-white rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition-colors"
                    >
                        建立活動
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
