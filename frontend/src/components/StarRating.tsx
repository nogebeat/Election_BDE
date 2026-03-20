import React, { useState } from 'react';

interface Props {
    label: string;
    value: number;
    onChange: (val: number) => void;
    activeColor: string;
    inactiveColor: string;
    maxStars?: number;
}

export const StarRating: React.FC<Props> = ({
    label,
    value,
    onChange,
    activeColor,
    inactiveColor,
    maxStars = 10
}) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const displayValue = hoverValue !== null ? hoverValue : value;

    return (
        <div className="flex flex-col mb-3 w-full max-w-[280px]">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-base font-medium" style={{ color: activeColor }}>
                    {label}
                </span>
                <span className="text-xs font-bold font-base" style={{ color: activeColor }}>
                    {value}/{maxStars}
                </span>
            </div>
            <div className="flex gap-[2px]">
                {[...Array(maxStars)].map((_, i) => {
                    const ratingValue = i + 1;
                    const isActive = ratingValue <= displayValue;

                    return (
                        <button
                            key={i}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-125"
                            onClick={() => onChange(ratingValue)}
                            onMouseEnter={() => setHoverValue(ratingValue)}
                            onMouseLeave={() => setHoverValue(null)}
                        >
                            <svg
                                className="w-5 h-5 transition-colors duration-200"
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
