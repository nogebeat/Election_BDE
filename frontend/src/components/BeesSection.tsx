import React, { useRef, useState, useEffect } from 'react';
import { StarRating } from './StarRating';

interface Props {
    ratings: Record<string, number>;
    onRatingChange: (criteria: string, value: number) => void;
}

export const BeesSection: React.FC<Props> = ({ ratings, onRatingChange }) => {
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
            className="relative w-full h-full bg-beesYellow flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Floating Background Effects */}
            <div
                className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, #000 0%, transparent 70%)',
                    transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            />

            {/* Floating Hexagon SVGs */}
            <div
                className="absolute right-10 top-32 opacity-20 animate-float"
                style={{
                    transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
            </div>

            <div
                className="absolute left-20 bottom-32 opacity-20 animate-float-delayed"
                style={{
                    transform: `translate(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
            </div>

            <div className="z-10 mb-6 w-40 h-40 rounded-full overflow-hidden border-4 border-beesBlack shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
                <img src="/logo/bees.jpeg" alt="The Bees Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="z-10 text-6xl md:text-8xl font-bees font-black text-beesBlack mb-2 tracking-tight uppercase text-center">
                The Bees
            </h1>
            <p className="z-10 text-beesBlack/80 font-base font-semibold text-xl mb-8 max-w-sm text-center">
                Energy, Buzz, and the Hive Mind.
            </p>

            {/* V2 Compact Rating Block */}
            <div className="z-10 bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-black/10 shadow-lg flex flex-col items-center">
                {['Bouffe', 'Ambiance', 'Projets', 'Respect'].map((crit) => (
                    <StarRating
                        key={crit}
                        label={crit}
                        value={ratings[crit] || 0}
                        onChange={(val) => onRatingChange(crit, val)}
                        activeColor="#000000"
                        inactiveColor="rgba(0, 0, 0, 0.15)"
                    />
                ))}
            </div>

            <button className="z-10 mt-8 text-black/60 hover:text-black font-base font-medium text-sm underline underline-offset-4 transition-colors">
                Afficher les détails de la notation
            </button>
        </div>
    );
};
