const express = require('express');
const { login, signup, requestForgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.status(200).json({
		message: 'Use POST /api/auth/signup with JSON body: { name, email, password }',
	});
});

router.get('/login', (req, res) => {
	res.status(200).json({
		message: 'Use POST /api/auth/login with JSON body: { email, password }',
	});
});

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password/request', requestForgotPassword);
router.post('/forgot-password/reset', resetPassword);

module.exports = router;
