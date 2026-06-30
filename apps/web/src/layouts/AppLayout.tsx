/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LogOut,
  Sun,
  Moon,
  Sparkles,
  User as UserIcon,
  LayoutDashboard,
  UserSquare2,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Sidebar States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modal / Dropdown States
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: 'AI Suggestion: Revise GATE Algorithms block today.',
      time: '10m ago',
      unread: true,
    },
    { id: 2, text: 'You achieved a 5-day study streak! Keep it up.', time: '2h ago', unread: true },
    { id: 3, text: 'Daily Target Met! 120 XP added.', time: '1d ago', unread: false },
  ]);

  // Handle hotkey (Command+K or Ctrl+K) for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile & Settings', path: '/profile', icon: UserSquare2 },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-[#262630] bg-white dark:bg-[#15151a] transition-all duration-300 z-30 select-none relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse Toggle Handle Button */}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-10 w-6 h-6 border border-slate-200 dark:border-[#262630] bg-white dark:bg-[#15151a] hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-zinc-500 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all z-40"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Sidebar Header (Logo) */}
        <div className="h-16 flex items-center px-6 border-b border-slate-150 dark:border-[#262630]">
          <Link to="/dashboard" className="flex items-center gap-2.5 focus:outline-none">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/30 shrink-0">
              S
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg tracking-tight animate-fade-in text-zinc-900 dark:text-zinc-50">
                Study<span className="text-indigo-650 dark:text-indigo-400">OS</span>
              </span>
            )}
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-semibold transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-slate-100/60 dark:hover:bg-[#1c1c24] hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`}
                />
                {!collapsed && <span className="animate-fade-in">{link.name}</span>}
                {/* Active side-dot indicator */}
                {isActive && collapsed && (
                  <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Level Banner Widget (Expanded only) */}
        {!collapsed && user && (
          <div className="mx-4 mb-3 p-3 bg-indigo-500/[0.03] border border-indigo-500/10 dark:border-indigo-500/5 rounded-xl space-y-1.5 animate-fade-in select-none">
            <div className="flex justify-between items-center text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
              <span>Current Status</span>
              <span className="flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Level {user.level}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
              <span>{user.xp} XP total</span>
              <span>Next Lvl: 400 XP</span>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-[#262630] flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98] transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          ></div>

          <aside className="relative w-72 max-w-xs bg-white dark:bg-[#15151a] flex flex-col h-full z-10 border-r border-slate-200/80 dark:border-[#262630] animate-scale-up duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-150 dark:border-[#262630]">
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-55">
                Study<span className="text-indigo-650 dark:text-indigo-400">OS</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#1c1c24]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-[#262630]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT PANEL */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 border-b border-slate-200/80 dark:border-[#262630] bg-white/70 dark:bg-[#15151a]/70 backdrop-blur-md sticky top-0 z-45 px-4 md:px-6 flex items-center justify-between transition-colors duration-300">
          {/* Left section: Hamburger / Search Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-[#262630] text-zinc-500 hover:bg-slate-100 dark:hover:bg-[#1c1c24]"
              aria-label="Open mobile menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Command-K Search Trigger Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden sm:flex items-center gap-2.5 text-xs text-zinc-400 dark:text-zinc-500 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#262630] hover:bg-slate-100/60 dark:hover:bg-[#121215] text-left w-52 md:w-60 focus:outline-none transition-colors"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Search dashboard...</span>
              <kbd className="ml-auto font-mono text-[9px] bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-550 select-none">
                ⌘K
              </kbd>
            </button>
            {/* Compact Search Trigger on Mobile */}
            <button
              onClick={() => setShowSearch(true)}
              className="sm:hidden p-2 rounded-lg border border-slate-200 dark:border-[#262630] text-zinc-500 hover:bg-slate-100 dark:hover:bg-[#1c1c24]"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Right section: Actions / Badges */}
          <div className="flex items-center gap-2">
            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                aria-label="Open notifications"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-[#262630] hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-zinc-500 dark:text-zinc-400 transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#15151a] border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-up">
                  <div className="p-4 border-b border-slate-150 dark:border-[#262630] flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-50 uppercase tracking-wider">
                      Notifications
                    </span>
                    <button
                      onClick={() =>
                        setNotifications(notifications.map((n) => ({ ...n, unread: false })))
                      }
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-[#262630] max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 text-xs transition-colors flex gap-2.5 ${notif.unread ? 'bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01]' : 'hover:bg-slate-50 dark:hover:bg-[#1c1c24]'}`}
                      >
                        <div className="mt-0.5 shrink-0 text-indigo-550">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-zinc-700 dark:text-zinc-300 leading-normal">
                            {notif.text}
                          </p>
                          <span className="text-[10px] text-zinc-400">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-[#262630] hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-zinc-550 dark:text-zinc-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-650" />
              )}
            </button>

            {/* User Profile Avatar Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  aria-label="User menu"
                  className="flex items-center gap-2 p-1 border border-slate-200 dark:border-[#262630] rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1c24] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm uppercase">
                    {user.name.slice(0, 2)}
                  </div>
                </button>

                {/* Profile menu dropdown details */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#15151a] border border-slate-200 dark:border-[#262630] rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-up select-none">
                    <div className="p-4 border-b border-slate-150 dark:border-[#262630] space-y-1">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 leading-none">
                        {user.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium leading-none">
                        @{user.username}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium truncate pt-1">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#1c1c24] transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* 4. WORKSPACE DISPLAY SCROLLPORT */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-[#0c0c0e] transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 5. MODAL: RAYCAST COMMAND SEARCH */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          ></div>
          <div className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-[#262630] w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden animate-scale-up select-none">
            <div className="p-4 border-b border-slate-150 dark:border-[#262630] flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search anything (e.g. Dashboard, Profile, GATE, Pomodoro)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm bg-transparent border-none text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-650 bg-slate-100 dark:bg-zinc-800 border dark:border-zinc-700 px-2 py-0.5 rounded"
              >
                ESC
              </button>
            </div>

            {/* Quick action list (Raycast style) */}
            <div className="p-2.5 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
              <div className="pb-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-3 py-1 block">
                  Navigation Quick-links
                </span>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    navigate('/dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-left transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                  <span>Go to Dashboard</span>
                  <span className="ml-auto text-[10px] text-zinc-400">⏎</span>
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-left transition-colors"
                >
                  <UserSquare2 className="w-4 h-4 text-zinc-400" />
                  <span>Go to Profile & Settings</span>
                  <span className="ml-auto text-[10px] text-zinc-400">⏎</span>
                </button>
              </div>

              <div className="pt-1.5 pb-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-3 py-1 block">
                  Tools & Utilities
                </span>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setShowQuickAdd(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-left transition-colors"
                >
                  <Plus className="w-4 h-4 text-zinc-400" />
                  <span>Quick Add Task or Note</span>
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    toggleTheme();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#1c1c24] text-left transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>Switch Theme ({theme === 'dark' ? 'Light' : 'Dark'} mode)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: QUICK ADD */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQuickAdd(false)}
          ></div>
          <div className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-[#262630] w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-150 dark:border-[#262630] flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-650" />
                Quick Add Component
              </span>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="p-1 text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-350"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Mock item added successfully!');
                setShowQuickAdd(false);
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Item Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="py-2 text-xs font-bold border border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-xl"
                  >
                    Task
                  </button>
                  <button
                    type="button"
                    className="py-2 text-xs font-bold border border-slate-200 dark:border-[#262630] text-zinc-550 rounded-xl hover:bg-slate-50"
                  >
                    Study block
                  </button>
                  <button
                    type="button"
                    className="py-2 text-xs font-bold border border-slate-200 dark:border-[#262630] text-zinc-550 rounded-xl hover:bg-slate-50"
                  >
                    Quick note
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g. Revise Graph Traversals"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-[#262630] rounded-xl text-sm bg-white dark:bg-[#0d0d11] text-zinc-900 dark:text-zinc-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"
                  >
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-[#262630] rounded-xl text-xs bg-white dark:bg-[#0d0d11] text-zinc-900 dark:text-zinc-50 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"
                  >
                    Duration
                  </label>
                  <select
                    id="time"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-[#262630] rounded-xl text-xs bg-white dark:bg-[#0d0d11] text-zinc-900 dark:text-zinc-50 focus:border-indigo-500 focus:outline-none"
                  >
                    <option>30 mins</option>
                    <option>60 mins</option>
                    <option>90 mins</option>
                    <option>120 mins</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-98 transition-all"
              >
                Add Mock Block
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
