const API_BASE_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : `${window.location.protocol}//${window.location.hostname}:5000/api`;
const STORAGE_KEY = 'devcollab-lite-auth';

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function setStoredAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

async function request(path, options = {}) {
  const auth = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

const authApi = {
  async signup(payload) {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredAuth(data);
    return data;
  },
  async login(payload) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredAuth(data);
    return data;
  },
  async requestPasswordReset(email) {
    return request('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword(payload) {
    return request('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  logout() {
    clearStoredAuth();
  },
  getStoredAuth,
};

const projectApi = {
  list() {
    return request('/projects');
  },
  create(title) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },
  update(projectId, title) {
    return request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },
  remove(projectId) {
    return request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};

const taskApi = {
  list(projectId) {
    return request(`/tasks/${projectId}`);
  },
  create(payload) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateStatus(taskId, status) {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  update(taskId, payload) {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  remove(taskId) {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};

const teamApi = {
  listMembers(projectId) {
    return request(`/projects/${projectId}/members`);
  },
  inviteMember(projectId, email) {
    return request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  removeMember(projectId, userId) {
    return request(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};

const messageApi = {
  list(projectId) {
    return request(`/messages/${projectId}`);
  },
  create(projectId, message) {
    return request('/messages', {
      method: 'POST',
      body: JSON.stringify({ projectId, message }),
    });
  },
};

export { API_BASE_URL, authApi, projectApi, taskApi, teamApi, messageApi };
