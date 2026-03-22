import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    olympusData: number[];
    beesData:    number[];
    maxVal?:     number;
    size?:       number; // optionnel, défaut 280
}

export const RadarChart: React.FC<Props> = ({ olympusData, beesData, maxVal = 10, size = 280 }) => {
    const center      = size / 2;
    const radius      = center - (size < 250 ? 45 : 60);
    const angleSlice  = (Math.PI * 2) / 4;
    const labels      = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
    const fontSize    = size < 250 ? 9 : 10;

    const getCoords = (val: number, index: number) => {
        const r = (val / maxVal) * radius;
        const a = angleSlice * index - Math.PI / 2;
        return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) };
    };

    const getPath = (data: number[]) =>
        data.map((v, i) => { const p = getCoords(v, i); return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`; }).join(' ') + ' Z';

    return (
        <div className="flex justify-center items-center w-full">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: '100%' }}>
                <defs>
                    <filter id="glowGold"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                </defs>
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <path key={i} d={getPath(labels.map(() => maxVal * scale))} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                ))}
                {labels.map((_, i) => {
                    const { x, y } = getCoords(maxVal, i);
                    return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />;
                })}
                {labels.map((label, i) => {
                    const { x, y } = getCoords(maxVal * 1.28, i);
                    return (
                        <text key={label} x={x} y={y} fill="rgba(255,255,255,1)" fontSize={fontSize} fontWeight="700" letterSpacing="1px" textAnchor="middle" alignmentBaseline="middle" className="uppercase">
                            {label}
                        </text>
                    );
                })}
                <motion.path d={getPath(olympusData)} fill="rgba(228,192,66,0.3)" stroke="#E4C042" strokeWidth="2.5" filter="url(#glowGold)"
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1, d: getPath(olympusData) }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }} />
                <motion.path d={getPath(beesData)} fill="rgba(255,230,0,0.15)" stroke="#FFE600" strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1, d: getPath(beesData) }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }} />
            </svg>
        </div>
    );
};
