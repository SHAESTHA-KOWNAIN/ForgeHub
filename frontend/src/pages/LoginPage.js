import React, { useState } from 'react';

function LoginPage({ onAuth, onRequestPasswordReset, onResetPassword }) {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await onAuth(isSignup ? 'signup' : 'login', form);
    } catch (authError) {
      setError(authError.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToken = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await onRequestPasswordReset(resetForm.email.trim());
      setMessage(response.message || 'Reset token generated.');
      if (response.resetToken) {
        setDevResetToken(response.resetToken);
        setResetForm((current) => ({ ...current, token: response.resetToken }));
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (resetForm.newPassword.length < 8) {
      setLoading(false);
      setError('Password must be at least 8 characters');
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setLoading(false);
      setError('Password and confirm password must match');
      return;
    }

    try {
      const response = await onResetPassword({
        email: resetForm.email.trim(),
        token: resetForm.token.trim(),
        newPassword: resetForm.newPassword,
      });
      setMessage(response.message || 'Password reset successful. You can now login.');
      setShowForgotPassword(false);
      setIsSignup(false);
      setForm((current) => ({ ...current, email: resetForm.email.trim(), password: '' }));
      setResetForm({ email: '', token: '', newPassword: '', confirmPassword: '' });
      setDevResetToken('');
    } catch (resetError) {
      setError(resetError.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => (
    <>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      )}
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-blue-500/20" />
      <div className="absolute right-[-10%] top-[12%] h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 text-slate-900 dark:text-slate-100">
          <div className="inline-flex rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            Notion-like planning, Jira-like execution.
          </div>
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Keep every project, task, and handoff in one clean workspace.
            </h1>
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-400">
              DevCollab Lite gives small teams a focused place to plan projects, move tasks across a Kanban board, and collaborate without the clutter.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {['Secure JWT auth', 'PostgreSQL persistence', 'Drag and drop board'].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/60 bg-white/75 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950/70"
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-soft sm:p-8 dark:border-slate-800">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {showForgotPassword ? 'Reset your password' : isSignup ? 'Create your account' : 'Sign in to DevCollab Lite'}
            </h2>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Ada Lovelace"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="ada@company.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Enter a secure password"
                />
              </div>

              {renderStatus()}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {loading ? 'Working...' : isSignup ? 'Create account' : 'Log in'}
              </button>

              {!isSignup && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setMessage('');
                    setDevResetToken('');
                    setResetForm((current) => ({ ...current, email: form.email || '' }));
                  }}
                  className="w-full text-sm font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot password?
                </button>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleRequestToken} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    value={resetForm.email}
                    onChange={(event) => setResetForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="ada@company.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !resetForm.email.trim()}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {loading ? 'Working...' : 'Generate reset token'}
                </button>
              </form>

              {devResetToken && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  Dev token: {devResetToken}
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Reset token</label>
                  <input
                    value={resetForm.token}
                    onChange={(event) => setResetForm((current) => ({ ...current, token: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Paste reset token"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">New password</label>
                  <input
                    type="password"
                    value={resetForm.newPassword}
                    onChange={(event) => setResetForm((current) => ({ ...current, newPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
                  <input
                    type="password"
                    value={resetForm.confirmPassword}
                    onChange={(event) => setResetForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Repeat new password"
                  />
                </div>

                {renderStatus()}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !resetForm.email.trim() ||
                    !resetForm.token.trim() ||
                    !resetForm.newPassword ||
                    !resetForm.confirmPassword
                  }
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {loading ? 'Working...' : 'Reset password'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setMessage('');
                  setDevResetToken('');
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Back to login
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            disabled={showForgotPassword}
            className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {isSignup ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
