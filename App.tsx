
import React, { useState, useEffect } from 'react';
import { Habit, HabitLog, Todo } from './types';
import HabitCard from './components/HabitCard';
import AddHabitModal from './components/AddHabitModal';
import { generateWeeklySummary, detectDropOff } from './services/geminiService';
import { 
  Plus, 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  Sparkles, 
  Sprout, 
  ChevronRight, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  LogOut 
} from 'lucide-react';

type View = 'garden' | 'tasks' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('garden');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [nudges, setNudges] = useState<Record<string, string>>({});

  // Persistence
  useEffect(() => {
    const savedHabits = localStorage.getItem('bloom_habits');
    const savedLogs = localStorage.getItem('bloom_logs');
    const savedTodos = localStorage.getItem('bloom_todos');
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTodos) setTodos(JSON.parse(savedTodos));
  }, []);

  useEffect(() => {
    localStorage.setItem('bloom_habits', JSON.stringify(habits));
    localStorage.setItem('bloom_logs', JSON.stringify(logs));
    localStorage.setItem('bloom_todos', JSON.stringify(todos));
  }, [habits, logs, todos]);

  const handleAddHabit = (habit: Habit) => {
    setHabits([...habits, habit]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
    setLogs(logs.filter(l => l.habitId !== id));
  };

  const handleToggleHabit = (habitId: string, value: number) => {
    const today = new Date().toISOString().split('T')[0];
    const logIndex = logs.findIndex(l => l.habitId === habitId && l.date === today);

    if (logIndex >= 0) {
      const newLogs = [...logs];
      newLogs[logIndex] = { ...newLogs[logIndex], completed: !newLogs[logIndex].completed };
      setLogs(newLogs);
    } else {
      setLogs([...logs, {
        id: Math.random().toString(36).substr(2, 9),
        habitId,
        date: today,
        value,
        completed: true
      }]);
    }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim()) return;
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text: todoInput.trim(),
      completed: false,
      createdAt: Date.now()
    };
    setTodos([newTodo, ...todos]);
    setTodoInput('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const fetchWeeklySummary = async () => {
    if (habits.length === 0) return;
    setLoadingSummary(true);
    const summary = await generateWeeklySummary(habits, logs);
    setWeeklySummary(summary);
    setLoadingSummary(false);
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all your growth progress? This cannot be undone.")) {
      setHabits([]);
      setLogs([]);
      setTodos([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  // Detect drop-offs
  useEffect(() => {
    const checkNudges = async () => {
      const newNudges: Record<string, string> = {};
      for (const habit of habits) {
        const habitLogs = logs.filter(l => l.habitId === habit.id);
        const nudge = await detectDropOff(habit, habitLogs);
        if (nudge) newNudges[habit.id] = nudge;
      }
      setNudges(newNudges);
    };
    if (habits.length > 0) checkNudges();
  }, [habits.length]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-pink-100 p-8 space-y-8">
        <div className="flex items-center gap-2 text-pink-600 font-bold text-2xl cursor-pointer" onClick={() => setActiveView('garden')}>
          <Sprout size={32} />
          <span>BloomHabit</span>
        </div>
        
        <div className="space-y-2">
          <NavItem 
            active={activeView === 'garden'} 
            icon={<LayoutDashboard size={20} />} 
            label="Garden" 
            onClick={() => setActiveView('garden')}
          />
          <NavItem 
            active={activeView === 'tasks'} 
            icon={<CheckSquare size={20} />} 
            label="To-Do List" 
            onClick={() => setActiveView('tasks')}
          />
          <NavItem 
            active={activeView === 'settings'} 
            icon={<Settings size={20} />} 
            label="Settings" 
            onClick={() => setActiveView('settings')}
          />
        </div>

        <div className="mt-auto p-6 bg-pink-50 rounded-[2rem] border border-pink-100 relative overflow-hidden group">
          <Sparkles size={24} className="text-pink-300 absolute -top-1 -right-1 group-hover:rotate-12 transition-transform" />
          <h4 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">Growth Level</h4>
          <div className="text-3xl font-bold text-pink-600 mb-1">LV {Math.floor(logs.filter(l => l.completed).length / 5) + 1}</div>
          <p className="text-[10px] text-pink-400 leading-tight">Your garden flourishes with every step.</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full pb-32 md:pb-12">
        {activeView === 'garden' && (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Your Garden</h1>
                <p className="text-gray-400 text-sm">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-pink-600 hover:-translate-y-0.5 transition-all"
              >
                <Plus size={20} />
                <span className="font-bold hidden sm:inline">Add Habit</span>
              </button>
            </header>

            {/* AI Summary Box */}
            <section className="mb-12 bg-white rounded-[2.5rem] p-8 border border-pink-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={80} className="text-pink-500" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">AI Garden Insights</h2>
                </div>
                {!weeklySummary && (
                  <button 
                    onClick={fetchWeeklySummary}
                    disabled={loadingSummary}
                    className="text-sm font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 bg-pink-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    {loadingSummary ? 'Consulting the Spirits...' : 'Generate Weekly View'}
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
              <div className="text-gray-600 leading-relaxed italic">
                {weeklySummary ? <div className="animate-in fade-in slide-in-from-left-4 duration-1000">{weeklySummary}</div> : "Your garden is currently peaceful. Click above to get personalized insights."}
              </div>
            </section>

            {/* Nudges */}
            {Object.values(nudges).length > 0 && (
              <div className="mb-10 grid gap-4">
                {Object.entries(nudges).map(([habitId, msg]) => (
                  <div key={habitId} className="bg-amber-50 border border-amber-100 text-amber-800 px-6 py-3 rounded-2xl text-sm flex items-center gap-3 animate-in slide-in-from-right-4">
                    <span className="text-xl">💡</span>
                    <p>{msg}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-200">
                    <Plus size={48} />
                  </div>
                  <p className="text-gray-400 font-medium">Your garden is empty. Let's plant some seeds!</p>
                </div>
              ) : (
                habits.map(habit => (
                  <HabitCard 
                    key={habit.id}
                    habit={habit}
                    logs={logs.filter(l => l.habitId === habit.id)}
                    onToggle={handleToggleHabit}
                    onDelete={handleDeleteHabit}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-800">Today's Tasks</h1>
              <p className="text-gray-400 text-sm">Quick checklist for things that pop up.</p>
            </header>

            <form onSubmit={handleAddTodo} className="mb-8 flex gap-3">
              <input 
                type="text" 
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                placeholder="What needs to be done? 🌸"
                className="flex-1 bg-white border border-pink-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-pink-300 outline-none shadow-sm transition-all"
              />
              <button type="submit" className="bg-pink-500 text-white p-4 rounded-2xl shadow-lg hover:bg-pink-600 transition-all">
                <Plus size={24} />
              </button>
            </form>

            <div className="space-y-3">
              {todos.length === 0 ? (
                <div className="text-center py-12 text-gray-300 italic">No tasks yet. Enjoy the quiet! ✨</div>
              ) : (
                todos.map(todo => (
                  <div 
                    key={todo.id} 
                    className="bg-white p-5 rounded-2xl border border-pink-50 flex items-center justify-between group shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggleTodo(todo.id)}>
                      <button className={`transition-colors ${todo.completed ? 'text-pink-500' : 'text-pink-200'}`}>
                        {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <span className={`text-lg transition-all ${todo.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-400 text-sm">Configure your bloom experience.</p>
            </header>

            <div className="bg-white rounded-[2.5rem] p-8 border border-pink-100 shadow-sm space-y-8">
              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4">Account & Data</h3>
                <div className="p-4 bg-pink-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-pink-700">Clear All Data</h4>
                    <p className="text-xs text-pink-500">Reset your garden and task list entirely.</p>
                  </div>
                  <button 
                    onClick={clearAllData}
                    className="flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-2 rounded-xl hover:bg-pink-200 transition-colors font-bold text-sm"
                  >
                    <Trash2 size={16} />
                    Reset
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-700 mb-4">About BloomHabit</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between py-2 border-b border-pink-50">
                    <span>Version</span>
                    <span className="font-medium">1.2.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-pink-50">
                    <span>AI Model</span>
                    <span className="font-medium">Gemini 3 Flash</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-pink-50">
                    <span>Developer</span>
                    <span className="font-medium text-pink-400">kavocado</span>
                  </div>
                </div>
              </section>

              <button className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 py-4 transition-colors font-medium">
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-pink-100 p-2 flex justify-around items-center z-40">
        <MobileNavItem 
          active={activeView === 'garden'} 
          icon={<LayoutDashboard size={24} />} 
          onClick={() => setActiveView('garden')}
        />
        <MobileNavItem 
          active={activeView === 'tasks'} 
          icon={<CheckSquare size={24} />} 
          onClick={() => setActiveView('tasks')}
        />
        <button 
          onClick={() => {
            setActiveView('garden');
            setIsModalOpen(true);
          }}
          className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform -translate-y-4"
        >
          <Plus size={32} />
        </button>
        <MobileNavItem 
          active={activeView === 'settings'} 
          icon={<Settings size={24} />} 
          onClick={() => setActiveView('settings')}
        />
      </nav>

      {isModalOpen && <AddHabitModal onClose={() => setIsModalOpen(false)} onAdd={handleAddHabit} />}
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-pink-400 hover:bg-pink-50/50'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface MobileNavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all ${active ? 'text-pink-500 bg-pink-50' : 'text-gray-400'}`}
  >
    {icon}
  </button>
);

export default App;
