"use client";
import { useState } from "react";
import {
  Swords,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  adminPassword: string;
  onSuccess?: () => void;
}

function SliderField({
  label,
  hint,
  value,
  min = 1,
  max = 10,
  step = 1,
  onChange,
  inverse = false,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  inverse?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = inverse
    ? value <= 3
      ? "text-green-400"
      : value <= 6
        ? "text-yellow-400"
        : "text-red-400"
    : value >= 8
      ? "text-green-400"
      : value >= 5
        ? "text-ocean"
        : "text-red-400";

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-mono text-sky/60 uppercase tracking-wider">
          {label}
        </label>
        <span className={`text-xs font-mono font-bold ${color}`}>
          {value}
          {max === 10 ? "/10" : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-ocean"
      />
      {hint && (
        <p className="text-[10px] text-sky/30 font-body mt-0.5">{hint}</p>
      )}
    </div>
  );
}

export default function LogOpponentForm({ adminPassword, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: "",
    leaguePosition: 6,
    points: 0,
    goalsScored: 0,
    goalsConceded: 0,
    coachAssessment: 5,
    totalTeams: 12,
    maxPoints: 66,
    upcoming: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ osi: number; name: string } | null>(
    null,
  );
  const [error, setError] = useState("");

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Opponent name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/opponents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save opponent");
      }
      const data = await res.json();
      setSuccess({ osi: data.osi ?? 0, name: form.name });
      setForm({
        name: "",
        leaguePosition: 6,
        points: 0,
        goalsScored: 0,
        goalsConceded: 0,
        coachAssessment: 5,
        totalTeams: 12,
        maxPoints: 66,
        upcoming: false,
      });
      onSuccess?.();
      setTimeout(() => setSuccess(null), 5000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const osiPreview = (() => {
    const totalTeams = form.totalTeams;
    const maxPoints = form.maxPoints;
    const normalizedPoints = Math.min((form.points / maxPoints) * 10, 10);
    const goalRatio = form.goalsScored - form.goalsConceded;
    const normalizedGoalRatio = Math.min(
      Math.max(((goalRatio + 30) / 60) * 10, 0),
      10,
    );
    const normalizedPosition = Math.min(
      Math.max(((totalTeams - form.leaguePosition) / (totalTeams - 1)) * 10, 0),
      10,
    );
    const osi =
      form.coachAssessment * 0.4 +
      normalizedPoints * 0.25 +
      normalizedGoalRatio * 0.2 +
      normalizedPosition * 0.15;
    return Math.min(Math.max(osi, 0), 10).toFixed(1);
  })();

  const osiColor =
    parseFloat(osiPreview) >= 7
      ? "text-red-400"
      : parseFloat(osiPreview) >= 5
        ? "text-yellow-400"
        : "text-green-400";

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Swords size={17} className="text-red-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Opponent Profile
          </h2>
          <p className="text-xs text-sky/40 font-body">
            Log opponent stats to enable match prediction
          </p>
        </div>
        {/* Live OSI preview */}
        <div className="ml-auto text-right">
          <div className={`font-display text-2xl font-black ${osiColor}`}>
            {osiPreview}
          </div>
          <div className="text-[10px] font-mono text-sky/40">OSI PREVIEW</div>
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
          Opponent Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="FC Tbilisi, Lokomotivi..."
          className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-sky/30 font-body outline-none border border-sky/10 focus:border-ocean bg-transparent"
        />
      </div>

      {/* League stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          {
            key: "leaguePosition",
            label: "League Position",
            min: 1,
            max: 20,
            hint: "Current standing",
          },
          {
            key: "points",
            label: "Points",
            min: 0,
            max: 99,
            hint: "Accumulated this season",
          },
          {
            key: "goalsScored",
            label: "Goals Scored",
            min: 0,
            max: 99,
            hint: "Season total",
          },
          {
            key: "goalsConceded",
            label: "Goals Conceded",
            min: 0,
            max: 99,
            hint: "Season total",
          },
        ].map(({ key, label, min, max, hint }) => (
          <div key={key}>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              {label}
            </label>
            <input
              type="number"
              min={min}
              max={max}
              value={(form as any)[key]}
              onChange={(e) => set(key, parseInt(e.target.value) || 0)}
              className="w-full glass rounded-xl px-3 py-2 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
            />
            <p className="text-[10px] text-sky/30 font-body mt-0.5">{hint}</p>
          </div>
        ))}
      </div>

      {/* Coach assessment */}
      <div className="mb-4">
        <SliderField
          label="Coach Assessment"
          hint="Your gut feeling — 1 (very weak) to 10 (elite). This is weighted 40% in OSI."
          value={form.coachAssessment}
          onChange={(v) => set("coachAssessment", v)}
        />
      </div>

      {/* Upcoming toggle */}
      <div className="flex items-center gap-3 p-3 glass rounded-xl mb-4">
        <button
          onClick={() => set("upcoming", !form.upcoming)}
          className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${
            form.upcoming ? "bg-ocean" : "bg-navy-800/60"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
              form.upcoming ? "left-5" : "left-1"
            }`}
          />
        </button>
        <div>
          <div className="text-sm font-mono text-white">
            Mark as upcoming fixture
          </div>
          <div className="text-[10px] text-sky/40 font-body">
            Shows Win Probability card on dashboard. Only one opponent can be
            upcoming at a time.
          </div>
        </div>
      </div>

      {/* Advanced settings */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs font-mono text-sky/40 hover:text-sky/70 mb-3 transition-colors"
      >
        {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Advanced settings (league size / max points)
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 glass rounded-xl border border-sky/5">
          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Total Teams in League
            </label>
            <input
              type="number"
              min={4}
              max={24}
              value={form.totalTeams}
              onChange={(e) =>
                set("totalTeams", parseInt(e.target.value) || 12)
              }
              className="w-full glass rounded-xl px-3 py-2 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Max Possible Points
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={form.maxPoints}
              onChange={(e) => set("maxPoints", parseInt(e.target.value) || 66)}
              className="w-full glass rounded-xl px-3 py-2 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
            />
          </div>
          <p className="col-span-2 text-[10px] text-sky/30 font-body">
            Used to normalize OSI. Default: 12 teams, 66 max points (22 games ×
            3pts).
          </p>
        </div>
      )}

      {/* OSI breakdown */}
      <div className="p-3 glass rounded-xl mb-4 border border-sky/5">
        <p className="text-[10px] font-mono text-sky/40 uppercase tracking-wider mb-2">
          OSI FORMULA PREVIEW
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono">
          <span className="text-sky/50">Coach ×0.40</span>
          <span className="text-sky/50">Points ×0.25</span>
          <span className="text-sky/50">Goal Ratio ×0.20</span>
          <span className="text-sky/50">Position ×0.15</span>
          <span className={`ml-auto font-bold ${osiColor}`}>
            = {osiPreview} / 10
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400 font-body mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-green-400 font-body mb-3 flex items-center gap-2">
          <CheckCircle size={13} />
          {success.name} saved — OSI:{" "}
          <strong>{success.osi.toFixed(1)}/10</strong>
          {form.upcoming && " · Marked as upcoming fixture"}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Swords size={16} />
        )}
        {loading ? "Saving..." : "Save Opponent Profile"}
      </button>
    </div>
  );
}
