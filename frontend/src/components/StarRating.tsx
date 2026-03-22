import React, { useState } from 'react';

interface Props {
    label: string;
    value: number;
    onChange: (val: number) => void;
    activeColor: string;
    inactiveColor: string;
    maxStars?: number;
    disabled?: boolean;
}

export const StarRating: React.FC<Props> = ({
    label, value, onChange, activeColor, inactiveColor, maxStars = 10, disabled = false
}) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const displayValue = hoverValue !== null ? hoverValue : value;

    return (
        <div className={`flex flex-col mb-4 w-full max-w-[280px] ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm font-base font-semibold tracking-wide uppercase" style={{ color: activeColor }}>
                    {label}
                </span>
                <span className="text-xs font-bold font-base bg-black/20 px-2 py-0.5 rounded-full" style={{ color: activeColor }}>
                    {value}<span className="opacity-50 font-normal">/{maxStars}</span>
                </span>
            </div>
            <div className="flex justify-between w-full">
                {[...Array(maxStars)].map((_, i) => {
                    const ratingValue = i + 1;
                    const isActive = ratingValue <= displayValue;
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={disabled}
                            className={`focus:outline-none transition-transform duration-300 ${disabled ? 'cursor-not-allowed' : 'hover:scale-125 focus:scale-110 active:scale-90'}`}
                            onClick={() => !disabled && onChange(ratingValue)}
                            onMouseEnter={() => !disabled && setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(null)}
                        >
                            <svg
                                className={`w-5 h-5 transition-all duration-300 ease-out ${isActive ? 'drop-shadow-[0_0_6px_currentColor] scale-110' : 'opacity-60 grayscale-[50%]'}`}
                                viewBox="0 0 24 24"
                                fill={isActive ? activeColor : inactiveColor}
                                stroke={isActive ? activeColor : 'transparent'}
                                strokeWidth="1"
                                style={{ color: isActive ? activeColor : 'transparent' }}
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
