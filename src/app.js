const express = require('express');
const path = require('path');
const quizRoutes = require("./routes/quiz");
const generateNotes = require("./geminiService.js");
const { saveSession } = require("./services/sessionStore");


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

  app.post("/api/generate", async (req, res) => {
    try {
      const { notes, mode = "summary" } = req.body;

      let prompt;

      if (mode === "summary") {
        prompt = `Summarize into short bullet points:\n\n${notes}`;
      } else if (mode === "flashcards") {
        prompt = `Convert into flashcards (Q&A format):\n\n${notes}`;
      } else {
        return res.status(400).json({ error: "Invalid mode" });
      }

      const output = await generateNotes(prompt);

      saveSession({
        notes,
        result: output,
        date: new Date()
      });

      res.json({ result: output });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use("/api/quiz", quizRoutes);

  return app;
}

module.exports = { createApp };