import React from 'react';

function Navbar({ auth, theme, onToggleTheme, onNavigateSettings, onNavigateHome, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-left transition hover:opacity-80"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
            DevCollab Lite
          </p>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Collaborate with focus</h1>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            type="button"
            onClick={onNavigateSettings}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Settings
          </button>
          <div className="hidden rounded-xl bg-slate-100 px-3 py-2 text-right text-sm dark:bg-slate-900 md:block">
            <p className="font-medium text-slate-900 dark:text-slate-100">{auth?.user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{auth?.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;