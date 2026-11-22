import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { TorneoProvider } from './context/TorneoContext.jsx' // NUEVO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TorneoProvider> {/* NUEVO */}
          <App />
        </TorneoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)