import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './dashboard/components/Navbar';
import Sidebar from './dashboard/components/Sidebar';

const Layout = ({ currentView, onViewChange }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('admin-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  // Load Admin Fonts Dynamically
  useEffect(() => {
    const fonts = [
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=VT323&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    ];

    const links = fonts.map(href => {
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`${theme} min-h-screen w-full`}>
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-hidden relative selection:bg-primary selection:text-white transition-colors duration-300">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 opacity-10 dark:opacity-10 pointer-events-none" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)' }}></div>
        <div className="fixed inset-0 z-0 pointer-events-none opacity-5 dark:opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-background-light to-white dark:from-slate-900 dark:via-background-dark dark:to-black"></div>
        <div className="fixed inset-0 z-50 scanlines pointer-events-none opacity-[0.03] dark:opacity-10 h-full w-full"></div>

        <div className="relative z-10 flex h-screen w-full flex-col overflow-hidden">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar currentView={currentView} onViewChange={onViewChange} />
            <main className="flex-1 overflow-y-auto bg-transparent p-6 lg:p-10 relative">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
