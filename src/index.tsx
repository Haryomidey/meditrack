
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
// Using relative path 'sw.js' instead of '/sw.js' to handle sandboxed/nested origins
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' })
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => {
        // Silently fail if in a restricted sandboxed environment like some preview frames
        console.debug('SW registration skipped or failed in this environment');
      });
  });
}
