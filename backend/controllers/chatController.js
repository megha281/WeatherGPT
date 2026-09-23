const geminiService = require('../services/geminiService');
const Chat = require('../models/Chat');
const ApiError = require('../utils/ApiError');
const { isDBConnected } = require('../config/db');

/**
 * POST /api/chat
 * Body: { message, location?, language?, chatId? }
 * Works signed out (nothing is stored) and signed in (conversation is saved).
 */
async function ask(req, res, next) {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) throw ApiError.badRequest('Type a question first');
    if (message.length > 1000) throw ApiError.badRequest('That question is too long. Keep it under 1000 characters.');

    const language = req.body.language || req.user?.preferredLanguage || 'en';
    const location = req.body.location || req.user?.defaultLocation || null;

    let chat = null;
    let history = Array.isArray(req.body.history) ? req.body.history : [];

    if (req.user && isDBConnected()) {
      if (req.body.chatId) {
        chat = await Chat.findOne({ _id: req.body.chatId, user: req.user._id });
        if (!chat) throw ApiError.notFound('That conversation no longer exists');
        history = chat.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      }
    }

    const result = await geminiService.askWeatherGPT({ question: message, location, language, history });

    if (req.user && isDBConnected()) {
      if (!chat) {
        chat = new Chat({
          user: req.user._id,
          title: await geminiService.generateTitle(message),
          language,
          location: result.location || location || undefined,
        });
      }
      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'assistant', content: result.answer, structured: {
        location: result.location,
        weather: result.weather,
        risk: result.risk,
        advisory: result.advisory,
        sources: result.sources,
      } });
      if (result.location) chat.location = result.location;
      await chat.save();
    }

    res.json({ success: true, data: { ...result, chatId: chat ? String(chat._id) : null, saved: Boolean(chat) } });
  } catch (err) { next(err); }
}

/** GET /api/chat/history */
async function history(req, res, next) {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('title location language createdAt updatedAt messages')
      .lean();

    res.json({
      success: true,
      count: chats.length,
      chats: chats.map((c) => ({
        id: String(c._id),
        title: c.title,
        location: c.location || null,
        language: c.language,
        messageCount: c.messages.length,
        preview: c.messages.find((m) => m.role === 'user')?.content?.slice(0, 120) || '',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (err) { next(err); }
}

/** GET /api/chat/:id */
async function getOne(req, res, next) {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!chat) throw ApiError.notFound('That conversation no longer exists');
    res.json({ success: true, chat: { ...chat, id: String(chat._id) } });
  } catch (err) { next(err); }
}

/** DELETE /api/chat/:id */
async function remove(req, res, next) {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!chat) throw ApiError.notFound('That conversation no longer exists');
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) { next(err); }
}

/** DELETE /api/chat  - clears every conversation for the signed-in user */
async function clearAll(req, res, next) {
  try {
    const result = await Chat.deleteMany({ user: req.user._id });
    res.json({ success: true, message: `Deleted ${result.deletedCount} conversation(s).` });
  } catch (err) { next(err); }
}

module.exports = { ask, history, getOne, remove, clearAll };
