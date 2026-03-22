import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { OlympusSection } from '../components/OlympusSection';
import { BeesSection } from '../components/BeesSection';
import { ScoreBoard } from '../components/ScoreBoard';
import { ShieldAlert, BarChart2 } from 'lucide-react';
import type { Day } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const criteriaKeys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
const emptyRatings = () => criteriaKeys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as Record<string, number>);
const DAY_NUMBER: Record<string, number> = { J1: 1, J2: 2, J3: 3, J4: 4, J5: 5 };

export const VotingPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<Day>('J1');
  const [olympusDays, setOlympusDays] = useState<Record<string, Record<string, number>>>({
    J1: emptyRatings(), J2: emptyRatings(), J3: emptyRatings(), J4: emptyRatings(), J5: emptyRatings(),
  });
  const [beesDays, setBeesDays] = useState<Record<string, Record<string, number>>>({
    J1: emptyRatings(), J2: emptyRatings(), J3: emptyRatings(), J4: emptyRatings(), J5: emptyRatings(),
  });

  const [votedDays, setVotedDays] = useState<Set<number>>(new Set());
  // currentDay = numéro du jour autorisé aujourd'hui (1-5), null = vote fermé
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  const navigate = useNavigate();

  // Charge les votes existants + le jour actuel autorisé
  useEffect(() => {
    const fetchMyVotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/votes/my-votes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const days = new Set<number>(data.votes.map((v: any) => v.day));
        setVotedDays(days);

        // currentDay vient du backend (calculé selon VOTE_START_DATE ou jour semaine)
        if (data.currentDay !== null && data.currentDay !== undefined) {
          const dayKey = `J${data.currentDay}` as Day;
          setCurrentDay(data.currentDay);
          setSelectedDay(dayKey); // Auto-sélectionne le bon jour
        } else {
          setCurrentDay(null);
        }
      } catch {
        // silencieux
      }
    };
    fetchMyVotes();
  }, []);

  const getGlobalRatings = (daysState: Record<string, Record<string, number>>) => {
    const global = emptyRatings();
    Object.keys(daysState).forEach(dk => {
      criteriaKeys.forEach(k => { global[k] += daysState[dk][k] || 0; });
    });
    return global;
  };

  const currentOlympusRatings = selectedDay === 'Global' ? getGlobalRatings(olympusDays) : olympusDays[selectedDay];
  const currentBeesRatings    = selectedDay === 'Global' ? getGlobalRatings(beesDays)    : beesDays[selectedDay];
  const olympusScore = criteriaKeys.reduce((s, k) => s + (currentOlympusRatings[k] || 0), 0);
  const beesScore    = criteriaKeys.reduce((s, k) => s + (currentBeesRatings[k] || 0), 0);
  const totalLimit   = selectedDay === 'Global' ? 200 : 40;
  const radarMaxVal  = selectedDay === 'Global' ? 50  : 10;

  // Le jour affiché est-il modifiable ?
  const selectedDayNum  = DAY_NUMBER[selectedDay] ?? null;
  const isCurrentDay    = selectedDayNum !== null && selectedDayNum === currentDay;
  const alreadyVoted    = selectedDayNum !== null && votedDays.has(selectedDayNum);
  const canVote         = isCurrentDay && !alreadyVoted && selectedDay !== 'Global';

  const handleRatingChange = (team: 'olympus' | 'bees', criteria: string, value: number) => {
    if (!canVote) return;
    if (team === 'olympus') {
      setOlympusDays(prev => ({ ...prev, [selectedDay]: { ...prev[selectedDay], [criteria]: value } }));
    } else {
      setBeesDays(prev => ({ ...prev, [selectedDay]: { ...prev[selectedDay], [criteria]: value } }));
    }
  };

  const handleSubmitVotes = async () => {
    if (!canVote || currentDay === null) return;

    const oRatings = olympusDays[selectedDay];
    const bRatings = beesDays[selectedDay];
    const allRated = criteriaKeys.every(k => (oRatings[k] >= 1) && (bRatings[k] >= 1));
    if (!allRated) {
      setSubmitStatus('error');
      setSubmitMessage('Notez tous les critères (1-10) pour les deux listes.');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setSubmitStatus('loading');
    const token = localStorage.getItem('token');

    const postVote = async (listName: string, ratings: Record<string, number>) => {
      const res = await fetch(`${API_URL}/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          listName, day: currentDay,
          scoreBouffe:   ratings['Bouffe'],
          scoreAmbiance: ratings['Ambiance'],
          scoreProjets:  ratings['Projets'],
          scoreRespect:  ratings['Respect'],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
    };

    try {
      await postVote('olympus', oRatings);
      await postVote('bees', bRatings);

      setSubmitStatus('success');
      setSubmitMessage(`Votes du J${currentDay} enregistrés !`);
      setVotedDays(prev => new Set([...prev, currentDay]));
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err: any) {
      setSubmitStatus('error');
      setSubmitMessage(err.message);
      if (err.message?.includes('déjà voté')) {
        setVotedDays(prev => new Set([...prev, currentDay]));
      }
      setTimeout(() => setSubmitStatus('idle'), 4000);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden bg-[#050505] relative">

      {/* Top bar */}
      <div className="absolute top-4 right-4 z-[100] flex gap-3 items-center">
        <Link to="/evaluation" className="glass-button px-4 py-2 rounded-full text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/5 bg-black/50 backdrop-blur-md">
          <BarChart2 size={16} className="text-beesYellow" />
          Évaluation
        </Link>
        {isAdmin && (
          <Link to="/admin" className="glass-button px-4 py-2 rounded-full text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/5 bg-black/50 backdrop-blur-md">
            <ShieldAlert size={16} className="text-olympusGold" />
            Admin
          </Link>
        )}
        <button onClick={logout} className="text-white/30 hover:text-white/60 text-xs uppercase tracking-widest transition-colors font-semibold">
          Logout
        </button>
      </div>

      {/* Banner "vote fermé" si week-end ou hors période */}
      {currentDay === null && (
        <div className="absolute top-0 left-0 right-0 z-[90] flex justify-center pt-4 px-4">
          <div className="glass-button border border-white/10 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full text-white/60 text-xs uppercase tracking-widest font-semibold">
            🔒 Vote fermé aujourd'hui — revenez un jour de semaine
          </div>
        </div>
      )}

      {/* Olympus Side */}
      <div className="w-full h-1/2 md:w-1/2 md:h-full relative overflow-y-auto md:overflow-hidden">
        <OlympusSection
          ratings={currentOlympusRatings}
          onRatingChange={(crit, val) => handleRatingChange('olympus', crit, val)}
          disabled={!canVote}
        />
      </div>

      {/* Bees Side */}
      <div className="w-full h-1/2 md:w-1/2 md:h-full relative overflow-y-auto md:overflow-hidden">
        <BeesSection
          ratings={currentBeesRatings}
          onRatingChange={(crit, val) => handleRatingChange('bees', crit, val)}
          disabled={!canVote}
        />
      </div>

      {/* ScoreBoard */}
      <ScoreBoard
        olympusScore={olympusScore}
        beesScore={beesScore}
        totalLimit={totalLimit}
        radarMaxVal={radarMaxVal}
        olympusRatings={currentOlympusRatings}
        beesRatings={currentBeesRatings}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onSubmit={handleSubmitVotes}
        submitStatus={submitStatus}
        submitMessage={submitMessage}
        alreadyVoted={alreadyVoted}
        votedDays={votedDays}
        currentDay={currentDay}
      />
    </div>
  );
};
