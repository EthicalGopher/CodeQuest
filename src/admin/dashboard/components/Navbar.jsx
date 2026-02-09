import React from 'react';
import useAuth from '../../../hooks/useAuth';

const Navbar = ({ theme, toggleTheme }) => {
  const {user} = useAuth()
  console.log(user)

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b-4 border-stone-200 dark:border-stone-light bg-white dark:bg-stone-dark px-6 py-4 shadow-lg z-20 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-4 text-slate-900 dark:text-white">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center gap-3 bg-white dark:bg-stone-dark px-4 py-2 ring-1 ring-black/5 dark:ring-white/10 rounded">
            <span className="material-symbols-outlined text-primary animate-pulse text-3xl">terminal</span>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-widest uppercase font-pixel animate-glitch" style={{ textShadow: theme === 'dark' ? "2px 2px 0px #0d59f2" : "none" }}>
              CodeQuestPro<span className="text-secondary">_ADMIN</span>
            </h2>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-3">
          <button 
            onClick={toggleTheme}
            className="relative group overflow-hidden rounded bg-stone-100 dark:bg-stone-light p-2 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors border-2 border-transparent hover:border-primary text-slate-600 dark:text-slate-300"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button className="relative group overflow-hidden rounded bg-stone-100 dark:bg-stone-light p-2 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors border-2 border-transparent hover:border-primary">
            <span className="material-symbols-outlined text-secondary group-hover:animate-bounce">notifications_active</span>
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
          </button>
          <button className="relative group overflow-hidden rounded bg-stone-100 dark:bg-stone-light p-2 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors border-2 border-transparent hover:border-primary">
            <span className="material-symbols-outlined text-primary">mail</span>
          </button>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-stone-200 dark:border-stone-light pl-6">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-slate-900 dark:text-white text-sm font-bold font-pixel tracking-wider text-xl">
              {user?.user_metadata?.full_name || 'Admin'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-pixel uppercase">[ONLINE]</span>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded border-2 border-primary bg-stone-100 dark:bg-stone-light p-0.5 shadow-md dark:shadow-[0_0_10px_#0d59f2]">
            {user?.user_metadata?.avatar_url ? (
              <img 
                alt="Admin Avatar" 
                className="h-full w-full object-cover" 
                src={user.user_metadata.avatar_url}
                 referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-stone-200 dark:bg-stone-700">
                <span className="material-symbols-outlined text-slate-400">person</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;