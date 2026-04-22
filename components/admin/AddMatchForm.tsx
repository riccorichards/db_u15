"use client";
import { useState } from "react";
import { Player } from "@/types";
import { Plus, Minus, Loader2, ClipboardList } from "lucide-react";

interface Props {
  players: Player[];
  adminPassword: string;
  onSuccess: () => void;
}

interface PerfEntry {
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  rating: number;
  isMvp: boolean;
  yellowCard: boolean;
  redCard: boolean;
}

export default function AddMatchForm({
  players,
  adminPassword,
  onSuccess,
}: Props) {
  const [match, setMatch] = useState({
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    homeAway: "home" as "home" | "away",
    goalsFor: 0,
    goalsAgainst: 0,
    trainingCondition: 0.75,
    mentalityScore: 0.7,
  });
  const [performances, setPerformances] = useState<PerfEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const addPlayer = (playerId: string) => {
    if (performances.find((p) => p.playerId === playerId)) return;
    setPerformances([
      ...performances,
      {
        playerId,
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        rating: 7,
        isMvp: false,
        yellowCard: false,
        redCard: false,
      },
    ]);
  };

  const removePlayer = (playerId: string) => {
    setPerformances(performances.filter((p) => p.playerId !== playerId));
  };

  const updatePerf = (
    playerId: string,
    field: keyof PerfEntry,
    value: unknown,
  ) => {
    setPerformances(
      performances.map((p) =>
        p.playerId === playerId ? { ...p, [field]: value } : p,
      ),
    );
  };

  const handleMvp = (playerId: string) => {
    setPerformances(
      performances.map((p) => ({
        ...p,
        isMvp: p.playerId === playerId ? !p.isMvp : false,
      })),
    );
  };

  const handleSubmit = async () => {
    if (!match.opponent) {
      setError("Opponent name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...match,
          playerPerformances: performances,
          adminPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save match");
      }
      setSuccess(true);
      setMatch({
        date: new Date().toISOString().split("T")[0],
        opponent: "",
        homeAway: "home",
        goalsFor: 0,
        goalsAgainst: 0,
        trainingCondition: 0.75,
        mentalityScore: 0.7,
      });
      setPerformances([]);
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const playerMap = Object.fromEntries(players.map((p) => [p._id!, p]));
  const addedIds = new Set(performances.map((p) => p.playerId));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-ocean/20 flex items-center justify-center">
          <ClipboardList size={17} className="text-ocean" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Log Match Result
          </h2>
          <p className="text-xs text-sky/40 font-body">
            Add result + player performances
          </p>
        </div>
      </div>

      {/* Match details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
            Date
          </label>
          <input
            type="date"
            value={match.date}
            onChange={(e) => setMatch({ ...match, date: e.target.value })}
            className="w-full glass rounded-xl px-3 py-2 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
            Opponent *
          </label>
          <input
            type="text"
            value={match.opponent}
            onChange={(e) => setMatch({ ...match, opponent: e.target.value })}
            placeholder="FC Tbilisi"
            className="w-full glass rounded-xl px-3 py-2 text-sm text-white placeholder-sky/30 font-body outline-none border border-sky/10 focus:border-ocean bg-transparent"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
            Venue
          </label>
          <div className="flex gap-2">
            {(["home", "away"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMatch({ ...match, homeAway: v })}
                className={`flex-1 py-2 rounded-xl text-xs font-mono uppercase transition-all ${
                  match.homeAway === v
                    ? "bg-ocean text-white"
                    : "glass text-sky/50 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {(["goalsFor", "goalsAgainst"] as const).map((field) => (
          <div key={field}>
            <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
              {field === "goalsFor" ? "Our Goals" : "Their Goals"}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setMatch({ ...match, [field]: Math.max(0, match[field] - 1) })
                }
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-sky/60 hover:text-white"
              >
                <Minus size={14} />
              </button>
              <div className="flex-1 text-center font-display text-3xl font-black text-white">
                {match[field]}
              </div>
              <button
                onClick={() =>
                  setMatch({ ...match, [field]: match[field] + 1 })
                }
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-sky/60 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Player performances */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-sky/70">
            Player Performances
          </h3>
          <span className="text-xs font-mono text-sky/40">
            {performances.length} added
          </span>
        </div>

        {/* Player picker */}
        <div className="flex flex-wrap gap-2 mb-4">
          {players
            .filter((p) => !addedIds.has(p._id!))
            .map((p) => (
              <button
                key={p._id}
                onClick={() => addPlayer(p._id!)}
                className="glass rounded-lg px-2.5 py-1.5 text-xs font-mono text-sky/60 hover:text-white hover:border-ocean/40 border border-transparent transition-all flex items-center gap-1.5"
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
        </div>

        {/* Performance rows */}
        {performances.length > 0 && (
          <div className="space-y-2">
            {performances.map((perf) => {
              const player = playerMap[perf.playerId];
              if (!player) return null;
              return (
                <div
                  key={perf.playerId}
                  className="glass rounded-xl p-3 grid grid-cols-[1fr_auto] gap-3 items-start"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-mono pos-${player.position}`}
                      >
                        {player.position}
                      </span>
                      <span className="text-white text-sm font-display font-bold">
                        {player.name} {player.surname}
                      </span>
                      <span className="text-sky/30 text-xs font-mono">
                        #{player.number}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          { field: "minutesPlayed", label: "MIN", max: 120 },
                          { field: "goals", label: "G", max: 10 },
                          { field: "assists", label: "A", max: 10 },
                          { field: "rating", label: "RTG", max: 10 },
                        ] as const
                      ).map(({ field, label, max }) => (
                        <div key={field}>
                          <label className="text-[10px] font-mono text-sky/40 block mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            value={perf[field]}
                            min={field === "rating" ? 1 : 0}
                            max={max}
                            step={field === "rating" ? 0.5 : 1}
                            onChange={(e) =>
                              updatePerf(
                                perf.playerId,
                                field,
                                parseFloat(e.target.value),
                              )
                            }
                            className="w-full glass rounded-lg px-2 py-1 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {(
                        [
                          {
                            field: "isMvp",
                            label: "⭐ MVP",
                            handler: () => handleMvp(perf.playerId),
                          },
                          {
                            field: "yellowCard",
                            label: "🟨 Yellow",
                            handler: () =>
                              updatePerf(
                                perf.playerId,
                                "yellowCard",
                                !perf.yellowCard,
                              ),
                          },
                          {
                            field: "redCard",
                            label: "🟥 Red",
                            handler: () =>
                              updatePerf(
                                perf.playerId,
                                "redCard",
                                !perf.redCard,
                              ),
                          },
                        ] as const
                      ).map(({ field, label, handler }) => (
                        <button
                          key={field}
                          onClick={handler}
                          className={`text-xs px-2 py-1 rounded-lg font-mono transition-all ${
                            perf[field]
                              ? "bg-ocean/30 text-white border border-ocean/50"
                              : "glass text-sky/40 hover:text-sky/70"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removePlayer(perf.playerId)}
                    className="w-7 h-7 glass rounded-lg flex items-center justify-center text-sky/30 hover:text-red-400 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400 font-body mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-green-400 font-body mb-3">
          ✓ Match saved successfully!
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
          <ClipboardList size={16} />
        )}
        {loading ? "Saving..." : "Save Match"}
      </button>
    </div>
  );
}
