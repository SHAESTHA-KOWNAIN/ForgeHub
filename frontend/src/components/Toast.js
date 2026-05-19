import React, { useEffect } from 'react';

function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onDismiss, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-soft">
      {message}
    </div>
  );
}

export default Toast;
