import React, { useRef, useState, useEffect } from 'react';
import { StarRating } from './StarRating';

interface Props {
    ratings: Record<string, number>;
    onRatingChange: (criteria: string, value: number) => void;
    disabled?: boolean;
}

export const BeesSection: React.FC<Props> = ({ ratings, onRatingChange, disabled = false }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            setMousePos({
                x: (e.clientX - rect.left - rect.width / 2) / 25,
                y: (e.clientY - rect.top - rect.height / 2) / 25,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={sectionRef}
            className="relative w-full min-h-[420px] lg:min-h-full flex flex-col items-center justify-center py-8 px-4 overflow-hidden bg-gradient-to-br from-[#FFE600] to-[#D4A000]">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />
            <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full opacity-[0.07] blur-[60px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #000 0%, transparent 70%)', transform: `translate(${-mousePos.x*1.5}px, ${-mousePos.y*1.5}px)`, transition: 'transform 0.1s ease-out' }} />

            {/* Décor hexagone — masqué sur petit écran */}
            <div className="hidden md:block absolute right-6 top-20 opacity-12 animate-float"
                style={{ transform: `translate(${-mousePos.x*2}px, ${-mousePos.y*2}px)`, transition: 'transform 0.1s ease-out' }}>
                <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
            </div>

            {/* Logo */}
            <div className="z-10 mb-4 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 transition-transform hover:scale-105 flex-shrink-0">
                <img src="/logo/bees.jpeg" alt="The Bees" className="w-full h-full object-contain mix-blend-multiply" />
            </div>

            <h1 className="z-10 text-3xl sm:text-4xl lg:text-6xl font-bees font-black text-beesBlack mb-1 tracking-tight uppercase text-center drop-shadow-sm">
                The Bees
            </h1>
            <p className="z-10 text-beesBlack/70 font-base text-xs sm:text-sm mb-6 max-w-xs text-center tracking-wide font-semibold">
                Energy, Buzz, and the Hive Mind.
            </p>

            {disabled && (
                <div className="z-10 mb-4 px-4 py-2 rounded-full bg-black/10 border border-black/15 text-beesBlack/50 text-[10px] uppercase tracking-widest font-semibold">
                    {ratings['Bouffe'] > 0 ? '✓ Vote enregistré' : '🔒 Vote non disponible'}
                </div>
            )}

            {/* Rating panel */}
            <div className="z-10 glass-panel-dark p-4 sm:p-5 rounded-3xl flex flex-col items-center w-full max-w-xs">
                {['Bouffe', 'Ambiance', 'Projets', 'Respect'].map(crit => (
                    <StarRating
                        key={crit} label={crit} value={ratings[crit] || 0}
                        onChange={val => onRatingChange(crit, val)}
                        disabled={disabled}
                        activeColor="#111111" inactiveColor="rgba(0,0,0,0.2)"
                    />
                ))}
            </div>
        </div>
    );
};
