
export type HabitPersonality = 'soft' | 'strict' | 'funny';
export type FrequencyType = 'daily' | 'weekly' | 'custom';
export type GoalType = 'time' | 'count' | 'streak';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: HabitPersonality;
  frequency: FrequencyType;
  customDays?: number[]; // 0-6 for Sun-Sat
  goalType: GoalType;
  goalTarget: number;
  unit: string;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO string YYYY-MM-DD
  value: number;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface UserStats {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
}

export interface AIInsight {
  type: 'motivation' | 'summary' | 'nudge' | 'adaptation';
  content: string;
  timestamp: number;
}
