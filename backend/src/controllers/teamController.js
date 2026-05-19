const { canAccessProject, findProjectByIdAndUser } = require('../models/projectModel');
const teamMemberModel = require('../models/teamMemberModel');

async function listProjectMembers(req, res) {
  try {
    const { projectId } = req.params;
    const hasAccess = await canAccessProject(projectId, req.user.id);

    if (!hasAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const members = await teamMemberModel.getProjectMembers(projectId);
    return res.status(200).json({ members });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load members' });
  }
}

async function inviteProjectMember(req, res) {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Member email is required' });
    }

    // Only owner can invite members
    const ownerProject = await findProjectByIdAndUser(projectId, req.user.id);
    if (!ownerProject) {
      return res.status(403).json({ message: 'Only project owner can invite members' });
    }

    const user = await teamMemberModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: 'User with this email was not found. Ask them to sign up first, then invite again.',
      });
    }

    if (Number(user.id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'Project owner is already part of the project' });
    }

    const exists = await teamMemberModel.memberExists(user.id, projectId);
    if (exists) {
      return res.status(409).json({ message: 'User is already a team member' });
    }

    await teamMemberModel.addTeamMember(user.id, projectId);
    const members = await teamMemberModel.getProjectMembers(projectId);

    return res.status(201).json({ message: 'Member invited successfully', members });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'User is already a team member' });
    }
    return res.status(500).json({ message: 'Unable to invite member' });
  }
}

async function removeProjectMember(req, res) {
  try {
    const { projectId, userId } = req.params;

    // Only owner can remove members
    const ownerProject = await findProjectByIdAndUser(projectId, req.user.id);
    if (!ownerProject) {
      return res.status(403).json({ message: 'Only project owner can remove members' });
    }

    if (Number(userId) === Number(req.user.id)) {
      return res.status(400).json({ message: 'Owner cannot be removed from project' });
    }

    await teamMemberModel.removeTeamMember(userId, projectId);
    const members = await teamMemberModel.getProjectMembers(projectId);

    return res.status(200).json({ message: 'Member removed', members });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to remove member' });
  }
}

module.exports = {
  listProjectMembers,
  inviteProjectMember,
  removeProjectMember,
};
