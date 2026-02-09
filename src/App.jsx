import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import TitleScreen from "./game/TitleScreen";
import GameInterface from "./GameInterface";
import AdminLayout from './admin/Layout';
import AdminDashboard from './admin/dashboard/Dashboard';
import CharacterEditor from './admin/dashboard/components/CharacterEditor';
import AdminProtection from './admin/AdminProtection';
import Unauthorized from './admin/Unauthorized';
import "./style.css"
const ModuleUnderConstuction = () => {
    return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <span className="material-symbols-outlined text-6xl mb-4">construction</span>
             <h2 className="text-2xl font-pixel uppercase">Module Under Construction</h2>
          </div>
        );
}
const AdminWrapper = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // Default view
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path === 'admin' || path === '') {
            setCurrentView('dashboard');
        } else {
            setCurrentView(path);
        }
    }, [location.pathname]);

    const onViewChange = (view) => {
        if (view === 'dashboard') {
            navigate('/admin');
        } else {
            navigate(`/admin/${view}`);
        }
    };

    return <AdminLayout currentView={currentView} onViewChange={onViewChange} />;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TitleScreen />} />
                <Route path="/game" element={<GameInterface />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route element={<AdminProtection />}>
                    <Route path="/admin" element={<AdminWrapper />}>
                        <Route index element={<AdminDashboard />} />

                        <Route path="home" element={<AdminDashboard />} />

                        <Route path="characters" element={<CharacterEditor />} />
                        <Route path="*" element={<ModuleUnderConstuction/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
