import React from 'react';
import TaskCard from './TaskCard';

const columns = [
  { key: 'todo', title: 'To Do', accent: 'bg-slate-200' },
  { key: 'in_progress', title: 'In Progress', accent: 'bg-amber-200' },
  { key: 'done', title: 'Done', accent: 'bg-emerald-200' },
];

function KanbanBoard({ tasks, teamMembers, currentUserId, onMoveTask, onAddTask, onEditTask, onDeleteTask, onAssignTask }) {
  const tasksByStatus = columns.reduce((accumulator, column) => {
    accumulator[column.key] = tasks.filter((task) => {
      if (column.key === 'in_progress') {
        return task.status === 'in_progress' || task.status === 'inprogress';
      }
      return task.status === column.key;
    });
    return accumulator;
  }, {});

  const handleDrop = (event, status) => {
    event.preventDefault();
    const rawTask = event.dataTransfer.getData('application/json');

    if (!rawTask) {
      return;
    }

    const task = JSON.parse(rawTask);
    if (task.status !== status) {
      onMoveTask(task, status);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => (
        <div
          key={column.key}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, column.key)}
          className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950/80"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className={`mb-2 h-1.5 w-14 rounded-full ${column.accent}`} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{column.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tasksByStatus[column.key].length} tasks</p>
            </div>
            {column.key === 'todo' && (
              <button
                type="button"
                onClick={onAddTask}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Add task
              </button>
            )}
          </div>

          <div className="min-h-[220px] space-y-3">
            {tasksByStatus[column.key].length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Drop a task here.
              </div>
            ) : (
              tasksByStatus[column.key].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onMove={onMoveTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onAssign={onAssignTask}
                  onDragStart={(event, draggedTask) => {
                    event.dataTransfer.setData('application/json', JSON.stringify(draggedTask));
                  }}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

export default KanbanBoard;
