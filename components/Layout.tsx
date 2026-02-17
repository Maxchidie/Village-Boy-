import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[10px] font-bold text-center py-1 safe-top z-[60]">
          OFFLINE MODE • DATA WILL SYNC LATER
        </div>
      )}
      
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 safe-top">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">V</div>
            <span className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Village Boy</span>
          </NavLink>
          <div className="flex gap-2 items-center">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <NavLink to="/pulse" className={({isActive}) => `text-sm font-bold ${isActive ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>Pulse</NavLink>
            <NavLink to="/ballot" className={({isActive}) => `px-4 py-2 rounded-2xl text-sm font-bold transition-all ${isActive ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>My Ballot</NavLink>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {children}
      </main>

      <footer className="py-12 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 safe-bottom">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mx-auto mb-4">VB</div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">The Village Voice</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[240px] mx-auto">Non-partisan • Independent • Built for Nigeria</p>
          <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-green-600">Privacy</a>
            <a href="#" className="hover:text-green-600">Terms</a>
            <a href="#" className="hover:text-green-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;