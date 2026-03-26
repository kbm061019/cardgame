'use client';

import React from 'react';

interface CardProps {
  fruit: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  gridSize?: number;
}

const Card: React.FC<CardProps> = ({ fruit, isFlipped, isMatched, onClick, gridSize = 4 }) => {
  // Adjust font size based on grid size
  const fontSizeClass = gridSize >= 8 ? 'text-2xl' : gridSize >= 6 ? 'text-3xl' : gridSize >= 5 ? 'text-4xl' : 'text-5xl';
  const borderRadiusClass = gridSize >= 8 ? 'rounded-[8px]' : gridSize >= 6 ? 'rounded-[12px]' : 'rounded-[24px]';

  return (
    <div className={`scene ${isMatched ? 'card-matched opacity-60' : ''} w-full h-full`} onClick={!isMatched && !isFlipped ? onClick : undefined}>
      <div className={`card-container ${isFlipped || isMatched ? 'is-flipped' : ''} h-full`}>
        <div className={`card-face card-face-front ${borderRadiusClass} shadow-sm transition-transform hover:scale-[1.02]`}>
          {/* Unflipped state */}
        </div>
        <div className={`card-face card-face-back ${borderRadiusClass} shadow-sm`}>
          <span className={`${fontSizeClass} transition-all duration-500 ${isMatched ? 'filter saturate-0 contrast-75 opacity-70' : 'filter saturate-100'}`}>
            {fruit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
