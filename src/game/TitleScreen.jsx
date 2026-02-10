import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signInWithPassword, signInWithGoogle, getCurrentUser, signOut, supabase } from '../supabaseClient';
import CharacterCreation from './CharacterCreation'; // New import
import useAuth from '../hooks/useAuth'; // New import

const TitleScreen= () => {
  const navigate = useNavigate();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCharacterCreation, setShowCharacterCreation] = useState(false); // New state

  const { user: currentUser, loading: isLoading, error: authError } = useAuth();
  const [isGameStartable, setIsGameStartable] = useState(false);
  const [playerProfile, setPlayerProfile] = useState(null);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      if (currentUser) {
        const { data, error } = await supabase
          .from('player') // Corrected table name to 'player'
          .select('sprite_sheet')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching player profile:', error);
          setPlayerProfile(null);
          setIsGameStartable(false);
        } else if (data) {
          setPlayerProfile(data);
          // Check if sprite_sheet exists and is not an empty string
          setIsGameStartable(!!data.sprite_sheet && data.sprite_sheet !== '');
        } else {
          setPlayerProfile(null);
          setIsGameStartable(false);
        }
      } else {
        setPlayerProfile(null);
        setIsGameStartable(false);
      }
      (!localStorage.getItem("sprite_sheet"))&&setIsGameStartable(false)
    };

    fetchPlayerProfile();
  }, [currentUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

            try {
                if (isLogin) {
                    await signInWithPassword(email, password);
                    console.log('User logged in successfully.');
                } else {
                    await signUp(email, password);
                    console.log('User signed up successfully.');
                }
    
                // Verify JWT in localStorage
                const user = await getCurrentUser();
                if (user) {
                    console.log('User session active:', user);
                    console.log('localStorage after auth:', localStorage);
                } else {
                    setErrorMessage('Authentication successful, but no active session found. Please try logging in again.');
                }
                
                // Reset form and hide
                setEmail('');
                setPassword('');
                setShowAuthForm(false);
    
            } catch (error) {
                console.error('Authentication error:', error);
                setErrorMessage(error.message || 'An unexpected error occurred during authentication.');
            }
        };
    
        return (
            <div className="relative h-screen w-full overflow-hidden flex items-center bg-[#0d0d14] font-pixel">
                {/* Background with scanlines and atmospheric moon */}
                <div className="absolute inset-0 z-0">
                   
                    <div className="absolute inset-0 bg-cover bg-bottom " style={{ backgroundImage: "url('assets/0YOvI2IM_o.jpeg')" }}></div>
                </div>
    
                
    
                <div className="relative z-30 w-full max-w-[1440px] mx-auto px-20 lg:px-40 flex flex-col justify-center h-full">
                    <div className="mb-16">
                        <h2 className="text-primary tracking-[0.2em] text-lg font-pixel-body mb-4 opacity-70 uppercase">A PIXELATED SOULSLIKE ENGINE</h2>
                        <h1 className="text-6xl lg:text-8xl font-pixel-heading tracking-tighter text-white drop-shadow-[4px_4px_0px_#000]">
                            CODE<span className="text-primary">QUEST</span>
                        </h1>
                    </div>
    
                    <nav className="flex flex-col gap-6 items-start">
                        {isLoading ? (
                            <span className="text-3xl lg:text-4xl tracking-widest font-bold text-primary drop-shadow-[2px_2px_0px_#000]">LOADING...</span>
                        ) : currentUser ? (
                            <>
                                <div
                                    onClick={isGameStartable ? () => navigate('/game', { state: { userId: currentUser.id, userSpriteSheet: playerProfile?.sprite_sheet, selectedFrameIndex: currentUser.user_metadata?.selected_frame_index } }) : undefined}
                                    className={`group flex items-center gap-6 transform transition-all duration-200 ${isGameStartable ? 'cursor-pointer hover:translate-x-4' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <div className="relative w-3 h-5 bg-primary shadow-[0_0_15px_#f2cc0d] animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 40%, 80% 100%, 20% 100%, 0% 40%)' }}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-3xl lg:text-4xl tracking-widest font-bold text-primary drop-shadow-[2px_2px_0px_#000]">START GAME</span>
                                        <div className="h-[2px] w-full bg-primary mt-1"></div>
                                    </div>
                                </div>
    
                                <div 
                                    onClick={() => setShowCharacterCreation(true)}
                                    className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-60 hover:opacity-100"
                                >
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-zinc-700 group-hover:bg-primary transition-all"></div></div>
                                    <span className="text-3xl lg:text-4xl tracking-widest text-zinc-400 group-hover:text-primary drop-shadow-[2px_2px_0px_#000]">CHARACTER</span>
                                </div>
                                
                                <div className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-60 hover:opacity-100">
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-zinc-700 group-hover:bg-primary transition-all"></div></div>
                                    <span className="text-3xl lg:text-4xl tracking-widest text-zinc-400 group-hover:text-primary drop-shadow-[2px_2px_0px_#000]">SETTINGS</span>
                                </div>
    
                                <div 
                                    onClick={signOut}
                                    className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-60 hover:opacity-100"
                                >
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-red-900 group-hover:bg-red-500 transition-all"></div></div>
                                    <span className="text-3xl lg:text-4xl tracking-widest text-zinc-400 group-hover:text-red-500 drop-shadow-[2px_2px_0px_#000]">LOGOUT</span>
                                </div>
    
                                <div 
                                    onClick={() => window.close()}
                                    className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-40 hover:opacity-100 mt-4"
                                >
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-red-900 group-hover:bg-red-500 transition-all"></div></div>
                                    <span className="text-2xl lg:text-3xl tracking-widest text-zinc-500 group-hover:text-red-500 drop-shadow-[2px_2px_0px_#000]">QUIT TO DESKTOP</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    onClick={() => { setShowAuthForm(true); setIsLogin(true); setErrorMessage(''); }}
                                    className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <div className="relative w-3 h-5 bg-primary shadow-[0_0_15px_#f2cc0d] animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 40%, 80% 100%, 20% 100%, 0% 40%)' }}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-3xl lg:text-4xl tracking-widest font-bold text-primary drop-shadow-[2px_2px_0px_#000]">LOGIN</span>
                                        <div className="h-[2px] w-full bg-primary mt-1"></div>
                                    </div>
                                </div>
    
                                <div
                                    onClick={() => { setShowAuthForm(true); setIsLogin(false); setErrorMessage(''); }}
                                    className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-60 hover:opacity-100"
                                >
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-zinc-700 group-hover:bg-primary transition-all"></div></div>
                                    <span className="text-3xl lg:text-4xl tracking-widest text-zinc-400 group-hover:text-primary drop-shadow-[2px_2px_0px_#000]">SIGN UP</span>
                                </div>
                                
                                <div className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-60 hover:opacity-100">
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-zinc-700 group-hover:bg-primary transition-all"></div></div>
                                    <span className="text-3xl lg:text-4xl tracking-widest text-zinc-400 group-hover:text-primary drop-shadow-[2px_2px_0px_#000]">SETTINGS</span>
                                </div>
    
                                <div 
                                    onClick={() => window.close()}
                                    className="group flex items-center gap-6 cursor-pointer transform hover:translate-x-4 transition-all duration-200 opacity-40 hover:opacity-100 mt-4"
                                >
                                    <div className="w-6 flex items-center justify-center"><div className="w-2 h-2 bg-red-900 group-hover:bg-red-500 transition-all"></div></div>
                                    <span className="text-2xl lg:text-3xl tracking-widest text-zinc-500 group-hover:text-red-500 drop-shadow-[2px_2px_0px_#000]">QUIT TO DESKTOP</span>
                                </div>
                            </>
                        )}
                    </nav>
                    
                    {showAuthForm && (
                        <div className="absolute inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center">
                            <div className="bg-zinc-800 p-8 rounded-lg shadow-xl border border-primary-dark w-96 font-pixel-body">
                                <h2 className="text-primary text-3xl mb-6 text-center">{isLogin ? 'LOGIN' : 'SIGN UP'}</h2>
                                {errorMessage && <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>}
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 mb-4 bg-zinc-700 text-white border border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 mb-6 bg-zinc-700 text-white border border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    onClick={handleAuthSubmit}
                                    className="w-full bg-primary text-black font-bold py-3 px-4 rounded hover:bg-yellow-400 transition-colors duration-200"
                                >
                                    {isLogin ? 'LOGIN' : 'SIGN UP'}
                                </button>
    
                                <div className="flex items-center my-6">
                                    <div className="flex-grow border-t border-zinc-700"></div>
                                    <span className="flex-shrink mx-4 text-zinc-500 text-sm">OR</span>
                                    <div className="flex-grow border-t border-zinc-700"></div>
                                </div>
    
                                <button
                                    onClick={signInWithGoogle}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="h-5" />
                                    Sign in with Google
                                </button>
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="w-full text-primary mt-4 text-sm hover:underline"
                                >
                                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                                </button>
                                <button
                                    onClick={() => { setShowAuthForm(false); setErrorMessage(''); setEmail(''); setPassword(''); }}
                                    className="w-full text-zinc-400 mt-6 text-sm hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

        {showCharacterCreation && (
            <CharacterCreation onClose={() => setShowCharacterCreation(false)} currentUser={currentUser} />
        )}

        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>
        
        <div className="absolute bottom-12 left-20 lg:left-40 right-20 lg:right-40 flex justify-between items-center text-xs tracking-widest font-pixel-body text-zinc-500 uppercase">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span>BUILD_2024.0.1_16BIT</span>
            </div>
            <div>© 2024 PIXEL SOULS ARCHIVE</div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800">
              <span className="text-white">W/S</span>
              <span className="text-[8px] opacity-60">NAVIGATE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800">
              <span className="text-white">ENTER</span>
              <span className="text-[8px] opacity-60">EXECUTE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
