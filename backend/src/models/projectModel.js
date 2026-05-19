const pool = require('../db/pool');

async function getProjectsByUser(userId) {
  // Get projects user owns OR is a team member of
  const result = await pool.query(
    `SELECT DISTINCT p.id, p.title, p.user_id
     FROM projects p
     LEFT JOIN team_members tm ON p.id = tm.project_id
     WHERE p.user_id = $1 OR (tm.user_id = $1)
     ORDER BY p.id DESC`,
    [userId]
  );

  return result.rows;
}

async function canAccessProject(projectId, userId) {
  // Check if user is owner or team member
  const result = await pool.query(
    `SELECT id FROM projects p
     WHERE p.id = $1 AND (p.user_id = $2 OR EXISTS (
       SELECT 1 FROM team_members tm WHERE tm.project_id = p.id AND tm.user_id = $2
     ))`,
    [projectId, userId]
  );
  return result.rows.length > 0;
}

async function isProjectOwner(projectId, userId) {
  const result = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1',
    [projectId, userId]
  );
  return result.rows.length > 0;
}

async function createProjectForUser(userId, title) {
  const result = await pool.query(
    'INSERT INTO projects (title, user_id) VALUES ($1, $2) RETURNING id, title, user_id',
    [title, userId]
  );

  return result.rows[0];
}

async function updateProjectForUser(projectId, userId, title) {
  const result = await pool.query(
    'UPDATE projects SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title, user_id',
    [title, projectId, userId]
  );

  return result.rows[0] || null;
}

async function deleteProjectForUser(projectId, userId) {
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
    [projectId, userId]
  );

  return result.rows[0] || null;
}

async function findProjectByIdAndUser(projectId, userId) {
  const result = await pool.query(
    'SELECT id, title, user_id FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1',
    [projectId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getProjectsByUser,
  createProjectForUser,
  updateProjectForUser,
  deleteProjectForUser,
  findProjectByIdAndUser,
  canAccessProject,
  isProjectOwner,
};
