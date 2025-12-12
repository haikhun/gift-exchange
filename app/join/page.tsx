"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { joinEvent } from "@/app/actions/event";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

function JoinForm() {
    const searchParams = useSearchParams();
    const defaultSlug = searchParams.get("code") || "";
    // @ts-ignore - Types for useActionState might still be catching up in some setups, or useFormState alias
    const [state, action, isPending] = useActionState(joinEvent, { message: "" });

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-christmas-green/20"
            >
                <div className="flex items-center justify-center mb-6 text-christmas-green">
                    <Users size={40} />
                </div>
                <h1 className="text-3xl font-display font-bold text-center text-christmas-red mb-2">
                    加入房間
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    輸入暱稱與房間代碼，加入交換禮物
                </p>

                {state.message && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100 dark:border-red-800">
                        <AlertCircle size={18} />
                        {state.message}
                    </div>
                )}

                <form action={action} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            房間代碼 (Room Code)
                        </label>
                        <input
                            name="eventSlug"
                            type="text"
                            required
                            defaultValue={defaultSlug}
                            placeholder="Ex: X9Y2Z1"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-green focus:ring-christmas-green focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 font-mono tracking-widest uppercase text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                你的暱稱 (Nickname)
                            </label>
                            <input
                                name="nickname"
                                type="text"
                                required
                                placeholder="Ex: 聖誕老人"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-green focus:ring-christmas-green focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                許願清單 (Wishlist) - 選填
                            </label>
                            <textarea
                                name="wishlist"
                                rows={2}
                                placeholder="Ex: 我喜歡咖啡、書籍，不喜歡絨毛娃娃..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-christmas-green focus:ring-christmas-green focus:outline-none transition-colors dark:bg-slate-900 dark:border-slate-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Avatar selection could be a future enhancement */}
                    <input type="hidden" name="avatar" value="default" />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-christmas-green text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {isPending ? "加入中..." : "加入活動"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense>
            <JoinForm />
        </Suspense>
    );
}
