import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

const updateSW = registerSW({
  onNeedRefresh() { window.dispatchEvent(new CustomEvent('expiryguard:update-ready', { detail: updateSW })) },
  onOfflineReady() { window.dispatchEvent(new CustomEvent('expiryguard:offline-ready')) },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)
