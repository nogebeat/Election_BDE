import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    olympusData: number[]; // Ensure order: [Bouffe, Ambiance, Projets, Respect]
    beesData: number[];
    maxVal?: number;
}

export const RadarChart: React.FC<Props> = ({ olympusData, beesData, maxVal = 10 }) => {
    const size = 300;
    const center = size / 2;
    const radius = center - 40; // Padding for labels
    const angleSlice = (Math.PI * 2) / 4; // 4 axes

    // Labels for the axes
    const labels = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];

    // Calculate coordinates for a given value on an axis
    const getCoordinatesForValue = (val: number, index: number) => {
        const r = (val / maxVal) * radius;
        const a = angleSlice * index - Math.PI / 2; // Start from top (-90deg)
        return {
            x: center + r * Math.cos(a),
            y: center + r * Math.sin(a)
        };
    };

    // Generate SVG path strings
    const getPathString = (data: number[]) => {
        return data.map((val, i) => {
            const pos = getCoordinatesForValue(val, i);
            return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
        }).join(' ') + ' Z';
    };

    const olympusPath = getPathString(olympusData);
    const beesPath = getPathString(beesData);

    return (
        <div className="flex justify-center items-center w-full">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Draw the 4 concentric background webs (25%, 50%, 75%, 100%) */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => {
                    const r = radius * scale;
                    const bgPath = labels.map((_, idx) => {
                        const a = angleSlice * idx - Math.PI / 2;
                        const px = center + r * Math.cos(a);
                        const py = center + r * Math.sin(a);
                        return `${idx === 0 ? 'M' : 'L'} ${px} ${py}`;
                    }).join(' ') + ' Z';

                    return (
                        <path key={i} d={bgPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    );
                })}

                {/* Draw axes */}
                {labels.map((_, i) => {
                    const { x, y } = getCoordinatesForValue(maxVal, i);
                    return (
                        <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    );
                })}

                {/* Draw Labels */}
                {labels.map((label, i) => {
                    const { x, y } = getCoordinatesForValue(maxVal * 1.25, i); // Push labels slightly out
                    return (
                        <text
                            key={label}
                            x={x}
                            y={y}
                            fill="rgba(255,255,255,0.7)"
                            fontSize="12"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className="font-base"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Olympus Polygon */}
                <motion.path
                    d={olympusPath}
                    fill="rgba(212, 175, 55, 0.4)" // olympusGold with opacity
                    stroke="#D4AF37"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1, d: olympusPath }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                />

                {/* Bees Polygon */}
                <motion.path
                    d={beesPath}
                    fill="rgba(0, 0, 0, 0.5)" // beesBlack with opacity
                    stroke="#000000"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1, d: beesPath }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                />
            </svg>
        </div>
    );
};
