"use client";

import { useState } from "react";
import ResultReveal from "./ResultReveal";

export default function ResultRevealWrapper({ slug, participants }: { slug: string, participants: string[] }) {
    const [selectedName, setSelectedName] = useState("");
    const [confirmed, setConfirmed] = useState(false);

    if (confirmed && selectedName) {
        return <ResultReveal slug={slug} nickname={selectedName} />;
    }

    return (
        <div className="flex flex-col gap-3">
            <select
                className="w-full p-3 rounded-xl border border-gray-300 dark:bg-slate-800"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
            >
                <option value="">選擇你的名字...</option>
                {participants.map(name => (
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>
            <button
                className="w-full py-3 bg-christmas-red text-white rounded-xl font-bold disabled:opacity-50 hover:bg-red-700 transition-colors"
                disabled={!selectedName}
                onClick={() => setConfirmed(true)}
            >
                查看我的對象
            </button>
        </div>
    );
}
