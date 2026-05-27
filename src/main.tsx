import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and swallow benign Vite HMR/WebSocket connection errors expected in sandboxed preview environments
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason) {
    const errorMsg = typeof reason === 'string' ? reason : String(reason.message || '');
    if (
      errorMsg.includes('WebSocket') || 
      errorMsg.includes('websocket') || 
      errorMsg.includes('failed to connect') ||
      errorMsg.includes('WebSocket closed without opened')
    ) {
      event.preventDefault();
      console.info('[Vite WS Alert Swallowed]:', errorMsg);
    }
  }
});

window.addEventListener('error', (event) => {
  const msg = String(event.message || '');
  if (
    msg.includes('WebSocket') || 
    msg.includes('websocket') || 
    msg.includes('failed to connect') ||
    msg.includes('WebSocket closed without opened')
  ) {
    event.preventDefault();
    console.info('[Vite WS Error Swallowed]:', msg);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

