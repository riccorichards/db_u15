"use client";
import { useState, useEffect } from "react";
import { Player } from "@/types";
import { Target, Loader2, CheckCircle, Info } from "lucide-react";

interface Props {
  players: Player[];
  adminPassword: string;
  onSuccess?: () => void;
}

interface KPIField {
  key: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
}

const KPI_FIELDS: KPIField[] = [
  {
    key: "prsAvg",
    label: "PRS Average",
    hint: "Target average readiness score across the season",
    min: 0,
    max: 100,
    step: 5,
    unit: "/100",
    color: "text-ocean",
  },
  {
    key: "goals",
    label: "Goals",
    hint: "Season goal target",
    min: 0,
    max: 50,
    step: 1,
    unit: "goals",
    color: "text-green-400",
  },
  {
    key: "avgRating",
    label: "Avg Match Rating",
    hint: "Target average official match rating",
    min: 1,
    max: 10,
    step: 0.5,
    unit: "/10",
    color: "text-yellow-400",
  },
  {
    key: "attendanceRate",
    label: "Attendance Rate",
    hint: "Target % of training sessions attended",
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
    color: "text-purple-400",
  },
  {
    key: "consistencyScore",
    label: "Consistency Score",
    hint: "Target match rating consistency (low std dev)",
    min: 0,
    max: 100,
    step: 5,
    unit: "/100",
    color: "text-blue-400",
  },
  {
    key: "disciplineScore",
    label: "Discipline Score",
    hint: "Target professionalism score (rolling 28 days)",
    min: 50,
    max: 100,
    step: 5,
    unit: "/100",
    color: "text-red-400",
  },
  {
    key: "pillarOverall",
    label: "Pillar Overall",
    hint: "Target overall player attribute score by season end",
    min: 1,
    max: 10,
    step: 0.5,
    unit: "/10",
    color: "text-emerald-400",
  },
];

interface CurrentValues {
  prsAvg: number;
  goals: number;
  avgRating: number;
  attendanceRate: number;
  consistencyScore: number;
  disciplineScore: number;
  pillarOverall: number;
}

