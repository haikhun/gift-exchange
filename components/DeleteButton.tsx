"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/actions/event";
import { useRouter } from "next/navigation";

// Simplified delete button - no input, just confirm.
// Logic: If user can SEE this button, they are the owner (server rendered check).
// So client just needs to invoke delete.

export default function DeleteButton({ eventSlug }: { eventSlug: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await deleteEvent(eventSlug); // No password arg
            if (res.success) {
                router.push("/");
            } else {
                setError(res.message || "刪除失敗");
            }
        } catch (e) {
            setError("發生錯誤");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                title="刪除活動"
            >
                <Trash2 size={20} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border-2 border-christmas-red/20 relative overflow-hidden">
                        {/* Decorative bg */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Trash2 size={100} className="text-christmas-red" />
                        </div>

                        <h3 className="text-xl font-display font-bold text-christmas-red mb-4 flex items-center gap-2">
                            <Trash2 size={24} />
                            刪除活動
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                            確定要刪除這個活動嗎？<br />
                            此操作 <span className="text-red-600 font-bold">無法復原</span>，且所有參加者資料都將消失。
                        </p>

                        <div className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 font-bold animate-pulse">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors dark:hover:bg-slate-800"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "處理中..." : "確認刪除"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
