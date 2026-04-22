"use client";
import { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  adminPassword: string;
}

const POSITIONS = ["GK", "DEF", "MID", "FWD"] as const;

export default function CreatePlayerModal({
  onClose,
  onSuccess,
  adminPassword,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    number: "",
    position: "MID" as (typeof POSITIONS)[number],
    avatarKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.surname || !form.number || !form.position) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          number: parseInt(form.number),
          avatarKey: form.avatarKey || `player_${form.number}`,
          adminPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create player");
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pitch/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-bright rounded-2xl w-full max-w-md p-6 shadow-2xl border border-ocean/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ocean/20 flex items-center justify-center">
              <UserPlus size={17} className="text-ocean" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white uppercase tracking-wide">
                Add Player
              </h2>
              <p className="text-xs text-sky/50 font-body">
                Create new squad member
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-sky/50 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
                First Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Giorgi"
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-sky/30 font-body outline-none focus:border-ocean border border-sky/10 transition-colors bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
                Surname *
              </label>
              <input
                type="text"
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
                placeholder="Beridze"
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-sky/30 font-body outline-none focus:border-ocean border border-sky/10 transition-colors bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
                Jersey # *
              </label>
              <input
                type="number"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder="7"
                min="1"
                max="99"
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-sky/30 font-mono outline-none focus:border-ocean border border-sky/10 transition-colors bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
                Position *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setForm({ ...form, position: pos })}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                      form.position === pos
                        ? `pos-${pos} scale-105`
                        : "glass text-sky/40 hover:text-sky/70"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              Avatar Key
            </label>
            <input
              type="text"
              value={form.avatarKey}
              onChange={(e) => setForm({ ...form, avatarKey: e.target.value })}
              placeholder={`player_${form.number || "7"} (auto if empty)`}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-sky/30 font-mono outline-none focus:border-ocean border border-sky/10 transition-colors bg-transparent"
            />
            <p className="text-xs text-sky/30 font-body mt-1">
              Maps to{" "}
              <code className="font-mono">
                /public/assets/players/[key].png
              </code>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400 font-body">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-ocean hover:bg-ocean/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            {loading ? "Creating..." : "Add to Squad"}
          </button>
        </div>
      </div>
    </div>
  );
}
