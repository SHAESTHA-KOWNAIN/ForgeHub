const pool = require('../db/pool');

const messagesModel = {
  // Get all messages for a project
  async getProjectMessages(projectId, limit = 50) {
    const query = `
      SELECT m.id, m.project_id, m.user_id, m.message, m.created_at, u.name, u.email
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.project_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [projectId, limit]);
    return result.rows.reverse(); // Reverse to show oldest first
  },

  // Add a message to a project
  async addMessage(projectId, userId, message) {
    const query = `
      INSERT INTO messages (project_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, project_id, user_id, message, created_at
    `;
    const result = await pool.query(query, [projectId, userId, message]);
    return result.rows[0];
  },

  // Delete a message (only by message creator or project owner)
  async deleteMessage(messageId, userId) {
    const query = `
      DELETE FROM messages
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [messageId, userId]);
    return result.rowCount > 0;
  }
};

module.exports = messagesModel;
