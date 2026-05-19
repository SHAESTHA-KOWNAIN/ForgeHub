import React, { useMemo, useState } from 'react';

function formatTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatPanel({ projectTitle, messages, onSendMessage, disabled }) {
  const [draft, setDraft] = useState('');

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [messages]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim() || disabled) {
      return;
    }
    await onSendMessage(draft.trim());
    setDraft('');
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Project chat</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {projectTitle || 'Select a project'}
        </h3>
      </div>

      <div className="mb-4 max-h-[300px] space-y-3 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
        {sortedMessages.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
        ) : (
          sortedMessages.map((message) => (
            <article key={message.id} className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{message.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(message.created_at)}</p>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{message.message}</p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          disabled={disabled}
          placeholder="Write a message..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="w-full rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send message
        </button>
      </form>
    </section>
  );
}

export default ChatPanel;
