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
    currentDay:     number | null; // null = vote fermé
}

export const ScoreBoard: React.FC<Props> = ({
    olympusScore, beesScore,
    totalLimit = 40, radarMaxVal = 10,
    olympusRatings, beesRatings,
    selectedDay, onSelectDay,
    onSubmit, submitStatus, submitMessage,
    alreadyVoted, votedDays, currentDay,
}) => {
    const keys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
    const olympusData = keys.map(k => olympusRatings[k] || 0);
    const beesData    = keys.map(k => beesRatings[k]    || 0);

    const isGlobal        = selectedDay === 'Global';
    const selectedDayNum  = DAY_NUMBER[selectedDay] ?? null;
    const isCurrentDay    = selectedDayNum !== null && selectedDayNum === currentDay;
    const canVote         = isCurrentDay && !alreadyVoted && !isGlobal && currentDay !== null;

    const buttonLabel = () => {
        if (currentDay === null)  return '🔒 Vote fermé aujourd\'hui';
        if (isGlobal)             return 'Vue globale — lecture seule';
        if (alreadyVoted)         return `✓ ${selectedDay} déjà voté`;
        if (!isCurrentDay)        return `🔒 Disponible uniquement le jour J${currentDay}`;
        if (submitStatus === 'loading') return 'Enregistrement...';
        return `Valider les notes du ${selectedDay}`;
    };

    const buttonDisabled = !canVote || submitStatus === 'loading';

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">

            {/* Navigation J1–J5 + Global */}
            <div className="flex bg-black/60 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-2xl z-50 mb-1">
                {(['J1', 'J2', 'J3', 'J4', 'J5', 'Global'] as Day[]).map(day => {
                    const dayNum   = DAY_NUMBER[day];
                    const voted    = dayNum && votedDays.has(dayNum);
                    const isToday  = dayNum && dayNum === currentDay;
                    const isPast   = dayNum && currentDay !== null && dayNum < currentDay;
                    const isFuture = dayNum && currentDay !== null && dayNum > currentDay;

                    return (
                        <button
                            key={day}
                            onClick={() => onSelectDay(day)}
                            title={
                                isFuture ? `Disponible le J${dayNum}` :
                                voted    ? `J${dayNum} — déjà voté` :
                                isToday  ? `J${dayNum} — vote ouvert aujourd'hui` : day
                            }
                            className={`relative px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300
                                ${selectedDay === day
                                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105'
                                    : isFuture
                                        ? 'text-white/20 cursor-default'
                                        : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {day}
                            {/* Point vert = déjà voté */}
                            {voted && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-black" />
                            )}
                            {/* Point doré = aujourd'hui, pas encore voté */}
                            {isToday && !voted && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-olympusGold rounded-full border border-black animate-pulse" />
                            )}
                            {/* Cadenas = futur */}
                            {isFuture && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 flex items-center justify-center">
                                    <Lock size={6} className="text-white/20" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Score header */}
            <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
                <div className="glass-scoreboard rounded-2xl p-4 flex flex-col items-center min-w-[300px]">
                    <h2 className="text-white font-base font-semibold uppercase tracking-[0.3em] text-[10px] mb-3 opacity-90 shine-effect">
                        The Arbitrator
                    </h2>
                    <div className="flex items-center justify-between w-full mb-3 px-6">
                        <span className="text-4xl font-olympus text-olympusGold text-glow-gold">{olympusScore}</span>
                        <span className="text-xs font-black text-white tracking-[0.3em] px-4 drop-shadow-md">VS</span>
                        <span className="text-4xl font-bees font-black text-white text-glow-yellow">{beesScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden relative shadow-inner">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-olympusGold via-white to-black transition-all duration-1000 ease-in-out"
                            style={{ width: `${Math.min(((olympusScore + beesScore) / totalLimit) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="mt-2 text-white/90 text-[10px] font-base tracking-widest uppercase font-semibold">
                        Target: {totalLimit}
                    </div>
                </div>
            </motion.div>

            {/* Radar */}
            <motion.div
                animate={{ y: [3, -3, 3] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            >
                <div className="glass-scoreboard rounded-3xl p-4 min-w-[320px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
                    <RadarChart olympusData={olympusData} beesData={beesData} maxVal={radarMaxVal} />
                </div>
            </motion.div>

            {/* Bouton soumettre + feedback */}
            <div className="flex flex-col items-center gap-2 w-full min-w-[300px]">
                <button
                    onClick={onSubmit}
                    disabled={buttonDisabled}
                    className={`glass-button w-full px-8 py-3 rounded-full text-white font-base text-xs font-bold tracking-widest uppercase transition-all duration-300 relative overflow-hidden group
                        ${buttonDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-[1.03] active:scale-95'
                        }
                        ${alreadyVoted ? 'border-green-500/30 bg-green-500/10' : ''}
                    `}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {submitStatus === 'loading' && <Loader size={14} className="animate-spin" />}
                        {alreadyVoted && <CheckCircle size={14} className="text-green-400" />}
                        {!canVote && !alreadyVoted && !isGlobal && currentDay !== null && <Lock size={14} />}
                        {buttonLabel()}
                    </span>
                    {!buttonDisabled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-olympusGold/30 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                </button>

                <AnimatePresence>
                    {submitStatus !== 'idle' && submitMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border font-semibold
                                ${submitStatus === 'success'
                                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                                }`}
                        >
                            {submitStatus === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {submitMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
