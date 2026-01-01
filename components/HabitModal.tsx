
import React, { useState, useEffect } from 'react';
import { Habit, HabitPersonality, FrequencyType } from '../types';
import { X } from 'lucide-react';

interface HabitModalProps {
  onClose: () => void;
  onAdd?: (habit: Habit) => void;
  onUpdate?: (habit: Habit) => void;
  initialHabit?: Habit | null;
}

const COLORS = ['#F472B6', '#FB7185', '#C084FC', '#818CF8', '#34D399', '#FBBF24'];
const EMOJIS = ['💧', '跑', '🧘‍♂️', '📖', '🥗', '🍎', '💤', '✍️', '🌱', '🎹', '🎨', '🧹'];

const HabitModal: React.FC<HabitModalProps> = ({ onClose, onAdd, onUpdate, initialHabit }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌱');
  const [color, setColor] = useState(COLORS[0]);
  const [personality, setPersonality] = useState<HabitPersonality>('soft');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('times');

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setEmoji(initialHabit.emoji);
      setColor(initialHabit.color);
      setPersonality(initialHabit.personality);
      setFrequency(initialHabit.frequency);
      setTarget(initialHabit.goalTarget);
      setUnit(initialHabit.unit);
    }
  }, [initialHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialHabit && onUpdate) {
      onUpdate({
        ...initialHabit,
        name,
        emoji,
        color,
        personality,
        frequency,
        goalTarget: target,
        unit,
      });
    } else if (onAdd) {
      const newHabit: Habit = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        emoji,
        color,
        personality,
        frequency,
        goalType: 'count',
        goalTarget: target,
        unit,
        createdAt: Date.now(),
      };
      onAdd(newHabit);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-xl border border-pink-50 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialHabit ? 'Edit Habit Seed' : 'New Habit Seed'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Habit Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read for 20 mins"
              className="w-full bg-pink-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-pink-300 transition-all outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Symbol</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-pink-100 scale-110' : 'hover:bg-gray-100'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${color === c ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">AI Personality</label>
            <div className="grid grid-cols-3 gap-2">
              {(['soft', 'strict', 'funny'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPersonality(p)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${personality === p ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400 hover:bg-pink-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Frequency</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                className="w-full bg-pink-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-pink-300 transition-all outline-none text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Target</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value))}
                  className="w-16 bg-pink-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-pink-300 transition-all outline-none text-sm"
                />
                <input 
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-pink-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-pink-300 transition-all outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-pink-600 active:scale-[0.98] transition-all"
          >
            {initialHabit ? 'Update Habit Seed' : 'Plant Habit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
