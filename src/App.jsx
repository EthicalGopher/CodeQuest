import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TitleScreen from "./game/TitleScreen";
import GameInterface from "./GameInterface"; // Import GameInterface

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TitleScreen />} />
                <Route path="/game" element={<GameInterface />} />
            </Routes>
        </BrowserRouter>
    );
}