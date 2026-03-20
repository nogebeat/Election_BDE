import React, { useRef, useState, useEffect } from 'react';
import { StarRating } from './StarRating';

interface Props {
    ratings: Record<string, number>;
    onRatingChange: (criteria: string, value: number) => void;
}

export const OlympusSection: React.FC<Props> = ({ ratings, onRatingChange }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 20;
            const y = (e.clientY - rect.top - rect.height / 2) / 20;
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
            {/* Floating Background Effects */}
            <div
                className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
                    transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            />

            {/* Floating Laurel SVG (approximated) */}
            <div
                className="absolute left-10 top-20 opacity-20 animate-float"
                style={{
                    transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>

            <div
                className="absolute right-20 bottom-40 opacity-20 animate-float-delayed"
                style={{
                    transform: `translate(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 4 13v-5l7-3 7 3v5a7 7 0 0 1-7 7z" />
                </svg>
            </div>

            <div className="z-10 mb-6 w-40 h-40 rounded-full overflow-hidden border-4 border-olympusBg shadow-[0_0_25px_rgba(212,175,55,0.6)]">
                <img src="/logo/olympus.jpeg" alt="Olympus Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="z-10 text-5xl md:text-7xl font-olympus text-olympusGold mb-2 tracking-wider text-center">
                OLYMPUS
            </h1>
            <p className="z-10 text-olympusGold/70 font-base text-lg mb-8 max-w-sm text-center">
                Wisdom, Strategy, and the Golden Age.
            </p>

            {/* V2 Compact Rating Block */}
            <div className="z-10 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-olympusGold/20 shadow-lg flex flex-col items-center">
                {['Bouffe', 'Ambiance', 'Projets', 'Respect'].map((crit) => (
                    <StarRating
                        key={crit}
                        label={crit}
                        value={ratings[crit] || 0}
                        onChange={(val) => onRatingChange(crit, val)}
                        activeColor="#D4AF37"
                        inactiveColor="rgba(212, 175, 55, 0.15)"
                    />
                ))}
            </div>

            <button className="z-10 mt-8 text-olympusGold/60 hover:text-olympusGold font-base text-sm underline underline-offset-4 transition-colors">
                Afficher les détails de la notation
            </button>
        </div>
    );
};
