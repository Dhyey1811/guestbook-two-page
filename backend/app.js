const path = require('path');
const express = require('express');

const USE_DB = process.env.USE_DB === '1';
let db;
if (USE_DB) {
  db = require('./db'); // DynamoDB helpers
}

const app = express();
app.use(express.json());

// In-memory store (fallback / tests)
const messages = [
  { id: 1, name: 'Admin', message: 'Welcome to the guest book!' }
];

async function listAll() {
  if (USE_DB) return await db.listMessages();
  return messages;
}

async function createOne({ name, message }) {
  const item = { id: Date.now(), name, message };
  if (USE_DB) return await db.createMessage(item);
  messages.push(item);
  return item;
}

async function updateOne(id, { name, message }) {
  if (USE_DB) return await db.updateMessage(id, { name, message });
  const idx = messages.findIndex(m => m.id === id);
  if (idx === -1) return null;
  messages[idx] = { ...messages[idx], name, message };
  return messages[idx];
}

async function deleteOne(id) {
  if (USE_DB) return await db.deleteMessage(id);
  const idx = messages.findIndex(m => m.id === id);
  if (idx === -1) return false;
  messages.splice(idx, 1);
  return true;
}

// API routes
app.get('/api/messages', async (req, res) => {
  const list = await listAll();
  res.json(list);
});

app.post('/api/messages', async (req, res) => {
  const { name, message } = req.body || {};
  if (!name || !message) return res.status(400).json({ error: 'name and message are required' });
  const created = await createOne({ name, message });
  res.status(201).json(created);
});

app.put('/api/messages/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, message } = req.body || {};
  if (!name || !message) return res.status(400).json({ error: 'name and message are required' });
  const updated = await updateOne(id, { name, message });
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

app.delete('/api/messages/:id', async (req, res) => {
  const id = Number(req.params.id);
  const ok = await deleteOne(id);
  if (!ok && !USE_DB) return res.status(404).json({ error: 'not found' });
  res.sendStatus(204);
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

module.exports = app;
