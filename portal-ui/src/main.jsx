import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* BỌC ỨNG DỤNG BẰNG GOOGLE PROVIDER KÈM CLIENT ID CỦA BẠN */}
      <GoogleOAuthProvider clientId="424857046874-ag5tmbrp5b7951u7185d7b78ttkflvhj.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)