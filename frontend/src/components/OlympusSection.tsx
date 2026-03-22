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
            // Smoother parallax
            const x = (e.clientX - rect.left - rect.width / 2) / 25;
            const y = (e.clientY - rect.top - rect.height / 2) / 25;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={sectionRef}
            className="relative w-full h-full bg-olympusBg flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,192,66,0.05)_0%,transparent_70%)] opacity-80 pointer-events-none" />

            {/* Floating Parallax Effects */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[60px]"
                style={{
                    background: 'radial-gradient(circle, #E4C042 0%, transparent 70%)',
                    transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            />

            {/* Floating Laurel SVGs */}
            <div
                className="absolute left-8 top-16 opacity-30 animate-float"
                style={{
                    transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#E4C042" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-gold">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>

            <div
                className="absolute right-12 bottom-32 opacity-25 animate-float-delayed"
                style={{
                    transform: `translate(${-mousePos.x * 1.2}px, ${-mousePos.y * 1.2}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="#E4C042" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-gold" style={{ animationDelay: '1s' }}>
                    <path d="M11 20A7 7 0 0 1 4 13v-5l7-3 7 3v5a7 7 0 0 1-7 7z" />
                </svg>
            </div>

            <div className="z-10 mb-6 w-40 h-40 rounded-full overflow-hidden border-[3px] border-olympusGold shadow-[0_0_35px_rgba(228,192,66,0.4)] transition-transform duration-700 hover:scale-105">
                <img src="/logo/olympus.jpeg" alt="Olympus Logo" className="w-full h-full object-cover" />
            </div>
            
            <h1 className="z-10 text-5xl md:text-7xl font-olympus text-olympusGold mb-2 tracking-widest text-center text-glow-gold">
                OLYMPUS
            </h1>
            <p className="z-10 text-olympusGold/80 font-base text-lg mb-10 max-w-sm text-center font-light tracking-wide">
                Wisdom, Strategy, and the Golden Age.
            </p>

            {/* Pro Max Glassmorphism Rating Block */}
            <div className="z-10 glass-panel-gold p-6 rounded-3xl flex flex-col items-center min-w-[300px]">
                {['Bouffe', 'Ambiance', 'Projets', 'Respect'].map((crit) => (
                    <StarRating
                        key={crit}
                        label={crit}
                        value={ratings[crit] || 0}
                        onChange={(val) => onRatingChange(crit, val)}
                        disabled={disabled}
                        activeColor="#E4C042"
                        inactiveColor="rgba(228, 192, 66, 0.15)"
                    />
                ))}
            </div>

            <button className="z-10 mt-8 text-olympusGold/90 hover:text-olympusGold hover:text-glow-gold font-base text-sm uppercase tracking-widest transition-all duration-300 font-semibold drop-shadow-sm">
                Détails de notation
            </button>
        </div>
    );
};

