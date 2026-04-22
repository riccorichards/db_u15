"use client";
import { useState } from "react";
import { Brain, Dumbbell, Loader2, Save } from "lucide-react";

interface Props {
  adminPassword: string;
  current: { trainingCondition: number; mentalityScore: number };
  onSuccess: () => void;
}

export default function ConditionForm({ adminPassword, current, onSuccess }: Props) {
  const [training, setTraining] = useState(current.trainingCondition);
  const [mentality, setMentality] = useState(current.mentalityScore);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingCondition: training,
          mentalityScore: mentality,
          adminPassword,
        }),
      });
      setSuccess(true);
      onSuccess();
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (val: number) => {
    const pct = Math.round(val * 100);
    if (pct >= 80) return { text: "Excellent", color: "text-green-400" };
    if (pct >= 60) return { text: "Good", color: "text-ocean" };
    if (pct >= 40) return { text: "Moderate", color: "text-yellow-400" };
    return { text: "Low", color: "text-red-400" };
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-ocean/20 flex items-center justify-center">
          <Brain size={17} className="text-ocean" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Team Condition
          </h2>
          <p className="text-xs text-sky/40 font-body">Update before next match</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Training */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-sky/60" />
              <span className="text-sm font-body text-sky/70">Training Condition</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${getLabel(training).color}`}>
                {getLabel(training).text}
              </span>
              <span className="text-white font-mono text-sm font-bold">
                {Math.round(training * 100)}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={training}
            onChange={(e) => setTraining(parseFloat(e.target.value))}
            className="w-full accent-ocean"
          />
          <div className="flex justify-between text-[10px] font-mono text-sky/20 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mentality */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-sky/60" />
              <span className="text-sm font-body text-sky/70">Mentality Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${getLabel(mentality).color}`}>
                {getLabel(mentality).text}
              </span>
              <span className="text-white font-mono text-sm font-bold">
                {Math.round(mentality * 100)}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={mentality}
            onChange={(e) => setMentality(parseFloat(e.target.value))}
            className="w-full accent-ocean"
          />
          <div className="flex justify-between text-[10px] font-mono text-sky/20 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-green-400 font-body">
          ✓ Condition updated!
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full mt-4 bg-navy-800 hover:bg-ocean disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {loading ? "Saving..." : "Update Condition"}
      </button>
    </div>
  );
}
