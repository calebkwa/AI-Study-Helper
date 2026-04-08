const express = require('express');
const path = require('path');
const { generateSummary } = require('./geminiService');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/api/info', (req, res) => {
    res.json({ name: 'ai-study-helper', version: '0.1.0' });
  });

  app.get('/', (req, res) => {
    res.send('AI Study Helper');
  });

  app.post('/api/generate', async (req, res) => {
    const { notes } = req.body;

    // FAKE RESPONSE FOR TESTING
    const summary = await generateSummary(notes);

    res.json({
      original_notes: notes,
      generated_summary: summary,
      timestamp: new Date()
    });
  });

  return app;
}

module.exports = { createApp };
