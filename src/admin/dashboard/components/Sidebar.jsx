import React from 'react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'monitoring' },
  { id: 'logs', label: 'User Logs', icon: 'group' },
  { id: 'quests', label: 'Quest Editor', icon: 'history_edu' },
  { id: 'map', label: 'World Map', icon: 'public' },
  { id: 'items', label: 'Item DB', icon: 'token' },
  { id: 'characters', label: 'Character Editor', icon: 'brush' },
];

const Sidebar = ({ currentView, onViewChange = () => {} }) => {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between bg-white dark:bg-stone-dark border-r-4 border-stone-200 dark:border-stone-light overflow-y-auto hidden md:flex transition-colors duration-300">
      <div className="p-4 flex flex-col gap-6">
        <div className="bg-stone-100 dark:bg-stone-light/50 p-4 rounded border border-black/5 dark:border-white/5 relative overflow-hidden group select-none">
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Clearance Level</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-pixel text-slate-900 dark:text-white">LVL.99</span>
              <span className="h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary w-[99%]"></div>
              </span>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange && onViewChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-all group ${
                  isActive
                    ? 'bg-primary/20 border-l-4 border-primary text-primary dark:text-white font-bold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-primary dark:text-white' : 'group-hover:text-secondary'}`}>
                  {item.icon}
                </span>
                <span className={`font-medium tracking-wide text-sm uppercase`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-stone-200 dark:border-stone-light">
        <Link to="/" className="flex w-full items-center gap-3 px-4 py-3 rounded hover:bg-accent/10 border border-transparent hover:border-accent/50 text-slate-600 dark:text-slate-300 group transition-all">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-accent transition-colors">power_settings_new</span>
          <span className="font-medium tracking-wide text-sm uppercase group-hover:text-accent">Exit</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;