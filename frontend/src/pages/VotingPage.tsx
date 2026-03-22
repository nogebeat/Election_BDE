import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { OlympusSection } from '../components/OlympusSection';
import { BeesSection } from '../components/BeesSection';
import { ScoreBoard } from '../components/ScoreBoard';
import { RadarChart } from '../components/RadarChart';
import { ShieldAlert, BarChart2, LogOut, CheckCircle, XCircle, Loader, Lock } from 'lucide-react';
import type { Day } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const CRITERIA = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
const empty = () => CRITERIA.reduce((a, k) => ({ ...a, [k]: 0 }), {} as Record<string, number>);
const DAY_NUM: Record<string, number> = { J1: 1, J2: 2, J3: 3, J4: 4, J5: 5 };

type Status = 'idle' | 'loading' | 'success' | 'error';

export const VotingPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<Day>('J1');
  const [olympusDays, setOlympusDays] = useState<Record<string, Record<string, number>>>({
    J1: empty(), J2: empty(), J3: empty(), J4: empty(), J5: empty(),
  });
  const [beesDays, setBeesDays] = useState<Record<string, Record<string, number>>>({
    J1: empty(), J2: empty(), J3: empty(), J4: empty(), J5: empty(),
  });
  const [votedDays, setVotedDays] = useState<Set<number>>(new Set());
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/votes/my-votes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setVotedDays(new Set<number>(data.votes.map((v: any) => v.day)));
        if (data.currentDay != null) {
          setCurrentDay(data.currentDay);
          setSelectedDay(`J${data.currentDay}` as Day);
        }
      } catch { /* silencieux */ }
    })();
  }, []);

  const globalRatings = (s: Record<string, Record<string, number>>) => {
    const g = empty();
    Object.keys(s).forEach(dk => CRITERIA.forEach(k => { g[k] += s[dk][k] || 0; }));
    return g;
  };

  const curO = selectedDay === 'Global' ? globalRatings(olympusDays) : olympusDays[selectedDay];
  const curB = selectedDay === 'Global' ? globalRatings(beesDays)    : beesDays[selectedDay];
  const oScore = CRITERIA.reduce((s, k) => s + (curO[k] || 0), 0);
  const bScore = CRITERIA.reduce((s, k) => s + (curB[k] || 0), 0);
  const limit  = selectedDay === 'Global' ? 200 : 40;
  const maxR   = selectedDay === 'Global' ? 50  : 10;

  const dayNum     = DAY_NUM[selectedDay] ?? null;
  const isToday    = dayNum !== null && dayNum === currentDay;
  const voted      = dayNum !== null && votedDays.has(dayNum);
  const canVote    = isToday && !voted && selectedDay !== 'Global';

  const onRate = (team: 'olympus' | 'bees', k: string, v: number) => {
    if (!canVote) return;
    if (team === 'olympus') setOlympusDays(p => ({ ...p, [selectedDay]: { ...p[selectedDay], [k]: v } }));
    else                    setBeesDays(p => ({ ...p, [selectedDay]: { ...p[selectedDay], [k]: v } }));
  };

  const handleSubmit = async () => {
    if (!canVote || !currentDay) return;
    const oR = olympusDays[selectedDay], bR = beesDays[selectedDay];
    if (!CRITERIA.every(k => oR[k] >= 1 && bR[k] >= 1)) {
      setStatus('error'); setMessage('Notez tous les critères (1–10) pour les deux listes.');
      setTimeout(() => setStatus('idle'), 3000); return;
    }
    setStatus('loading');
    const token = localStorage.getItem('token');
    const post = async (listName: string, r: Record<string, number>) => {
      const res = await fetch(`${API_URL}/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listName, day: currentDay, scoreBouffe: r.Bouffe, scoreAmbiance: r.Ambiance, scoreProjets: r.Projets, scoreRespect: r.Respect }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    };
    try {
      await post('olympus', oR); await post('bees', bR);
      setStatus('success'); setMessage(`Votes J${currentDay} enregistrés !`);
      setVotedDays(p => new Set([...p, currentDay]));
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e: any) {
      setStatus('error'); setMessage(e.message);
      if (e.message?.includes('déjà voté')) setVotedDays(p => new Set([...p, currentDay]));
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const logout = () => { ['token','email','role'].forEach(k => localStorage.removeItem(k)); navigate('/login'); };

  // ── Barre de navigation jours ──────────────────────────────────────────────
  const DayNav = () => (
    <div className="flex bg-black/60 backdrop-blur-xl p-1 rounded-full border border-white/10 gap-0.5 overflow-x-auto scrollbar-none">
      {(['J1','J2','J3','J4','J5','Global'] as Day[]).map(day => {
        const dn = DAY_NUM[day];
        const isV = dn && votedDays.has(dn);
        const isTd = dn && dn === currentDay;
        const isFu = dn && currentDay !== null && dn > currentDay;
        return (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`relative flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-200
              ${selectedDay === day ? 'bg-white text-black scale-105' : isFu ? 'text-white/25' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
            {day}
            {isV  && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full border border-black" />}
            {isTd && !isV && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-olympusGold rounded-full border border-black animate-pulse" />}
          </button>
        );
      })}
    </div>
  );

  // ── Bouton soumettre (réutilisé mobile + desktop) ──────────────────────────
  const SubmitBtn = ({ full = false }) => {
    const label = currentDay === null ? '🔒 Vote fermé'
      : voted ? `✓ J${currentDay} déjà voté`
      : !isToday && selectedDay !== 'Global' ? `🔒 Seulement le J${currentDay}`
      : selectedDay === 'Global' ? 'Vue globale'
      : status === 'loading' ? 'Enregistrement...'
      : `Valider les votes du ${selectedDay}`;
    const disabled = !canVote || status === 'loading';
    return (
      <div className={`flex flex-col gap-2 ${full ? 'w-full' : ''}`}>
        <button onClick={handleSubmit} disabled={disabled}
          className={`${full ? 'w-full' : 'px-6'} py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2
            ${voted ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : disabled ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              : 'glass-button text-white hover:scale-[1.02] active:scale-95'}`}>
          {status === 'loading' && <Loader size={13} className="animate-spin" />}
          {voted && <CheckCircle size={13} className="text-green-400" />}
          {!canVote && !voted && currentDay !== null && selectedDay !== 'Global' && <Lock size={13} />}
          {label}
        </button>
        {status !== 'idle' && message && (
          <p className={`text-center text-xs font-semibold flex items-center justify-center gap-1 ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
            {status === 'success' ? <CheckCircle size={11} /> : <XCircle size={11} />}
            {message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col text-white">

      {/* ── Header sticky ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 px-3 sm:px-5 py-3 flex items-center gap-3">
        {/* Actions gauche */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/evaluation" className="glass-button p-2 sm:px-3 sm:py-1.5 rounded-full text-white/60 hover:text-white border border-white/5 flex items-center gap-1.5">
            <BarChart2 size={13} className="text-beesYellow" />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Évaluation</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="glass-button p-2 sm:px-3 sm:py-1.5 rounded-full text-white/60 hover:text-white border border-white/5 flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-olympusGold" />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </Link>
          )}
        </div>

        {/* Nav jours — centre flex */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <DayNav />
        </div>

        {/* Logout droite */}
        <button onClick={logout} className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors p-1">
          <LogOut size={15} />
        </button>
      </header>

      {/* ── Banner vote fermé ────────────────────────────────────────── */}
      {currentDay === null && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40 text-[10px] uppercase tracking-widest font-semibold">
          🔒 Vote fermé — l'admin ouvrira le vote du jour prochainement
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT MOBILE / TABLETTE  (< lg)
          Colonne scrollable : scoreboard compact → Olympus → Bees
      ═══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col gap-0">

        {/* Scoreboard compact mobile */}
        <div className="px-4 pt-4 pb-2">
          <div className="glass-scoreboard rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
            {/* VS scores */}
            <div className="flex items-center">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[9px] text-olympusGold/60 uppercase tracking-widest font-bold mb-1">Olympus</span>
                <span className="text-5xl font-black text-olympusGold text-glow-gold">{oScore}</span>
              </div>
              <div className="flex flex-col items-center px-3 gap-2">
                <span className="text-xs font-black text-white/30 tracking-widest">VS</span>
                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-olympusGold to-beesYellow transition-all duration-700"
                    style={{ width: `${Math.min(((oScore+bScore)/limit)*100,100)}%` }} />
                </div>
                <span className="text-[9px] text-white/20 uppercase">{oScore+bScore}/{limit}</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[9px] text-beesYellow/60 uppercase tracking-widest font-bold mb-1">The Bees</span>
                <span className="text-5xl font-black text-beesYellow text-glow-yellow">{bScore}</span>
              </div>
            </div>

            {/* Radar compact */}
            <div className="flex justify-center">
              <RadarChart olympusData={CRITERIA.map(k => curO[k]||0)} beesData={CRITERIA.map(k => curB[k]||0)} maxVal={maxR} size={220} />
            </div>

            {/* Bouton */}
            <SubmitBtn full />
          </div>
        </div>

        {/* Sections Olympus + Bees empilées */}
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1">
            <OlympusSection ratings={curO} onRatingChange={(c,v) => onRate('olympus',c,v)} disabled={!canVote} />
          </div>
          <div className="flex-1">
            <BeesSection ratings={curB} onRatingChange={(c,v) => onRate('bees',c,v)} disabled={!canVote} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT DESKTOP  (>= lg)
          Deux colonnes + ScoreBoard flottant centré
      ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 relative" style={{ height: 'calc(100vh - 57px)' }}>
        <div className="w-1/2 h-full overflow-y-auto">
          <OlympusSection ratings={curO} onRatingChange={(c,v) => onRate('olympus',c,v)} disabled={!canVote} />
        </div>
        <div className="w-1/2 h-full overflow-y-auto">
          <BeesSection ratings={curB} onRatingChange={(c,v) => onRate('bees',c,v)} disabled={!canVote} />
        </div>

        {/* ScoreBoard flottant */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40">
          <div className="pointer-events-auto">
            <ScoreBoard
              olympusScore={oScore} beesScore={bScore} totalLimit={limit} radarMaxVal={maxR}
              olympusRatings={curO} beesRatings={curB} selectedDay={selectedDay} onSelectDay={setSelectedDay}
              onSubmit={handleSubmit} submitStatus={status} submitMessage={message}
              alreadyVoted={voted} votedDays={votedDays} currentDay={currentDay} hideNav
            />
          </div>
        </div>
      </div>
    </div>
  );
};
