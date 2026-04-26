"use client";
import { useState } from "react";
import { Player, EmotionalState, SessionType } from "@/types";
import {
  Dumbbell,
  Plus,
  Minus,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface Props {
  players: Player[];
  adminPassword: string;
  onSuccess: () => void;
}

interface PlayerEntry {
  playerId: string;
  workRate: number;
  technicalQuality: number;
  tacticalAwareness: number;
  focusLevel: number;
  bodyLanguage: number;
  coachability: number;
  emotionalState: EmotionalState;
  fatigueLevel: number;
  injuryFlag: boolean;
  minutesParticipated: number;
  // Discipline flags — written to DisciplineLog automatically on save
  lateToSession: boolean;
  leftEarly: boolean;
}

const SESSION_TYPES: {
  value: SessionType;
  label: string;
  color: string;
  hint: string;
}[] = [
  {
    value: "tactical",
    label: "Tactical",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    hint: "Shape, positioning, pressing structure",
  },
  {
    value: "technical",
    label: "Technical",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    hint: "Ball mastery, finishing, passing drills",
  },
  {
    value: "physical",
    label: "Physical",
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    hint: "Fitness, speed, stamina conditioning",
  },
  {
    value: "mixed",
    label: "Mixed",
    color: "bg-ocean/20 text-sky border-ocean/30",
    hint: "Combined session — all metrics weighted equally",
  },
  {
    value: "recovery",
    label: "Recovery",
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    hint: "Post-match regeneration — low intensity expected",
  },
  {
    value: "pre_match",
    label: "Pre-Match",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    hint: "Light activation + tactical prep before a game",
  },
];

// What each session type focuses on — shown as a hint below the type selector
const SESSION_FOCUS: Record<SessionType, string> = {
  tactical: "Tactical Awareness + Focus + Coachability weighted highest",
  technical: "Technical Quality weighted 45% — execution is everything",
  physical: "Work Rate weighted 50% — effort is the only metric that matters",
  mixed: "All metrics weighted equally — balanced evaluation",
  recovery: "Coachability + Focus weighted highest — low intensity is correct",
  pre_match:
    "Focus + Tactical Awareness weighted highest — intensity should be LOW",
};

const EMOTIONS: { value: EmotionalState; emoji: string; label: string }[] = [
  { value: "happy", emoji: "😄", label: "Happy" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "frustrated", emoji: "😤", label: "Frustrated" },
  { value: "anxious", emoji: "😟", label: "Anxious" },
];

const METRIC_FIELDS: { key: keyof PlayerEntry; label: string; hint: string }[] =
  [
    { key: "workRate", label: "Work Rate", hint: "Effort & intensity" },
    {
      key: "technicalQuality",
      label: "Technical",
      hint: "Ball control, execution",
    },
    { key: "tacticalAwareness", label: "Tactical", hint: "Positioning, shape" },
    { key: "focusLevel", label: "Focus", hint: "Concentration" },
    { key: "bodyLanguage", label: "Body Lang.", hint: "Positive signals" },
    {
      key: "coachability",
      label: "Coachability",
      hint: "Response to feedback",
    },
    { key: "fatigueLevel", label: "Fatigue ⚠", hint: "High = bad" },
  ];

function ScoreButton({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-5 h-5 rounded text-[9px] font-mono transition-all ${
            n <= value
              ? n >= 8
                ? "bg-green-500 text-white"
                : n >= 5
                  ? "bg-ocean text-white"
                  : "bg-red-500/60 text-white"
              : "bg-navy-800/60 text-sky/30 hover:bg-navy-800"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function LogTrainingForm({
  players,
  adminPassword,
  onSuccess,
}: Props) {
  const [session, setSession] = useState({
    date: new Date().toISOString().split("T")[0],
    sessionType: "mixed" as SessionType,
    intensity: 7,
    quality: 7,
    attendancePct: 100,
    fatigue: 5,
    coachRating: 7,
    notes: "",
  });
  const [playerEntries, setPlayerEntries] = useState<PlayerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ formulaVersion: number } | null>(
    null,
  );
  const [error, setError] = useState("");

  const addedIds = new Set(playerEntries.map((p) => p.playerId));

  const addPlayer = (player: Player) => {
    if (addedIds.has(player._id!)) return;
    setPlayerEntries((prev) => [
      ...prev,
      {
        playerId: player._id!,
        workRate: 7,
        technicalQuality: 7,
        tacticalAwareness: 7,
        focusLevel: 7,
        bodyLanguage: 7,
        coachability: 7,
        emotionalState: "neutral",
        fatigueLevel: 5,
        injuryFlag: false,
        minutesParticipated: 90,
        lateToSession: false,
        leftEarly: false,
      },
    ]);
  };

  const addAllPlayers = () => players.forEach((p) => addPlayer(p));
  const removePlayer = (playerId: string) =>
    setPlayerEntries((prev) => prev.filter((p) => p.playerId !== playerId));
  const updateEntry = (
    playerId: string,
    field: keyof PlayerEntry,
    value: unknown,
  ) =>
    setPlayerEntries((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, [field]: value } : p)),
    );

  const handleSubmit = async () => {
    if (playerEntries.length === 0) {
      setError("Add at least one player.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          playerLogs: playerEntries,
          adminPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      const data = await res.json();
      setSuccess({ formulaVersion: data.formulaVersion ?? 1 });
      setPlayerEntries([]);
      setSession({
        date: new Date().toISOString().split("T")[0],
        sessionType: "mixed",
        intensity: 7,
        quality: 7,
        attendancePct: 100,
        fatigue: 5,
        coachRating: 7,
        notes: "",
      });
      onSuccess();
      setTimeout(() => setSuccess(null), 4000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const playerMap = Object.fromEntries(players.map((p) => [p._id!, p]));
  const currentType = SESSION_TYPES.find(
    (t) => t.value === session.sessionType,
  );
  const isPreMatch = session.sessionType === "pre_match";

  return (
    <div className="space-y-5">
      {/* Session header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-ocean/20 flex items-center justify-center">
            <Dumbbell size={17} className="text-ocean" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Log Training Session
            </h2>
            <p className="text-xs text-sky/40 font-body">
              Coach-level + per-player metrics
            </p>
          </div>
        </div>

        {/* Date + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Date
            </label>
            <input
              type="date"
              value={session.date}
              onChange={(e) => setSession({ ...session, date: e.target.value })}
              className="w-full glass rounded-xl px-3 py-2 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Session Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() =>
                    setSession({ ...session, sessionType: t.value })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    session.sessionType === t.value
                      ? t.color
                      : "glass text-sky/40 border-transparent hover:text-sky/70"
                  }`}
                  title={t.hint}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session focus hint */}
        <div
          className={`px-3 py-2 rounded-xl mb-4 text-[11px] font-mono border ${
            isPreMatch
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
              : "bg-ocean/5 border-sky/10 text-sky/50"
          }`}
        >
          {isPreMatch && "⚠ Pre-Match: "}
          {SESSION_FOCUS[session.sessionType]}
          {isPreMatch &&
            " — a low intensity score here is CORRECT and expected."}
        </div>

        {/* Coach-level metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(
            [
              {
                key: "intensity",
                label: "Intensity",
                hint: isPreMatch
                  ? "Keep LOW for pre-match (2–4 expected)"
                  : "How physically demanding?",
              },
              {
                key: "quality",
                label: "Quality",
                hint: "Tactical execution & drill precision",
              },
              {
                key: "fatigue",
                label: "Fatigue ⚠",
                hint: "Post-session tiredness (high = bad)",
              },
              {
                key: "coachRating",
                label: "Coach Rating",
                hint: "Your overall feel of the session",
              },
            ] as const
          ).map(({ key, label, hint }) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-mono text-sky/60 uppercase tracking-wider">
                  {label}
                </label>
                <span
                  className={`text-xs font-mono font-bold ${
                    key === "fatigue"
                      ? session[key] >= 8
                        ? "text-red-400"
                        : session[key] >= 5
                          ? "text-yellow-400"
                          : "text-green-400"
                      : key === "intensity" && isPreMatch
                        ? session[key] <= 4
                          ? "text-green-400"
                          : session[key] <= 6
                            ? "text-yellow-400"
                            : "text-red-400"
                        : session[key] >= 8
                          ? "text-green-400"
                          : session[key] >= 5
                            ? "text-ocean"
                            : "text-red-400"
                  }`}
                >
                  {session[key]}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={session[key]}
                onChange={(e) =>
                  setSession({ ...session, [key]: parseInt(e.target.value) })
                }
                className="w-full accent-ocean"
              />
              <p className="text-[10px] text-sky/30 font-body mt-0.5">{hint}</p>
            </div>
          ))}

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-mono text-sky/60 uppercase tracking-wider">
                Attendance
              </label>
              <span className="text-xs font-mono font-bold text-white">
                {session.attendancePct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={session.attendancePct}
              onChange={(e) =>
                setSession({
                  ...session,
                  attendancePct: parseInt(e.target.value),
                })
              }
              className="w-full accent-ocean"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
            Notes (optional)
          </label>
          <textarea
            value={session.notes}
            onChange={(e) => setSession({ ...session, notes: e.target.value })}
            placeholder="Any observations about the session..."
            rows={2}
            className="w-full glass rounded-xl px-3 py-2 text-sm text-white placeholder-sky/30 font-body outline-none border border-sky/10 focus:border-ocean bg-transparent resize-none"
          />
        </div>
      </div>

      {/* Player section */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Player Performance
            </h3>
            <p className="text-xs text-sky/40 font-body mt-0.5">
              {playerEntries.length} players added
            </p>
          </div>
          <button
            onClick={addAllPlayers}
            className="glass rounded-xl px-3 py-1.5 text-xs font-mono text-sky/60 hover:text-white transition-colors"
          >
            + Add All
          </button>
        </div>

        {/* Player picker */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-sky/10">
          {players
            .filter((p) => !addedIds.has(p._id!))
            .map((p) => (
              <button
                key={p._id}
                onClick={() => addPlayer(p)}
                className="glass rounded-lg px-2.5 py-1.5 text-xs font-mono text-sky/60 hover:text-white border border-transparent hover:border-ocean/30 transition-all flex items-center gap-1.5"
              >
                <span className={`px-1 rounded text-[10px] pos-${p.position}`}>
                  {p.position}
                </span>
                <span>
                  #{p.number} {p.surname}
                </span>
                <Plus size={10} />
              </button>
            ))}
          {players.filter((p) => !addedIds.has(p._id!)).length === 0 &&
            playerEntries.length > 0 && (
              <p className="text-xs text-sky/30 font-body">All players added</p>
            )}
        </div>

        {/* Player rows */}
        <div className="space-y-4">
          {playerEntries.map((entry) => {
            const player = playerMap[entry.playerId];
            if (!player) return null;
            return (
              <div
                key={entry.playerId}
                className="glass rounded-xl p-4 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-mono pos-${player.position}`}
                    >
                      {player.position}
                    </span>
                    <span className="font-display font-bold text-white">
                      {player.name} {player.surname}
                    </span>
                    <span className="text-sky/30 text-xs font-mono">
                      #{player.number}
                    </span>
                    {entry.injuryFlag && (
                      <span className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertTriangle size={11} /> Injury
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removePlayer(entry.playerId)}
                    className="w-6 h-6 glass rounded-lg flex items-center justify-center text-sky/30 hover:text-red-400 transition-colors"
                  >
                    <Minus size={11} />
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {METRIC_FIELDS.map(({ key, label, hint }) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-[10px] font-mono text-sky/50 uppercase">
                          {label}
                        </span>
                      </div>
                      <ScoreButton
                        value={entry[key] as number}
                        onChange={(v) => updateEntry(entry.playerId, key, v)}
                      />
                      <span className="text-[10px] text-sky/30 font-body hidden md:block">
                        {hint}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-sky/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-sky/40 uppercase">
                      Mood
                    </span>
                    <div className="flex gap-1">
                      {EMOTIONS.map((em) => (
                        <button
                          key={em.value}
                          onClick={() =>
                            updateEntry(
                              entry.playerId,
                              "emotionalState",
                              em.value,
                            )
                          }
                          title={em.label}
                          className={`w-7 h-7 rounded-lg text-sm transition-all ${
                            entry.emotionalState === em.value
                              ? "bg-ocean/30 scale-110 border border-ocean/50"
                              : "glass opacity-50 hover:opacity-100"
                          }`}
                        >
                          {em.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-sky/40 uppercase">
                      Minutes
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={entry.minutesParticipated}
                      onChange={(e) =>
                        updateEntry(
                          entry.playerId,
                          "minutesParticipated",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-14 glass rounded-lg px-2 py-1 text-xs text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
                    />
                  </div>
                  <button
                    onClick={() =>
                      updateEntry(
                        entry.playerId,
                        "injuryFlag",
                        !entry.injuryFlag,
                      )
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                      entry.injuryFlag
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "glass text-sky/40 border-transparent hover:border-sky/20"
                    }`}
                  >
                    <AlertTriangle size={11} />
                    Injury
                  </button>

                  {/* Discipline flags — auto-written to DisciplineLog on save */}
                  <button
                    onClick={() =>
                      updateEntry(
                        entry.playerId,
                        "lateToSession",
                        !entry.lateToSession,
                      )
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                      entry.lateToSession
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                        : "glass text-sky/40 border-transparent hover:border-sky/20"
                    }`}
                  >
                    ⏰ Late
                  </button>
                  <button
                    onClick={() =>
                      updateEntry(entry.playerId, "leftEarly", !entry.leftEarly)
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                      entry.leftEarly
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                        : "glass text-sky/40 border-transparent hover:border-sky/20"
                    }`}
                  >
                    🚪 Left early
                  </button>
                </div>
              </div>
            );
          })}

          {playerEntries.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sky/30 font-body text-sm">
                Pick players above to log their performance
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400 font-body">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-green-400 font-body flex items-center gap-2">
          <CheckCircle size={13} />
          Session saved! TC and MS updated.{" "}
          <span
            className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
              success.formulaVersion === 2
                ? "bg-ocean/30 text-ocean"
                : "bg-sky/10 text-sky/50"
            }`}
          >
            Formula v{success.formulaVersion}
          </span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-ocean hover:bg-navy-800 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Dumbbell size={16} />
        )}
        {loading ? "Saving Session..." : "Save Training Session"}
      </button>
    </div>
  );
}
