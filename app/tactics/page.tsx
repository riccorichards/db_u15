export const dynamic = "force-dynamic";
import TacticsPitch from "@/components/TacticsPitch";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TacticsPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-sky/10 bg-navy-950/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-mono text-sky/50 hover:text-white transition-colors">
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>
          <span className="text-sky/30 font-mono text-xs">DINAMO BATUMI U15 · TACTICAL EDUCATION</span>
        </div>
      </div>
      <main className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display text-4xl font-black uppercase text-white tracking-wide">
            Pitch Intelligence
          </h1>
          <p className="text-sky/50 font-body mt-1">
            Guardiola&apos;s positional zones — click any zone to learn its principles
          </p>
        </div>
        <TacticsPitch />
      </main>
    </div>
  );
}
