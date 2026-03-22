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
        <div className={`flex flex-col mb-3 w-full max-w-[300px] transition-opacity ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: activeColor }}>
                    {label}
                </span>
                <span className="text-xs font-bold bg-black/15 px-2 py-0.5 rounded-full" style={{ color: activeColor }}>
                    {value}<span className="opacity-40 font-normal">/{maxStars}</span>
                </span>
            </div>
            <div className="flex justify-between w-full gap-0.5">
                {[...Array(maxStars)].map((_, i) => {
                    const rv = i + 1;
                    const isActive = rv <= displayValue;
                    return (
                        <button key={i} type="button"
                            disabled={disabled}
                            onClick={() => !disabled && onChange(rv)}
                            onMouseEnter={() => !disabled && setHoverValue(rv)}
                            onMouseLeave={() => setHoverValue(null)}
                            className={`focus:outline-none transition-transform duration-150 flex-1
                                ${disabled ? 'cursor-not-allowed' : 'hover:scale-125 active:scale-90'}`}
                        >
                            <svg
                                className={`w-full aspect-square max-w-[22px] mx-auto transition-all duration-200 ${isActive ? 'scale-110' : 'opacity-50'}`}
                                viewBox="0 0 24 24"
                                fill={isActive ? activeColor : inactiveColor}
                                stroke={isActive ? activeColor : 'transparent'}
                                strokeWidth="1"
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
