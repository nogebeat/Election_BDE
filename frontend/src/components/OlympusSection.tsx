import React, { useRef, useState, useEffect } from 'react';
import { StarRating } from './StarRating';

interface Props {
    ratings: Record<string, number>;
    onRatingChange: (criteria: string, value: number) => void;
    disabled?: boolean;
}

export const OlympusSection: React.FC<Props> = ({ ratings, onRatingChange, disabled = false }) => {
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
            className="relative w-full min-h-[420px] lg:min-h-full flex flex-col items-center justify-center py-8 px-4 overflow-hidden bg-olympusBg">
            {/* Glow bg */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,192,66,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full opacity-15 blur-[60px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #E4C042 0%, transparent 70%)', transform: `translate(${-mousePos.x*1.5}px, ${-mousePos.y*1.5}px)`, transition: 'transform 0.1s ease-out' }} />

            {/* Décor flottant — masqué sur petit écran */}
            <div className="hidden md:block absolute left-6 top-12 opacity-25 animate-float"
                style={{ transform: `translate(${-mousePos.x*2}px, ${-mousePos.y*2}px)`, transition: 'transform 0.1s ease-out' }}>
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#E4C042" strokeWidth="1">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>

            {/* Logo */}
            <div className="z-10 mb-4 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-[3px] border-olympusGold shadow-[0_0_25px_rgba(228,192,66,0.4)] transition-transform hover:scale-105 flex-shrink-0">
                <img src="/logo/olympus.jpeg" alt="Olympus" className="w-full h-full object-cover" />
            </div>

            <h1 className="z-10 text-3xl sm:text-4xl lg:text-6xl font-olympus text-olympusGold mb-1 tracking-widest text-center text-glow-gold">
                OLYMPUS
            </h1>
            <p className="z-10 text-olympusGold/60 font-base text-xs sm:text-sm mb-6 max-w-xs text-center tracking-wide">
                Wisdom, Strategy, and the Golden Age.
            </p>

            {disabled && (
                <div className="z-10 mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-semibold">
                    {ratings['Bouffe'] > 0 ? '✓ Vote enregistré' : '🔒 Vote non disponible'}
                </div>
            )}

            {/* Rating panel */}
            <div className="z-10 glass-panel-gold p-4 sm:p-5 rounded-3xl flex flex-col items-center w-full max-w-xs">
                {['Bouffe', 'Ambiance', 'Projets', 'Respect'].map(crit => (
                    <StarRating
                        key={crit} label={crit} value={ratings[crit] || 0}
                        onChange={val => onRatingChange(crit, val)}
                        disabled={disabled}
                        activeColor="#E4C042" inactiveColor="rgba(228,192,66,0.15)"
                    />
                ))}
            </div>
        </div>
    );
};
