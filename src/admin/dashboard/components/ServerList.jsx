import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const ServerList= () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Deploy Modal State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployFormData, setDeployFormData] = useState({
    name: '',
    maxPlayers: 100,
    type: 'public',
    map: 'Cyber-Slums'
  });

  // Manage Modal State
  const [managingServer, setManagingServer] = useState(null);
  const [activePlayers, setActivePlayers] = useState([]);

  useEffect(() => {
    fetchServers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('server_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'server' }, () => {
        fetchServers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('server')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServers(data || []);
    } catch (error) {
      console.error('Error fetching servers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredServers = filter === 'all' 
    ? servers 
    : servers.filter(s => s.types === filter || s.server_stutus === filter);

  const getLoadStatus = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return { text: 'CRITICAL LOAD', color: 'text-accent' };
    if (percentage >= 70) return { text: 'NEAR CAPACITY', color: 'text-orange-500' };
    if (percentage >= 30) return { text: 'MODERATE', color: 'text-yellow-500' };
    return { text: 'STABLE', color: 'text-terminal-green' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-terminal-green';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-accent';
      default: return 'bg-slate-500';
    }
  };

  const handleOpenDeployModal = () => {
    setDeployFormData({
        name: '',
        maxPlayers: 100,
        type: 'public',
        map: 'Cyber-Slums'
    });
    setIsDeployModalOpen(true);
  };

  const handleDeploySubmit = async (e) => {
    e.preventDefault();
    try {
      const newServer = {
        server_name: deployFormData.name || 'Unnamed Server',
        current: 0,
        max: deployFormData.maxPlayers || 100,
        types: deployFormData.type || 'public',
        server_stutus: 'online',
        server_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        players: []
      };

      const { error } = await supabase
        .from('server')
        .insert([newServer]);

      if (error) throw error;
      
      setIsDeployModalOpen(false);
      fetchServers();
    } catch (error) {
      console.error('Error deploying server:', error.message);
      alert('Failed to deploy server: ' + error.message);
    }
  };

  const handleManageServer = async (server) => {
    setManagingServer(server);
    setActivePlayers([]); // Clear previous state

    if (server.players && server.players.length > 0) {
        try {
            const { data, error } = await supabase
                .from('player')
                .select('*')
                .in('id', server.players);
            
            if (error) throw error;
            setActivePlayers(data || []);
        } catch (error) {
            console.error('Error fetching server players:', error);
        }
    }
  };

  const handleKickPlayer = async (playerId) => {
    if (!managingServer) return;

    try {
        const updatedPlayers = (managingServer.players || []).filter(id => id !== playerId);
        const { error } = await supabase
            .from('server')
            .update({ 
                players: updatedPlayers,
                current: updatedPlayers.length
            })
            .eq('id', managingServer.id);

        if (error) throw error;

        // Update local state
        setManagingServer(prev => ({
            ...prev,
            players: updatedPlayers,
            current: updatedPlayers.length
        }));
        setActivePlayers(prev => prev.filter(p => p.id !== playerId));
        fetchServers(); // Refresh main list
    } catch (error) {
        console.error('Error kicking player:', error);
        alert('Failed to kick player');
    }
  };

  const handleDeleteServer = async (serverId) => {
    if (!window.confirm('Are you sure you want to delete this server?')) return;
    
    try {
        const { error } = await supabase
            .from('server')
            .delete()
            .eq('id', serverId);
        
        if (error) throw error;
        fetchServers();
    } catch (error) {
        console.error('Error deleting server:', error);
        alert('Failed to delete server');
    }
  };

  if (loading && servers.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-primary font-pixel text-2xl animate-pulse">Uplinking to Neural Network...</div>
        </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-[0.1em] font-pixel mb-2 uppercase">Server Uplink</h1>
          <p className="text-slate-500 font-pixel text-lg uppercase tracking-widest">Global Instance Manager | Total Active: {servers.filter(s => s.server_stutus === 'online').length}</p>
        </div>
        <div className="flex gap-4">
            <select 
              className="bg-stone-dark border-2 border-slate-700 text-white font-pixel p-3 uppercase focus:outline-none focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
                <option value="all">All Servers</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="online">Online</option>
                <option value="maintenance">Maintenance</option>
            </select>
            <button 
                onClick={handleOpenDeployModal}
                className="pixel-button flex items-center gap-3 bg-secondary text-stone-dark px-6 py-3 font-pixel font-bold text-xl uppercase tracking-widest hover:brightness-110 whitespace-nowrap active:scale-95 transition-transform"
            >
                <span className="material-symbols-outlined">add_to_queue</span>
                Deploy Server
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServers.map((server) => {
          const load = getLoadStatus(server.current, server.max);
          const loadPercentage = Math.round((server.current / server.max) * 100);
          const totalSegments = 24;
          const activeSegments = Math.ceil((server.current / server.max) * totalSegments);
          
          return (
            <div key={server.id} className="relative bg-[#0F1219] border border-slate-700 p-6 rounded shadow-lg flex flex-col gap-6 group hover:border-primary/50 transition-all duration-300">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                
                {/* Header */}
                <div className="flex justify-between items-start z-10">
                    <div className="flex gap-4">
                        {/* Icon Box */}
                        <div className="w-16 h-16 bg-black border border-slate-800 rounded flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/20"></div>
                             {/* Using map initial or icon as placeholder for server image */}
                            <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-primary transition-colors">dns</span>
                        </div>
                        
                        {/* Title & Status */}
                        <div>
                            <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider leading-none mb-2">{server.server_name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 ${getStatusColor(server.server_stutus)} rounded-[1px]`}></span>
                                <span className={`text-sm font-bold uppercase tracking-wider ${server.server_stutus === 'online' ? 'text-terminal-green' : server.server_stutus === 'maintenance' ? 'text-yellow-500' : 'text-accent'}`}>
                                    {server.server_stutus}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Region/Type Badge */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-slate-600 font-pixel uppercase tracking-widest bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                            Code: {server.server_code}
                        </span>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="flex flex-col gap-3 z-10">
                    <div className="flex justify-between items-end text-slate-400 font-bold uppercase tracking-wider text-xs">
                        <span>Player Count</span>
                        <span className="text-white text-lg font-pixel tracking-widest">{server.current} <span className="text-slate-600 text-sm">/</span> {server.max}</span>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="h-4 w-full bg-[#050608] border border-white/5 flex gap-[2px] p-[2px] rounded-[2px]">
                        {[...Array(totalSegments)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`flex-1 h-full rounded-[1px] transition-all duration-500 ${
                                    i < activeSegments 
                                        ? 'bg-primary shadow-[0_0_5px_rgba(13,89,242,0.5)]' 
                                        : 'bg-slate-800/20'
                                }`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Load: {loadPercentage}%</span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${load.color}`}>{load.text}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-2 z-10">
                    <button className="col-span-1 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-2 rounded shadow-[0_4px_0_rgb(10,50,140)] active:shadow-none active:translate-y-[4px] uppercase tracking-wider text-xs font-display transition-all flex items-center justify-center gap-2 group/btn">
                        Enter
                    </button>
                    <button 
                        onClick={() => handleManageServer(server)}
                        className="col-span-1 bg-[#1f232d] hover:bg-[#2a2f3d] text-slate-300 font-bold py-3 px-2 rounded shadow-[0_4px_0_rgb(15,18,25)] active:shadow-none active:translate-y-[4px] uppercase tracking-wider text-xs font-display transition-all border border-slate-700"
                    >
                        Manage
                    </button>
                     <button 
                        onClick={() => handleDeleteServer(server.id)}
                        className="col-span-1 bg-red-900/50 hover:bg-red-800/80 text-red-200 font-bold py-3 px-2 rounded shadow-[0_4px_0_rgb(60,10,10)] active:shadow-none active:translate-y-[4px] uppercase tracking-wider text-xs font-display transition-all border border-red-900/50 flex items-center justify-center"
                    >
                        Delete
                    </button>
                </div>
            </div>
          );
        })}

        {/* Add New Server Card */}
        <div 
            onClick={handleOpenDeployModal}
            className="relative bg-[#0F1219]/50 border-2 border-dashed border-slate-700 p-6 rounded flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all min-h-[320px]"
        >
             <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-700 group-hover:border-secondary">
                <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-secondary">add</span>
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-slate-400 font-display uppercase tracking-wider group-hover:text-white mb-1">Deploy New Node</h3>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">Available Capacity: {4 - servers.length} Slots</p>
            </div>
        </div>
      </div>
      
      <div className="mt-16 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-pixel uppercase tracking-[0.2em]">
        <p>Network Status: STABLE | Packet Loss: 0.001%</p>
        <p className="flex items-center gap-3">
          Bandwidth: <span className="text-terminal-green font-bold">4.2 TB/s</span>
          <span className="material-symbols-outlined text-sm animate-pulse text-terminal-green">network_check</span>
        </p>
      </div>
      <div className="h-10"></div>

      {/* Deploy Server Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeployModalOpen(false)}></div>
          <div className="relative bg-stone-dark border-4 border-stone-light w-full max-w-lg shadow-2xl animate-glitch overflow-hidden">
             {/* Modal Header */}
            <div className="bg-stone-light px-6 py-4 flex justify-between items-center border-b-4 border-black">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-3 font-pixel">
                    <span className="material-symbols-outlined text-secondary">dns</span>
                    Deploy New Node
                </h2>
                <button onClick={() => setIsDeployModalOpen(false)} className="text-slate-400 hover:text-accent">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form onSubmit={handleDeploySubmit} className="p-6 flex flex-col gap-4 relative">
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-repeat" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}></div>
                
                <div className="space-y-1">
                    <label className="text-xs uppercase font-pixel tracking-widest text-slate-400">Server Identity (Name)</label>
                    <input 
                        required
                        type="text" 
                        value={deployFormData.name || ''} 
                        onChange={e => setDeployFormData({...deployFormData, name: e.target.value})}
                        className="w-full bg-black/50 border-2 border-slate-700 p-2 text-white font-pixel text-lg focus:border-primary focus:outline-none focus:shadow-[0_0_10px_#0d59f2] transition-all"
                        placeholder="SERVER_NAME..."
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs uppercase font-pixel tracking-widest text-slate-400">Access Protocol</label>
                        <select 
                        value={deployFormData.type || 'public'}
                        onChange={e => setDeployFormData({...deployFormData, type: e.target.value })}
                        className="w-full bg-black/50 border-2 border-slate-700 p-2 text-white font-pixel text-lg focus:border-primary focus:outline-none"
                    >
                        <option value="public">PUBLIC</option>
                        <option value="private">PRIVATE</option>
                    </select>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs uppercase font-pixel tracking-widest text-slate-400">Max Connections</label>
                        <input 
                            type="number" 
                            value={deployFormData.maxPlayers || 100}
                            onChange={e => setDeployFormData({...deployFormData, maxPlayers: parseInt(e.target.value)})}
                            className="w-full bg-black/50 border-2 border-slate-700 p-2 text-white font-pixel text-lg focus:border-primary focus:outline-none"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs uppercase font-pixel tracking-widest text-slate-400">Map Asset</label>
                        <input 
                            type="text" 
                            value={deployFormData.map || ''} 
                            onChange={e => setDeployFormData({...deployFormData, map: e.target.value})}
                            className="w-full bg-black/50 border-2 border-slate-700 p-2 text-white font-pixel text-lg focus:border-primary focus:outline-none"
                            placeholder="Map Name..."
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setIsDeployModalOpen(false)} className="flex-1 border-2 border-slate-600 py-3 text-slate-400 font-pixel font-bold uppercase hover:bg-slate-800 transition-colors">
                        Abort
                    </button>
                    <button type="submit" className="flex-1 bg-primary text-white py-3 font-pixel font-bold uppercase border-2 border-transparent hover:border-white shadow-[0_0_15px_rgba(13,89,242,0.4)] transition-all">
                        Initialize
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Server Modal */}
      {managingServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setManagingServer(null)}></div>
          <div className="relative bg-[#0F1219] border-2 border-slate-700 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#161a23]">
                <div>
                    <h2 className="text-2xl font-bold text-white font-display uppercase tracking-wider mb-1">
                        Manage: {managingServer.server_name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs uppercase font-bold tracking-widest">
                        <span className="text-primary">{managingServer.current} Active Sessions</span>
                    </div>
                </div>
                <button 
                    onClick={() => setManagingServer(null)}
                    className="h-10 w-10 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Modal Content - Player List */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#0F1219]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Player Manifest</h3>
                    <div className="flex gap-2">
                        <button className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded uppercase hover:bg-slate-700 transition-colors">
                            Broadcast Message
                        </button>
                        <button className="text-xs font-bold text-white bg-accent hover:bg-red-600 px-3 py-1.5 rounded uppercase transition-colors">
                            Restart Node
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {activePlayers.length === 0 ? (
                         <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded bg-slate-900/50">
                            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">person_off</span>
                            <p className="text-slate-500 font-pixel uppercase">No Active Players Detected</p>
                         </div>
                    ) : (
                        activePlayers.map((player) => (
                            <div key={player.id} className="flex items-center justify-between bg-[#161a23] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-10 w-10 rounded overflow-hidden border border-slate-600 bg-black">
                                        <img 
                                            src={player.avatar_url  || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNqjin4qb-JAmKNR6MiUQyIKHchDAOWGISdkJS9X9DklO5eOG1q6Nae_Mt2QZdi88UWEYNNBAPNXSfltSjsHSykTkAA6xxT5D-N5TQTHYtNt_pAzN2sxbaNGAKz_OoRHMPUF547_oyLZzsUHED6JTnflB-cFu959MN0AmU0CsG9h-W224-VCnY3pgDU1qxhiYzZcA02DjJL42mervn7gSf0-4PyVJQBfWf6MKslCxTmAtxhfxLs0wwSgnX71MAWNvmxPDWHJ5tGqbW'} 
                                            alt={player.username || 'Player'}
                                            referrerPolicy="no-referrer"

                                            className="w-full h-full object-cover image-pixelated" 
                                        />
                                        {(player.role === 'ADMIN' || player.role === 'admin') && (
                                            <div className="absolute inset-0 border-2 border-primary pointer-events-none"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold font-pixel tracking-wide text-lg ${(player.role === 'ADMIN' || player.role === 'admin') ? 'text-primary' : 'text-white'}`}>
                                                {player.username || 'Unknown Player'}
                                            </span>
                                            {(player.role === 'ADMIN' || player.role === 'admin') && (
                                                <span className="text-[10px] bg-primary/20 text-primary px-1 rounded font-bold">OP</span>
                                            )}
                                        </div>
                                        <div className="flex gap-3 text-xs text-slate-500 font-bold uppercase">
                                            <span>LVL {player.level || 1}</span>
                                            <span className="text-slate-700">|</span>
                                            <span className={(player.ping || 0) > 100 ? 'text-accent' : 'text-terminal-green'}>{player.ping || 0}ms</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                        title="Direct Message"
                                    >
                                        <span className="material-symbols-outlined text-lg">chat</span>
                                    </button>
                                    <button 
                                        onClick={() => handleKickPlayer(player.id)}
                                        className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                        title="Kick Player"
                                    >
                                        <span className="material-symbols-outlined text-lg">block</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#161a23] border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-600 uppercase font-pixel tracking-widest">
                    Authorized Personnel Only • Actions are Logged
                </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServerList;