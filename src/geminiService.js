const API_KEY = process.env.GEMINI_API_KEY;

const MODELS = ['gemini-2.5-flash'];

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function callGemini(model, prompt) {
  const body = {
    contents: [
      {
        parts: [
          {
            // Prompt is already fully specified by the caller (summary, flashcards, etc.).
            text: prompt,
          },
        ],
      },
    ],
  };

  const response = await fetch(geminiUrl(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(`Gemini HTTP ${response.status}`);
    err.response = { status: response.status, data };
    throw err;
  }

  const candidate = data.candidates?.[0];
  return candidate?.content?.parts?.[0]?.text || 'No text returned';
}

async function generateNotes(prompt, retries = 3) {
  if (!API_KEY) {
    return 'Gemini is currently unavailable. Please try again later.';
  }

  for (const model of MODELS) {
    try {
      return await callGemini(model, prompt);
    } catch (error) {
      const status = error.response?.status;

      if (status === 503 && retries > 0) {
        await new Promise((r) => setTimeout(r, 2000));
        return generateNotes(prompt, retries - 1);
      }

      if (status === 429) {
        continue;
      }

      if (status === 404) {
        continue;
      }

      console.error('Gemini error:', error.response?.data || error.message);
    }
  }

  return 'Gemini is currently unavailable. Please try again later.';
}

module.exports = generateNotes;
