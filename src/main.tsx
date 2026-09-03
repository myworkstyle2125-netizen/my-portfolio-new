import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Prevent unhandled WebSocket / Vite HMR promise rejections from bubbling or crashing
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('vite') ||
      msg.includes('closed without opened') ||
      msg.includes('vite-hmr')
    ) {
      event.preventDefault();
      console.debug('[Vite HMR] Intercepted WebSocket connection rejection gracefully:', msg);
    }
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Fatal error: Root DOM element "#root" not found.');
}
