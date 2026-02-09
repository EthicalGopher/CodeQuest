import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const Dashboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('player')
          .select('id, username, avatar_url, level')
          .order('level', { ascending: false })
          .limit(10);

        if (error) throw error;
        setPlayers(data || []);
      } catch (err) {
        console.error('Error fetching players:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight font-display mb-1">
            SYSTEM HEALTH <span className="text-primary text-xl align-top animate-pulse">●</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-pixel text-lg">Server Status: <span className="text-terminal-green">OPERATIONAL</span> | Uptime: 412h 32m</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white dark:bg-stone-light hover:bg-primary/20 hover:text-primary text-slate-700 dark:text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wider border border-black/10 dark:border-white/10 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">refresh</span> Refresh
          </button>
          <button className="flex items-center gap-2 bg-white dark:bg-stone-light hover:bg-accent/20 hover:text-accent text-slate-700 dark:text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wider border border-black/10 dark:border-white/10 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">warning</span> Purge Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="neon-border bg-white dark:bg-black/40 rounded-lg p-5 flex flex-col border-stone-200 dark:border-stone-light/50 shadow-sm transition-colors duration-300">
          <h3 className="text-slate-500 dark:text-slate-400 font-pixel text-lg uppercase mb-2">Total Players</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-white font-pixel">1.2M+</span>
            <span className="text-terminal-green text-xs mb-1">▲ 12%</span>
          </div>
        </div>
        <div className="neon-border bg-white dark:bg-black/40 rounded-lg p-5 flex flex-col border-stone-200 dark:border-stone-light/50 shadow-sm transition-colors duration-300">
          <h3 className="text-slate-500 dark:text-slate-400 font-pixel text-lg uppercase mb-2">Total Online</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-secondary font-pixel">42.5K</span>
            <span className="text-secondary text-xs mb-1 animate-pulse">LIVE</span>
          </div>
        </div>
        <div className="neon-border bg-white dark:bg-black/40 rounded-lg p-5 flex flex-col border-stone-200 dark:border-stone-light/50 shadow-sm transition-colors duration-300">
          <h3 className="text-slate-500 dark:text-slate-400 font-pixel text-lg uppercase mb-2">Total YouTubers</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-accent font-pixel">856</span>
            <span className="text-accent text-xs mb-1">PARTNERED</span>
          </div>
        </div>
        <div className="neon-border bg-white dark:bg-black/40 rounded-lg p-5 flex flex-col border-stone-200 dark:border-stone-light/50 shadow-sm transition-colors duration-300">
          <h3 className="text-slate-500 dark:text-slate-400 font-pixel text-lg uppercase mb-2">Total Quests</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-white font-pixel">15,402</span>
            <span className="text-slate-500 text-xs mb-1 uppercase">VERIFIED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hall of Legends */}
        <div className="xl:col-span-2 bg-white dark:bg-stone-dark border-4 border-stone-200 dark:border-stone-light rounded-xl p-1 shadow-xl relative overflow-hidden transition-colors duration-300">
          <div className="bg-stone-100 dark:bg-stone-light px-6 py-3 flex justify-between items-center border-b-4 border-black transition-colors duration-300">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">leaderboard</span>
              Hall of Legends
            </h2>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 border border-black"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-500 border border-black"></span>
              <span className="h-3 w-3 rounded-full bg-green-500 border border-black"></span>
            </div>
          </div>
          <div className="p-6 bg-slate-50/50 dark:bg-black/40 transition-colors duration-300">
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="text-center py-10 font-pixel text-slate-500">Loading legends...</div>
              ) : players.length > 0 ? (
                players.map((player, index) => (
                  <div key={player.id} className={`bg-white dark:bg-stone-light border-2 border-slate-200 dark:border-slate-700 p-4 rounded flex items-center gap-4 group transition-all duration-300 ${index === 0 ? 'hover:border-primary' : index === 1 ? 'hover:border-secondary' : 'hover:border-accent'}`}>
                    <div className={`${index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-accent'} font-pixel text-3xl w-10 text-center font-bold`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className={`relative h-14 w-14 rounded overflow-hidden border-2 bg-black shadow-sm ${index === 0 ? 'border-primary' : index === 1 ? 'border-secondary' : 'border-accent'}`}>
                      <img 
                        className="w-full h-full object-cover image-pixelated" 
                        alt={player.username || 'Legend'}
                        src={player.avatar_url || 'https://via.placeholder.com/150'}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{player.username || 'Unknown Player'}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded font-pixel ${index === 0 ? 'bg-primary/20 text-primary' : index === 1 ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'}`}>
                          LVL. {player.level || 1}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${index === 0 ? 'from-primary to-secondary' : index === 1 ? 'from-secondary to-terminal-green' : 'from-accent to-purple-500'}`}
                          style={{ width: `${Math.min(100, (player.level || 1) * 1.2)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 font-pixel">
                        <span>ID: {player.id.substring(0, 8)}...</span>
                        <span>Tier: {player.level > 80 ? 'Elder' : player.level > 50 ? 'Elite' : 'Novice'}</span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-3xl ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : 'text-amber-700'}`}>
                      emoji_events
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 font-pixel text-slate-500">No legends found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Creators */}
        <div className="xl:col-span-1 bg-white dark:bg-stone-dark border-4 border-stone-200 dark:border-stone-light rounded-xl p-1 shadow-xl relative overflow-hidden transition-colors duration-300">
          <div className="bg-stone-100 dark:bg-stone-light px-6 py-3 flex justify-between items-center border-b-4 border-black transition-colors duration-300">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-400">video_library</span>
              Top Creators
            </h2>
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
              <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
            </div>
          </div>
          <div className="p-6 bg-slate-50/50 dark:bg-black/40 flex flex-col gap-4 h-full transition-colors duration-300">
            <div className="group cursor-pointer">
              <div className="relative aspect-video bg-black rounded border border-slate-300 dark:border-slate-700 overflow-hidden mb-2 group-hover:border-purple-400 transition-colors">
                <img alt="Creator Content 1" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity image-pixelated" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtvoi4Rq6IuEhKfGsTFMU-mXtocqQHVGvF93YMLcvtO1XdQroX1T3OVjiDCSd25P9loDwHo6GxFF_zdILDCztHudt5xlmn5kfYQk0V7neuzjag2Qu0nkpFoyJsNYvqxznlaN3zU8hnE78ixsal0BYgaw_twJk7FQFTlLCDaMo8eLmRN9_48h1FiwdqC-_cM--rgSwZWRl2H9Cva5VANv5hf77tZAaoc8gDPBodvZUDfGqBd1bgTWB7QFI0C-zXp3FIzt5QvgdWOdnw"/>
                <div className="absolute bottom-2 right-2 bg-black/80 px-1 text-[10px] text-white font-pixel border border-white/20">10:42</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-4xl drop-shadow-lg">play_circle</span>
                </div>
              </div>
              <h4 className="text-slate-900 dark:text-white text-sm font-bold truncate group-hover:text-purple-400">Speedrun: Tutorial Island Any%</h4>
              <p className="text-slate-500 dark:text-slate-500 text-xs font-pixel">By: RetroMaster • 24K Views</p>
            </div>
            <div className="group cursor-pointer">
              <div className="relative aspect-video bg-black rounded border border-slate-300 dark:border-slate-700 overflow-hidden mb-2 group-hover:border-purple-400 transition-colors">
                <img alt="Creator Content 2" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity image-pixelated" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBej1fhs41WHHh6CjiBkaFGFKJ2j_3eicZD7sGnGiiGzPgEhPSS5lPKqUtpmHQQyJw-tZXY9sC0HP6xZSO2tYRBIjk6q8mYQRNbQrgy48e_ggkOAZMlBSBHBKGf6-ZlJm0ASmyZ_YCdliQf3Gh5M1VvxeBCwcAtYTuBRC35Z0viotLrjgVc48Or4tQOS1idIIBltErrtS-6wVT6BrWEXnQV1SyKPMhvXpdPf8OQz3nkcl37dnNnlYFjDGgKnHQlImqrGz2Sw6r4IOWU"/>
                <div className="absolute bottom-2 right-2 bg-black/80 px-1 text-[10px] text-white font-pixel border border-white/20">23:15</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-4xl drop-shadow-lg">play_circle</span>
                </div>
              </div>
              <h4 className="text-slate-900 dark:text-white text-sm font-bold truncate group-hover:text-purple-400">Advanced Sprite Animation Tips</h4>
              <p className="text-slate-500 dark:text-slate-500 text-xs font-pixel">By: PixelArtist99 • 12K Views</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-black/5 dark:border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-pixel uppercase tracking-widest transition-colors duration-300">
        <p>System V.2.0 | Connected via Secure Shell</p>
        <p className="flex items-center gap-2">
          Latency: <span className="text-terminal-green">12ms</span>
          <span className="block w-2 h-2 rounded-full bg-terminal-green animate-pulse"></span>
        </p>
      </div>
      <div className="h-10"></div>
    </>
  );
};

export default Dashboard;;
