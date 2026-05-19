const {
  createTaskForProject,
  getTasksByProject,
  getTaskByIdForUser,
  deleteTaskForUser,
  updateTaskForUser,
} = require('../models/taskModel');
const { canAccessProject, isProjectOwner } = require('../models/projectModel');
const teamMemberModel = require('../models/teamMemberModel');

const allowedStatuses = new Set(['todo', 'in_progress', 'inprogress', 'done']);

function normalizeStatus(status) {
  if (status === 'inprogress') {
    return 'in_progress';
  }
  return status;
}

async function listTasks(req, res) {
  try {
    const { projectId } = req.params;
    const projectAccess = await canAccessProject(projectId, req.user.id);

    if (!projectAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await getTasksByProject(projectId, req.user.id);
    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load tasks' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description = '', projectId, status = 'todo', assigned_to = null } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const normalizedStatus = normalizeStatus(status);

    if (assigned_to) {
      const isOwner = await isProjectOwner(projectId, assigned_to);
      const isMember = await teamMemberModel.isTeamMember(assigned_to, projectId);
      if (!isOwner && !isMember) {
        return res.status(400).json({ message: 'Assigned user must be a project member' });
      }
    }

    const task = await createTaskForProject({
      title: title.trim(),
      description,
      status: normalizedStatus,
      projectId,
      userId: req.user.id,
      assigned_to,
    });

    if (!task) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create task' });
  }
}

async function changeTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, title, description, assigned_to } = req.body;

    if (typeof title === 'string' && !title.trim()) {
      return res.status(400).json({ message: 'Task title cannot be empty' });
    }

    if (status && !allowedStatuses.has(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const taskRecord = await getTaskByIdForUser(id, req.user.id);
    if (!taskRecord) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If user is changing task status, verify they are either the assigned member or project owner
    const projectId = taskRecord.project_id;
    const isCurrentUserProjectOwner = await isProjectOwner(projectId, req.user.id);
    if (status && !isProjectOwner) {
      // Ensure numeric comparison for type safety
      const assignedUserId = Number(taskRecord.assigned_to);
      const currentUserId = Number(req.user.id);
      if (assignedUserId !== currentUserId) {
        return res.status(403).json({ message: 'Only the assigned member can change task status' });
      }
    }

    let hasAssignedTo = false;
    let nextAssignedTo = null;
    if (Object.prototype.hasOwnProperty.call(req.body, 'assigned_to')) {
      hasAssignedTo = true;
      if (assigned_to === null || assigned_to === '') {
        nextAssignedTo = null;
      } else {
        nextAssignedTo = Number(assigned_to);
        const projectId = taskRecord.project_id;
        const isOwner = await isProjectOwner(projectId, nextAssignedTo);
        const isMember = await teamMemberModel.isTeamMember(nextAssignedTo, projectId);
        if (!isOwner && !isMember) {
          return res.status(400).json({ message: 'Assigned user must be a project member' });
        }
      }
    }

    const task = await updateTaskForUser(id, req.user.id, {
      title: typeof title === 'string' ? title.trim() : null,
      description: typeof description === 'string' ? description : null,
      status: status ? normalizeStatus(status) : null,
      hasAssignedTo,
      assigned_to: nextAssignedTo,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error('Task update error:', error);
    return res.status(500).json({ message: error.message || 'Unable to update task' });
  }
}

async function removeTask(req, res) {
  try {
    const { id } = req.params;
    const task = await deleteTaskForUser(id, req.user.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete task' });
  }
}

module.exports = {
  listTasks,
  createTask,
  changeTaskStatus,
  removeTask,
};
