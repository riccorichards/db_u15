"use client";
import { IPMS } from "@/types";
import { Brain, Flame, RefreshCw, Shield, AlertCircle } from "lucide-react";

interface Props {
  ipms: IPMS;
  matchCount: number;
}

const COMPONENTS: {
  key: keyof IPMS;
  label: string;
  desc: string;
  weight: string;
  icon: React.ElementType;
  minMatches: number;
}[] = [
  {
    key: "trainingSignal",
    label: "Training Signal",
    desc: "Body language, focus, coachability and emotional state across recent sessions",
    weight: "35%",
    icon: Brain,
    minMatches: 0,
  },
  {
    key: "pressureResponse",
    label: "Pressure Response",
    desc: "Performance delta: rating in high-OSI matches vs low-OSI matches",
    weight: "30%",
    icon: Flame,
    minMatches: 4, // needs enough matches with OSI data
  },
  {
    key: "consistencyAfterLoss",
    label: "Post-Loss Consistency",
    desc: "Match rating in the game immediately following a team loss",
    weight: "20%",
    icon: Shield,
    minMatches: 2,
  },
  {
    key: "recoverySpeed",
    label: "Recovery Speed",
    desc: "PRS trajectory in the first training session after a match loss",
    weight: "15%",
    icon: RefreshCw,
    minMatches: 2,
  },
];

function ComponentBar({
  label,
  desc,
  weight,
  value,
  icon: Icon,
  hasData,
}: {
  label: string;
  desc: string;
  weight: string;
  value: number;
  icon: React.ElementType;
  hasData: boolean;
}) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70
      ? "bg-green-500"
      : pct >= 50
        ? "bg-ocean"
        : pct >= 35
          ? "bg-yellow-500"
          : "bg-red-500";
  const textColor =
    pct >= 70
      ? "text-green-400"
      : pct >= 50
        ? "text-ocean"
        : pct >= 35
          ? "text-yellow-400"
          : "text-red-400";

  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-navy-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className={hasData ? "text-sky" : "text-sky/20"} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1 items-center">
          <div>
            <span className="text-xs font-mono text-sky/70">{label}</span>
            <span className="text-[9px] font-mono text-sky/30 ml-2">
              {weight}
            </span>
          </div>
          {hasData ? (
            <span className={`text-xs font-mono font-bold ${textColor}`}>
              {pct}%
            </span>
          ) : (
            <span className="text-[10px] font-mono text-sky/30 flex items-center gap-1">
              <AlertCircle size={9} /> Insufficient data
            </span>
          )}
        </div>
        <div className="h-1.5 bg-navy-800/40 rounded-full overflow-hidden">
          {hasData ? (
            <div
              className={`h-full ${color} rounded-full transition-all duration-1000`}
              style={{ width: `${pct}%` }}
            />
          ) : (
            <div
              className="h-full bg-navy-800/40 rounded-full"
              style={{
                width: "50%",
                background:
                  "repeating-linear-gradient(90deg, rgba(151,202,219,0.05) 0px, rgba(151,202,219,0.05) 4px, transparent 4px, transparent 8px)",
              }}
            />
          )}
        </div>
        <p className="text-[9px] text-sky/30 font-body mt-0.5 leading-tight">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function IPMSCard({ ipms, matchCount }: Props) {
  const overallPct = Math.round(ipms.ipms * 100);
  const overallColor =
    overallPct >= 70
      ? "text-green-400"
      : overallPct >= 50
        ? "text-ocean"
        : overallPct >= 35
          ? "text-yellow-400"
          : "text-red-400";
  const verdict =
    overallPct >= 70
      ? "Mentally strong"
      : overallPct >= 55
        ? "Solid mentality"
        : overallPct >= 40
          ? "Developing mentally"
          : "Needs attention";

  const hasOSIMatches = matchCount >= 4;
  const hasLosses = matchCount >= 2;

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Brain size={15} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Mentality Score
            </h3>
            <p className="text-xs text-sky/40 font-body mt-0.5">
              Individual player mentality index
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-display text-3xl font-black ${overallColor}`}>
            {overallPct}
          </div>
          <div className="text-[10px] font-mono text-sky/40">IPMS / 100</div>
        </div>
      </div>

      {/* Verdict */}
      <div
        className={`px-3 py-2 rounded-xl mb-5 glass border border-sky/10 flex items-center justify-between`}
      >
        <span className={`text-sm font-display font-bold ${overallColor}`}>
          {verdict}
        </span>
        <div className="w-24 h-1.5 bg-navy-800/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              overallPct >= 70
                ? "bg-green-500"
                : overallPct >= 50
                  ? "bg-ocean"
                  : overallPct >= 35
                    ? "bg-yellow-500"
                    : "bg-red-500"
            }`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Component bars */}
      <div className="space-y-4 flex-1">
        {COMPONENTS.map((comp) => (
          <ComponentBar
            key={comp.key}
            label={comp.label}
            desc={comp.desc}
            weight={comp.weight}
            value={ipms[comp.key] as number}
            icon={comp.icon}
            hasData={
              comp.key === "trainingSignal"
                ? true
                : comp.key === "pressureResponse"
                  ? hasOSIMatches
                  : hasLosses
            }
          />
        ))}
      </div>

      {/* Data note */}
      {!hasOSIMatches && (
        <div className="mt-4 pt-3 border-t border-sky/10">
          <p className="text-[10px] font-body text-sky/30 leading-relaxed">
            <span className="text-yellow-400/70">Pressure Response</span> and{" "}
            <span className="text-yellow-400/70">Recovery Speed</span> require
            match data with opponent profiles linked. Add opponents in Admin →
            Opponents and link them at match entry to unlock these signals.
          </p>
        </div>
      )}
    </div>
  );
}
