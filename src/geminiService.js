const API_KEY = process.env.GEMINI_API_KEY;

const MODELS = ['gemini-2.5-flash'];

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function callGemini(model, notes) {
  const body = {
    contents: [
      {
        parts: [
          {
            text: `Summarize this into SHORT bullet point study notes (max 5-6 points):\n\n${notes}`,
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

async function generateNotes(notes, retries = 3) {
  if (!API_KEY) {
    return 'Gemini is currently unavailable. Please try again later.';
  }

  for (const model of MODELS) {
    try {
      return await callGemini(model, notes);
    } catch (error) {
      const status = error.response?.status;

      if (status === 503 && retries > 0) {
        await new Promise((r) => setTimeout(r, 2000));
        return generateNotes(notes, retries - 1);
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
