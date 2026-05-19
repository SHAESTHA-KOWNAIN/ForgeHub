import React from 'react';
import Modal from './Modal';

function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;