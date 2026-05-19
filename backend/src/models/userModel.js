const pool = require('../db/pool');

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, password FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [String(email || '').trim()]
  );
  return result.rows[0] || null;
}

async function createUser({ name, email, password }) {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, password]
  );

  return result.rows[0];
}

async function updateUserPassword(userId, passwordHash) {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, name, email',
    [passwordHash, userId]
  );
  return result.rows[0] || null;
}

async function ensurePasswordResetTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(128) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = FALSE', [userId]);
  const result = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0] || null;
}

async function findValidPasswordResetToken({ userId, tokenHash }) {
  const result = await pool.query(
    `SELECT id, user_id, expires_at
     FROM password_reset_tokens
     WHERE user_id = $1
       AND token_hash = $2
       AND used = FALSE
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [userId, tokenHash]
  );
  return result.rows[0] || null;
}

async function markPasswordResetTokenUsed(tokenId) {
  await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [tokenId]);
}

module.exports = {
  findUserByEmail,
  createUser,
  updateUserPassword,
  ensurePasswordResetTable,
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
};
