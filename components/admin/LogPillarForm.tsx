"use client";
import { useState } from "react";
import { Player, PillarScores } from "@/types";
import {
  BarChart2,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  players: Player[];
  adminPassword: string;
  onSuccess?: () => void;
}

type PillarKey = "physical" | "technical" | "tactical" | "mental";

const PILLARS: {
  key: PillarKey;
  label: string;
  color: string;
  bg: string;
  subAttributes: { key: string; label: string; hint: string }[];
}[] = [
  {
    key: "physical",
    label: "Physical",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    subAttributes: [
      {
        key: "sprintSpeed",
        label: "Sprint Speed",
        hint: "Explosive pace over short distances",
      },
      {
        key: "stamina",
        label: "Stamina",
        hint: "Endurance across the full match",
      },
      {
        key: "strength",
        label: "Strength",
        hint: "Physical duels, shielding, holding off",
      },
      {
        key: "agility",
        label: "Agility",
        hint: "Change of direction, balance, coordination",
      },
    ],
  },
  {
    key: "technical",
    label: "Technical",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    subAttributes: [
      {
        key: "firstTouch",
        label: "First Touch",
        hint: "Receiving and controlling all types of passes",
      },
      {
        key: "passing",
        label: "Passing",
        hint: "Accuracy and weight across all ranges",
      },
      {
        key: "shooting",
        label: "Shooting",
        hint: "Technique, power, and placement",
      },
      {
        key: "dribbling",
        label: "Dribbling",
        hint: "Ball manipulation in tight spaces",
      },
    ],
  },
  {
    key: "tactical",
    label: "Tactical",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    subAttributes: [
      {
        key: "positioning",
        label: "Positioning",
        hint: "Finding and holding the right position",
      },
      {
        key: "pressing",
        label: "Pressing",
        hint: "Timing and intensity of press triggers",
      },
      {
        key: "defensiveShape",
        label: "Defensive Shape",
        hint: "Maintaining structure when out of possession",
      },
      {
        key: "decisionMaking",
        label: "Decision Making",
        hint: "Speed and quality of choices under pressure",
      },
    ],
  },
  {
    key: "mental",
    label: "Mental",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    subAttributes: [
      {
        key: "composure",
        label: "Composure",
        hint: "Staying calm in high-pressure moments",
      },
      {
        key: "leadership",
        label: "Leadership",
        hint: "Organising, encouraging, and leading by example",
      },
      {
        key: "resilience",
        label: "Resilience",
        hint: "Response to setbacks, mistakes, and adversity",
      },
      {
        key: "coachability",
        label: "Coachability",
        hint: "Applying feedback quickly and consistently",
      },
    ],
  },
];

