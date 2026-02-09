import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const CharacterEditor = () => {
  const [spriteSheets, setSpriteSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [animationType, setAnimationType] = useState('idle');
  const [directionIndex, setDirectionIndex] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Constants for sprite display
  const FRAME_WIDTH = 64;
  const FRAME_HEIGHT = 64;
  const FRAMES_PER_ROW = 14; // Assuming 7 based on previous code, but standard sheets might vary. PlayScene implies large indices (147), so 7 cols * ~22 rows?
  // Actually PlayScene uses large indices like 147. 147 / 13 cols?
  // Let's check standard LPC spritesheet width. usually 13 cols (832px) or similar.
  // The previous code had FRAMES_PER_ROW = 7. Let's stick to it if it worked for the preview, 
  // BUT `CharacterCreation.jsx` had `FRAMES_PER_ROW = 7`.
  // If `PlayScene` uses index 147, and `FRAMES_PER_ROW` is 7, row is 21. 
  // 147 / 7 = 21. 
  
  const DIRECTIONS = ['down', 'left', 'up', 'right'];
  
  const ANIMATIONS = {
    idle: {
      down: [337, 336],
      up: [308, 309],
      left: [322, 323],
      right: [350,351]
    },
    walk: {
      right: [128,129,130, 131, 132, 134],
      left: [157,158,159,160,161,162],
      up: [115,116,117,118,119,120],
      down: [143, 144, 145, 146, 147,148]
    }
  };

  // Auto-rotate direction
  useEffect(() => {
    const timer = setInterval(() => {
      setDirectionIndex((prev) => (prev + 1) % DIRECTIONS.length);
    }, 2000); // Change direction every 2 seconds
    return () => clearInterval(timer);
  }, []);

  // Animate frames
  useEffect(() => {
    const interval = animationType === 'walk' ? 100 : 200;
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [animationType]);

  const getCurrentFrame = () => {
    const direction = DIRECTIONS[directionIndex];
    const frames = ANIMATIONS[animationType][direction];
    return frames[currentFrameIndex % frames.length];
  };

  const frameToRender = getCurrentFrame();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    file: null
  });

  const fetchSpriteSheets = async () => {
    try {
      setLoading(true);
      const folderPath = 'public';

      const { data: files, error: listError } = await supabase.storage
        .from('spritsheet')
        .list(folderPath);
        if (listError) throw listError;
        console.log(files)

      const spriteFiles = files.filter(f => 
        f.name.endsWith('.png')
      );

      const sheets = spriteFiles.map(file => {
        const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name;
        const { data: { publicUrl } } = supabase.storage
          .from('spritsheet')
          .getPublicUrl(fullPath);
        return {
          id: file.id || file.name,
          name: file.name,
          url: publicUrl,
          path: fullPath
        };
      });

      setSpriteSheets(sheets);
    } catch (err) {
      console.error('Error fetching sprites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpriteSheets();
  }, []);

  const handleOpenCreate = () => {
    setEditingChar(null);
    setFormData({
      name: '',
      url: '',
      file: null
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (char) => {
    setEditingChar(char);
    setFormData({
      name: char.name,
      url: char.url,
      file: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (char) => {
    if (window.confirm(`Terminate ${char.name} unit?`)) {
      try {
        const { error } = await supabase.storage
          .from('spritsheet')
          .remove([char.path]);

        if (error) throw error;
        
        setSpriteSheets(prev => prev.filter(c => c.id !== char.id));
      } catch (err) {
        alert('Error deleting file: ' + err.message);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        file,
        name: formData.name || file.name
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalPath = editingChar ? editingChar.path : `public/${formData.name}`;
      
      if (formData.file) {
        // Upload new file or replace existing
        const { error: uploadError } = await supabase.storage
          .from('spritsheet')
          .upload(finalPath, formData.file, {
            upsert: true
          });

        if (uploadError) throw uploadError;
      }

      await fetchSpriteSheets();
      setIsModalOpen(false);
    } catch (err) {
      alert('Error saving character: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-pixel text-slate-500 uppercase tracking-widest">
        Loading Registry...
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white tracking-[0.1em] font-pixel mb-2 uppercase">Character Registry</h1>
          <p className="text-slate-500 dark:text-slate-500 font-pixel text-lg uppercase tracking-widest">Active Hero Database | Total Units: {spriteSheets.length}</p>
        </div>
        <div>
          <button 
            onClick={handleOpenCreate}
            className="pixel-button flex items-center gap-3 bg-secondary text-stone-dark px-8 py-3 font-pixel font-bold text-xl uppercase tracking-widest hover:brightness-110 whitespace-nowrap active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">menu_book</span>
            Upload New Sprite
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 xl:gap-8">
        {spriteSheets.map((char) => (
          <div key={char.id} className="pixel-card bg-white dark:bg-stone-dark w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(33.333%-2rem)] p-5 flex flex-col gap-5 border-2 border-slate-200 dark:border-white/5 transition-all hover:-translate-y-1 shadow-sm dark:shadow-none">
            <div className={`character-frame relative aspect-square overflow-hidden flex items-center justify-center p-2 bg-stone-100 dark:bg-black/20`}>
              <div
                className="w-[64px] h-[64px] scale-[2.5]"
                style={{
                  backgroundImage: `url(${char.url})`,
                  backgroundPosition: `-${(frameToRender % FRAMES_PER_ROW) * FRAME_WIDTH}px -${Math.floor(frameToRender / FRAMES_PER_ROW) * FRAME_HEIGHT}px`,
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated'
                }}
              ></div>
            </div>
            <div>
              <h3 className="text-2xl font-pixel text-slate-900 dark:text-white tracking-widest uppercase mb-1 truncate" title={char.name}>{char.name}</h3>
              <p className="text-xs font-pixel text-slate-500 uppercase truncate mb-2">{char.url}</p>
              
              {/* Animation Selector */}
              <div className="flex gap-2 mb-2">
                <button 
                  onClick={() => setAnimationType('idle')}
                  className={`px-2 py-1 text-[10px] font-pixel uppercase border ${animationType === 'idle' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-500 border-slate-300'}`}
                >
                  Idle
                </button>
                <button 
                  onClick={() => setAnimationType('walk')}
                  className={`px-2 py-1 text-[10px] font-pixel uppercase border ${animationType === 'walk' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-500 border-slate-300'}`}
                >
                  Walk
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleOpenEdit(char)}
                className="pixel-button flex items-center justify-center gap-2 bg-primary text-white py-2.5 text-base font-pixel font-bold uppercase hover:bg-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">build</span>
                Edit
              </button>
              <button 
                onClick={() => handleDelete(char)}
                className="pixel-button flex items-center justify-center gap-2 bg-accent text-white py-2.5 text-base font-pixel font-bold uppercase hover:bg-red-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">skull</span>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-stone-dark border-4 border-stone-200 dark:border-stone-light w-full max-w-lg shadow-2xl animate-glitch overflow-hidden transition-colors duration-300">
            <div className="bg-stone-100 dark:bg-stone-light px-6 py-4 flex justify-between items-center border-b-4 border-black transition-colors duration-300">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-3 font-pixel">
                    <span className="material-symbols-outlined text-secondary">terminal</span>
                    {editingChar ? 'Edit Sprite Protocol' : 'Initialize New Sprite'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-accent">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 relative">
                <div className="space-y-1">
                    <label className="text-xs uppercase font-pixel tracking-widest text-slate-500 dark:text-slate-400">File Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name || ''} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-stone-50 dark:bg-black/50 border-2 border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white font-pixel text-lg focus:border-primary focus:outline-none"
                        placeholder="sprite-name.png"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs uppercase font-pixel tracking-widest text-slate-500 dark:text-slate-400">Sprite Sheet URL</label>
                    <input 
                        type="text" 
                        readOnly
                        value={formData.url || ''} 
                        className="w-full bg-stone-100 dark:bg-black/30 border-2 border-slate-200 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400 font-pixel text-sm focus:outline-none"
                        placeholder="Auto-generated on upload"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs uppercase font-pixel tracking-widest text-slate-500 dark:text-slate-400">Upload File (.png)</label>
                    <input 
                        type="file" 
                        accept=".png"
                        onChange={handleFileChange}
                        className="w-full bg-stone-50 dark:bg-black/50 border-2 border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white font-pixel text-sm focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border-2 border-slate-300 dark:border-slate-600 py-3 text-slate-500 dark:text-slate-400 font-pixel font-bold uppercase hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors">
                        Abort
                    </button>
                    <button 
                      type="submit" 
                      disabled={uploading}
                      className="flex-1 bg-primary text-white py-3 font-pixel font-bold uppercase border-2 border-transparent hover:border-white shadow-[0_0_15px_rgba(13,89,242,0.4)] transition-all disabled:opacity-50"
                    >
                        {uploading ? 'Processing...' : (editingChar ? 'Update Sequence' : 'Initialize')}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CharacterEditor;