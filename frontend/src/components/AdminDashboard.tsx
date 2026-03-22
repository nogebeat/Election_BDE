import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Users, BarChart3, Trophy, ChevronRight, ArrowLeft, Lock, Unlock, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface StatsData {
    kpi: { totalVoters: number; todayParticipation: number; leadingList: string; activeDay: number | null };
    radarData: any[];
    lineData: any[];
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState<number | null>(null);
    const [dayLoading, setDayLoading] = useState(false);
    const [dayMessage, setDayMessage] = useState('');
    const [topDuJour, setTopDuJour] = useState('');
    const [flopDuJour, setFlopDuJour] = useState('');

    const token = localStorage.getItem('token');

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setActiveDay(data.kpi.activeDay);
            }
        } catch (e) {
            console.error('Stats error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleSetDay = async (day: number | null) => {
        setDayLoading(true);
        setDayMessage('');
        try {
            const res = await fetch(`${API_URL}/api/admin/vote-day`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ activeDay: day }),
            });
            const data = await res.json();
            if (res.ok) {
                setActiveDay(day);
                setDayMessage(data.message);
                fetchStats(); // rafraîchit les KPIs
            } else {
                setDayMessage(data.error || 'Erreur.');
            }
        } catch {
            setDayMessage('Impossible de contacter le serveur.');
        } finally {
            setDayLoading(false);
            setTimeout(() => setDayMessage(''), 3000);
        }
    };

    const { kpi, radarData, lineData } = stats || {
        kpi: { totalVoters: 0, todayParticipation: 0, leadingList: 'N/A', activeDay: null },
        radarData: [], lineData: []
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 overflow-x-hidden">

            {/* Header */}
            <header className="mb-10 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl md:text-5xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-olympusGold via-white to-beesYellow">
                        BDE Arbitrator Control
                    </h1>
                    <p className="text-white/50 mt-2 tracking-wide">Interface de suivi et gestion des votes.</p>
                </div>
                <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors mt-2">
                    <ArrowLeft size={14} /> Retour
                </Link>
            </header>

            {/* ── Panneau de contrôle du jour ───────────────────────────────── */}
            <section className="mb-10">
                <div className="glass-panel-dark rounded-3xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar size={18} className="text-olympusGold" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/80">
                            Contrôle du jour de vote
                        </h2>
                        <div className={`ml-auto flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                            ${activeDay
                                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                : 'bg-red-500/10 border-red-500/30 text-red-300'
                            }`}
                        >
                            {activeDay
                                ? <><Unlock size={12} /> Vote ouvert — J{activeDay}</>
                                : <><Lock size={12} /> Vote fermé</>
                            }
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5].map(day => (
                            <button
                                key={day}
                                disabled={dayLoading}
                                onClick={() => handleSetDay(activeDay === day ? null : day)}
                                className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-200 border
                                    ${activeDay === day
                                        ? 'bg-olympusGold text-black border-olympusGold shadow-[0_0_20px_rgba(228,192,66,0.4)] scale-105'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                    }
                                    ${dayLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                J{day}
                            </button>
                        ))}

                        <button
                            disabled={dayLoading || activeDay === null}
                            onClick={() => handleSetDay(null)}
                            className={`ml-auto px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-200 border
                                bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20
                                ${(dayLoading || activeDay === null) ? 'opacity-40 cursor-not-allowed' : ''}
                            `}
                        >
                            <Lock size={14} className="inline mr-2" />
                            Fermer le vote
                        </button>
                    </div>

                    {dayMessage && (
                        <p className="mt-4 text-sm text-white/60 italic">{dayMessage}</p>
                    )}

                    <p className="mt-4 text-xs text-white/30 uppercase tracking-widest">
                        Cliquez sur un jour pour l'activer. Cliquer sur le jour actif le désactive. Un seul jour peut être ouvert à la fois.
                    </p>
                </div>
            </section>

            {/* ── KPIs ──────────────────────────────────────────────────────── */}
            {loading ? (
                <div className="text-white/40 text-center py-10 uppercase tracking-widest text-sm">Chargement...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <div className="glass-panel-dark p-6 rounded-2xl flex items-center justify-between border border-white/10 shadow-2xl transition-transform hover:-translate-y-1">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Total Votants</p>
                                <h2 className="text-4xl font-bold">{kpi.totalVoters}</h2>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-olympusGold">
                                <Users size={28} />
                            </div>
                        </div>

                        <div className="glass-panel-dark p-6 rounded-2xl flex items-center justify-between border border-white/10 shadow-2xl transition-transform hover:-translate-y-1">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-white/50 mb-1">
                                    Votes aujourd'hui {kpi.activeDay ? `(J${kpi.activeDay})` : ''}
                                </p>
                                <h2 className="text-4xl font-bold">{kpi.todayParticipation}</h2>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                                <BarChart3 size={28} />
                            </div>
                        </div>

                        <div className="glass-panel-dark p-6 rounded-2xl flex items-center justify-between border border-white/10 shadow-2xl transition-transform hover:-translate-y-1">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Liste en tête</p>
                                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-olympusGold to-beesYellow">
                                    {kpi.leadingList}
                                </h2>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-beesYellow">
                                <Trophy size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="glass-panel-dark p-6 rounded-3xl border border-white/5 flex flex-col items-center">
                            <h3 className="text-sm uppercase tracking-widest text-white/60 mb-6 font-semibold w-full">Métriques Globales (Moyennes)</h3>
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="criteria" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }} />
                                        <Legend />
                                        <Radar name="Olympus" dataKey="olympus" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.6} />
                                        <Radar name="The Bees" dataKey="bees" stroke="#FFD700" fill="#FFD700" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-panel-dark p-6 rounded-3xl border border-white/5 flex flex-col">
                            <h3 className="text-sm uppercase tracking-widest text-white/60 mb-6 font-semibold">Progression Hebdomadaire</h3>
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                        <Legend />
                                        <Line type="monotone" name="Olympus" dataKey="olympus" stroke="#D4AF37" strokeWidth={3} dot={{ r: 5, fill: '#D4AF37' }} activeDot={{ r: 8 }} />
                                        <Line type="monotone" name="The Bees" dataKey="bees" stroke="#FFD700" strokeWidth={3} dot={{ r: 5, fill: '#FFD700' }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Synthèse */}
                    <div className="glass-panel-dark p-8 rounded-3xl border border-white/5">
                        <h3 className="text-sm uppercase tracking-widest text-white/80 mb-6 font-bold">Générateur de Synthèse Rapide</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex flex-col">
                                <label className="text-xs uppercase tracking-widest text-olympusGold/80 mb-2 font-semibold">Top du Jour</label>
                                <textarea
                                    className="bg-black/30 text-white rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-olympusGold/50 transition-all border border-white/10"
                                    placeholder="Événement marquant réussi..."
                                    value={topDuJour}
                                    onChange={e => setTopDuJour(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs uppercase tracking-widest text-white/50 mb-2 font-semibold">Flop du Jour</label>
                                <textarea
                                    className="bg-black/30 text-white rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all border border-white/10"
                                    placeholder="Élément à améliorer..."
                                    value={flopDuJour}
                                    onChange={e => setFlopDuJour(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="glass-button px-8 py-3 rounded-full text-white font-base text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.03] active:scale-95 hover:bg-white/10 flex items-center gap-2">
                                Publier le Verdict <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
