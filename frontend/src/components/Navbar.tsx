import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AlertsBell from './AlertsBell';
import { LogOut, Settings as SettingsIcon, Sun, Moon, LayoutDashboard, GitCompare } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { logout, user } = useAuthStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };
  
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white shadow-lg shadow-indigo-600/20">C</span>
              CompTracker
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/" className="nav-link"><LayoutDashboard className="h-4 w-4" /> Overview</Link>
              <Link to="/comparison" className="nav-link"><GitCompare className="h-4 w-4" /> Comparison</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/add-competitor" className="hidden items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 sm:inline-flex">
              <span className="mr-1.5 text-base">+</span>
              Add Competitor
            </Link>
            <AlertsBell />
            <button onClick={toggleTheme} className="theme-button" aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <Link to="/settings" className="theme-button">
              <SettingsIcon className="h-5 w-5" />
            </Link>
            <div className="hidden max-w-[180px] truncate text-sm font-medium text-slate-600 dark:text-slate-300 lg:block">{user?.email}</div>
            <button onClick={logout} className="theme-button" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