export default function LogKPIForm({
  players,
  adminPassword,
  onSuccess,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [targets, setTargets] = useState<Record<string, number | null>>(
    Object.fromEntries(KPI_FIELDS.map((f) => [f.key, null])),
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(KPI_FIELDS.map((f) => [f.key, false])),
  );
  const [currentValues, setCurrentValues] = useState<CurrentValues | null>(
    null,
  );
  const [existingTargets, setExistingTargets] = useState<Record<
    string,
    number
  > | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // When player changes, fetch their current KPI data
  useEffect(() => {
    if (!selectedPlayerId) {
      setCurrentValues(null);
      setExistingTargets(null);
      return;
    }
    setLoadingPlayer(true);
    fetch(`/api/kpi?playerId=${selectedPlayerId}`)
      .then((r) => r.json())
      .then((data) => {
        setCurrentValues(data.currentValues ?? null);
        if (data.targets) {
          setExistingTargets(data.targets);
          // Pre-fill form with existing targets
          const newTargets: Record<string, number | null> = {};
          const newEnabled: Record<string, boolean> = {};
          KPI_FIELDS.forEach((f) => {
            const existing = data.targets[f.key];
            newTargets[f.key] = existing ?? null;
            newEnabled[f.key] = existing != null;
          });
          setTargets(newTargets);
          setEnabled(newEnabled);
        } else {
          setExistingTargets(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlayer(false));
  }, [selectedPlayerId]);

  const toggleField = (key: string) => {
    setEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) setTargets((t) => ({ ...t, [key]: null }));
      else {
        const field = KPI_FIELDS.find((f) => f.key === key)!;
        const curr = currentValues?.[key as keyof CurrentValues];
        const sensible = curr
          ? Math.min(field.max, curr * 1.1)
          : (field.min + field.max) / 2;
        setTargets((t) => ({
          ...t,
          [key]: Math.round(sensible / field.step) * field.step,
        }));
      }
      return next;
    });
  };

  const setTarget = (key: string, value: number) =>
    setTargets((t) => ({ ...t, [key]: value }));

  const handleSubmit = async () => {
    if (!selectedPlayerId) {
      setError("Select a player first.");
      return;
    }
    const activeTargets = Object.fromEntries(
      KPI_FIELDS.filter((f) => enabled[f.key]).map((f) => [
        f.key,
        targets[f.key],
      ]),
    );
    if (Object.keys(activeTargets).length === 0) {
      setError("Enable at least one KPI target.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kpi", {
        method: existingTargets ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword,
          playerId: selectedPlayerId,
          targets: activeTargets,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlayer = players.find((p) => p._id === selectedPlayerId);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Target size={17} className="text-yellow-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Season KPI Targets
          </h2>
          <p className="text-xs text-sky/40 font-body">
            Set development goals — players see progress live on their profile
          </p>
        </div>
      </div>

      {/* Player selector */}
      <div className="mb-5">
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

        {existingTargets && (
          <p className="text-[10px] text-yellow-400/70 font-mono mt-1.5">
            ✓ Existing targets found — form pre-filled. Saving will update them.
          </p>
        )}
        {loadingPlayer && (
          <p className="text-[10px] text-sky/40 font-mono mt-1.5 flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" /> Loading current
            stats...
          </p>
        )}
      </div>

      {/* KPI fields */}
      <div className="space-y-3">
        {KPI_FIELDS.map((field) => {
          const isEnabled = enabled[field.key];
          const curr = currentValues?.[field.key as keyof CurrentValues];
          const target = targets[field.key];
          const progress =
            curr != null && target != null
              ? Math.min(100, (curr / target) * 100)
              : null;

          return (
            <div
              key={field.key}
              className={`rounded-xl p-3 transition-all border ${
                isEnabled
                  ? "glass border-sky/20"
                  : "border-sky/5 bg-navy-950/20 opacity-60"
              }`}
            >
              {/* Toggle row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleField(field.key)}
                    className={`w-8 h-5 rounded-full transition-all relative flex-shrink-0 ${
                      isEnabled ? "bg-ocean" : "bg-navy-800/60"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        isEnabled ? "left-3.5" : "left-0.5"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-mono font-bold ${isEnabled ? field.color : "text-sky/40"}`}
                  >
                    {field.label}
                  </span>
                </div>
                {curr != null && (
                  <span className="text-[10px] font-mono text-sky/50">
                    Current:{" "}
                    <span className="text-white">
                      {typeof curr === "number" ? curr.toFixed(1) : curr}
                      {field.unit}
                    </span>
                  </span>
                )}
              </div>

              {isEnabled && target != null && (
                <>
                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={target}
                      onChange={(e) =>
                        setTarget(field.key, parseFloat(e.target.value))
                      }
                      className="flex-1 accent-ocean"
                    />
                    <span
                      className={`text-sm font-mono font-bold w-14 text-right ${field.color}`}
                    >
                      {target}
                      {field.unit}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {progress !== null && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] font-mono text-sky/40 mb-1">
                        <span>Current progress toward target</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-navy-800/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress >= 100
                              ? "bg-green-500"
                              : progress >= 60
                                ? "bg-ocean"
                                : progress >= 30
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-sky/30 font-body mt-1.5">
                    {field.hint}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 mt-4 p-3 glass rounded-xl border border-sky/5">
        <Info size={12} className="text-sky/40 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] font-body text-sky/40 leading-relaxed">
          Enable only the KPIs relevant to this player. Disabled KPIs won't
          appear on their radar. Season dates run Sep 2025 – May 2026.
          Projections are linear extrapolations from current rate.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400 font-body mt-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-green-400 font-body mt-3 flex items-center gap-2">
          <CheckCircle size={13} />
          KPI targets saved for {selectedPlayer?.name} {selectedPlayer?.surname}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedPlayerId}
        className="w-full mt-4 bg-yellow-600/80 hover:bg-yellow-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Target size={16} />
        )}
        {loading
          ? "Saving..."
          : existingTargets
            ? "Update KPI Targets"
            : "Set KPI Targets"}
      </button>
    </div>
  );
}
