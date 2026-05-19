const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  updateUserPassword,
  ensurePasswordResetTable,
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
} = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      token: signToken(user),
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create account' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userWithPassword = await findUserByEmail(email.toLowerCase().trim());

    if (!userWithPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, userWithPassword.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
    };

    return res.status(200).json({
      token: signToken(user),
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to login' });
  }
}

async function requestForgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await ensurePasswordResetTable();
    const user = await findUserByEmail(email.trim().toLowerCase());

    // Return generic success response even if user does not exist.
    if (!user) {
      return res.status(200).json({
        message: 'If this email exists, a reset token has been generated.',
      });
    }

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const payload = {
      message: 'Reset token generated. Use it to set a new password within 30 minutes.',
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.resetToken = rawToken;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to process forgot password request' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and newPassword are required' });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    await ensurePasswordResetTable();
    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset details' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token).trim()).digest('hex');
    const resetToken = await findValidPasswordResetToken({ userId: user.id, tokenHash });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(user.id, hashedPassword);
    await markPasswordResetTokenUsed(resetToken.id);

    return res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to reset password' });
  }
}

module.exports = {
  signup,
  login,
  requestForgotPassword,
  resetPassword,
};
