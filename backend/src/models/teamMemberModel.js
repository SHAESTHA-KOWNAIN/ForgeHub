const pool = require('../db/pool');

const teamMemberModel = {
  // Get all team members for a project
  async getProjectMembers(projectId) {
    const query = `
      SELECT member_id AS id, user_id, role, name, email, created_at
      FROM (
        SELECT
          p.id AS member_id,
          p.user_id,
          'owner'::varchar AS role,
          u.name,
          u.email,
          p.created_at
        FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1

        UNION ALL

        SELECT
          tm.id AS member_id,
          tm.user_id,
          tm.role,
          u.name,
          u.email,
          tm.created_at
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.project_id = $1
      ) members
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows;
  },

  // Add a team member to a project
  async addTeamMember(userId, projectId, role = 'member') {
    const query = `
      INSERT INTO team_members (user_id, project_id, role)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, project_id, role, created_at
    `;
    const result = await pool.query(query, [userId, projectId, role]);
    return result.rows[0];
  },

  // Check if user is team member of a project
  async isTeamMember(userId, projectId) {
    const query = `
      SELECT id FROM team_members
      WHERE user_id = $1 AND project_id = $2
    `;
    const result = await pool.query(query, [userId, projectId]);
    return result.rows.length > 0;
  },

  // Remove a team member from a project
  async removeTeamMember(userId, projectId) {
    const query = `
      DELETE FROM team_members
      WHERE user_id = $1 AND project_id = $2
    `;
    await pool.query(query, [userId, projectId]);
  },

  // Find user by email
  async findUserByEmail(email) {
    const query = `
      SELECT id, name, email FROM users
      WHERE LOWER(email) = LOWER($1)
    `;
    const result = await pool.query(query, [String(email || '').trim()]);
    return result.rows[0];
  },

  // Check if already a member
  async memberExists(userId, projectId) {
    const query = `
      SELECT id FROM team_members
      WHERE user_id = $1 AND project_id = $2
    `;
    const result = await pool.query(query, [userId, projectId]);
    return result.rows.length > 0;
  }
};

module.exports = teamMemberModel;
