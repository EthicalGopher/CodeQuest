import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './PhaserGame';
import SEO from './components/SEO';

function GameInterface() {
    const phaserRef = useRef();

    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [quest, setQuest] = useState('');
    const [showEditor, setShowEditor] = useState(false);

    const currentScene = (scene) => {
    if (!scene) return;

    switch (scene.scene.key) {
        case 'PlayScene':
            console.log('PlayScene is active');
            break;

        case 'Game':
            console.log('Gameplay scene is active');
            break;

        case 'GameOver':
            console.log('Game Over scene');
            break;
    }
    };

    const pauseGame = () => {
        const scene = phaserRef.current.scene;
        if (scene) scene.scene.pause();
    };

    const resumeGame = () => {
        const scene = phaserRef.current.scene;
        if (scene) scene.scene.resume();
    };

    const runCode = () => {
        const scene = phaserRef.current.scene;
        if (scene) {
            scene.solvePuzzle(true); 
        }
        setXp(prev => prev + 50);
        setShowEditor(false);
    };

    return (
        <>
            <SEO 
                title="Play Game"
                description="Enter the world of CodeQuest and begin your adventure. Solve puzzles, level up, and become the ultimate champion."
                keywords={['play game', 'online rpg', 'browser game', 'codequest gameplay']}
            />
            <div className="app ">
            <div className="hud flex gap-11 p-11 justify-center items-center fixed z-10">
                <p>Level: {level}</p>
                <p>XP: {xp}</p>
                <p>Quest: {quest}</p>

                <button onClick={() => setShowEditor(true)}>Open Code</button>
                <button onClick={pauseGame}>Pause</button>
                <button onClick={resumeGame}>Resume</button>
            </div>
            <div className=' flex justify-center items-center'>

            <PhaserGame
                ref={phaserRef}
                currentActiveScene={currentScene}
                />
            </div>

            {showEditor && (
                <div className="editor">
                    <textarea placeholder="Write your code here..." />
                    <button onClick={runCode}>Run Code</button>
                </div>
            )}
            </div>
        </>
    );
}

export default GameInterface;

