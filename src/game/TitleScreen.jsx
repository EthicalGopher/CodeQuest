import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signInWithPassword, signInWithGoogle, getCurrentUser, signOut, supabase } from '../supabaseClient';
import CharacterCreation from './CharacterCreation'; // New import
import useAuth from '../hooks/useAuth'; // New import
import ButtonBox from '../admin/dashboard/components/buttonbox';
import { PiTrophy } from "react-icons/pi";
import { BiSolidHelpCircle } from 'react-icons/bi';
import { IoSettings } from 'react-icons/io5';
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

  const [showServerJoin, setShowServerJoin] = useState(false);
  const [serverCode, setServerCode] = useState('');
  const [joinError, setJoinError] = useState('');

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

  const joinServer = async (server) => {
    try {
        if (server.current >= server.max) {
            throw new Error("Server is full!");
        }

        // 1. Update Player
        const { error: playerError } = await supabase
            .from('player')
            .update({ server_id: server.id })
            .eq('id', currentUser.id);

        if (playerError) throw playerError;

        // 2. Update Server (Fetch fresh, append, update)
        const { data: freshServer, error: fetchError } = await supabase
            .from('server')
            .select('players, current')
            .eq('id', server.id)
            .single();
        
        if (fetchError) throw fetchError;

        const updatedPlayers = [...(freshServer.players || []), currentUser.id];
        // Deduplicate
        const uniquePlayers = [...new Set(updatedPlayers)];

        const { error: serverError } = await supabase
            .from('server')
            .update({ 
                players: uniquePlayers,
                current: uniquePlayers.length
            })
            .eq('id', server.id);

        if (serverError) throw serverError;

        navigate('/game', { state: { userId: currentUser.id, userSpriteSheet: playerProfile?.sprite_sheet, selectedFrameIndex: currentUser.user_metadata?.selected_frame_index } });

    } catch (error) {
        console.error("Join Error", error);
        setJoinError(error.message);
        alert("Failed to join: " + error.message);
    }
  };

  const handleRandomJoin = async () => {
    if (!isGameStartable) return;
    
    try {
        // Fetch public, online servers
        const { data: servers, error } = await supabase
            .from('server')
            .select('*')
            .eq('types', 'public')
            .eq('server_stutus', 'online'); // Note: schema typo 'server_stutus'
        
        if (error) throw error;
        
        const availableServers = servers.filter(s => s.current < s.max);

        if (availableServers.length === 0) {
            alert("No public servers available with open slots! Try creating one or join by code.");
            return;
        }

        const randomServer = availableServers[Math.floor(Math.random() * availableServers.length)];
        await joinServer(randomServer);

    } catch (err) {
        console.error(err);
        alert("Failed to find a server.");
    }
  };

  const handleCodeJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!serverCode) return;

    try {
        const { data, error } = await supabase
            .from('server')
            .select('*')
            .eq('server_code', serverCode.trim())
            .single();
        
        if (error || !data) {
            setJoinError("Invalid Server Code");
            return;
        }

        if (data.server_stutus !== 'online') {
             setJoinError("Server is offline or in maintenance");
             return;
        }

        await joinServer(data);

    } catch (err) {
        setJoinError(err.message);
    }
  };

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

