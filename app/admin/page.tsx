"use client";
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types";
import CreatePlayerModal from "@/components/admin/CreatePlayerModal";
import AddMatchForm from "@/components/admin/AddMatchForm";
import LogTrainingForm from "@/components/admin/LogTrainingForm";
import dbLogo from "../../assets/dblogo.png";
import { getPlayerImage } from "@/lib/playerImages";
import {
  Lock,
  Users,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  ClipboardList,
  Dumbbell,
  Swords,
  BarChart2,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LogOpponentForm from "@/components/admin/LogOpponentForm";
import LogPillarForm from "@/components/admin/LogPillarForm";
import LogKPIForm from "@/components/admin/LogKPIForm";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "dinamo2025";

type TabId = "players" | "match" | "training" | "opponents" | "pillars" | "kpi";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "players", label: "Squad", icon: Users, color: "text-sky" },
  { id: "match", label: "Log Match", icon: ClipboardList, color: "text-ocean" },
  { id: "training", label: "Training", icon: Dumbbell, color: "text-ocean" },
  { id: "opponents", label: "Opponents", icon: Swords, color: "text-red-400" },
  {
    id: "pillars",
    label: "Assessment",
    icon: BarChart2,
    color: "text-purple-400",
  },
  { id: "kpi", label: "KPI Targets", icon: Target, color: "text-yellow-400" },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("players");

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  }, []);

  useEffect(() => {
    if (authed) fetchPlayers();
  }, [authed, fetchPlayers]);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else setPwError(true);
  };

  const handleDelete = async (playerId: string) => {
    if (!confirm("Remove this player from the squad?")) return;
    await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, adminPassword: ADMIN_PASSWORD }),
    });
    fetchPlayers();
  };

  // ── Login wall ─────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-bright rounded-2xl p-8 w-full max-w-sm border border-ocean/20">
          <div className="text-center mb-6">
            <Image
              src={dbLogo}
              alt="Dinamo Batumi"
              width={48}
              height={48}
              className="mx-auto mb-3"
            />
            <h1 className="font-display text-2xl font-black uppercase text-white">
              Admin Panel
            </h1>
            <p className="text-sky/50 text-sm font-body mt-1">
              Dinamo Batumi U15
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-sky/60 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter admin password"
                  className={`w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-sky/30 font-mono outline-none border transition-colors bg-transparent pr-10 ${
                    pwError
                      ? "border-red-500/50"
                      : "border-sky/10 focus:border-ocean"
                  }`}
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sky/40 hover:text-white"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pwError && (
                <p className="text-red-400 text-xs font-body mt-1">
                  Incorrect password
                </p>
              )}
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-ocean hover:bg-navy-800 text-white font-display font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Lock size={14} />
              Enter
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-xs text-sky/40 hover:text-sky/70 font-mono transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-sky/10 bg-navy-950/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src={dbLogo} alt="Dinamo Batumi" width={32} height={32} />
            <div>
              <span className="font-display font-bold text-white text-sm uppercase">
                Admin
              </span>
              <span className="text-sky/30 font-mono text-xs ml-2">
                U15 Squad Hub
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="glass rounded-xl px-3 py-1.5 text-xs font-mono text-sky/50 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={11} />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-display font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-ocean text-white"
                    : "glass text-sky/50 hover:text-white"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : tab.color}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Squad tab ─────────────────────────────────────────── */}
        {activeTab === "players" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-black uppercase text-white">
                  Squad
                </h2>
                <p className="text-sky/40 text-xs font-body">
                  {players.length} players registered
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-ocean hover:bg-navy-800 text-white font-display font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle size={15} />
                Add Player
              </button>
            </div>

            {players.length === 0 ? (
              <div className="glass rounded-2xl py-20 text-center">
                <Users size={32} className="text-sky/20 mx-auto mb-3" />
                <p className="text-sky/40 font-body text-sm">No players yet.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-ocean hover:text-sky text-sm font-mono transition-colors"
                >
                  Add first player →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {players.map((player) => (
                  <Link
                    href={`/players/${player._id}`}
                    key={player._id}
                    className="glass rounded-2xl p-4 relative group"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(player._id!);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-lg glass flex items-center justify-center text-sky/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>

                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-navy-800/60 mx-auto mb-3 border border-sky/10">
                      <Image
                        src={getPlayerImage(player.avatarKey)}
                        alt={`${player.name} ${player.surname}`}
                        fill
                        sizes="64px"
                        className="object-cover object-top"
                        quality={90}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold text-white">
                        {player.name} {player.surname}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-mono pos-${player.position}`}
                        >
                          {player.position}
                        </span>
                        <span className="text-sky/30 font-mono text-xs">
                          #{player.number}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-3">
                      {[
                        { label: "G", value: player.goals },
                        { label: "A", value: player.assists },
                        { label: "MVP", value: player.mvpCount },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="glass rounded-lg py-1.5 text-center"
                        >
                          <div className="font-mono font-bold text-white text-sm">
                            {value}
                          </div>
                          <div className="text-[10px] font-mono text-sky/30">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Match tab ─────────────────────────────────────────── */}
        {activeTab === "match" && (
          <AddMatchForm
            players={players}
            adminPassword={ADMIN_PASSWORD}
            onSuccess={fetchPlayers}
          />
        )}

        {/* ── Training tab ──────────────────────────────────────── */}
        {activeTab === "training" && (
          <LogTrainingForm
            players={players}
            adminPassword={ADMIN_PASSWORD}
            onSuccess={fetchPlayers}
          />
        )}

        {/* ── Opponents tab ─────────────────────────────────────── */}
        {activeTab === "opponents" && (
          <div className="space-y-5">
            <div className="glass rounded-xl px-4 py-3 border border-red-500/10 flex items-start gap-3">
              <Swords size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono text-white font-bold mb-0.5">
                  Why this matters
                </p>
                <p className="text-[11px] font-body text-sky/50 leading-relaxed">
                  Opponent profiles unlock{" "}
                  <span className="text-white">
                    OSI (Opponent Strength Index)
                  </span>
                  , <span className="text-white">Win Probability</span> on the
                  dashboard, and the{" "}
                  <span className="text-white">
                    Difficulty-Adjusted Form Index
                  </span>{" "}
                  in MRS. A win against OSI 8 weighs more than a win against OSI
                  2.
                </p>
              </div>
            </div>
            <LogOpponentForm
              adminPassword={ADMIN_PASSWORD}
              onSuccess={fetchPlayers}
            />
          </div>
        )}

        {/* ── Pillars tab ───────────────────────────────────────── */}
        {activeTab === "pillars" && (
          <div className="space-y-5">
            <div className="glass rounded-xl px-4 py-3 border border-purple-500/10 flex items-start gap-3">
              <BarChart2
                size={16}
                className="text-purple-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-mono text-white font-bold mb-0.5">
                  How pillar assessments work
                </p>
                <p className="text-[11px] font-body text-sky/50 leading-relaxed">
                  Rate each player once per week across{" "}
                  <span className="text-white">
                    Physical, Technical, Tactical, and Mental
                  </span>{" "}
                  pillars. After{" "}
                  <span className="text-white">3 weekly assessments</span>, the
                  system switches from the baseline PRS model to the
                  expectation-relative model — where a 7/10 means different
                  things for different players. This also feeds{" "}
                  <span className="text-white">SQI</span> in the match
                  prediction formula.
                </p>
              </div>
            </div>
            <LogPillarForm
              players={players}
              adminPassword={ADMIN_PASSWORD}
              onSuccess={fetchPlayers}
            />
          </div>
        )}

        {/* ── KPI tab ───────────────────────────────────────────── */}
        {activeTab === "kpi" && (
          <div className="space-y-5">
            <div className="glass rounded-xl px-4 py-3 border border-yellow-500/10 flex items-start gap-3">
              <Target
                size={16}
                className="text-yellow-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-mono text-white font-bold mb-0.5">
                  Season KPI targets
                </p>
                <p className="text-[11px] font-body text-sky/50 leading-relaxed">
                  Set development goals for each player at the start of the
                  season (or anytime). Players see a{" "}
                  <span className="text-white">KPI radar</span> on their profile
                  page — target vs actual — with a projected end-of-season
                  value. This structures player-parent conversations and gives
                  each player a personal north star beyond team selection.
                </p>
              </div>
            </div>
            <LogKPIForm
              players={players}
              adminPassword={ADMIN_PASSWORD}
              onSuccess={fetchPlayers}
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePlayerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchPlayers}
          adminPassword={ADMIN_PASSWORD}
        />
      )}
    </div>
  );
}
