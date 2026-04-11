const express = require("express");
const path = require("path");

const quizRoutes = require("./routes/quiz");
const uploadRoutes = require("./routes/upload");

const generateNotes = require("./geminiService");
const { saveSession, listSessions } = require("./services/sessionStore");
const { buildFlashcardPrompt, parseFlashcardResponse } = require("./services/flashcards");


function createApp() {

  const app = express();

  app.use(express.json());

  app.use(express.static(path.join(__dirname, "../public")));


  // health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });


  // info endpoint
  app.get("/api/info", (req, res) => {
    res.json({
      name: "ai-study-helper",
      version: "0.1.0"
    });
  });


  // summary + flashcards generation
  app.post("/api/generate", async (req, res) => {

    try {

      const { notes, mode = "summary", language = "English" } = req.body;

      let prompt;

      if (mode === "summary") {
        prompt = `Summarize into short bullet points in ${language}:\n\n${notes}`;
      }

      else if (mode === "flashcards") {
        prompt = buildFlashcardPrompt(notes, language);
      }

      else {
        return res.status(400).json({
          error: "Invalid mode"
        });
      }


      const output = await generateNotes(prompt);


      saveSession({
        notes,
        result: output,
        mode,
        date: new Date(),
      });

      if (mode === "flashcards") {
        const { cards } = parseFlashcardResponse(output);
        return res.json({
          result: output,
          cards,
        });
      }

      res.json({
        result: output
      });

    }

    catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  });

  app.get("/api/history", (req, res) => {
    try {
      const sessions = listSessions();
      res.json({ sessions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/save", (req, res) => {
    try {
      const { notes, result, mode = "summary", title, score } = req.body || {};
      if (typeof notes !== "string" || typeof result !== "string") {
        return res.status(400).json({ error: "notes and result are required strings" });
      }
      saveSession({
        notes,
        result,
        mode,
        title: title || null,
        score: score ?? null,
        date: new Date(),
      });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // routes
  app.use("/api/quiz", quizRoutes);
  app.use("/api/upload", uploadRoutes);


  return app;

}

module.exports = { createApp };