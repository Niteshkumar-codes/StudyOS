/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LogOut,
  Sun,
  Moon,
  Sparkles,
  User,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Scroll,
  Calendar,
  Timer,
  FileText,
  ClipboardCheck,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
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

  // Refs for accessibility focus trap / clicks outside
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  // Sidebar link categories (Group navigation)
  const menuGroups = [
    {
      title: 'MAIN',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Exams', path: '/exams', icon: GraduationCap },
        { name: 'Subjects', path: '/subjects', icon: BookOpen },
        { name: 'Syllabus', path: '/syllabus', icon: Scroll },
      ],
    },
    {
      title: 'PRODUCTIVITY',
      links: [
        { name: 'Planner', path: '/planner', icon: Calendar },
        { name: 'Study Timer', path: '/timer', icon: Timer },
        { name: 'Notes', path: '/notes', icon: FileText },
      ],
    },
    {
      title: 'PERFORMANCE',
      links: [
        { name: 'Mock Tests', path: '/mock-tests', icon: ClipboardCheck },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  // Flat array of links for search index
  const flatLinks = menuGroups.flatMap((group) => group.links);

  // Screen size detection for responsive layout (auto-collapses on tablet)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut (⌘K or Ctrl+K) for Search + Escape key for modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowQuickAdd(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Filtered navigation quicklinks for command search
  const filteredSearchItems = flatLinks.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Premium Logo component: Book + Progress + OS inspired
  const StudyOSLogo = () => (
    <div className="flex items-center gap-2.5 select-none">
      {/* Custom premium SVG icon */}
      <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-zinc-950 dark:bg-zinc-100 shadow-sm shrink-0 border border-zinc-800 dark:border-zinc-200">
        <svg className="w-4.5 h-4.5 text-zinc-105 dark:text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Book outline (representing Book/Syllabus/Exams) */}
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          {/* Progress circle (representing Performance/Analytics/Timer) */}
          <path d="M12 6.5a2.5 2.5 0 1 1-2.5 2.5" className="stroke-indigo-400 dark:stroke-indigo-600" strokeWidth="1.8" />
          {/* OS Prompt terminal chevron (representing OS/System) */}
          <path d="M9 13.5l1.5 1.5 3-3" className="stroke-indigo-400 dark:stroke-indigo-600" strokeWidth="1.8" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="font-extrabold text-[13.5px] tracking-tight text-zinc-950 dark:text-zinc-50 leading-none">
          Study<span className="text-indigo-650 dark:text-indigo-400">OS</span>
        </span>
        <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-550 tracking-wider mt-1 leading-none uppercase">
          Preparation Operating System
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      {/* 1. LEFT SIDEBAR (Desktop & Tablet) */}
      <aside
        className={`hidden md:flex flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121215] transition-all duration-300 z-30 select-none relative h-screen sticky top-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-6 w-6 h-6 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-[#15151a] hover:bg-zinc-50 dark:hover:bg-[#1c1c24] text-zinc-550 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Header (Logo) */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-200/80 dark:border-zinc-800/60 shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg p-1.5 w-full"
            aria-label="StudyOS dashboard home"
          >
            {collapsed ? (
              <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-zinc-950 dark:bg-zinc-100 shadow-sm shrink-0 border border-zinc-850 dark:border-zinc-200">
                <svg className="w-4.5 h-4.5 text-zinc-100 dark:text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M12 6.5a2.5 2.5 0 1 1-2.5 2.5" className="text-indigo-400 dark:text-indigo-600" strokeWidth="1.8" />
                  <path d="M9 13.5l1.5 1.5 3-3" className="stroke-indigo-400 dark:stroke-indigo-600" strokeWidth="1.8" />
                </svg>
              </div>
            ) : (
              <StudyOSLogo />
            )}
          </Link>
        </div>

        {/* Sidebar Navigation Items grouped into categories */}
        <nav className="flex-grow p-3 space-y-4 overflow-y-auto" aria-label="Main menu">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              {!collapsed ? (
                <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase px-3 pb-1 select-none">
                  {group.title}
                </div>
              ) : (
                <div className="border-t border-zinc-100 dark:border-zinc-800/40 my-2 mx-1" />
              )}

              {group.links.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 hover:translate-x-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-850/20 hover:text-zinc-950 dark:hover:text-zinc-50 group ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-850/50 text-zinc-955 dark:text-zinc-50 font-semibold shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    title={collapsed ? link.name : undefined}
                  >
                    {/* Active left indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-md bg-indigo-600 dark:bg-indigo-400" />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-all duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'text-indigo-650 dark:text-indigo-400 drop-shadow-[0_0_2px_rgba(99,102,241,0.2)]'
                          : 'text-zinc-450 dark:text-zinc-500'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{link.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Level Stats Banner (Visible when expanded only) */}
        {!collapsed && user && (
          <div className="mx-3 mb-2 p-3 bg-zinc-50/50 dark:bg-[#15151a]/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1.5 shrink-0 select-none animate-fade-in">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">
              <span>Status</span>
              <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-2.5 h-2.5" />
                Lvl {user.level}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200/70 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-650 dark:bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
              <span>{user.xp} XP total</span>
              <span>Next: 400 XP</span>
            </div>
          </div>
        )}

        {/* Sidebar Footer (Profile & Logout) */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/60 flex flex-col gap-0.5 shrink-0">
          <Link
            to="/profile"
            className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:translate-x-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-850/20 hover:text-zinc-950 dark:hover:text-zinc-50 relative outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
              location.pathname === '/profile'
                ? 'bg-zinc-100 dark:bg-zinc-850/50 text-zinc-955 dark:text-zinc-50 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
            aria-current={location.pathname === '/profile' ? 'page' : undefined}
            title={collapsed ? 'Profile' : undefined}
          >
            {location.pathname === '/profile' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-md bg-indigo-600 dark:bg-indigo-400" />
            )}
            <User
              className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                location.pathname === '/profile' ? 'text-indigo-650 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            />
            {!collapsed && <span className="truncate">Profile</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/5 active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 text-left"
            title={collapsed ? 'Log Out' : undefined}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-500" />
            {!collapsed && <span className="truncate">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR (overlay panel) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMobileOpen(false)}
          ></div>

          {/* Drawer Panel content */}
          <aside className="relative w-64 max-w-xs bg-white dark:bg-[#121215] flex flex-col h-full z-10 border-r border-zinc-200 dark:border-zinc-800 animate-fade-in">
            {/* Header branding / dismiss button */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <StudyOSLogo />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg"
                aria-label="Close mobile menu"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Menu Links grouped */}
            <nav className="flex-grow p-3 space-y-4 overflow-y-auto" aria-label="Mobile navigation">
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-0.5">
                  <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase px-3 pb-1 select-none">
                    {group.title}
                  </div>
                  {group.links.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-semibold transition-all relative group ${
                          isActive
                            ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-955 dark:text-zinc-50'
                            : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2.5 bottom-2.5 w-0.75 rounded-r-md bg-indigo-600 dark:bg-indigo-400" />
                        )}
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                            isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-zinc-450 dark:text-zinc-500'
                          }`}
                        />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sticky Mobile Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-[#262630] space-y-0.5 shrink-0">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-955 dark:text-zinc-50'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20'
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    location.pathname === '/profile' ? 'text-indigo-650 dark:text-indigo-400' : 'text-zinc-450 dark:text-zinc-500'
                  }`}
                />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-colors text-left"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN APP PANEL (Top Nav + Scroll Content) */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header
          className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/60 bg-white/80 dark:bg-[#121215]/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between transition-colors duration-300"
          aria-label="Top panel"
        >
          {/* Header Left: Hamburger and logo options */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              aria-label="Open sidebar menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Logo in header (visible on mobile, tablet, and collapsed desktop) */}
            <Link
              to="/dashboard"
              className={`outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg p-1.5 ${
                !collapsed ? 'md:hidden' : 'flex'
              }`}
              aria-label="StudyOS home"
            >
              <StudyOSLogo />
            </Link>

            {/* Command-K Search Trigger Bar (desktop/tablet) */}
            <button
              onClick={() => setShowSearch(true)}
              aria-label="Search study items"
              className="hidden sm:flex items-center gap-2 text-xs text-zinc-450 dark:text-zinc-550 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-[#18181c]/50 text-left w-48 md:w-56 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-colors"
            >
              <Search className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              <span>Search...</span>
              <kbd className="ml-auto font-mono text-[9px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-500 select-none">
                ⌘K
              </kbd>
            </button>

            {/* Compact Search Trigger button (mobile) */}
            <button
              onClick={() => setShowSearch(true)}
              aria-label="Search"
              className="sm:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-505 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAdd(true)}
              aria-label="Open quick add tool"
              className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-white text-white dark:text-zinc-950 rounded-lg text-xs font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                aria-expanded={showNotifications}
                aria-haspopup="true"
                aria-label="Toggle notifications list"
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-[#1c1c24] text-zinc-500 dark:text-zinc-450 transition-colors relative focus-visible:ring-2 focus-visible:ring-indigo-500/50 outline-none"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-650 dark:bg-indigo-400 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">
                      Notifications
                    </span>
                    <button
                      onClick={() => setNotifications(notifications.map((n) => ({ ...n, unread: false })))}
                      className="text-[10px] font-semibold text-indigo-650 dark:text-indigo-400 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-855 max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 text-xs transition-colors flex gap-2.5 ${
                          notif.unread ? 'bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01]' : 'hover:bg-zinc-50 dark:hover:bg-[#1c1c24]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-indigo-550 dark:text-indigo-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-zinc-705 dark:text-zinc-300 leading-normal">
                            {notif.text}
                          </p>
                          <span className="text-[9px] text-zinc-400">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle system theme"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-[#1c1c24] text-zinc-500 dark:text-zinc-450 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/50 outline-none"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-450" /> : <Moon className="w-4 h-4 text-indigo-650" />}
            </button>

            {/* User Profile Avatar Dropdown */}
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                  aria-label="Open user settings dropdown"
                  className="flex items-center gap-1.5 p-0.5 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-[#1c1c24] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/50 outline-none"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-zinc-900 text-xs font-bold shadow-sm uppercase shrink-0 select-none">
                    {user.name.slice(0, 2)}
                  </div>
                </button>

                {/* Profile menu dropdown content */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-up">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-850 space-y-0.5 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-50 leading-none">
                        {user.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-medium">@{user.username}</p>
                      <p className="text-[9px] text-zinc-450 truncate pt-1 leading-none">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-[#1c1c24] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-550/50"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-red-500 hover:bg-red-500/5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-550/50"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* 4. MAIN CONTENT AREA CONTAINER */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300">
          <div className="max-w-5xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 5. MODAL: RAYCAST COMMAND SEARCH */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" role="dialog" aria-modal="true" aria-label="Command search">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-[2px]"
            onClick={() => setShowSearch(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-xl shadow-xl z-10 overflow-hidden animate-fade-in select-none">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-850 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search anything (e.g. Dashboard, Exams, Timer, Notes)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="text-[9px] font-bold text-zinc-450 hover:text-zinc-700 bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 px-1.5 py-0.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              >
                ESC
              </button>
            </div>

            {/* Quick Action Navigation list */}
            <div className="p-2 max-h-64 overflow-y-auto space-y-1">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-2 py-1 block">
                  Quick Navigation Links
                </span>
                {filteredSearchItems.length === 0 ? (
                  <p className="text-xs text-zinc-450 pl-2 py-2">No matching modules found.</p>
                ) : (
                  filteredSearchItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        setShowSearch(false);
                        navigate(item.path);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-left transition-colors outline-none focus-visible:bg-zinc-50 dark:focus-visible:bg-zinc-800/40"
                    >
                      <item.icon className="w-3.5 h-3.5 text-zinc-450" />
                      <span>{item.name}</span>
                      <span className="ml-auto text-[9px] text-zinc-400">⏎</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: QUICK ADD */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-[2px]"
            onClick={() => setShowQuickAdd(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-850 w-full max-w-md rounded-xl shadow-xl z-10 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span id="quick-add-title" className="text-[10px] font-bold text-zinc-855 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Quick Add Action
              </span>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Block created successfully!');
                setShowQuickAdd(false);
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Item Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="py-1.5 text-xs font-semibold border border-indigo-550 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-lg"
                  >
                    Task
                  </button>
                  <button
                    type="button"
                    className="py-1.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/35"
                  >
                    Study block
                  </button>
                  <button
                    type="button"
                    className="py-1.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/35"
                  >
                    Quick note
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="quick-title"
                  className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5"
                >
                  Title
                </label>
                <input
                  id="quick-title"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Revise Graph Algorithms"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-[#0d0d11] text-zinc-900 dark:text-zinc-55 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quick-date"
                    className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5"
                  >
                    Date
                  </label>
                  <input
                    id="quick-date"
                    type="date"
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] bg-white dark:bg-[#0d0d11] text-zinc-900 dark:text-zinc-55 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quick-time"
                    className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5"
                  >
                    Duration
                  </label>
                  <select
                    id="quick-time"
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] bg-white dark:bg-[#0d0d11] text-zinc-900 dark:text-zinc-55 focus:border-indigo-500 focus:outline-none"
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
                className="w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-150 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 rounded-lg text-xs font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-offset-zinc-950 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-100"
              >
                Create Block
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
