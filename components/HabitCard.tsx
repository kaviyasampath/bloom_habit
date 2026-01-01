
import React, { useState, useEffect } from 'react';
import { Habit, HabitLog } from '../types';
import PlantVisual from './PlantVisual';
import { generateMotivation } from '../services/geminiService';
import { Sparkles, Trash2, CheckCircle2, Circle, Pencil } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onToggle: (habitId: string, value: number) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, logs, onToggle, onDelete, onEdit }) => {
  const [motivation, setMotivation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Calculate streak
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const log of sortedLogs) {
    if (log.completed) streak++;
    else break;
  }

  // Today's completion
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === today);
  const isCompleted = !!todayLog?.completed;

  // Percentage for the plant (simple 7-day view)
  const last7Days = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
  });
  const progressPercent = last7Days.length > 0 
    ? (last7Days.filter(l => l.completed).length / 7) * 100 
    : 0;

  const fetchMotivation = async () => {
    setLoadingAI(true);
    const msg = await generateMotivation(habit, streak, logs);
    setMotivation(msg);
    setLoadingAI(false);
  };

  useEffect(() => {
    if (isCompleted && !motivation) {
      fetchMotivation();
    }
  }, [isCompleted]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${habit.color}22` }}
          >
            {habit.emoji}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{habit.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{habit.frequency} • {habit.goalTarget} {habit.unit}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(habit)}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-pink-400 transition-all"
            aria-label="Edit Habit"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => onDelete(habit.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-all"
            aria-label="Delete Habit"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <PlantVisual progress={progressPercent} color={habit.color} />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-700">{streak}</span>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Day Streak</p>
          </div>
          
          <button 
            onClick={() => onToggle(habit.id, habit.goalTarget)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
              isCompleted 
                ? 'bg-pink-100 text-pink-500' 
                : 'bg-white border-2 border-dashed border-pink-200 text-pink-200 hover:border-pink-400 hover:text-pink-400'
            }`}
          >
            {isCompleted ? <CheckCircle2 size={32} /> : <Circle size={32} />}
          </button>
        </div>
      </div>

      {motivation && (
        <div className="mt-4 p-3 bg-pink-50 rounded-2xl text-xs text-pink-700 italic flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
          <p>{motivation}</p>
        </div>
      )}
      
      {loadingAI && (
        <div className="mt-4 flex justify-center">
          <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
