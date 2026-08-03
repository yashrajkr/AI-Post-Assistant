import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);

// Register the service worker — required by Chrome/Edge for the app to be
// installable (fires `beforeinstallprompt`, see InstallPrompt.tsx).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability just won't trigger; the app still works normally.
    });
  });
}
