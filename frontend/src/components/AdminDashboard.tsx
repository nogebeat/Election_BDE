import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Users, BarChart3, Trophy, ChevronRight } from 'lucide-react';

interface StatsData {
    kpi: {
        totalVoters: number;
        todayParticipation: number;
        leadingList: string;
    };
    radarData: any[];
    lineData: any[];
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const [topDuJour, setTopDuJour] = useState('');
    const [flopDuJour, setFlopDuJour] = useState('');

    useEffect(() => {
        // Fetch stats (Mock auth header to be implemented based on context)
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    console.error("Failed to fetch backend stats, returning mocks.");
                    // In a real flow, redirect to login if 401/403.
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="text-white text-center mt-20">Chargement du dashboard administrateur...</div>;

    const { kpi, radarData, lineData } = stats || {
        kpi: { totalVoters: 0, todayParticipation: 0, leadingList: 'N/A' },
        radarData: [],
        lineData: []
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-base overflow-x-hidden">
            {/* Header */}
            <header className="mb-10 animate-fade-in text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-olympusGold via-white to-beesYellow">
                    BDE Arbitrator Control
                </h1>
                <p className="text-white/50 mt-2 font-medium tracking-wide">Interface de suivi et validation des campagnes.</p>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                        <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Participation J-Data</p>
                        <h2 className="text-4xl font-bold text-white">{kpi.todayParticipation}</h2>
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
                {/* Radar Chart (Global Means) */}
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
                                <Radar name="The Bees" dataKey="bees" stroke="#000000" fill="#1A1A1A" fillOpacity={0.8} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart (Daily Progression) */}
                <div className="glass-panel-dark p-6 rounded-3xl border border-white/5 flex flex-col">
                    <h3 className="text-sm uppercase tracking-widest text-white/60 mb-6 font-semibold">Progression Hebdomadaire (Total/Jour)</h3>
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

            {/* Synthesis Row */}
            <div className="glass-panel-dark p-8 rounded-3xl border border-white/5">
                <h3 className="text-sm uppercase tracking-widest text-white/80 mb-6 font-bold">Générateur de Synthèse Rapide</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-olympusGold/80 mb-2 font-semibold">Top du Jour</label>
                        <textarea 
                            className="bg-black/30 text-white rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-olympusGold/50 transition-all border border-white/10"
                            placeholder="Événement marquant réussi (ex: Le pôle bouffe de l'aprèm)..."
                            value={topDuJour}
                            onChange={(e) => setTopDuJour(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs uppercase tracking-widest text-white/50 mb-2 font-semibold">Flop du Jour</label>
                        <textarea 
                            className="bg-black/30 text-white rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all border border-white/10"
                            placeholder="Élément à améliorer (ex: Retard sur l'animation)..."
                            value={flopDuJour}
                            onChange={(e) => setFlopDuJour(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="glass-button px-8 py-3 rounded-full text-white font-base text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:bg-white/10 flex items-center gap-2">
                        Publier le Verdict <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
