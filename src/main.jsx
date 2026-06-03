import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="jemla-theme">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
