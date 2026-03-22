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
            className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFE600] to-[#D4A000]"
        >
            {/* Ambient Hexagon Pattern / Dark Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />

            {/* Dark Parallax Effects instead of glowing */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[60px]"
                style={{
                    background: 'radial-gradient(circle, #000 0%, transparent 70%)',
                    transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            />

            {/* Floating Hexagon SVGs with dark stroke */}
            <div
                className="absolute right-8 top-28 opacity-15 animate-float"
                style={{
                    transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
            </div>

            <div
                className="absolute left-16 bottom-24 opacity-10 animate-float-delayed"
                style={{
                    transform: `translate(${-mousePos.x * 1.2}px, ${-mousePos.y * 1.2}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" style={{ animationDelay: '1.5s' }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
            </div>

            <div className="z-10 mb-6 w-40 h-40 transition-transform duration-700 hover:scale-105">
                <img src="/logo/bees.jpeg" alt="The Bees Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            
            <h1 className="z-10 text-5xl md:text-7xl font-bees font-black text-beesBlack mb-2 tracking-tight uppercase text-center drop-shadow-sm">
                The Bees
            </h1>
            <p className="z-10 text-beesBlack/80 font-base font-semibold tracking-wide text-lg mb-10 max-w-sm text-center">
                Energy, Buzz, and the Hive Mind.
            </p>

            {/* Pro Max Glassmorphism Rating Block (Dark version on yellow bg) */}
            <div className="z-10 glass-panel-dark p-6 rounded-3xl flex flex-col items-center min-w-[300px]">
                {['Bouffe', 'Ambiance', 'Projets', 'Respect'].map((crit) => (
                    <StarRating
                        key={crit}
                        label={crit}
                        value={ratings[crit] || 0}
                        onChange={(val) => onRatingChange(crit, val)}
                        disabled={disabled}
                        activeColor="#111111"
                        inactiveColor="rgba(0, 0, 0, 0.25)"
                    />
                ))}
            </div>

            <button className="z-10 mt-8 text-beesBlack/90 hover:text-black font-base text-sm uppercase tracking-widest font-bold transition-all duration-300 drop-shadow-sm">
                Détails de notation
            </button>
        </div>
    );
};
