import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart } from './RadarChart';
import { CheckCircle, XCircle, Loader, Lock } from 'lucide-react';
import type { Day } from '../types';

const DAY_NUMBER: Record<string, number> = { J1: 1, J2: 2, J3: 3, J4: 4, J5: 5 };

interface Props {
    olympusScore:   number;
    beesScore:      number;
    totalLimit?:    number;
    radarMaxVal?:   number;
    olympusRatings: Record<string, number>;
    beesRatings:    Record<string, number>;
    selectedDay:    Day;
    onSelectDay:    (day: Day) => void;
    onSubmit:       () => void;
    submitStatus:   'idle' | 'loading' | 'success' | 'error';
    submitMessage:  string;
    alreadyVoted:   boolean;
    votedDays:      Set<number>;
    currentDay:     number | null;
    hideNav?:       boolean; // masque la nav jours (gérée par le parent sur mobile)
}

export const ScoreBoard: React.FC<Props> = ({
    olympusScore, beesScore, totalLimit = 40, radarMaxVal = 10,
    olympusRatings, beesRatings, selectedDay, onSelectDay,
    onSubmit, submitStatus, submitMessage,
    alreadyVoted, votedDays, currentDay, hideNav = false,
}) => {
    const keys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
    const olympusData = keys.map(k => olympusRatings[k] || 0);
    const beesData    = keys.map(k => beesRatings[k]    || 0);

    const isGlobal       = selectedDay === 'Global';
    const selectedDayNum = DAY_NUMBER[selectedDay] ?? null;
    const isCurrentDay   = selectedDayNum !== null && selectedDayNum === currentDay;
    const canVote        = isCurrentDay && !alreadyVoted && !isGlobal && currentDay !== null;

    const buttonLabel = () => {
        if (currentDay === null)        return '🔒 Vote fermé';
        if (isGlobal)                   return 'Vue globale — lecture seule';
        if (alreadyVoted)               return `✓ ${selectedDay} déjà voté`;
        if (!isCurrentDay)              return `🔒 Seulement le J${currentDay}`;
        if (submitStatus === 'loading') return 'Enregistrement...';
        return `Valider les notes du ${selectedDay}`;
    };

    return (
        <div className="flex flex-col items-center gap-3">

            {/* Navigation jours — affichée uniquement si !hideNav */}
            {!hideNav && (
                <div className="flex bg-black/60 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-2xl z-50 mb-1">
                    {(['J1','J2','J3','J4','J5','Global'] as Day[]).map(day => {
                        const dn     = DAY_NUMBER[day];
                        const voted  = dn && votedDays.has(dn);
                        const isToday  = dn && dn === currentDay;
                        const isFuture = dn && currentDay !== null && dn > currentDay;
                        return (
                            <button key={day} onClick={() => onSelectDay(day)}
                                className={`relative px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                                    ${selectedDay === day ? 'bg-white text-black scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                        : isFuture ? 'text-white/20 cursor-default'
                                        : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                                {day}
                                {voted   && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-black" />}
                                {isToday && !voted && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-olympusGold rounded-full border border-black animate-pulse" />}
                                {isFuture && <Lock size={6} className="absolute -top-0.5 -right-0.5 text-white/20" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Score */}
            <motion.div animate={{ y: [-3,3,-3] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
                <div className="glass-scoreboard rounded-2xl p-4 flex flex-col items-center min-w-[280px]">
                    <h2 className="text-white font-semibold uppercase tracking-[0.3em] text-[10px] mb-3 opacity-90">The Arbitrator</h2>
                    <div className="flex items-center justify-between w-full mb-3 px-6">
                        <span className="text-4xl font-olympus text-olympusGold text-glow-gold">{olympusScore}</span>
                        <span className="text-xs font-black text-white tracking-[0.3em] px-4">VS</span>
                        <span className="text-4xl font-bees font-black text-white text-glow-yellow">{beesScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-olympusGold via-white to-black transition-all duration-1000"
                            style={{ width: `${Math.min(((olympusScore+beesScore)/totalLimit)*100,100)}%` }} />
                    </div>
                    <div className="mt-2 text-white/70 text-[10px] uppercase tracking-widest">Target: {totalLimit}</div>
                </div>
            </motion.div>

            {/* Radar */}
            <motion.div animate={{ y: [3,-3,3] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}>
                <div className="glass-scoreboard rounded-3xl p-4 min-w-[300px] relative overflow-hidden">
                    <RadarChart olympusData={olympusData} beesData={beesData} maxVal={radarMaxVal} />
                </div>
            </motion.div>

            {/* Bouton + feedback */}
            <div className="flex flex-col items-center gap-2 w-full min-w-[280px]">
                <button onClick={onSubmit} disabled={!canVote || submitStatus === 'loading'}
                    className={`glass-button w-full px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 relative overflow-hidden group
                        ${!canVote || submitStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95'}
                        ${alreadyVoted ? 'border-green-500/30 bg-green-500/10' : ''}`}>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                        {submitStatus === 'loading' && <Loader size={13} className="animate-spin" />}
                        {alreadyVoted && <CheckCircle size={13} className="text-green-400" />}
                        {!canVote && !alreadyVoted && !isGlobal && currentDay !== null && <Lock size={13} />}
                        {buttonLabel()}
                    </span>
                    {canVote && <div className="absolute inset-0 bg-gradient-to-r from-olympusGold/30 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                </button>

                <AnimatePresence>
                    {submitStatus !== 'idle' && submitMessage && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border font-semibold
                                ${submitStatus === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                            {submitStatus === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {submitMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
