const {
  createProjectForUser,
  deleteProjectForUser,
  getProjectsByUser,
  findProjectByIdAndUser,
  updateProjectForUser,
} = require('../models/projectModel');

async function listProjects(req, res) {
  try {
    const projects = await getProjectsByUser(req.user.id);
    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load projects' });
  }
}

async function createProject(req, res) {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await createProjectForUser(req.user.id, title.trim());
    return res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create project' });
  }
}

async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const existingProject = await findProjectByIdAndUser(id, req.user.id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await updateProjectForUser(id, req.user.id, title.trim());
    return res.status(200).json({ project });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update project' });
  }
}

async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const existingProject = await findProjectByIdAndUser(id, req.user.id);

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await deleteProjectForUser(id, req.user.id);
    return res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete project' });
  }
}

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
};
