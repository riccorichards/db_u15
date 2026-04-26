"use client";
import { useState, useEffect } from "react";
import { Player, Opponent } from "@/types";
import {
  Plus,
  Minus,
  Loader2,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  // CMR criteria — optional
  defensiveContrib: number | null;
  technicalExec: number | null;
  tacticalDiscipline: number | null;
  attackingContrib: number | null;
  mentalPerformance: number | null;
  defensiveImpact: number | null;
}

function CriteriaSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  const v = value ?? 5;
  const color =
    v >= 8 ? "text-green-400" : v >= 5 ? "text-ocean" : "text-red-400";
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[10px] font-mono text-sky/50 uppercase">
          {label}
        </span>
        <span className={`text-[10px] font-mono font-bold ${color}`}>
          {v}/10
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={v}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-ocean"
      />
    </div>
  );
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
    opponentId: "" as string,
  });
  const [performances, setPerformances] = useState<PerfEntry[]>([]);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expandedCMR, setExpandedCMR] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/opponents")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOpponents(data);
      })
      .catch(() => {});
  }, []);

  const addPlayer = (playerId: string) => {
    if (performances.find((p) => p.playerId === playerId)) return;
    setPerformances([
      ...performances,
      {
        playerId,
        minutesPlayed: 80,
        goals: 0,
        assists: 0,
        rating: 7,
        isMvp: false,
        yellowCard: false,
        redCard: false,
        defensiveContrib: null,
        technicalExec: null,
        tacticalDiscipline: null,
        attackingContrib: null,
        mentalPerformance: null,
        defensiveImpact: null,
      },
    ]);
  };

  const removePlayer = (playerId: string) =>
    setPerformances(performances.filter((p) => p.playerId !== playerId));

  const updatePerf = (
    playerId: string,
    field: keyof PerfEntry,
    value: unknown,
  ) =>
    setPerformances(
      performances.map((p) =>
        p.playerId === playerId ? { ...p, [field]: value } : p,
      ),
    );

  const handleMvp = (playerId: string) =>
    setPerformances(
      performances.map((p) => ({
        ...p,
        isMvp: p.playerId === playerId ? !p.isMvp : false,
      })),
    );

  const toggleCMR = (playerId: string) =>
    setExpandedCMR((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
        // Auto-initialize all CMR criteria to 5 so calculation starts immediately
        setPerformances((perfs) =>
          perfs.map((p) =>
            p.playerId === playerId
              ? {
                  ...p,
                  defensiveContrib: p.defensiveContrib ?? 5,
                  technicalExec: p.technicalExec ?? 5,
                  tacticalDiscipline: p.tacticalDiscipline ?? 5,
                  attackingContrib: p.attackingContrib ?? 5,
                  mentalPerformance: p.mentalPerformance ?? 5,
                  defensiveImpact: p.defensiveImpact ?? 5,
                }
              : p,
          ),
        );
      }
      return next;
    });

  const handleOpponentSelect = (opponentId: string) => {
    const opp = opponents.find((o) => o._id === opponentId);
    setMatch({
      ...match,
      opponentId,
      opponent: opp?.name ?? match.opponent,
    });
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
          opponentId: match.opponentId || null,
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
        opponentId: "",
      });
      setPerformances([]);
      setExpandedCMR(new Set());
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
            Result + player performances + optional structured ratings
          </p>
        </div>
      </div>

      {/* Opponent selector */}
      {opponents.length > 0 && (
        <div className="mb-4">
          <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
            Link to Opponent Profile
            <span className="text-sky/30 ml-2 normal-case">
              (enables OSI + adjusted form index)
            </span>
          </label>
          <select
            value={match.opponentId}
            onChange={(e) => handleOpponentSelect(e.target.value)}
            className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white font-body outline-none border border-sky/10 focus:border-ocean bg-navy-950/80"
          >
            <option value="">No opponent profile — enter name manually</option>
            {opponents.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name} · OSI: {(o as any).osi ?? "—"} · Pos:{" "}
                {o.leaguePosition}
              </option>
            ))}
          </select>
        </div>
      )}

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
          <div className="space-y-3">
            {performances.map((perf) => {
              const player = playerMap[perf.playerId];
              if (!player) return null;
              const hasCMR = expandedCMR.has(perf.playerId);
              const showDefImpact =
                player.position === "DEF" || player.position === "MID";

              // Live CMR preview — position weights
              const CMR_WEIGHTS: Record<string, Record<string, number>> = {
                GK: {
                  defensive: 0.4,
                  technical: 0.15,
                  tactical: 0.25,
                  attacking: 0.05,
                  mental: 0.15,
                },
                DEF: {
                  defensive: 0.35,
                  technical: 0.15,
                  tactical: 0.25,
                  attacking: 0.1,
                  mental: 0.15,
                },
                MID: {
                  defensive: 0.2,
                  technical: 0.25,
                  tactical: 0.25,
                  attacking: 0.2,
                  mental: 0.1,
                },
                FWD: {
                  defensive: 0.05,
                  technical: 0.3,
                  tactical: 0.2,
                  attacking: 0.35,
                  mental: 0.1,
                },
              };
              const w = CMR_WEIGHTS[player.position] ?? CMR_WEIGHTS.MID;
              const criteriaFilled =
                perf.defensiveContrib !== null &&
                perf.technicalExec !== null &&
                perf.tacticalDiscipline !== null &&
                perf.attackingContrib !== null &&
                perf.mentalPerformance !== null;

              const liveCMR = criteriaFilled
                ? parseFloat(
                    (
                      (perf.defensiveContrib ?? 5) * w.defensive +
                      (perf.technicalExec ?? 5) * w.technical +
                      (perf.tacticalDiscipline ?? 5) * w.tactical +
                      (perf.attackingContrib ?? 5) * w.attacking +
                      (perf.mentalPerformance ?? 5) * w.mental
                    ).toFixed(2),
                  )
                : null;

              // When CMR is filled, auto-set rating to CMR×0.65 + gutFeel×0.35
              // gutFeel defaults to CMR itself so OfficialRating = CMR until coach overrides
              const autoRating =
                liveCMR !== null
                  ? parseFloat((liveCMR * 0.65 + perf.rating * 0.35).toFixed(2))
                  : perf.rating;

              const ratingColor =
                autoRating >= 8
                  ? "text-green-400"
                  : autoRating >= 6.5
                    ? "text-ocean"
                    : autoRating >= 5
                      ? "text-yellow-400"
                      : "text-red-400";

              return (
                <div key={perf.playerId} className="glass rounded-xl p-3">
                  {/* Player header */}
                  <div className="flex items-center gap-2 mb-3">
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
                    <button
                      onClick={() => removePlayer(perf.playerId)}
                      className="ml-auto w-6 h-6 glass rounded-lg flex items-center justify-center text-sky/30 hover:text-red-400 transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                  </div>

                  {/* Core stats — 3 cols + rating display */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {(
                      [
                        { field: "minutesPlayed", label: "MIN", max: 120 },
                        { field: "goals", label: "G", max: 10 },
                        { field: "assists", label: "A", max: 10 },
                      ] as const
                    ).map(({ field, label, max }) => (
                      <div key={field}>
                        <label className="text-[10px] font-mono text-sky/40 block mb-1">
                          {label}
                        </label>
                        <input
                          type="number"
                          value={perf[field]}
                          min={0}
                          max={max}
                          step={1}
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

                    {/* Rating — auto-computed when CMR filled, manual otherwise */}
                    <div>
                      <label className="text-[10px] font-mono text-sky/40 block mb-1">
                        {criteriaFilled ? "OFFICIAL RTG" : "COACH RTG"}
                      </label>
                      {criteriaFilled ? (
                        <div
                          className={`glass rounded-lg px-2 py-1 text-sm font-mono font-bold text-center border border-ocean/30 ${ratingColor}`}
                        >
                          {autoRating.toFixed(1)}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={perf.rating}
                          min={1}
                          max={10}
                          step={0.5}
                          onChange={(e) =>
                            updatePerf(
                              perf.playerId,
                              "rating",
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full glass rounded-lg px-2 py-1 text-sm text-white font-mono outline-none border border-sky/10 focus:border-ocean bg-transparent"
                        />
                      )}
                    </div>
                  </div>

                  {/* CMR live preview strip — visible when CMR is expanded and filled */}
                  {hasCMR && criteriaFilled && liveCMR !== null && (
                    <div className="flex items-center gap-3 mb-3 px-3 py-2 glass rounded-lg border border-ocean/20">
                      <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div
                            className={`font-mono font-bold text-sm ${ratingColor}`}
                          >
                            {liveCMR.toFixed(2)}
                          </div>
                          <div className="text-[9px] font-mono text-sky/40">
                            CMR
                          </div>
                        </div>
                        <div>
                          <div className="font-mono font-bold text-sm text-sky/60">
                            {perf.rating.toFixed(1)}
                          </div>
                          <div className="text-[9px] font-mono text-sky/40">
                            Gut feel
                          </div>
                        </div>
                        <div>
                          <div
                            className={`font-mono font-bold text-sm ${ratingColor}`}
                          >
                            {autoRating.toFixed(2)}
                          </div>
                          <div className="text-[9px] font-mono text-sky/40">
                            Official
                          </div>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-sky/30 text-right leading-tight">
                        CMR×0.65
                        <br />+ Gut×0.35
                      </div>
                    </div>
                  )}

                  {/* Gut-feel override when CMR is active */}
                  {hasCMR && criteriaFilled && (
                    <div className="mb-3">
                      <label className="text-[10px] font-mono text-sky/40 uppercase mb-1 block">
                        Gut-feel override (1–10) · adjusts official rating
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={0.5}
                        value={perf.rating}
                        onChange={(e) =>
                          updatePerf(
                            perf.playerId,
                            "rating",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full accent-ocean"
                      />
                    </div>
                  )}

                  {/* Toggles */}
                  <div className="flex items-center gap-3 mb-3">
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
                            updatePerf(perf.playerId, "redCard", !perf.redCard),
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

                    <button
                      onClick={() => toggleCMR(perf.playerId)}
                      className={`ml-auto flex items-center gap-1 text-[10px] font-mono transition-colors ${
                        hasCMR
                          ? "text-ocean hover:text-sky"
                          : "text-sky/40 hover:text-sky/70"
                      }`}
                    >
                      {hasCMR ? (
                        <ChevronUp size={11} />
                      ) : (
                        <ChevronDown size={11} />
                      )}
                      {hasCMR ? "Hide" : "Rate by criteria"}
                    </button>
                  </div>

                  {/* CMR criteria sliders */}
                  {hasCMR && (
                    <div className="border-t border-sky/10 pt-3 space-y-2">
                      <p className="text-[10px] font-mono text-sky/40 mb-2">
                        CRITERIA RATING — slides auto-calculate Official Rating
                        above
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(
                          [
                            {
                              key: "defensiveContrib",
                              label: "Defensive Contribution",
                            },
                            {
                              key: "technicalExec",
                              label: "Technical Execution",
                            },
                            {
                              key: "tacticalDiscipline",
                              label: "Tactical Discipline",
                            },
                            {
                              key: "attackingContrib",
                              label: "Attacking Contribution",
                            },
                            {
                              key: "mentalPerformance",
                              label: "Mental Performance",
                            },
                          ] as const
                        ).map(({ key, label }) => (
                          <CriteriaSlider
                            key={key}
                            label={label}
                            value={perf[key] ?? 5}
                            onChange={(v) => updatePerf(perf.playerId, key, v)}
                          />
                        ))}
                        {showDefImpact && (
                          <CriteriaSlider
                            label="Defensive Impact (DEF/MID)"
                            value={perf.defensiveImpact ?? 5}
                            onChange={(v) =>
                              updatePerf(perf.playerId, "defensiveImpact", v)
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}
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
