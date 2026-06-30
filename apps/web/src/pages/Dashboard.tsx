/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Flame,
  Clock,
  BookOpen,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Compass,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Award,
  ArrowUpRight,
  HelpCircle,
  BrainCircuit,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Demo States: loaded, empty, loading
  const [demoState, setDemoState] = useState<'loaded' | 'empty' | 'loading'>('loaded');

  // Interactive Pomodoro Timer States
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Today's Planner checklist states
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Revise Dijkstra Algorithm (GATE)', completed: false, priority: 'P0' },
    { id: 2, text: 'Complete Subject Weightage Excel', completed: true, priority: 'P1' },
    { id: 3, text: 'Practice 15 Aptitude MCQs', completed: false, priority: 'P2' },
  ]);

  // Handle Pomodoro timer logic
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((prev) => prev - 1);
        } else if (timerSeconds === 0) {
          if (timerMinutes > 0) {
            setTimerMinutes((prev) => prev - 1);
            setTimerSeconds(59);
          } else {
            // Timer finished!
            setTimerActive(false);
            clearInterval(timerIntervalRef.current!);
            toast.success('Study session completed! Take a break.');

            // Switch modes automatically
            if (timerMode === 'study') {
              setTimerMode('shortBreak');
              setTimerMinutes(5);
            } else {
              setTimerMode('study');
              setTimerMinutes(25);
            }
          }
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, timerMinutes, timerSeconds, timerMode]);

  const toggleTimer = () => setTimerActive(!timerActive);

  const resetTimer = () => {
    setTimerActive(false);
    if (timerMode === 'study') {
      setTimerMinutes(25);
    } else if (timerMode === 'shortBreak') {
      setTimerMinutes(5);
    } else {
      setTimerMinutes(15);
    }
    setTimerSeconds(0);
  };

  const switchTimerMode = (mode: 'study' | 'shortBreak' | 'longBreak') => {
    setTimerActive(false);
    setTimerMode(mode);
    setTimerSeconds(0);
    if (mode === 'study') {
      setTimerMinutes(25);
    } else if (mode === 'shortBreak') {
      setTimerMinutes(5);
    } else {
      setTimerMinutes(15);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      toast.success('Task marked completed!');
    }
  };

  // Weekly study data for SVG bar chart
  const weeklyData = [
    { day: 'Mon', hours: 3.2 },
    { day: 'Tue', hours: 4.5 },
    { day: 'Wed', hours: 2.0 },
    { day: 'Thu', hours: 5.1 },
    { day: 'Fri', hours: 1.5 },
    { day: 'Sat', hours: 4.0 },
    { day: 'Sun', hours: 4.2 },
  ];

  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  // Monthly heatmap commit simulation (4 weeks * 7 days)
  const heatmapDays = Array(28)
    .fill(0)
    .map((_, i) => {
      // Generate mock study hours density (0 to 3)
      if (i % 7 === 0) return 0;
      if (i % 5 === 0) return 3;
      if (i % 3 === 0) return 2;
      return 1;
    });

  const getHeatmapColor = (density: number) => {
    switch (density) {
      case 3:
        return 'bg-indigo-600 dark:bg-indigo-500';
      case 2:
        return 'bg-indigo-400 dark:bg-indigo-650';
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-900/60';
      default:
        return 'bg-slate-100 dark:bg-zinc-800/40';
    }
  };

  // 1. SKELETON LOADING STATE
  if (demoState === 'loading') {
    return (
      <div className="space-y-8 select-none">
        {/* State Toggle Selector */}
        <div className="flex justify-end gap-2 text-xs">
          <button
            onClick={() => setDemoState('loaded')}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold transition-colors"
          >
            Loaded State
          </button>
          <button
            onClick={() => setDemoState('empty')}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold transition-colors"
          >
            Empty State
          </button>
          <button
            onClick={() => setDemoState('loading')}
            className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm"
          >
            Loading State
          </button>
        </div>

        {/* Hero Banner Skeleton */}
        <div className="p-6 md:p-8 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800/60 rounded-xl"></div>
              ))}
          </div>
        </div>

        {/* Grid widgets skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl animate-pulse p-6">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/6 mb-4"></div>
              <div className="h-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl animate-pulse p-6"
                  ></div>
                ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl animate-pulse p-6"></div>
            <div className="h-48 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl animate-pulse p-6"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. EMPTY STATE
  if (demoState === 'empty') {
    return (
      <div className="space-y-8 select-none">
        {/* State Toggle Selector */}
        <div className="flex justify-end gap-2 text-xs">
          <button
            onClick={() => setDemoState('loaded')}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold transition-colors"
          >
            Loaded State
          </button>
          <button
            onClick={() => setDemoState('empty')}
            className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm"
          >
            Empty State
          </button>
          <button
            onClick={() => setDemoState('loading')}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold transition-colors"
          >
            Loading State
          </button>
        </div>

        {/* Hero Section */}
        <div className="p-6 md:p-8 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Welcome to StudyOS, {user?.name}!
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Configure your target exams to start tracking your study routines.
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-550 border border-slate-200 dark:border-[#262630] px-2.5 py-1 rounded-lg select-none">
            Preparing since June 2026
          </span>
        </div>

        {/* Big Empty State Widget Card */}
        <div className="border border-dashed border-slate-300 dark:border-zinc-800/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-5 py-20 bg-white/40 dark:bg-[#15151a]/20 backdrop-blur-md">
          <div className="w-16 h-16 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-650 dark:text-indigo-400 rounded-full flex items-center justify-center">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Your study dashboard is empty
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed font-medium">
              We need at least one target exam and study target hours to populate your charts and
              commits heatmaps.
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/10 transition-all active:scale-[0.98]"
          >
            Configure Profile Exams
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. LOADED WIDGETS DASHBOARD
  return (
    <div className="space-y-6 md:space-y-8 select-none">
      {/* State Toggle Selector (Floating Demo Control) */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={() => setDemoState('loaded')}
          className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm"
        >
          Loaded State
        </button>
        <button
          onClick={() => setDemoState('empty')}
          className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold transition-colors"
        >
          Empty State
        </button>
        <button
          onClick={() => setDemoState('loading')}
          className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold transition-colors"
        >
          Loading State
        </button>
      </div>

      {/* Hero metrics banner */}
      <div className="p-6 md:p-8 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-55">
              Good evening, {user?.name || 'Aarav'}
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              You completed 80% of your daily target today. Keep pushing!
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-550 border border-slate-150 dark:border-[#262630] px-3 py-1 rounded-lg">
            Prep Started: June 2026
          </span>
        </div>

        {/* Hero stat badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-[#0d0d11] border border-slate-150 dark:border-[#262630] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                Study Hours
              </p>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">24.5 hrs</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#0d0d11] border border-slate-150 dark:border-[#262630] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-650 dark:text-purple-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                Sessions
              </p>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">18 total</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#0d0d11] border border-slate-150 dark:border-[#262630] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                Active Streak
              </p>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">5 Days</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#0d0d11] border border-slate-150 dark:border-[#262630] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                Longest Streak
              </p>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">12 Days</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Column (Analytics & Planners) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly SVG Bar Chart widget */}
          <div className="p-5 md:p-6 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                Weekly Activity
              </h3>
              <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 px-2 py-0.5 rounded-lg">
                Last 7 Days
              </span>
            </div>
            <div className="h-44 flex items-end justify-between gap-2.5 pt-4">
              {weeklyData.map((d) => {
                const heightPercent = (d.hours / maxHours) * 80; // Scale to fit widget
                return (
                  <div
                    key={d.day}
                    className="flex-grow flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-zinc-400 group-hover:text-indigo-600 transition-colors">
                      {d.hours}h
                    </div>
                    <div className="w-full relative h-32 flex items-end">
                      <div className="w-full bg-slate-100 dark:bg-zinc-800/50 rounded-lg absolute inset-0"></div>
                      <div
                        className="w-full bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-700 rounded-lg z-10 transition-all"
                        style={{ height: `${heightPercent || 5}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap & Planner Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Heatmap widget */}
            <div className="p-5 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                  Study Heatmap
                </h3>
                <span className="text-[9px] text-zinc-400 font-semibold">28-day grid</span>
              </div>
              <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium">
                Daily study consistency over the last month:
              </p>

              <div className="grid grid-cols-7 gap-1.5 pt-2 max-w-[200px] sm:max-w-none">
                {heatmapDays.map((density, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-md transition-all duration-200 hover:scale-105 cursor-pointer ${getHeatmapColor(density)}`}
                    title={`Day ${idx + 1}: ${density} blocks studied`}
                  ></div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold pt-2 justify-end">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-zinc-800/40"></div>
                <div className="w-2.5 h-2.5 rounded bg-indigo-200 dark:bg-indigo-900/60"></div>
                <div className="w-2.5 h-2.5 rounded bg-indigo-400 dark:bg-indigo-650"></div>
                <div className="w-2.5 h-2.5 rounded bg-indigo-600 dark:bg-indigo-500"></div>
                <span>More</span>
              </div>
            </div>

            {/* Today's Planner widget */}
            <div className="p-5 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                  Today's Planner
                </h3>
                <button
                  onClick={() => toast.success('Open Quick Add to insert tasks.')}
                  className="text-indigo-650 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0d0d11]/80 hover:bg-slate-100/50 dark:hover:bg-[#1c1c24] border border-slate-100 dark:border-[#262630]/60 cursor-pointer transition-all duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}} // Click handler covers this
                      className="w-4 h-4 rounded text-indigo-650 accent-indigo-650 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-semibold select-none flex-grow ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                    >
                      {task.text}
                    </span>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        task.priority === 'P0'
                          ? 'bg-red-500/10 text-red-500'
                          : task.priority === 'P1'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-slate-200 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions Copilot */}
          <div className="p-5 bg-gradient-to-tr from-indigo-500/[0.03] to-purple-500/[0.03] border border-indigo-500/10 dark:border-indigo-500/5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1">
                StudyOS Copilot
                <span className="text-[8px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full scale-90">
                  AI
                </span>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                "Based on your subject weights, we noticed you have studied GATE Algorithms 40% less
                than your monthly milestone. We highly suggest launching a 25-minute revision timer
                block today."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Column (Timer & Lists) */}
        <div className="space-y-6">
          {/* Active Pomodoro Timer Widget */}
          <div className="p-5 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm text-center space-y-4">
            <div className="flex justify-between items-center text-left">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-650" />
                Study Timer
              </h3>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                Pomodoro
              </span>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-[#0d0d11] p-1 border dark:border-[#262630] rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => switchTimerMode('study')}
                className={`py-1.5 rounded-lg transition-all ${timerMode === 'study' ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm' : 'text-zinc-500'}`}
              >
                Study
              </button>
              <button
                type="button"
                onClick={() => switchTimerMode('shortBreak')}
                className={`py-1.5 rounded-lg transition-all ${timerMode === 'shortBreak' ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm' : 'text-zinc-500'}`}
              >
                Short Break
              </button>
              <button
                type="button"
                onClick={() => switchTimerMode('longBreak')}
                className={`py-1.5 rounded-lg transition-all ${timerMode === 'longBreak' ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-white shadow-sm' : 'text-zinc-500'}`}
              >
                Long Break
              </button>
            </div>

            {/* Timer Clock Face */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              {/* Simple SVGs circular path layout */}
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-100 dark:text-zinc-800"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000"
                  fill="transparent"
                  strokeDasharray="402"
                  strokeDashoffset={
                    402 -
                    402 *
                      ((timerMinutes * 60 + timerSeconds) /
                        (timerMode === 'study'
                          ? 25 * 60
                          : timerMode === 'shortBreak'
                            ? 5 * 60
                            : 15 * 60))
                  }
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-zinc-50 select-none">
                  {timerMinutes.toString().padStart(2, '0')}:
                  {timerSeconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-400 select-none tracking-wider mt-0.5">
                  {timerMode === 'study' ? 'Focusing' : 'Break Time'}
                </span>
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex justify-center gap-3">
              <button
                onClick={toggleTimer}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                title={timerActive ? 'Pause' : 'Start'}
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
              </button>
              <button
                onClick={resetTimer}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#262630] hover:bg-slate-50 dark:hover:bg-[#1c1c24] text-zinc-650 dark:text-zinc-350 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Exams & Upcoming revisions widgets */}
          <div className="p-5 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Target Exams
            </h3>
            <div className="space-y-2">
              {user?.preparationTypes.map((exam, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2.5 rounded-xl border border-slate-150/60 dark:border-[#262630]/60 bg-slate-50/50 dark:bg-[#0d0d11]/40"
                >
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{exam}</span>
                  <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded">
                    Active Target
                  </span>
                </div>
              )) || (
                <div className="text-center text-xs text-zinc-400 py-2">
                  No active examinations configure.
                </div>
              )}
            </div>
          </div>

          {/* Achievements widget */}
          <div className="p-5 bg-white dark:bg-[#15151a] border border-slate-200/80 dark:border-[#262630] rounded-2xl shadow-sm space-y-4 select-none">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              Achievements
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col items-center">
                <Flame className="w-5 h-5 text-amber-550" />
                <span className="text-[9px] font-bold mt-1 text-zinc-750 dark:text-zinc-300">
                  5-Day Run
                </span>
              </div>
              <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col items-center">
                <Award className="w-5 h-5 text-indigo-550 dark:text-indigo-455" />
                <span className="text-[9px] font-bold mt-1 text-zinc-750 dark:text-zinc-300">
                  Milestone 1
                </span>
              </div>
              <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded-xl flex flex-col items-center">
                <Sparkles className="w-5 h-5 text-purple-550 dark:text-purple-455" />
                <span className="text-[9px] font-bold mt-1 text-zinc-750 dark:text-zinc-300">
                  First block
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
