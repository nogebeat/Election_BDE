import React from 'react';
import { motion } from 'framer-motion';
import { RadarChart } from './RadarChart';

interface Props {
    olympusScore: number;
    beesScore: number;
    totalLimit?: number;
    olympusRatings: Record<string, number>;
    beesRatings: Record<string, number>;
}

export const ScoreBoard: React.FC<Props> = ({
    olympusScore,
    beesScore,
    totalLimit = 40,
    olympusRatings,
    beesRatings
}) => {
    // Convert dictionaries array in fixed order: 'Bouffe', 'Ambiance', 'Projets', 'Respect'
    const keys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
    const olympusData = keys.map(k => olympusRatings[k] || 0);
    const beesData = keys.map(k => beesRatings[k] || 0);

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6">

            {/* 1. Header Score (Compact) */}
            <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
                <div className="bg-white/5 backdrop-blur-[24px] saturate-150 border border-white/10 shadow-lg rounded-2xl p-4 flex flex-col items-center min-w-[280px]">
                    <h2 className="text-white font-base font-medium uppercase tracking-[0.2em] text-xs mb-3 opacity-70">
                        The Arbitrator
                    </h2>

                    <div className="flex items-center justify-between w-full mb-2 px-4">
                        <span className="text-3xl font-olympus text-olympusGold drop-shadow-md">{olympusScore}</span>
                        <span className="text-sm font-light text-white/40 tracking-widest">VS</span>
                        <span className="text-4xl font-bees font-black text-beesYellow drop-shadow-md">{beesScore}</span>
                    </div>

                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-olympusGold to-beesYellow transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(((olympusScore + beesScore) / totalLimit) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="mt-2 text-white/40 text-xs font-base">
                        Target: {totalLimit}
                    </div>
                </div>
            </motion.div>

            {/* 2. Radar Chart (New Panel) */}
            <motion.div
                animate={{ y: [5, -5, 5] }} // Counter-bop to the top panel
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
                <div className="bg-white/5 backdrop-blur-[24px] saturate-150 border border-white/10 shadow-xl rounded-3xl p-6 min-w-[340px]">
                    <RadarChart olympusData={olympusData} beesData={beesData} maxVal={10} />
                </div>
            </motion.div>

            {/* 3. Final Global Call To Action */}
            <button className="glassmorphism bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full text-white font-base text-sm font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">
                Finaliser ma décision et Confirmer le vote
            </button>

        </div>
    );
};
