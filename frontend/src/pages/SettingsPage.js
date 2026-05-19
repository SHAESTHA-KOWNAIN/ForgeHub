import React from 'react';

function SettingsPage({ auth, theme, onToggleTheme, onNavigateHome, onLogout }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          ← Back to dashboard
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Logout
        </button>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Appearance</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Switch between dark and light mode. Your preference is saved locally.</p>

        <button
          type="button"
          onClick={onToggleTheme}
          className="mt-6 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">User</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{auth?.user?.name}</h2>
          <p className="text-slate-600 dark:text-slate-400">{auth?.user?.email}</p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Theme</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{theme === 'dark' ? 'Dark mode active' : 'Light mode active'}</h2>
          <p className="text-slate-600 dark:text-slate-400">Theme preference is stored in localStorage.</p>
        </div>
      </section>
    </main>
  );
}

export default SettingsPage;