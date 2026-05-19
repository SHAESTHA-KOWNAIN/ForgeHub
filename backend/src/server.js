require('dotenv').config();

const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

function resolveCorsOrigins() {
  if (!process.env.CLIENT_URL) {
    // Reflect request origin when CLIENT_URL is not explicitly configured.
    return true;
  }

  const allowedOrigins = process.env.CLIENT_URL.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return allowedOrigins.length > 0 ? allowedOrigins : true;
}

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://devcollab-lite.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'DevCollab Lite API',
    message: 'Backend is running. Use the /api routes.',
    docs: '/api',
    health: '/api/health',
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Available API routes',
    routes: {
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      forgotPasswordRequest: 'POST /api/auth/forgot-password/request',
      forgotPasswordReset: 'POST /api/auth/forgot-password/reset',
      projectsList: 'GET /api/projects',
      projectsCreate: 'POST /api/projects',
      projectsUpdate: 'PUT /api/projects/:id',
      projectsDelete: 'DELETE /api/projects/:id',
      projectMembersList: 'GET /api/projects/:projectId/members',
      projectMembersInvite: 'POST /api/projects/:projectId/members',
      projectMembersRemove: 'DELETE /api/projects/:projectId/members/:userId',
      tasksList: 'GET /api/tasks/:projectId',
      tasksCreate: 'POST /api/tasks',
      tasksUpdate: 'PUT /api/tasks/:id',
      tasksDelete: 'DELETE /api/tasks/:id',
      messagesList: 'GET /api/messages/:projectId',
      messagesCreate: 'POST /api/messages',
      health: 'GET /api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Server error' });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`DevCollab Lite API running on port ${port}`);
});
