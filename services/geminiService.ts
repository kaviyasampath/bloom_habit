
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, HabitLog, HabitPersonality } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMotivation = async (habit: Habit, streak: number, logs: HabitLog[]): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Habit: ${habit.name} (${habit.emoji})
    Personality: ${habit.personality}
    Current Streak: ${streak} days
    Recent activity: ${logs.slice(-7).map(l => l.completed ? '✅' : '❌').join('')}

    Generate a short, one-sentence motivational message for this user. 
    If personality is 'soft', be very gentle and nurturing.
    If 'strict', be high-energy and a bit pushy.
    If 'funny', use a pun or a lighthearted joke.
    The tone should always be encouraging overall. Use pink/floral/growth metaphors if possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text || "You're doing amazing, keep growing!";
  } catch (error) {
    console.error("AI Motivation error:", error);
    return "Every small step counts towards your blooming future!";
  }
};

export const generateWeeklySummary = async (habits: Habit[], logs: HabitLog[]): Promise<string> => {
  const ai = getAI();
  const summaryData = habits.map(h => {
    const habitLogs = logs.filter(l => l.habitId === h.id);
    const completedCount = habitLogs.filter(l => l.completed).length;
    return `${h.name}: ${completedCount}/${habitLogs.length} completions`;
  }).join(', ');

  const prompt = `
    User's Weekly Habit Data: ${summaryData}

    Provide a concise weekly summary (3-4 sentences). 
    1. Identify a success pattern.
    2. Gently point out a problem area if any.
    3. Suggest one small, actionable improvement.
    Use a calming, "Zen gardener" tone. Use emojis like 🌸, 🌿, ✨.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Your garden is growing beautifully. Keep tending to your habits!";
  } catch (error) {
    console.error("AI Summary error:", error);
    return "You've made progress this week! Every habit is a seed for tomorrow.";
  }
};

export const detectDropOff = async (habit: Habit, logs: HabitLog[]): Promise<string | null> => {
  const ai = getAI();
  const recentLogs = logs.slice(-5);
  const missedCount = recentLogs.filter(l => !l.completed).length;

  if (missedCount < 3) return null;

  const prompt = `
    The user has missed ${missedCount} out of the last 5 days for the habit: ${habit.name}.
    Generate a gentle "nudge" message to help them get back on track without making them feel guilty.
    Tone: ${habit.personality === 'soft' ? 'Warm hug' : habit.personality === 'strict' ? 'Coach pep talk' : 'Funny friend'}.
    Keep it under 100 characters.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Missed you in the garden today! Let's plant a new seed tomorrow? 🌷";
  } catch (error) {
    return "Thinking of you! Your habits miss you. 🌸";
  }
};
