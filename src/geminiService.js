const axios = require("axios");

const API_KEY = process.env.GEMINI_API_KEY;

async function generateSummary(notes) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: `Summarize this:\n${notes}` }]
        }
      ]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}

module.exports = { generateSummary };