import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    Tooltip, Legend, BarChart, Bar, Cell
} from 'recharts';
import { Trophy, Users, ArrowLeft, Star, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CRITERIA_ICONS: Record<string, string> = {
    Bouffe: '🍕',
    Ambiance: '🎉',
    Projets: '💡',
    Respect: '🤝',
};

const CRITERIA_LABELS: Record<string, string> = {
    Bouffe: 'Bouffe',
    Ambiance: 'Ambiance',
    Projets: 'Projets',
    Respect: 'Respect',
};

interface GlobalData {
    totalVoters: number;
    winner: string | null;
    globalScores: {
        name: string;
        total: number;
        votes: number;
        details: Record<string, number>;
    }[];
    radarData: any[];
    lineData: any[];
}

// Barre de score animée
const ScoreBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
            />
        </div>
    );
};

// Carte d'un clan
const ClanCard: React.FC<{
    data: GlobalData['globalScores'][0];
    isWinner: boolean;
    isOlympus: boolean;
    rank: number;
}> = ({ data, isWinner, isOlympus, rank }) => {
    const color = isOlympus ? '#E4C042' : '#FFE600';
    const bgGrad = isOlympus
        ? 'from-[#E4C042]/10 to-transparent'
        : 'from-[#FFE600]/10 to-transparent';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: rank * 0.15 }}
            className={`relative rounded-3xl border p-6 flex flex-col gap-4 overflow-hidden
                ${isWinner
                    ? 'border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.1)]'
                    : 'border-white/10'
                } bg-gradient-to-br ${bgGrad}`}
        >
            {/* Glow background */}
            <div
                className="absolute inset-0 blur-[80px] opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black"
                        style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
                    >
                        {isOlympus ? '⚡' : '🐝'}
                    </div>
                    <div>
                        <h3
                            className="text-xl font-black uppercase tracking-wider"
                            style={{ color }}
                        >
                            {isOlympus ? 'Olympus' : 'The Bees'}
                        </h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">
                            {data.votes} vote{data.votes > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {isWinner && (
                    <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full">
                        <Trophy size={14} className="text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Leader</span>
                    </div>
                )}
            </div>

            {/* Score global */}
            <div className="z-10">
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black" style={{ color }}>
                        {data.total.toFixed(1)}
                    </span>
                    <span className="text-white/40 text-sm mb-2">/ 40</span>
                </div>
                <ScoreBar value={data.total} max={40} color={color} />
            </div>

            {/* Détail par critère */}
            <div className="z-10 grid grid-cols-2 gap-3">
                {Object.entries(data.details).map(([key, val]) => (
                    <div
                        key={key}
                        className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1.5"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                                {CRITERIA_ICONS[key]} {CRITERIA_LABELS[key]}
                            </span>
                            <span className="text-sm font-bold" style={{ color }}>
                                {val.toFixed(1)}
                            </span>
                        </div>
                        <ScoreBar value={val} max={10} color={color} />
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// Tooltip recharts custom
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-2xl text-sm">
            <p className="text-white/60 font-semibold mb-2 uppercase tracking-widest text-xs">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-white/70 capitalize">{p.name}</span>
                    <span className="font-bold text-white ml-auto pl-4">{Number(p.value).toFixed(1)}</span>
                </div>
            ))}
        </div>
    );
};

