import { createHead, UnheadProvider } from '@unhead/react/server'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'

const head = createHead()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UnheadProvider value={head}>
      <App />
    </UnheadProvider>
  </StrictMode>,
)
