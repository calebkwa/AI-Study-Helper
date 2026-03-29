const express = require('express');
const path = require('path');

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

  return app;
}

module.exports = { createApp };
