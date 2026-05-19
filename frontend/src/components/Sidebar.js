import React from 'react';
import ProjectItem from './ProjectItem';

function Sidebar({
  projects,
  selectedProjectId,
  currentUserId,
  selectedProject,
  teamMembers,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onInviteMember,
}) {
  const isSelectedProjectOwner =
    selectedProject && Number(selectedProject.user_id) === Number(currentUserId);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200/70 bg-white/80 p-4 shadow-soft lg:w-80 lg:rounded-r-[2rem] dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mb-6 rounded-3xl bg-slate-950 px-4 py-5 text-white shadow-lg shadow-slate-950/10 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold">Team projects</h1>
        <p className="mt-2 text-sm text-slate-300">Plan projects, track tasks, and keep work moving.</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Projects</p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects</h2>
        </div>
        <button
          type="button"
          onClick={onCreateProject}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          New Project
        </button>
      </div>

      <div className="mb-4 flex-1 space-y-2 overflow-auto pr-1 scrollbar-thin">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No projects yet. Create your first workspace.
          </div>
        ) : (
          projects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              isSelected={Number(selectedProjectId) === Number(project.id)}
              isOwner={Number(project.user_id) === Number(currentUserId)}
              onSelect={onSelectProject}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
            />
          ))
        )}
      </div>

      <div className="mt-2 rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Team Members</h3>
          <button
            type="button"
            onClick={onInviteMember}
            disabled={!selectedProjectId || !isSelectedProjectOwner}
            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Invite
          </button>
        </div>

        <div className="space-y-2">
          {teamMembers.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No team members yet.</p>
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
