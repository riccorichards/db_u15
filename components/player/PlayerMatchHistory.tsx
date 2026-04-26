"use client";
import { useState } from "react";
import { MatchHistoryEntry } from "@/types";
import { Star, Target, Zap, ChevronDown, ChevronUp } from "lucide-react";

const ratingColor = (r: number) =>
  r >= 8
    ? "text-green-400"
    : r >= 6.5
      ? "text-ocean"
      : r >= 5
        ? "text-yellow-400"
        : r > 0
          ? "text-red-400"
          : "text-sky/20";

const osiColor = (osi: number | null) =>
  osi == null
    ? "bg-sky/10 text-sky/30"
    : osi >= 7
      ? "bg-red-500/20 text-red-400"
      : osi >= 5
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-green-500/20 text-green-400";

const CMR_CRITERIA = [
  { key: "defensiveContrib", label: "Defensive" },
  { key: "technicalExec", label: "Technical" },
  { key: "tacticalDiscipline", label: "Tactical" },
  { key: "attackingContrib", label: "Attacking" },
  { key: "mentalPerformance", label: "Mental" },
] as const;

function CriteriaBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value == null) return null;
  const color =
    value >= 8 ? "bg-green-500" : value >= 5 ? "bg-ocean" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-sky/40 w-16">{label}</span>
      <div className="flex-1 h-1 bg-navy-800/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-[9px] font-mono text-sky/60 w-5 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function PlayerMatchHistory({
  matchHistory,
}: {
  matchHistory: MatchHistoryEntry[];
}) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const played = [...matchHistory].filter((m) => m.minutesPlayed > 0).reverse();

  if (!played.length) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center justify-center h-32">
        <p className="text-sky/40 text-sm font-body">
          No match appearances yet.
        </p>
      </div>
    );
  }

  const hasCMRData = played.some((m) => m.cmr !== null);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-sky/10 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Match History
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            {played.length} appearances ·{" "}
            {hasCMRData
              ? "★ structured ratings available"
              : "coach ratings — add CMR criteria for deeper analysis"}
          </p>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[90px_1fr_55px_50px_45px_45px_60px_60px_55px] gap-1 px-4 py-2 text-[10px] font-mono text-sky/30 uppercase tracking-wider border-b border-sky/5">
        <div>Date</div>
        <div>Opponent</div>
        <div className="text-center">Score</div>
        <div className="text-center">MIN</div>
        <div className="text-center">G</div>
        <div className="text-center">A</div>
        <div className="text-center">OSI</div>
        <div className="text-center">RTG</div>
        <div className="text-center">Notes</div>
      </div>

      {played.map((m) => {
        const isExpanded = expandedMatch === m.matchId;
        const hasCMR = m.cmr !== null;
        const displayRating = m.officialRating ?? m.rating;

        return (
          <div key={m.matchId}>
            <div
              className="grid grid-cols-[90px_1fr_55px_50px_45px_45px_60px_60px_55px] gap-1 px-4 py-3 items-center border-b border-sky/5 hover:bg-ocean/5 transition-colors cursor-pointer"
              onClick={() =>
                hasCMR && setExpandedMatch(isExpanded ? null : m.matchId)
              }
            >
              {/* Date */}
              <div className="text-xs font-mono text-sky/50">
                {new Date(m.date).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {/* Opponent */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono result-${m.result}`}
                >
                  {m.result}
                </span>
                <span className="text-white text-sm font-display font-bold truncate">
                  vs {m.opponent}
                </span>
                <span className="text-sky/30 text-[10px] font-mono">
                  {m.homeAway}
                </span>
              </div>

              {/* Score */}
              <div className="text-center text-xs font-mono text-sky/60">
                {m.goalsFor}–{m.goalsAgainst}
              </div>

              {/* Minutes */}
              <div className="text-center text-xs font-mono text-mist/60">
                {m.minutesPlayed}'
              </div>

              {/* Goals */}
              <div className="text-center">
                {m.goals > 0 ? (
                  <span className="flex items-center justify-center gap-0.5">
                    <Target size={10} className="text-ocean" />
                    <span className="text-sm font-mono font-bold text-white">
                      {m.goals}
                    </span>
                  </span>
                ) : (
                  <span className="text-sky/20 font-mono text-sm">—</span>
                )}
              </div>

              {/* Assists */}
              <div className="text-center">
                {m.assists > 0 ? (
                  <span className="flex items-center justify-center gap-0.5">
                    <Zap size={10} className="text-sky" />
                    <span className="text-sm font-mono font-bold text-white">
                      {m.assists}
                    </span>
                  </span>
                ) : (
                  <span className="text-sky/20 font-mono text-sm">—</span>
                )}
              </div>

              {/* OSI badge */}
              <div className="text-center">
                {m.osi != null ? (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${osiColor(m.osi)}`}
                  >
                    {m.osi.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-sky/20 font-mono text-xs">—</span>
                )}
              </div>

              {/* Rating */}
              <div className="text-center">
                <div
                  className={`text-sm font-mono font-bold ${ratingColor(displayRating)}`}
                >
                  {displayRating > 0 ? displayRating.toFixed(1) : "—"}
                </div>
                {hasCMR && m.officialRating && (
                  <div className="text-[8px] font-mono text-sky/30">★ CMR</div>
                )}
              </div>

              {/* Notes */}
              <div className="flex items-center justify-center gap-1">
                {m.isMvp && <Star size={11} className="text-yellow-400" />}
                {m.yellowCard && (
                  <div className="w-2.5 h-3 bg-yellow-400 rounded-sm" />
                )}
                {m.redCard && (
                  <div className="w-2.5 h-3 bg-red-500 rounded-sm" />
                )}
                {hasCMR &&
                  (isExpanded ? (
                    <ChevronUp size={11} className="text-sky/40" />
                  ) : (
                    <ChevronDown size={11} className="text-sky/40" />
                  ))}
              </div>
            </div>

            {/* Expanded CMR breakdown */}
            {isExpanded && hasCMR && (
              <div className="px-5 py-4 bg-ocean/5 border-b border-sky/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-mono text-sky/40 uppercase tracking-wider mb-2">
                      Structured Rating Breakdown
                    </p>
                    <div className="space-y-1.5">
                      {CMR_CRITERIA.map(({ key, label }) => (
                        <CriteriaBar
                          key={key}
                          label={label}
                          value={m.cmrCriteria[key]}
                        />
                      ))}
                      {m.defensiveImpact != null && (
                        <CriteriaBar
                          label="Def. Impact"
                          value={m.defensiveImpact}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-sky/40 uppercase tracking-wider mb-2">
                      Rating Composition
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          label: "CMR (structured)",
                          value: m.cmr,
                          sub: "Position-weighted criteria",
                        },
                        {
                          label: "Official Rating",
                          value: m.officialRating,
                          sub: "CMR×0.65 + Coach×0.35, OSI-adjusted",
                        },
                        {
                          label: "Coach Rating (raw)",
                          value: m.rating,
                          sub: "Original gut-feel rating",
                        },
                      ]
                        .filter(({ value }) => value != null)
                        .map(({ label, value, sub }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <div className="text-[10px] font-mono text-sky/60">
                                {label}
                              </div>
                              <div className="text-[9px] text-sky/30 font-body">
                                {sub}
                              </div>
                            </div>
                            <span
                              className={`text-sm font-mono font-bold ${ratingColor(value!)}`}
                            >
                              {value!.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      {m.osi != null && (
                        <div className="flex items-center justify-between pt-2 border-t border-sky/10">
                          <div className="text-[10px] font-mono text-sky/60">
                            Opponent OSI
                          </div>
                          <span
                            className={`text-xs font-mono font-bold ${osiColor(m.osi).split(" ")[1]}`}
                          >
                            {m.osi.toFixed(1)} / 10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
