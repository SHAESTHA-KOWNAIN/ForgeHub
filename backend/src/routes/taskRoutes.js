const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  changeTaskStatus,
  createTask,
  listTasks,
  removeTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(authMiddleware);

router.get('/:projectId', listTasks);
router.post('/', createTask);
router.put('/:id', changeTaskStatus);
router.delete('/:id', removeTask);

module.exports = router;
