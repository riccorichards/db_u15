"use client";
import { TeamStats } from "@/types";
import { Trophy, Target, Shield, TrendingUp, Zap } from "lucide-react";
import dbLogo from "../../assets/dblogo.png";
import Image from "next/image";

interface Props {
  stats: TeamStats;
}

function StatPill({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass shine rounded-2xl px-5 py-4 flex items-center gap-4 ${
        accent ? "glass-bright" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          accent
            ? "bg-ocean/30 text-sky"
            : "bg-navy-800/60 text-sky"
        }`}
      >
        <Icon size={18} />
      </div>
      <div>
        <div className="font-display text-2xl font-bold leading-none text-white">
          {value}
        </div>
        <div className="text-xs text-sky/60 mt-0.5 font-body">{label}</div>
        {sub && <div className="text-xs text-mist/40 font-mono">{sub}</div>}
      </div>
    </div>
  );
}

export default function Header({ stats }: Props) {
  const formColor =
    stats.formIndex >= 70
      ? "text-green-400"
      : stats.formIndex >= 40
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <header className="relative overflow-hidden">
      {/* Background strip */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-800/40 to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #018ABE 0, #018ABE 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 px-6 pt-8 pb-6 max-w-screen-xl mx-auto">
        {/* Club identity */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Image
              src={dbLogo}
              alt="Dinamo Batumi Logo"
              width={56}
              height={56}
              className="rounded-2xl"
            />
            <div>
              <h1 className="font-display text-3xl font-black tracking-wide text-white uppercase">
                Dinamo Batumi
              </h1>
              <p className="text-sky/60 text-sm font-body">
                U15 · Season 2025/26 · Squad Hub
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 glass rounded-full px-4 py-2">
            <div className="pulse-dot" />
            <span className="text-xs text-sky/70 font-mono">LIVE STATS</span>
          </div>
        </div>

        {/* Stats pills */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatPill
            label="Win Rate"
            value={`${stats.winPct}%`}
            sub={`${stats.wins}W ${stats.draws}D ${stats.losses}L`}
            icon={Trophy}
            accent
          />
          <StatPill
            label="Goals Scored"
            value={stats.totalGoals}
            sub={`vs ${stats.receivedGoals} received`}
            icon={Target}
          />
          <StatPill
            label="Clean Sheets"
            value={stats.wins}
            sub="No goals conceded"
            icon={Shield}
          />
          <StatPill
            label="Lost Points"
            value={stats.lostPoints}
            sub="Draws+Losses pts"
            icon={Zap}
          />
          <div className="glass shine rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-navy-800/60">
              <TrendingUp size={18} className="text-sky" />
            </div>
            <div>
              <div className={`font-display text-2xl font-bold leading-none ${formColor}`}>
                {stats.formIndex}
              </div>
              <div className="text-xs text-sky/60 mt-0.5 font-body">Form Index</div>
              <div className="text-xs text-mist/40 font-mono">Last 5 games</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
