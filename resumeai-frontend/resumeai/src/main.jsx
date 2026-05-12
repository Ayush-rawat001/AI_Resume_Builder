import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a33',
            color: '#e8e8f0',
            border: '1px solid #2a2a4a',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: '#22c76a', secondary: '#0a0a1a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0a1a' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
