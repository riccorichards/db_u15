"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface SessionLog {
  date: string;
  sessionType: string;
  workRate: number;
  technicalQuality: number;
  tacticalAwareness: number;
  focusLevel: number;
  bodyLanguage: number;
  coachability: number;
  emotionalState: string;
  fatigueLevel: number;
  injuryFlag: boolean;
  minutesParticipated: number;
  prs: number;
  readinessLabel: string;
}

const EMOTION_EMOJI: Record<string, string> = {
  happy: "😄",
  neutral: "😐",
  tired: "😴",
  frustrated: "😤",
  anxious: "😟",
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  tactical: "text-blue-300",
  physical: "text-red-300",
  technical: "text-purple-300",
  mixed: "text-sky",
  recovery: "text-green-300",
};

const READINESS_COLORS = {
  match_ready: "text-green-400",
  monitor: "text-yellow-400",
  rest: "text-red-400",
};

function ScoreDot({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const good = inverse ? value <= 4 : value >= 7;
  const mid = inverse ? value <= 6 : value >= 5;
  const color = good ? "text-green-400" : mid ? "text-ocean" : "text-red-400";
  return (
    <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
  );
}

export default function PlayerTrainingLog({
  sessionLogs,
}: {
  sessionLogs: SessionLog[];
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...sessionLogs].reverse();
  const displayed = expanded ? sorted : sorted.slice(0, 5);

  if (!sorted.length) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center justify-center h-32">
        <p className="text-sky/40 text-sm font-body">
          No training sessions logged yet.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-sky/10 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Training Log
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            All metrics explained: 1–10 scale · Fatigue is inverse (lower =
            better)
          </p>
        </div>
        <span className="glass rounded-lg px-3 py-1 text-xs font-mono text-sky/60">
          {sorted.length} sessions
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[100px_70px_60px_60px_60px_60px_60px_60px_60px_60px_60px] gap-1 px-4 py-2 text-[10px] font-mono text-sky/30 uppercase tracking-wider border-b border-sky/5 overflow-x-auto">
        <div>Date</div>
        <div>Type</div>
        <div className="text-center">Work</div>
        <div className="text-center">Tech</div>
        <div className="text-center">Tact</div>
        <div className="text-center">Focus</div>
        <div className="text-center">Body</div>
        <div className="text-center">Coach</div>
        <div className="text-center">Fatigue</div>
        <div className="text-center">Mood</div>
        <div className="text-center">PRS</div>
      </div>

      {displayed.map((s, i) => (
        <div
          key={i}
          className="grid grid-cols-[100px_70px_60px_60px_60px_60px_60px_60px_60px_60px_60px] gap-1 px-4 py-2.5 items-center border-b border-sky/5 hover:bg-ocean/5 transition-colors overflow-x-auto"
        >
          <div className="text-xs font-mono text-sky/60">
            {new Date(s.date).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })}
            {s.injuryFlag && (
              <AlertTriangle size={10} className="text-red-400 inline ml-1" />
            )}
          </div>
          <div
            className={`text-[10px] font-mono capitalize ${SESSION_TYPE_COLORS[s.sessionType] ?? "text-sky/50"}`}
          >
            {s.sessionType}
          </div>
          <div className="text-center">
            <ScoreDot value={s.workRate} />
          </div>
          <div className="text-center">
            <ScoreDot value={s.technicalQuality} />
          </div>
          <div className="text-center">
            <ScoreDot value={s.tacticalAwareness} />
          </div>
          <div className="text-center">
            <ScoreDot value={s.focusLevel} />
          </div>
          <div className="text-center">
            <ScoreDot value={s.bodyLanguage} />
          </div>
          <div className="text-center">
            <ScoreDot value={s.coachability} />
          </div>
          <div className="text-center">
            <ScoreDot value={s.fatigueLevel} inverse />
          </div>
          <div className="text-center text-sm">
            {EMOTION_EMOJI[s.emotionalState] ?? "😐"}
          </div>
          <div
            className={`text-center text-xs font-mono font-bold ${READINESS_COLORS[s.readinessLabel as keyof typeof READINESS_COLORS] ?? "text-white"}`}
          >
            {Math.round(s.prs * 100)}
          </div>
        </div>
      ))}

      {/* Metric legend */}
      <div className="px-5 py-3 border-t border-sky/10 bg-navy-950/20">
        <p className="text-[10px] font-mono text-sky/30 mb-1">
          HOW METRICS ARE CALCULATED:
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: "Work Rate", desc: "Effort & running intensity" },
            { label: "Technical", desc: "Ball control & execution" },
            { label: "Tactical", desc: "Positioning & shape awareness" },
            { label: "Focus", desc: "Concentration & instructions" },
            { label: "Body Lang.", desc: "Positive energy & leadership" },
            { label: "Coachability", desc: "Response to feedback" },
            { label: "Fatigue ⚠", desc: "Lower is better (less tired)" },
            { label: "PRS", desc: "Overall readiness score /100" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-sky/50">
                {label}:
              </span>
              <span className="text-[10px] font-body text-sky/30">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {sorted.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 flex items-center justify-center gap-2 text-xs font-mono text-sky/50 hover:text-white transition-colors border-t border-sky/10"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Show less" : `Show all ${sorted.length} sessions`}
        </button>
      )}
    </div>
  );
}
