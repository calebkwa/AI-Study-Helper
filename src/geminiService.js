const axios = require("axios");

const API_KEY = process.env.GEMINI_API_KEY;

// Models to try
const MODELS = ["gemini-2.5-flash"];

async function callGemini(model, notes) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      contents: [
        {
          parts: [
            { text: `Summarize this into SHORT bullet point study notes (max 5-6 points):\n\n${notes}` }
          ]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      }
    }
  );

  const candidate = response.data.candidates?.[0];
  return candidate?.content?.parts?.[0]?.text || "No text returned";
}

async function generateNotes(notes, retries = 3) {
  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      return await callGemini(model, notes);
    } catch (error) {
      const status = error.response?.status;

      if (status === 503 && retries > 0) {
        console.warn(`${model} busy, retrying...`);
        await new Promise(res => setTimeout(res, 2000));
        return generateNotes(notes, retries - 1);
      }

      if (status === 429) {
        console.warn(`Rate limit hit on ${model}, trying next...`);
        continue;
      }

      if (status === 404) {
        console.warn(`${model} not found, trying next...`);
        continue;
      }

      console.error("REAL ERROR:", error.response?.data || error.message);
    }
  }

  // If all models fail, return a safe fallback message
  return "Gemini is currently unavailable. Please try again later.";
}

module.exports = generateNotes;
