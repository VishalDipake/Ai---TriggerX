import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              background: '#27500A',
              color: '#C0DD97',
              border: '1px solid #3B6D11',
              borderRadius: '8px',
            },
            success: { iconTheme: { primary: '#97C459', secondary: '#27500A' } },
            error: {
              style: { background: '#FCEBEB', color: '#791F1F', border: '1px solid #F09595' },
              iconTheme: { primary: '#E24B4A', secondary: '#FCEBEB' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
