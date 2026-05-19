import React, { useEffect, useMemo, useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import ConfirmModal from '../components/ConfirmModal';
import KanbanBoard from '../components/KanbanBoard';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { messageApi, projectApi, taskApi, teamApi } from '../utils/api';

const initialTaskForm = {
  title: '',
  description: '',
  assigned_to: '',
};

function DashboardPage({ auth, onLogout, notify, onNavigateSettings, onNavigateHome, theme, onToggleTheme }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectEditModalOpen, setProjectEditModalOpen] = useState(false);
  const [projectDeleteConfirmOpen, setProjectDeleteConfirmOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [taskDeleteConfirmOpen, setTaskDeleteConfirmOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [projectBeingEdited, setProjectBeingEdited] = useState(null);
  const [projectBeingDeleted, setProjectBeingDeleted] = useState(null);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [taskBeingDeleted, setTaskBeingDeleted] = useState(null);
  const [savingProject, setSavingProject] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => Number(project.id) === Number(selectedProjectId)),
    [projects, selectedProjectId]
  );

  const isSelectedProjectOwner =
    selectedProject && Number(selectedProject.user_id) === Number(auth?.user?.id);

  useEffect(() => {
    let isActive = true;

    async function loadProjects() {
      setLoadingProjects(true);

      try {
        const response = await projectApi.list();

        if (!isActive) {
          return;
        }

        const nextProjects = response.projects || [];
        setProjects(nextProjects);
        if (nextProjects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(nextProjects[0].id);
        }
      } catch (error) {
        notify(error.message || 'Unable to load projects');
      } finally {
        if (isActive) {
          setLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      setTeamMembers([]);
      setMessages([]);
      return undefined;
    }

    let isActive = true;

    async function loadProjectData() {
      setLoadingTasks(true);

      try {
        const [tasksResponse, membersResponse, messagesResponse] = await Promise.all([
          taskApi.list(selectedProjectId),
          teamApi.listMembers(selectedProjectId),
          messageApi.list(selectedProjectId),
        ]);

        if (!isActive) {
          return;
        }

        setTasks(tasksResponse.tasks || []);
        setTeamMembers(membersResponse.members || []);
        setMessages(messagesResponse.messages || []);
      } catch (error) {
        notify(error.message || 'Unable to load project data');
      } finally {
        if (isActive) {
          setLoadingTasks(false);
        }
      }
    }

    loadProjectData();

    return () => {
      isActive = false;
    };
  }, [selectedProjectId]);

  const selectedProjectTasks = tasks;

  const refreshProjects = async (nextProjectId) => {
    const response = await projectApi.list();
    const nextProjects = response.projects || [];
    setProjects(nextProjects);

    if (nextProjectId) {
      setSelectedProjectId(nextProjectId);
      return;
    }

    if (!selectedProjectId && nextProjects.length > 0) {
      setSelectedProjectId(nextProjects[0].id);
    }
  };

  const refreshTasks = async () => {
    if (!selectedProjectId) {
      return;
    }
    const response = await taskApi.list(selectedProjectId);
    setTasks(response.tasks || []);
  };

  const refreshMembers = async () => {
    if (!selectedProjectId) {
      return;
    }
    const response = await teamApi.listMembers(selectedProjectId);
    setTeamMembers(response.members || []);
  };

  const refreshMessages = async () => {
    if (!selectedProjectId) {
      return;
    }
    const response = await messageApi.list(selectedProjectId);
    setMessages(response.messages || []);
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!projectTitle.trim()) {
      notify('Project title is required');
      return;
    }
    setSavingProject(true);

    try {
      const response = await projectApi.create(projectTitle.trim());
      setProjectModalOpen(false);
      setProjectTitle('');
      notify('Project created');
      await refreshProjects(response.project.id);
    } catch (error) {
      notify(error.message || 'Unable to create project');
    } finally {
      setSavingProject(false);
    }
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();
    if (!projectTitle.trim()) {
      notify('Project title is required');
      return;
    }
    setSavingProject(true);

    try {
      await projectApi.update(projectBeingEdited.id, projectTitle.trim());
      setProjectEditModalOpen(false);
      setProjectBeingEdited(null);
      setProjectTitle('');
      notify('Project updated');
      await refreshProjects(selectedProjectId);
    } catch (error) {
      notify(error.message || 'Unable to update project');
    } finally {
      setSavingProject(false);
    }
  };

  const openEditProject = (project) => {
    if (Number(project.user_id) !== Number(auth?.user?.id)) {
      notify('Only the project owner can edit this project');
      return;
    }
    setProjectBeingEdited(project);
    setProjectTitle(project.title);
    setProjectEditModalOpen(true);
  };

  const openDeleteProject = (project) => {
    if (Number(project.user_id) !== Number(auth?.user?.id)) {
      notify('Only the project owner can delete this project');
      return;
    }
    setProjectBeingDeleted(project);
    setProjectDeleteConfirmOpen(true);
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.remove(projectBeingDeleted.id);
      notify('Project deleted');
      setProjectDeleteConfirmOpen(false);
      const shouldResetSelection = Number(selectedProjectId) === Number(projectBeingDeleted.id);
      setProjectBeingDeleted(null);
      const response = await projectApi.list();
      const nextProjects = response.projects || [];
      setProjects(nextProjects);
      if (shouldResetSelection) {
        setSelectedProjectId(nextProjects[0]?.id || null);
        setTasks([]);
        setTeamMembers([]);
        setMessages([]);
      }
    } catch (error) {
      if ((error.message || '').toLowerCase().includes('not found')) {
        notify('Only project owner can delete this project');
      } else {
        notify(error.message || 'Unable to delete project');
      }
    }
  };

  const handleInviteMember = async (event) => {
    event.preventDefault();
    if (!selectedProjectId || !inviteEmail.trim()) {
      notify('Member email is required');
      return;
    }

    if (!isSelectedProjectOwner) {
      notify('Only project owner can invite members');
      return;
    }

    try {
      const response = await teamApi.inviteMember(selectedProjectId, inviteEmail.trim());
      setTeamMembers(response.members || []);
      setInviteEmail('');
      setInviteModalOpen(false);
      notify('Member invited');
    } catch (error) {
      notify(error.message || 'Unable to invite member');
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!taskForm.title.trim()) {
      notify('Task title is required');
      return;
    }
    setSavingTask(true);

    try {
      await taskApi.create({
        title: taskForm.title.trim(),
        description: taskForm.description,
        projectId: selectedProjectId,
        status: 'todo',
        assigned_to: taskForm.assigned_to ? Number(taskForm.assigned_to) : null,
      });
      setTaskModalOpen(false);
      setTaskForm(initialTaskForm);
      notify('Task created');
      await refreshTasks();
    } catch (error) {
      notify(error.message || 'Unable to create task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTask = async (event) => {
    event.preventDefault();
    if (!taskForm.title.trim()) {
      notify('Task title is required');
      return;
    }
    setSavingTask(true);

    try {
      await taskApi.update(taskBeingEdited.id, {
        title: taskForm.title.trim(),
        description: taskForm.description,
        assigned_to: taskForm.assigned_to ? Number(taskForm.assigned_to) : null,
      });
      setTaskEditModalOpen(false);
      setTaskBeingEdited(null);
      setTaskForm(initialTaskForm);
      notify('Task updated');
      await refreshTasks();
    } catch (error) {
      notify(error.message || 'Unable to update task');
    } finally {
      setSavingTask(false);
    }
  };

  const openEditTask = (task) => {
    setTaskBeingEdited(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      assigned_to: task.assigned_to ? String(task.assigned_to) : '',
    });
    setTaskEditModalOpen(true);
  };

  const openDeleteTask = (task) => {
    setTaskBeingDeleted(task);
    setTaskDeleteConfirmOpen(true);
  };

  const handleDeleteTask = async () => {
    try {
      await taskApi.remove(taskBeingDeleted.id);
      notify('Task deleted');
      setTaskDeleteConfirmOpen(false);
      setTaskBeingDeleted(null);
      await refreshTasks();
    } catch (error) {
      notify(error.message || 'Unable to delete task');
    }
  };

  const handleMoveTask = async (task, status) => {
    try {
      const response = await taskApi.update(task.id, { status });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === response.task.id ? { ...currentTask, ...response.task } : currentTask
        )
      );
      notify('Task updated');
    } catch (error) {
      notify(error.message || 'Unable to update task');
    }
  };

  const handleAssignTask = async (task, assignedTo) => {
    try {
      const response = await taskApi.update(task.id, {
        assigned_to: assignedTo ? Number(assignedTo) : null,
      });

      const assignedUser = teamMembers.find((member) => Number(member.user_id) === Number(response.task.assigned_to));
      const assignedToName = assignedUser ? assignedUser.name : null;

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === response.task.id
            ? { ...currentTask, ...response.task, assigned_to_name: assignedToName }
            : currentTask
        )
      );
      notify('Assignee updated');
    } catch (error) {
      notify(error.message || 'Unable to update assignee');
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedProjectId) {
      return;
    }

    try {
      await messageApi.create(selectedProjectId, content);
      await refreshMessages();
    } catch (error) {
      notify(error.message || 'Unable to send message');
    }
  };

  if (loadingProjects && projects.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-slate-600">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar
        auth={auth}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onNavigateSettings={onNavigateSettings}
        onNavigateHome={onNavigateHome}
        onLogout={onLogout}
      />

      <div className="flex flex-col lg:flex-row">
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          currentUserId={auth?.user?.id}
          selectedProject={selectedProject}
          teamMembers={teamMembers}
          onSelectProject={setSelectedProjectId}
          onCreateProject={() => setProjectModalOpen(true)}
          onEditProject={openEditProject}
          onDeleteProject={openDeleteProject}
          onInviteMember={() => setInviteModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Dashboard</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {selectedProject ? selectedProject.title : 'Select or create a project'}
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {selectedProject
                    ? 'Manage tasks visually, assign teammates, and collaborate in real time.'
                    : 'Projects organize the work in your collaboration space.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(true)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  New project
                </button>
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(true)}
                  disabled={!selectedProjectId}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Add task
                </button>
              </div>
            </div>
          </div>

          {loadingTasks ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-8 text-slate-500 shadow-soft dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
              Loading project data...
            </div>
          ) : selectedProjectId ? (
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <KanbanBoard
                tasks={selectedProjectTasks}
                teamMembers={teamMembers}
                currentUserId={auth?.user?.id}
                onMoveTask={handleMoveTask}
                onAddTask={() => setTaskModalOpen(true)}
                onEditTask={openEditTask}
                onDeleteTask={openDeleteTask}
                onAssignTask={handleAssignTask}
              />
              <ChatPanel
                projectTitle={selectedProject?.title}
                messages={messages}
                onSendMessage={handleSendMessage}
                disabled={!selectedProjectId}
              />
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white/80 p-8 text-slate-500 shadow-soft dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400">
              Create a project to start organizing tasks.
            </div>
          )}
        </main>
      </div>

      {projectModalOpen && (
        <Modal title="Create project" onClose={() => setProjectModalOpen(false)}>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Project title</label>
              <input
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Launch planning"
              />
            </div>
            <button
              type="submit"
              disabled={savingProject || !projectTitle.trim()}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {savingProject ? 'Saving...' : 'Create project'}
            </button>
          </form>
        </Modal>
      )}

      {projectEditModalOpen && (
        <Modal title="Edit project" onClose={() => setProjectEditModalOpen(false)}>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Project title</label>
              <input
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={savingProject || !projectTitle.trim()}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProject ? 'Saving...' : 'Update project'}
            </button>
          </form>
        </Modal>
      )}

      {inviteModalOpen && (
        <Modal title="Invite team member" onClose={() => setInviteModalOpen(false)}>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Member email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                placeholder="teammate@company.com"
              />
            </div>
            <button
              type="submit"
              disabled={!inviteEmail.trim() || !selectedProjectId}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Invite member
            </button>
          </form>
        </Modal>
      )}

      {projectDeleteConfirmOpen && projectBeingDeleted && (
        <ConfirmModal
          title="Delete project"
          message={`Delete "${projectBeingDeleted.title}"? All tasks and messages inside it will be removed too.`}
          confirmLabel="Delete project"
          onClose={() => setProjectDeleteConfirmOpen(false)}
          onConfirm={handleDeleteProject}
        />
      )}

      {taskModalOpen && (
        <Modal title="Create task" onClose={() => setTaskModalOpen(false)}>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Task title</label>
              <input
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Review API responses"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={4}
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Add details, notes, or code snippets..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to</label>
              <select
                value={taskForm.assigned_to}
                onChange={(event) => setTaskForm((current) => ({ ...current, assigned_to: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={savingTask || !selectedProjectId || !taskForm.title.trim()}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {savingTask ? 'Saving...' : 'Create task'}
            </button>
          </form>
        </Modal>
      )}

      {taskEditModalOpen && (
        <Modal title="Edit task" onClose={() => setTaskEditModalOpen(false)}>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Task title</label>
              <input
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={4}
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to</label>
              <select
                value={taskForm.assigned_to}
                onChange={(event) => setTaskForm((current) => ({ ...current, assigned_to: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={savingTask || !taskForm.title.trim()}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingTask ? 'Saving...' : 'Update task'}
            </button>
          </form>
        </Modal>
      )}

      {taskDeleteConfirmOpen && taskBeingDeleted && (
        <ConfirmModal
          title="Delete task"
          message={`Delete "${taskBeingDeleted.title}"? This action cannot be undone.`}
          confirmLabel="Delete task"
          onClose={() => setTaskDeleteConfirmOpen(false)}
          onConfirm={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default DashboardPage;