export const GlobalEvaluation: React.FC = () => {
    const [data, setData] = useState<GlobalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/admin/global-evaluation`);
                if (!res.ok) throw new Error('Erreur serveur');
                const json = await res.json();
                setData(json);
            } catch (e: any) {
                setError('Impossible de charger les données. Le serveur est-il démarré ?');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const olympus = data?.globalScores.find(s => s.name === 'olympus');
    const bees = data?.globalScores.find(s => s.name === 'bees');

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

            {/* Header sticky */}
            <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <Link
                    to={isLoggedIn ? "/" : "/login"}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-semibold"
                >
                    <ArrowLeft size={16} />
                    {isLoggedIn ? "Retour au vote" : "Se connecter"}
                </Link>

                <h1 className="text-sm md:text-base font-black uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-olympusGold via-white to-beesYellow">
                    Évaluation Globale
                </h1>

                <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Users size={14} />
                    <span>{data?.totalVoters ?? '—'} votants</span>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-12">

                {/* Loading / Error */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                        <p className="text-white/40 uppercase tracking-widest text-xs">Chargement des votes...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-6 text-center">
                        {error}
                    </div>
                )}

                {data && !loading && (
                    <>
                        {/* ── Banner vainqueur ───────────────────────────── */}
                        {data.winner && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative rounded-3xl border border-white/10 p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden text-center md:text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-4xl">
                                    {data.winner === 'olympus' ? '⚡' : '🐝'}
                                </div>

                                <div className="flex-1">
                                    <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-1">
                                        🏆 Liste en tête
                                    </p>
                                    <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r
                                        ${data.winner === 'olympus'
                                            ? 'from-olympusGold to-white'
                                            : 'from-beesYellow to-white'
                                        }`}
                                    >
                                        {data.winner === 'olympus' ? 'Olympus' : 'The Bees'}
                                    </h2>
                                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">
                                        Meilleur score global sur l'ensemble des votes
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-yellow-300 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                                    <Award size={20} />
                                    <span className="font-bold text-lg">
                                        {data.globalScores.find(s => s.name === data.winner)?.total.toFixed(1)} pts
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Cartes des deux clans ─────────────────────── */}
                        <section>
                            <h2 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-3">
                                <Star size={14} />
                                Scores détaillés par clan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {olympus && (
                                    <ClanCard
                                        data={olympus}
                                        isWinner={data.winner === 'olympus'}
                                        isOlympus={true}
                                        rank={0}
                                    />
                                )}
                                {bees && (
                                    <ClanCard
                                        data={bees}
                                        isWinner={data.winner === 'bees'}
                                        isOlympus={false}
                                        rank={1}
                                    />
                                )}
                                {!olympus && !bees && (
                                    <div className="col-span-2 text-center text-white/30 py-16 uppercase tracking-widest text-sm">
                                        Aucun vote enregistré pour le moment.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ── Bar chart comparatif ──────────────────────── */}
                        {(olympus || bees) && (
                            <section>
                                <h2 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-3">
                                    <TrendingUp size={14} />
                                    Comparaison par critère
                                </h2>
                                <div className="glass-panel-dark rounded-3xl border border-white/5 p-6">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart
                                            data={['Bouffe', 'Ambiance', 'Projets', 'Respect'].map(crit => ({
                                                name: crit,
                                                Olympus: olympus?.details[crit] ?? 0,
                                                Bees: bees?.details[crit] ?? 0,
                                            }))}
                                            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                            barGap={6}
                                        >
                                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                            <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                            <Bar dataKey="Olympus" fill="#E4C042" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                            <Bar dataKey="Bees" fill="#FFE600" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        )}

                        {/* ── Radar chart ───────────────────────────────── */}
                        {data.radarData.length > 0 && (
                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h2 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-3">
                                        <Award size={14} />
                                        Profil global (Radar)
                                    </h2>
                                    <div className="glass-panel-dark rounded-3xl border border-white/5 p-6">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                <PolarAngleAxis dataKey="criteria" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 'bold' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                                <Radar name="Olympus" dataKey="olympus" stroke="#E4C042" fill="#E4C042" fillOpacity={0.25} strokeWidth={2} />
                                                <Radar name="Bees" dataKey="bees" stroke="#FFE600" fill="#FFE600" fillOpacity={0.15} strokeWidth={2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* ── Progression journalière ───────────── */}
                                <div>
                                    <h2 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-3">
                                        <TrendingUp size={14} />
                                        Progression jour par jour
                                    </h2>
                                    <div className="glass-panel-dark rounded-3xl border border-white/5 p-6">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={data.lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                                <Line type="monotone" name="Olympus" dataKey="olympus" stroke="#E4C042" strokeWidth={3} dot={{ r: 5, fill: '#E4C042' }} activeDot={{ r: 8 }} />
                                                <Line type="monotone" name="Bees" dataKey="bees" stroke="#FFE600" strokeWidth={3} dot={{ r: 5, fill: '#FFE600' }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── Participation par jour ────────────────────── */}
                        {data.lineData.some(d => d.voters > 0) && (
                            <section>
                                <h2 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-3">
                                    <Users size={14} />
                                    Participation par jour
                                </h2>
                                <div className="glass-panel-dark rounded-3xl border border-white/5 p-6">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data.lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="voters" name="Votants" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                                {data.lineData.map((_: any, i: number) => (
                                                    <Cell key={i} fill={`rgba(255,255,255,${0.1 + i * 0.08})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