const MenuButton = ({ onClick, text, disabled = false, className = "" }) => (
  <button
    onClick={!disabled ? onClick : undefined}
    className={`
      group block p-0 border-none bg-transparent outline-none
      transition-all duration-200 w-full md:w-auto
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-95"}
    `}
  >
    <div 
      className="flex items-center justify-center"
    >
      <ButtonBox className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center font-bold text-white drop-shadow-[3px_3px_0px_#000] uppercase ${className}`}>
        {text}
      </ButtonBox>
    </div>
  </button>
);

    return (
        <div className="relative h-screen w-full overflow-hidden flex items-center font-pixel">
            {/* Background with video background */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="assets/bg.mp4" type="video/mp4" />
                </video>
            </div>



            <div className="relative z-30 w-full max-w-[1440px] mx-auto px-4 sm:px-10 md:px-20 lg:px-40 flex flex-col justify-center items-center h-full">
                <div className="absolute top-20 sm:top-16 md:top-20 px-4 w-full flex justify-center">
                    <img src='assets/header.png' className='w-full max-w-[300px] sm:max-w-md md:max-w-xl lg:max-w-2xl h-auto' />
                </div>

                <nav className="flex flex-col gap-2 items-center mt-20 sm:mt-32 md:mt-40 w-full md:max-w-none">
                    {isLoading ? (
                        <span className="text-2xl sm:text-3xl lg:text-4xl tracking-widest font-bold text-primary drop-shadow-[2px_2px_0px_#000]">LOADING...</span>
                    ) : currentUser ? (
                        <div className='flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto items-center'>
                                <div className="flex flex-col gap-2 w-full md:w-auto items-center">

                            <MenuButton
                                text="START"
                                onClick={handleRandomJoin}
                                disabled={!isGameStartable}
                                className=""
                                />

                            <MenuButton
                                text="CHARACTER"
                                onClick={() => setShowCharacterCreation(true)}
                                className=""
                                />
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto items-center">


                            <MenuButton
                                text="SERVER"
                                onClick={() => { setShowServerJoin(true); setJoinError(''); setServerCode(''); }}
                                className=""
                                />

                            <MenuButton
                                text="LOGOUT"
                                onClick={signOut}
                                className=""
                                />

                                </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 items-center w-full justify-center">
                            <MenuButton
                                text="LOGIN"
                                onClick={() => { setShowAuthForm(true); setIsLogin(true); setErrorMessage(''); }}
                                className=""
                            />

                            <MenuButton
                                text="SIGN UP"
                                onClick={() => { setShowAuthForm(true); setIsLogin(false); setErrorMessage(''); }}
                                className=""
                            />


                        </div>
                    )}
                </nav>

                <div className="absolute bottom-4 sm:bottom-0 left-0 right-0 hidden sm:flex items-center justify-center overflow-hidden">
                    <div className="relative w-full max-w-[1920px]">
                        <img src="assets/credit.png" className="w-full h-16 sm:h-20 md:h-24 lg:h-auto object-cover lg:object-contain" />
                        <div className="absolute inset-0 flex items-center justify-around px-2 sm:px-6 md:px-12 text-white font-pixel text-[10px] sm:text-base md:text-2xl lg:text-4xl tracking-widest uppercase">
                            <button className="transition-colors cursor-pointer uppercase flex items-center gap-1 sm:gap-2 md:gap-4">
                                <IoSettings className='text-gray-200 text-sm sm:text-xl md:text-3xl'/>
                                <span className="hidden sm:inline">Credits</span>
                            </button>
                            <button className="transition-colors cursor-pointer uppercase flex items-center gap-1 sm:gap-2 md:gap-4">
                                <PiTrophy className='text-yellow-200 text-sm sm:text-xl md:text-3xl'/>
                                <span className="hidden sm:inline">Achievements</span>
                            </button>
                            <button className="transition-colors cursor-pointer uppercase flex items-center gap-1 sm:gap-2 md:gap-4">
                                <BiSolidHelpCircle className='text-blue-200 text-sm sm:text-xl md:text-3xl'/>
                                <span className="hidden sm:inline">Help</span>
                            </button>
                        </div>
                    </div>
                </div>

                    
                    {showAuthForm && (
                        <div className="absolute inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-4">
                            <div className="bg-zinc-800 p-6 sm:p-8 rounded-lg shadow-xl border border-primary-dark w-full max-w-md font-pixel-body">
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

                    {showServerJoin && (
                        <div className="absolute inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-4">
                            <div className="bg-zinc-800 p-6 sm:p-8 rounded-lg shadow-xl border border-primary-dark w-full max-w-md font-pixel-body">
                                <h2 className="text-primary text-3xl mb-6 text-center">JOIN SERVER</h2>
                                {joinError && <p className="text-red-500 text-sm mb-4 text-center">{joinError}</p>}
                                <p className="text-zinc-400 text-sm mb-2 uppercase text-center tracking-widest">Enter Access Code</p>
                                <input
                                    type="text"
                                    placeholder="CODE..."
                                    value={serverCode}
                                    onChange={(e) => setServerCode(e.target.value)}
                                    className="w-full p-3 mb-6 bg-zinc-700 text-white border border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary uppercase text-center text-xl tracking-widest"
                                />
                                <button
                                    onClick={handleCodeJoin}
                                    className="w-full bg-primary text-black font-bold py-3 px-4 rounded hover:bg-yellow-400 transition-colors duration-200 uppercase tracking-widest"
                                >
                                    Connect
                                </button>
                                <button
                                    onClick={() => { setShowServerJoin(false); setJoinError(''); setServerCode(''); }}
                                    className="w-full text-zinc-400 mt-4 text-sm hover:underline"
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
        
      </div>
    </div>
  );
};

export default TitleScreen;
