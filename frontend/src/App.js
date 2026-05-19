import React, { useEffect, useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import Toast from './components/Toast';
import { authApi } from './utils/api';

const THEME_KEY = 'devcollab-lite-theme';

function App() {
  const [auth, setAuth] = useState(() => authApi.getStoredAuth());
  const [toastMessage, setToastMessage] = useState('');
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');

  useEffect(() => {
    if (auth?.token) {
      localStorage.setItem('devcollab-lite-auth', JSON.stringify(auth));
    }
  }, [auth]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const notify = (message) => {
    setToastMessage(message);
  };

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setPathname(path);
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleAuth = async (mode, form) => {
    const response = mode === 'signup' ? await authApi.signup(form) : await authApi.login(form);
    setAuth(response);
    notify('Signed in successfully');
    navigate('/');
  };

  const handleLogout = () => {
    authApi.logout();
    setAuth(null);
    navigate('/');
    notify('Logged out');
  };

  const handleRequestPasswordReset = async (email) => {
    return authApi.requestPasswordReset(email);
  };

  const handleResetPassword = async (payload) => {
    return authApi.resetPassword(payload);
  };

  const isAuthenticated = Boolean(auth?.token);
  const safePath = pathname === '/settings' ? '/settings' : '/';

  return (
    <div className="min-h-screen text-slate-900 transition-colors dark:text-slate-100">
      {isAuthenticated ? (
        safePath === '/settings' ? (
          <SettingsPage
            auth={auth}
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigateHome={() => navigate('/')}
            onLogout={handleLogout}
          />
        ) : (
          <DashboardPage
            auth={auth}
            onLogout={handleLogout}
            notify={notify}
            onNavigateSettings={() => navigate('/settings')}
            onNavigateHome={() => navigate('/')}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )
      ) : (
        <LoginPage
          onAuth={handleAuth}
          onRequestPasswordReset={handleRequestPasswordReset}
          onResetPassword={handleResetPassword}
        />
      )}
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </div>
  );
}

export default App;
