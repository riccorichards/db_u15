"use client";
import { useState } from "react";
import { SessionHistoryEntry } from "@/types";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

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
  pre_match: "text-yellow-300",
};

// What each session type evaluates most — shown as a hint
const SESSION_FOCUS_HINT: Record<string, string> = {
  tactical: "Tactical + Focus + Coachability weighted",
  physical: "Work Rate weighted 50%",
  technical: "Technical Quality weighted 45%",
  mixed: "All metrics equal",
  recovery: "Coachability + Focus weighted",
  pre_match: "Focus + Tactical weighted · Low intensity expected",
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
  sessionHistory,
}: {
  sessionHistory: SessionHistoryEntry[];
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...sessionHistory].reverse();
  const displayed = expanded ? sorted : sorted.slice(0, 6);

  const v1Count = sorted.filter((s) => s.formulaVersion === 1).length;
  const v2Count = sorted.filter((s) => s.formulaVersion === 2).length;

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
            All sessions · Fatigue is inverse (lower = better)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {v1Count > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky/5 text-sky/40 border border-sky/10">
              v1: {v1Count}
            </span>
          )}
          {v2Count > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-ocean/20 text-ocean border border-ocean/30">
              v2: {v2Count}
            </span>
          )}
          <span className="glass rounded-lg px-3 py-1 text-xs font-mono text-sky/60">
            {sorted.length} sessions
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[90px_80px_55px_55px_55px_55px_55px_55px_55px_50px_55px] gap-1 px-4 py-2 text-[10px] font-mono text-sky/30 uppercase tracking-wider border-b border-sky/5 overflow-x-auto min-w-max">
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

      {displayed.map((s, i) => {
        const isV2 = s.formulaVersion === 2;
        return (
          <div
            key={`${s.sessionId}-${i}`}
            className="grid grid-cols-[90px_80px_55px_55px_55px_55px_55px_55px_55px_50px_55px] gap-1 px-4 py-2.5 items-center border-b border-sky/5 hover:bg-ocean/5 transition-colors overflow-x-auto min-w-max"
          >
            {/* Date + injury flag */}
            <div className="text-xs font-mono text-sky/60">
              {new Date(s.date).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}
              {s.injuryFlag && (
                <AlertTriangle size={10} className="text-red-400 inline ml-1" />
              )}
            </div>

            {/* Session type */}
            <div>
              <div
                className={`text-[10px] font-mono capitalize ${SESSION_TYPE_COLORS[s.sessionType] ?? "text-sky/50"}`}
              >
                {s.sessionType.replace("_", " ")}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[8px] font-mono px-1 rounded ${
                    isV2 ? "bg-ocean/20 text-ocean" : "bg-sky/5 text-sky/30"
                  }`}
                >
                  v{s.formulaVersion}
                </span>
              </div>
              {/* Template hint on hover via title */}
              <div
                className="text-[8px] text-sky/25 font-body leading-tight mt-0.5 hidden md:block"
                title={SESSION_FOCUS_HINT[s.sessionType]}
              >
                {SESSION_FOCUS_HINT[s.sessionType]?.split("·")[0].slice(0, 18)}…
              </div>
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
              className={`text-center text-xs font-mono font-bold ${
                READINESS_COLORS[s.readinessLabel] ?? "text-white"
              }`}
            >
              {Math.round(s.prs * 100)}
              {isV2 && <span className="text-[8px] text-ocean ml-0.5">★</span>}
            </div>
          </div>
        );
      })}

      {/* Metric legend */}
      <div className="px-5 py-3 border-t border-sky/10 bg-navy-950/20">
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
          {[
            { label: "Work Rate", desc: "Effort & intensity" },
            { label: "Technical", desc: "Ball control & execution" },
            { label: "Tactical", desc: "Positioning & shape" },
            { label: "Focus", desc: "Concentration" },
            { label: "Body Lang.", desc: "Positive energy" },
            { label: "Coachability", desc: "Response to feedback" },
            { label: "Fatigue ⚠", desc: "Lower = better" },
            { label: "PRS", desc: "Readiness /100" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-sky/50">
                {label}:
              </span>
              <span className="text-[10px] font-body text-sky/30">{desc}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono">
          <div className="flex items-center gap-1">
            <span className="px-1 rounded bg-sky/5 text-sky/40 border border-sky/10">
              v1
            </span>
            <span className="text-sky/30">Baseline absolute formula</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1 rounded bg-ocean/20 text-ocean border border-ocean/30">
              v2 ★
            </span>
            <span className="text-sky/30">
              Expectation-relative (pillar + template aware)
            </span>
          </div>
        </div>
      </div>

      {sorted.length > 6 && (
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
