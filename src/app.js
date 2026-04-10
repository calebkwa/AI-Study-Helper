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

const express = require('express');
const path = require('path');
const generateNotes = require("./geminiService.js");

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

  app.post("/api/generate", async (req, res) => {
    try {
      const { notes } = req.body;

      const output = await generateNotes(notes);

      res.json({ result: output });
    } catch (err) {
      console.error("FULL ERROR:", err);
      res.status(500).json({ error: err.message || "Something went wrong" });
    }
  });

  

    return app;
  }

module.exports = { createApp };
