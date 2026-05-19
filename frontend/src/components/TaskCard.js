import React from 'react';

function TaskCard({ task, teamMembers, currentUserId, onDragStart, onMove, onEdit, onDelete, onAssign }) {
  const statusLabel = {
    todo: 'To Do',
    in_progress: 'In Progress',
    inprogress: 'In Progress',
    done: 'Done',
  }[task.status] || task.status;

  // Only assigned member can change status
  const isAssigned = task.assigned_to && Number(task.assigned_to) === Number(currentUserId);

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-slate-900 dark:text-slate-100">{task.title}</h4>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {statusLabel}
        </span>
      </div>

      {task.description ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          {task.description}
        </pre>
      ) : null}

      <div className="mt-3 space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Assigned to: <span className="font-medium text-slate-700 dark:text-slate-200">{task.assigned_to_name || 'Unassigned'}</span>
        </p>
        <label className="block text-xs text-slate-500 dark:text-slate-400">
          Assign to:
          <select
            value={task.assigned_to || ''}
            onChange={(event) => onAssign(task, event.target.value || null)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-950"
        >
          🗑️ Delete
        </button>
        {isAssigned ? (
          <>
            {task.status !== 'todo' && (
              <button
                type="button"
                onClick={() => onMove(task, 'todo')}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                To Do
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                type="button"
                onClick={() => onMove(task, 'in_progress')}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                In Progress
              </button>
            )}
            {task.status !== 'done' && (
              <button
                type="button"
                onClick={() => onMove(task, 'done')}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Done
              </button>
            )}
          </>
        ) : (
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Only assigned member can change status
          </span>
        )}
      </div>
    </article>
  );
}

export default TaskCard;
