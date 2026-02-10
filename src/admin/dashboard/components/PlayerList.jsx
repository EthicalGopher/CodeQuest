import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlayers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('player_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player' }, () => {
        fetchPlayers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      // Fetch players and admins in parallel
      const [playersRes, adminsRes] = await Promise.all([
        supabase.from('player').select('*').order('username', { ascending: true }),
        supabase.from('admins').select('id')
      ]);

      if (playersRes.error) throw playersRes.error;
      if (adminsRes.error) throw adminsRes.error;

      const adminIds = new Set(adminsRes.data.map(a => a.id));
      
      const mergedPlayers = playersRes.data.map(player => ({
        ...player,
        role: adminIds.has(player.id) ? 'admin' : 'user',
        status: player.ban ? 'banned' : (isOnline(player.updated_at) ? 'online' : 'offline')
      }));

      setPlayers(mergedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const isOnline = (updatedAt) => {
    if (!updatedAt) return false;
    const lastUpdate = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    return (now - lastUpdate) < 60000; // Online if updated in last 60 seconds
  };

  const filteredPlayers = players.filter(player => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'online' && player.status === 'online') ||
                         (filter === 'offline' && player.status === 'offline') ||
                         (filter === 'banned' && player.ban) ||
                         (filter === 'admin' && player.role === 'admin') ||
                         (filter === 'vip' && player.role === 'vip');
                         
    const matchesSearch = (player.username || '').toLowerCase().includes(search.toLowerCase()) || 
                          (player.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (player.id || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-terminal-green bg-terminal-green/10 border-terminal-green/20';
      case 'offline': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      case 'banned': return 'text-accent bg-accent/10 border-accent/20';
      case 'suspended': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-white';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'bg-primary text-white border-primary';
      case 'moderator': return 'bg-purple-600 text-white border-purple-500';
      case 'vip': return 'bg-amber-500 text-black border-amber-400';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const toggleBan = async (id, currentBanStatus) => {
    try {
        const { error } = await supabase
            .from('player')
            .update({ ban: !currentBanStatus })
            .eq('id', id);

        if (error) throw error;
        fetchPlayers(); // Refresh list
    } catch (error) {
        console.error('Error toggling ban:', error.message);
        alert('Failed to update ban status');
    }
  };

  if (loading && players.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-primary font-pixel text-2xl animate-pulse">Accessing Neural Database...</div>
        </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-[0.1em] font-pixel mb-2 uppercase">Global Registry</h1>
          <p className="text-slate-500 font-pixel text-lg uppercase tracking-widest">User Database Access | Total Records: {players.length}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                <input 
                    type="text" 
                    placeholder="SEARCH_DB..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-black/50 border-2 border-slate-700 pl-10 pr-4 py-3 text-white font-pixel text-lg focus:border-primary focus:outline-none focus:shadow-[0_0_15px_rgba(13,89,242,0.3)] w-full sm:w-64"
                />
            </div>
            <select 
              className="bg-stone-dark border-2 border-slate-700 text-white font-pixel p-3 uppercase focus:outline-none focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
                <option value="all">All Users</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="banned">Banned</option>
                <option value="admin">Admins</option>
                <option value="vip">VIPs</option>
            </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-stone-dark border-2 border-slate-700 p-4 rounded flex items-center justify-between">
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-2xl font-pixel text-white">{players.length}</p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">group</span>
        </div>
        <div className="bg-stone-dark border-2 border-slate-700 p-4 rounded flex items-center justify-between border-l-4 border-l-terminal-green">
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Online Now</p>
                <p className="text-2xl font-pixel text-terminal-green">{players.filter(p => p.status === 'online').length}</p>
            </div>
            <span className="material-symbols-outlined text-terminal-green text-3xl animate-pulse">wifi</span>
        </div>
        <div className="bg-stone-dark border-2 border-slate-700 p-4 rounded flex items-center justify-between border-l-4 border-l-amber-500">
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">VIP Members</p>
                <p className="text-2xl font-pixel text-amber-500">{players.filter(p => p.role === 'vip').length}</p>
            </div>
            <span className="material-symbols-outlined text-amber-500 text-3xl">diamond</span>
        </div>
        <div className="bg-stone-dark border-2 border-slate-700 p-4 rounded flex items-center justify-between border-l-4 border-l-accent">
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Banned</p>
                <p className="text-2xl font-pixel text-accent">{players.filter(p => p.ban).length}</p>
            </div>
            <span className="material-symbols-outlined text-accent text-3xl">block</span>
        </div>
      </div>

      <div className="bg-stone-dark border-2 border-stone-light rounded-lg overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black/40 text-slate-400 text-xs font-pixel uppercase tracking-widest border-b border-slate-700">
                        <th className="p-4 font-bold">Identity</th>
                        <th className="p-4 font-bold">Role & Level</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Connection</th>
                        <th className="p-4 font-bold">Last Active</th>
                        <th className="p-4 font-bold text-right">Protocol</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {filteredPlayers.map((player) => (
                        <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-10 w-10 rounded overflow-hidden bg-black border border-slate-600">
                                        <img 
                                            src={player.avatar_url  || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNqjin4qb-JAmKNR6MiUQyIKHchDAOWGISdkJS9X9DklO5eOG1q6Nae_Mt2QZdi88UWEYNNBAPNXSfltSjsHSykTkAA6xxT5D-N5TQTHYtNt_pAzN2sxbaNGAKz_OoRHMPUF547_oyLZzsUHED6JTnflB-cFu959MN0AmU0CsG9h-W224-VCnY3pgDU1qxhiYzZcA02DjJL42mervn7gSf0-4PyVJQBfWf6MKslCxTmAtxhfxLs0wwSgnX71MAWNvmxPDWHJ5tGqbW'} 
                                            alt={player.username} 
                                            referrerPolicy="no-referrer"

                                            className="w-full h-full object-cover image-pixelated" 
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white tracking-wide">{player.username || 'Anonymous'}</div>
                                        <div className="text-[10px] text-slate-500 font-pixel uppercase tracking-widest">{player.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadge(player.role)}`}>
                                        {player.role}
                                    </span>
                                    <div className="flex items-center gap-2 w-full max-w-[100px]">
                                        <span className="text-xs font-pixel text-slate-400">L.{player.level || 1}</span>
                                        <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-500" style={{ width: `${Math.min(player.level || 1, 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStatusColor(player.status)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${player.status === 'online' ? 'bg-terminal-green animate-pulse' : 'bg-current'}`}></span>
                                    {player.status}
                                </span>
                            </td>
                            <td className="p-4">
                                {player.server_id ? (
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                                        <span className="material-symbols-outlined text-sm">dns</span>
                                        {player.server_id}
                                    </div>
                                ) : (
                                    <span className="text-slate-600 text-xs font-bold uppercase tracking-wide">Disconnected</span>
                                )}
                            </td>
                            <td className="p-4 font-pixel text-slate-400 text-sm">
                                {player.updated_at ? new Date(player.updated_at).toLocaleTimeString() : 'Never'}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="p-2 hover:bg-primary/20 hover:text-primary rounded transition-colors"
                                        title="View Profile"
                                    >
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                    </button>
                                    <button 
                                        className="p-2 hover:bg-slate-700 hover:text-white rounded transition-colors"
                                        title="Message User"
                                    >
                                        <span className="material-symbols-outlined text-lg">mail</span>
                                    </button>
                                    <button 
                                        onClick={() => toggleBan(player.id, player.ban)}
                                        className={`p-2 rounded transition-colors ${player.ban ? 'text-green-500 hover:bg-green-500/20' : 'hover:bg-accent/20 hover:text-accent'}`}
                                        title={player.ban ? "Unban User" : "Ban User"}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {player.ban ? 'check_circle' : 'block'}
                                        </span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-black/20 flex justify-between items-center text-xs text-slate-500 font-pixel uppercase tracking-widest">
            <span>Showing {filteredPlayers.length} Records</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 hover:bg-slate-800 hover:text-white rounded disabled:opacity-50" disabled>Prev</button>
                <button className="px-3 py-1 bg-slate-800 text-white rounded">1</button>
                <button className="px-3 py-1 hover:bg-slate-800 hover:text-white rounded disabled:opacity-50" disabled>Next</button>
            </div>
        </div>
      </div>
      <div className="h-10"></div>
    </>
  );
};

export default PlayerList;