function SubSlider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const color =
    value >= 8 ? "text-green-400" : value >= 5 ? "text-ocean" : "text-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 flex-shrink-0">
        <span className="text-[10px] font-mono text-sky/60 uppercase">
          {label}
        </span>
        <p className="text-[9px] text-sky/30 font-body leading-tight mt-0.5">
          {hint}
        </p>
      </div>
      <div className="flex gap-0.5 flex-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-5 rounded text-[8px] font-mono transition-all ${
              n <= value
                ? n >= 8
                  ? "bg-green-500 text-white"
                  : n >= 5
                    ? "bg-ocean text-white"
                    : "bg-red-500/60 text-white"
                : "bg-navy-800/60 text-sky/20 hover:bg-navy-800"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span
        className={`text-xs font-mono font-bold w-6 text-right flex-shrink-0 ${color}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function LogPillarForm({
  players,
  adminPassword,
  onSuccess,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [weekOf, setWeekOf] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  });

  // Sub-attribute state: pillar -> subKey -> value
  const [subs, setSubs] = useState<Record<string, Record<string, number>>>(() =>
    Object.fromEntries(
      PILLARS.map((p) => [
        p.key,
        Object.fromEntries(p.subAttributes.map((s) => [s.key, 7])),
      ]),
    ),
  );

  const [expandedPillars, setExpandedPillars] = useState<Set<PillarKey>>(
    new Set<PillarKey>(["physical", "technical", "tactical", "mental"]),
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    scores: PillarScores;
    name: string;
  } | null>(null);
  const [error, setError] = useState("");

  const togglePillar = (key: PillarKey) => {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const setSub = (pillar: PillarKey, subKey: string, value: number) => {
    setSubs((prev) => ({
      ...prev,
      [pillar]: { ...prev[pillar], [subKey]: value },
    }));
  };

  const pillarAvg = (key: PillarKey) => {
    const vals = Object.values(subs[key]);
    return parseFloat(
      (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    );
  };

  const handleSubmit = async () => {
    if (!selectedPlayerId) {
      setError("Select a player first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        adminPassword,
        playerId: selectedPlayerId,
        weekOf,
        physical: pillarAvg("physical"),
        technical: pillarAvg("technical"),
        tactical: pillarAvg("tactical"),
        mental: pillarAvg("mental"),
      };
      const res = await fetch("/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      const data = await res.json();
      const player = players.find((p) => p._id === selectedPlayerId);
      setSuccess({
        scores: data.pillarScores,
        name: `${player?.name} ${player?.surname}`,
      });
      onSuccess?.();
      setTimeout(() => setSuccess(null), 6000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlayer = players.find((p) => p._id === selectedPlayerId);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <BarChart2 size={17} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Weekly Pillar Assessment
            </h2>
            <p className="text-xs text-sky/40 font-body">
              Rate one player's five development pillars — done once per week
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Player selector */}
          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Player *
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white font-body outline-none border border-sky/10 focus:border-ocean bg-navy-950/80"
            >
              <option value="">Select player...</option>
              {players.map((p) => (
                <option key={p._id} value={p._id}>
                  #{p.number} {p.name} {p.surname} ({p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Week picker */}
          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Week of (auto-snaps to Monday)
            </label>
            <input
              type="date"
              value={weekOf}
              onChange={(e) => setWeekOf(e.target.value)}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
            />
          </div>
        </div>

        {/* Pillar summary bar */}
        {selectedPlayer && (
          <div className="mt-4 p-3 glass rounded-xl border border-sky/5">
            <p className="text-[10px] font-mono text-sky/40 uppercase tracking-wider mb-2">
              Pillar averages — {selectedPlayer.name} {selectedPlayer.surname} (
              {selectedPlayer.position})
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PILLARS.map((p) => {
                const avg = pillarAvg(p.key);
                return (
                  <div key={p.key} className="text-center">
                    <div
                      className={`font-display text-xl font-black ${p.color}`}
                    >
                      {avg}
                    </div>
                    <div className="text-[9px] font-mono text-sky/40 uppercase">
                      {p.label}
                    </div>
                    <div className="h-1 bg-navy-800/60 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-ocean transition-all"
                        style={{ width: `${(avg / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pillar sections */}
      {PILLARS.map((pillar) => {
        const avg = pillarAvg(pillar.key);
        const isExpanded = expandedPillars.has(pillar.key);
        return (
          <div key={pillar.key} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => togglePillar(pillar.key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-ocean/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-8 rounded-full ${pillar.bg.replace("bg-", "bg-").split(" ")[0]}`}
                  style={{
                    background: pillar.color.includes("red")
                      ? "#ef4444"
                      : pillar.color.includes("purple")
                        ? "#a855f7"
                        : pillar.color.includes("blue")
                          ? "#3b82f6"
                          : "#22c55e",
                    opacity: 0.6,
                  }}
                />
                <div className="text-left">
                  <span
                    className={`font-display font-bold uppercase tracking-wide text-sm ${pillar.color}`}
                  >
                    {pillar.label}
                  </span>
                  <div className="text-[10px] text-sky/40 font-mono mt-0.5">
                    {pillar.subAttributes.map((s) => s.label).join(" · ")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`font-display text-2xl font-black ${pillar.color}`}
                >
                  {avg}
                </div>
                {isExpanded ? (
                  <ChevronUp size={14} className="text-sky/40" />
                ) : (
                  <ChevronDown size={14} className="text-sky/40" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-4 space-y-3 border-t border-sky/10 pt-4">
                {pillar.subAttributes.map((sub) => (
                  <SubSlider
                    key={sub.key}
                    label={sub.label}
                    hint={sub.hint}
                    value={subs[pillar.key][sub.key]}
                    onChange={(v) => setSub(pillar.key, sub.key, v)}
                  />
                ))}
                <p className="text-[10px] text-sky/30 font-body pt-1">
                  Pillar score = average of all four sub-attributes
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Bootstrap notice */}
      <div className="glass rounded-xl px-4 py-3 border border-ocean/20">
        <p className="text-[11px] font-mono text-sky/50 leading-relaxed">
          <span className="text-ocean font-bold">Note:</span> The
          expectation-relative PRS model (v2) activates after{" "}
          <span className="text-white">3 weekly assessments</span> per player.
          Until then, the system uses the baseline absolute formula. Assessment
          data is cumulative — each week builds the profile.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400 font-body">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 font-body">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={13} className="text-purple-400" />
            <span className="text-xs text-purple-400 font-mono">
              {success.name} — week assessment saved
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PILLARS.map((p) => (
              <div key={p.key} className="text-center">
                <div className={`font-mono font-bold text-sm ${p.color}`}>
                  {(success.scores as any)[p.key]?.toFixed(1) ?? "—"}
                </div>
                <div className="text-[9px] text-sky/40 font-mono uppercase">
                  {p.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-sky/30 font-body mt-2">
            Overall:{" "}
            <span className="text-white font-mono">
              {success.scores.overall?.toFixed(1)}
            </span>{" "}
            · Snapshots:{" "}
            <span className="text-white font-mono">
              {success.scores.weeklySnapshots}
            </span>
            {success.scores.weeklySnapshots >= 3
              ? " · ✓ Expectation model active"
              : ` · ${3 - success.scores.weeklySnapshots} more needed for expectation model`}
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedPlayerId}
        className="w-full bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <BarChart2 size={16} />
        )}
        {loading ? "Saving Assessment..." : "Save Weekly Assessment"}
      </button>
    </div>
  );
}
