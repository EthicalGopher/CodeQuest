import './style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Head } from '@unhead/react';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Head />
        <App />
    </React.StrictMode>,
)
