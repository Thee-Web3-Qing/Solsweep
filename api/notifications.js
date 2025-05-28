// In-memory notification store
const userNotifications = {};

export default async function handler(req, res) {
  const { sessionId } = req.method === 'GET' ? req.query : req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  if (req.method === 'GET') {
    // Fetch and clear notifications
    const notes = userNotifications[sessionId] || [];
    userNotifications[sessionId] = [];
    return res.status(200).json({ notifications: notes });
  }

  if (req.method === 'POST') {
    const { notification } = req.body;
    if (!notification) {
      return res.status(400).json({ error: 'Missing notification' });
    }
    if (!userNotifications[sessionId]) userNotifications[sessionId] = [];
    userNotifications[sessionId].push(notification);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 