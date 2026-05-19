const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
	createProject,
	deleteProject,
	listProjects,
	updateProject,
} = require('../controllers/projectController');
const {
  listProjectMembers,
  inviteProjectMember,
  removeProjectMember,
} = require('../controllers/teamController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:projectId/members', listProjectMembers);
router.post('/:projectId/members', inviteProjectMember);
router.delete('/:projectId/members/:userId', removeProjectMember);

module.exports = router;
