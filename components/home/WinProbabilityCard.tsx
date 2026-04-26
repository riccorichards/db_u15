"use client";
import { NextMatchOutlook } from "@/types";
import { Swords, Calendar } from "lucide-react";

interface Props {
  outlook: NextMatchOutlook | null;
  mrs: number;
}

function RadialGauge({ value, size = 100 }: { value: number; size?: number }) {
  const radius = 46;
  const circ = 2 * Math.PI * radius;
  const progress = (value / 100) * circ;
  const color =
    value >= 65
      ? "#4ade80"
      : value >= 45
        ? "#018ABE"
        : value >= 30
          ? "#facc15"
          : "#f87171";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(151,202,219,0.1)"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - progress}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s" }}
      />
      {/* Glow */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.25"
        strokeDasharray={circ}
        strokeDashoffset={circ - progress}
        transform="rotate(-90 50 50)"
        filter="blur(3px)"
      />
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="bold"
        fontFamily="Barlow Condensed"
      >
        {Math.round(value)}%
      </text>
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="rgba(151,202,219,0.5)"
        fontSize="7"
        fontFamily="JetBrains Mono"
      >
        WIN PROB
      </text>
    </svg>
  );
}

function OSIBar({ osi }: { osi: number }) {
  const pct = (osi / 10) * 100;
  const color =
    osi >= 7 ? "bg-red-500" : osi >= 5 ? "bg-yellow-500" : "bg-green-500";
  const label = osi >= 7 ? "Difficult" : osi >= 5 ? "Moderate" : "Favourable";
  const textColor =
    osi >= 7 ? "text-red-400" : osi >= 5 ? "text-yellow-400" : "text-green-400";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-mono text-sky/50 uppercase">
          Opponent Strength (OSI)
        </span>
        <span className={`text-[10px] font-mono font-bold ${textColor}`}>
          {osi.toFixed(1)}/10 · {label}
        </span>
      </div>
      <div className="h-1.5 bg-navy-800/40 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function WinProbabilityCard({ outlook, mrs }: Props) {
  // No fixture set
  if (!outlook) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Match Outlook
            </h3>
            <p className="text-xs text-sky/50 font-body mt-0.5">
              Next fixture prediction
            </p>
          </div>
          <Swords size={18} className="text-sky/20" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <Calendar size={18} className="text-sky/30" />
          </div>
          <div className="text-center">
            <p className="text-white font-display font-bold text-sm">
              No Fixture Set
            </p>
            <p className="text-sky/40 text-xs font-body mt-1">
              Add an opponent profile in Admin → Opponents and mark it as
              upcoming
            </p>
          </div>
          {/* Still show MRS context */}
          <div className="glass rounded-xl px-4 py-2 mt-2 text-center">
            <div className="text-[10px] font-mono text-sky/40 mb-1">
              Current Readiness
            </div>
            <div
              className={`font-display text-2xl font-black ${
                mrs >= 75
                  ? "text-green-400"
                  : mrs >= 55
                    ? "text-ocean"
                    : mrs >= 35
                      ? "text-yellow-400"
                      : "text-red-400"
              }`}
            >
              {Math.round(mrs)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const wp = outlook.winProbability;
  const verdict =
    wp >= 65
      ? { label: "Favoured to win", color: "text-green-400" }
      : wp >= 50
        ? { label: "Even match", color: "text-ocean" }
        : wp >= 35
          ? { label: "Slight underdog", color: "text-yellow-400" }
          : { label: "Challenging fixture", color: "text-red-400" };

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Match Outlook
          </h3>
          <p className="text-xs text-sky/50 font-body mt-0.5">
            vs{" "}
            <span className="text-white font-mono">{outlook.opponentName}</span>
          </p>
        </div>
        <div
          className={`glass rounded-xl px-2.5 py-1 text-xs font-mono font-bold ${verdict.color}`}
        >
          {verdict.label}
        </div>
      </div>

      {/* Gauge */}
      <div className="flex items-center gap-4 mb-5">
        <RadialGauge value={wp} size={96} />
        <div className="flex-1">
          <p className={`font-display text-base font-bold ${verdict.color}`}>
            {verdict.label}
          </p>
          <p className="text-[10px] font-mono text-sky/40 mt-1 leading-relaxed">
            Based on MRS ({Math.round(mrs)}) vs opponent OSI (
            {outlook.osi.toFixed(1)})
          </p>
          <div className="flex gap-3 mt-2">
            <div className="text-center">
              <div className="text-[10px] font-mono text-sky/40">MRS</div>
              <div
                className={`font-mono font-bold text-sm ${
                  mrs >= 75
                    ? "text-green-400"
                    : mrs >= 55
                      ? "text-ocean"
                      : "text-yellow-400"
                }`}
              >
                {Math.round(mrs)}
              </div>
            </div>
            <div className="text-sky/20 font-mono text-sm self-end mb-0.5">
              vs
            </div>
            <div className="text-center">
              <div className="text-[10px] font-mono text-sky/40">OSI</div>
              <div
                className={`font-mono font-bold text-sm ${
                  outlook.osi >= 7
                    ? "text-red-400"
                    : outlook.osi >= 5
                      ? "text-yellow-400"
                      : "text-green-400"
                }`}
              >
                {outlook.osi.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OSI bar */}
      <OSIBar osi={outlook.osi} />

      <p className="text-[9px] font-body text-sky/30 mt-3 leading-relaxed">
        Win Probability = MRS / (MRS + OSI×10) × 100. Not a guarantee — use
        alongside match preparation and your own knowledge of the opponent.
      </p>
    </div>
  );
}
