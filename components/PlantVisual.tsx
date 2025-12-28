
import React from 'react';

interface PlantVisualProps {
  progress: number; // 0 to 100
  color: string;
}

const PlantVisual: React.FC<PlantVisualProps> = ({ progress, color }) => {
  // Determine growth stage
  let stage = 0;
  if (progress > 80) stage = 4; // Full bloom
  else if (progress > 50) stage = 3; // Budding
  else if (progress > 25) stage = 2; // Sprout
  else if (progress > 0) stage = 1; // Seedling
  else stage = 0; // Earth

  const renderPlant = () => {
    switch (stage) {
      case 4:
        return (
          <div className="relative w-16 h-16 flex items-end justify-center">
            <div className="absolute bottom-0 w-2 h-10 bg-green-400 rounded-full"></div>
            <div className="absolute bottom-8 w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: `${color}44` }}>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }}></div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative w-16 h-16 flex items-end justify-center">
            <div className="absolute bottom-0 w-2 h-8 bg-green-400 rounded-full"></div>
            <div className="absolute bottom-6 w-6 h-6 bg-pink-300 rounded-full" style={{ backgroundColor: color }}></div>
          </div>
        );
      case 2:
        return (
          <div className="relative w-16 h-16 flex items-end justify-center">
            <div className="absolute bottom-0 w-1.5 h-6 bg-green-400 rounded-full"></div>
            <div className="absolute bottom-4 left-9 w-3 h-2 bg-green-300 rounded-full -rotate-45"></div>
          </div>
        );
      case 1:
        return (
          <div className="relative w-16 h-16 flex items-end justify-center">
            <div className="absolute bottom-0 w-1 h-3 bg-green-400 rounded-full"></div>
          </div>
        );
      default:
        return (
          <div className="relative w-16 h-16 flex items-end justify-center">
            <div className="w-8 h-2 bg-stone-300 rounded-full"></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {renderPlant()}
      <div className="mt-2 h-1.5 w-full bg-pink-50 rounded-full overflow-hidden border border-pink-100">
        <div 
          className="h-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default PlantVisual;
