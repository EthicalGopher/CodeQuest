import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

const CharacterCreation = ({ onClose, currentUser }) => {
  const [spriteSheets, setSpriteSheets] = useState([]);
  const [currentSprite, setCurrentSprite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user} = useAuth();
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0); // New state for current frame

  const FRAME_WIDTH = 64;
  const FRAME_HEIGHT = 64;
  const FRAMES_PER_ROW = 7; 

  const rotationFrames = [
    20,
    10,  
    0,  
    27   
  ];

  useEffect(() => {
const fetchSpriteSheets = async () => {
  try {
    setLoading(true);
    const folderPath = 'public'; // Change to '' if files are in the root

    // 1. List files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from('spritsheet')
      .list(folderPath);

    if (listError) throw listError;
    console.log('Files found:', files);

    // 2. Filter files
    const spriteFiles = files.filter(f => 
      f.name.startsWith('sprite-') && f.name.endsWith('.png')
    );

    if (spriteFiles.length === 0) {
      setError('No valid sprite sheets found.');
      return;
    }

    // 3. Generate URLs (Including the folder path prefix)
    const urls = spriteFiles.map(file => {
      const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name;
      const { data: { publicUrl } } = supabase.storage
        .from('spritsheet')
        .getPublicUrl(fullPath);
      return publicUrl;
    });

    setSpriteSheets(urls);
    setCurrentSprite(urls[Math.floor(Math.random() * urls.length)]);

  } catch (err) {
    console.error('Error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


    fetchSpriteSheets();
  }, []);

  const randomizeSprite = () => {
    if (spriteSheets.length > 0) {
      setCurrentSprite(spriteSheets[Math.floor(Math.random() * spriteSheets.length)]);
    }
  };

  const rotatePrevious = () => {
    setCurrentFrameIndex((prevIndex) => (prevIndex === 0 ? rotationFrames.length - 1 : prevIndex - 1));
  };

  const rotateNext = () => {
    setCurrentFrameIndex((prevIndex) => (prevIndex === rotationFrames.length - 1 ? 0 : prevIndex + 1));
  };

  const [isSaving, setIsSaving] = useState(false); // New state for saving status

  const handleSaveCharacter = async () => {
    if (!currentUser) {
      setError('You must be logged in to save a character.');
      return;
    }
    if (!currentSprite) {
      setError('No sprite sheet selected.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Data to be saved in the 'player' table
      const playerData = {
        id: user.id,
        email:user.email,
        username:user.user_metadata.full_name,
        sprite_sheet: currentSprite,
      };
      localStorage.setItem("sprite_sheet",currentSprite)

      const { error: upsertError } = await supabase
        .from('player')
        .upsert(playerData, { onConflict: 'id' }); // Update if exists, insert if new

      if (upsertError) {
        throw upsertError;
      }

      // Optionally, update user_metadata in Supabase Auth for JWT (if needed elsewhere)
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          sprite_sheet: currentSprite,
        },
      });

      if (updateAuthError) {
        // Log this, but don't necessarily stop the process if player table updated
        console.error('Error updating user metadata:', updateAuthError);
      }

      onClose(); // Close the UI after successful save

    } catch (err) {
      console.error('Error saving character:', err);
      setError(err.message || 'Failed to save character.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center font-pixel-body text-primary text-2xl">
        Loading Characters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center flex-col p-4 font-pixel-body text-red-500 text-center">
        <p className="text-xl mb-4">Error: {error}</p>
        <button onClick={onClose} className="bg-red-700 text-white py-2 px-4 hover:bg-red-800 transition-colors">Close</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-xl border border-primary-dark w-full max-w-lg font-pixel-body relative">
        <h2 className="text-primary text-3xl mb-6 text-center">Character Creation</h2>

        <div className="flex justify-center items-center mb-6">
          <button
            onClick={rotatePrevious}
            className="px-4 py-2 bg-zinc-700 text-white hover:bg-zinc-600 transition-colors duration-200 mr-4"
          >
            &lt;
          </button>
          {currentSprite ? (
            <div 
              className="w-32 h-32 flex items-center justify-center border border-primary-dark p-2" 
              style={{ overflow: 'hidden' }}
            >
              <div
                className="w-[64px] h-[64px]" // Explicitly set frame dimensions
                style={{
                  backgroundImage: `url(${currentSprite})`,
                  backgroundPosition: `-${(rotationFrames[currentFrameIndex] % FRAMES_PER_ROW) * FRAME_WIDTH}px -${Math.floor(rotationFrames[currentFrameIndex] / FRAMES_PER_ROW) * FRAME_HEIGHT}px`,
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated' // Optional: for crisp pixel art
                }}
              ></div>
            </div>
          ) : (
            <div className="w-32 h-32 bg-zinc-700 flex items-center justify-center text-zinc-500">No Sprite</div>
          )}
          <button
            onClick={rotateNext}
            className="px-4 py-2 bg-zinc-700 text-white hover:bg-zinc-600 transition-colors duration-200 ml-4"
          >
            &gt;
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={randomizeSprite}
            className="w-full bg-primary text-black font-bold py-3 px-4 rounded hover:bg-yellow-400 transition-colors duration-200"
          >
            Randomize Character
          </button>
          <button
            onClick={handleSaveCharacter}
            disabled={isSaving || !currentUser || !currentSprite}
            className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors duration-200 ${isSaving || !currentUser || !currentSprite ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {isSaving ? 'Saving...' : 'Save Character'}
          </button>
          <button
            onClick={onClose}
            className="w-full text-zinc-400 mt-2 text-sm hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
