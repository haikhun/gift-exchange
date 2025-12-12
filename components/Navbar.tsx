import Link from "next/link";
import { Gift, Home } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 p-4 z-50 pointer-events-none">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Link
                    href="/"
                    className="pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-christmas-gold/30 hover:scale-110 transition-transform text-christmas-red"
                    title="回首頁"
                >
                    <Home size={24} />
                </Link>

                <Link
                    href="/create"
                    className="pointer-events-auto bg-christmas-red/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-white font-bold flex items-center gap-2 hover:bg-red-700 transition-colors"
                    title="建立新房間"
                >
                    <Gift size={18} />
                    <span className="text-sm">新活動</span>
                </Link>
            </div>
        </nav>
    );
}
