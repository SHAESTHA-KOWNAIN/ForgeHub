const pool = require('../db/pool');

async function getTasksByProject(projectId, userId) {
  // User must be owner OR team member
  const result = await pool.query(
    `SELECT t.id, t.title, t.description, t.status, t.project_id, t.assigned_to, u.name as assigned_to_name
     FROM tasks t
     INNER JOIN projects p ON p.id = t.project_id
     LEFT JOIN users u ON t.assigned_to = u.id
     WHERE t.project_id = $1 AND (
       p.user_id = $2 OR EXISTS (
         SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $2
       )
     )
     ORDER BY t.id DESC`,
    [projectId, userId]
  );

  return result.rows;
}

async function createTaskForProject({ title, description = '', status = 'todo', projectId, userId, assigned_to = null }) {
  // User must be owner OR team member to create task
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, project_id, assigned_to)
     SELECT $1, $2, $3, p.id, $4
     FROM projects p
     WHERE p.id = $5 AND (p.user_id = $6 OR EXISTS (
       SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $6
     ))
     RETURNING id, title, description, status, project_id, assigned_to`,
    [title, description, status, assigned_to, projectId, userId]
  );

  return result.rows[0] || null;
}

async function updateTaskStatus(taskId, userId, status) {
  const result = await pool.query(
    `UPDATE tasks t
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     FROM projects p
     WHERE t.project_id = p.id
       AND t.id = $2
       AND (p.user_id = $3 OR EXISTS (
         SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $3
       ))
     RETURNING t.id, t.title, t.description, t.status, t.project_id, t.assigned_to`,
    [status, taskId, userId]
  );

  return result.rows[0] || null;
}

async function updateTaskForUser(taskId, userId, { title, description, status, hasAssignedTo = false, assigned_to = null }) {
  const result = await pool.query(
    `UPDATE tasks t
     SET title = COALESCE($1, t.title),
         description = COALESCE($2, t.description),
         status = COALESCE($3, t.status),
         assigned_to = CASE WHEN $4 THEN $5 ELSE t.assigned_to END,
         updated_at = CURRENT_TIMESTAMP
     FROM projects p
     WHERE t.project_id = p.id
       AND t.id = $6
       AND (p.user_id = $7 OR EXISTS (
         SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $7
       ))
     RETURNING t.id, t.title, t.description, t.status, t.project_id, t.assigned_to`,
    [title, description, status, hasAssignedTo, assigned_to, taskId, userId]
  );

  return result.rows[0] || null;
}

async function deleteTaskForUser(taskId, userId) {
  const result = await pool.query(
    `DELETE FROM tasks t
     USING projects p
     WHERE t.project_id = p.id
       AND t.id = $1
       AND (p.user_id = $2 OR EXISTS (
         SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $2
       ))
     RETURNING t.id`,
    [taskId, userId]
  );

  return result.rows[0] || null;
}

async function getTaskByIdForUser(taskId, userId) {
  const result = await pool.query(
    `SELECT t.id, t.project_id, t.assigned_to
     FROM tasks t
     INNER JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1
       AND (p.user_id = $2 OR EXISTS (
         SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $2
       ))
     LIMIT 1`,
    [taskId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getTasksByProject,
  createTaskForProject,
  updateTaskStatus,
  updateTaskForUser,
  deleteTaskForUser,
  getTaskByIdForUser,
};
