const { getResponse } = require('../helpers/chatbot.helper');

const chat = (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ ok: false, error: 'El campo "message" es requerido.' });
  }

  const response = getResponse(message.trim());
  return res.json({ ok: true, ...response });
};

module.exports = { chat };