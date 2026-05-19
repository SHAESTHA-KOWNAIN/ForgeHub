import React from 'react';

function ProjectItem({ project, isSelected, isOwner, onSelect, onEdit, onDelete }) {
  return (
    <div
      className={`group w-full rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-100'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(project.id)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="truncate font-medium">{project.title}</span>
        </button>
        <div className="flex items-center gap-2 opacity-80 transition group-hover:opacity-100">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {isOwner ? 'Owner' : 'Member'}
          </span>
          {isOwner ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(project);
                }}
                className="rounded-lg px-2 py-1 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Edit project"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project);
                }}
                className="rounded-lg px-2 py-1 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Delete project"
              >
                🗑️
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ProjectItem;