const messagesModel = require('../models/messagesModel');
const { canAccessProject } = require('../models/projectModel');

async function listMessages(req, res) {
  try {
    const { projectId } = req.params;
    const hasAccess = await canAccessProject(projectId, req.user.id);

    if (!hasAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const messages = await messagesModel.getProjectMessages(projectId);
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load messages' });
  }
}

async function createMessage(req, res) {
  try {
    const { projectId, message } = req.body;

    if (!projectId || !message || !message.trim()) {
      return res.status(400).json({ message: 'projectId and message are required' });
    }

    const hasAccess = await canAccessProject(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newMessage = await messagesModel.addMessage(projectId, req.user.id, message.trim());
    return res.status(201).json({ message: newMessage });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to send message' });
  }
}

module.exports = {
  listMessages,
  createMessage,
};
