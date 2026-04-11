const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildQuizGenerationPrompt } = require('../prompts/quizGenerationPrompt');

function extractJsonObject(text) {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const payload = fence ? fence[1].trim() : trimmed;
  const start = payload.indexOf('{');
  const end = payload.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model response');
  }
  return JSON.parse(payload.slice(start, end + 1));
}

function normalizeQuestion(q, index) {
  const id = `q-${index + 1}`;
  const question = typeof q.question === 'string' ? q.question.trim() : '';
  const options = Array.isArray(q.options) ? q.options.map((o) => String(o).trim()) : [];
  const correctIndex = Number.isInteger(q.correctIndex) ? q.correctIndex : parseInt(q.correctIndex, 10);

  if (!question || options.length !== 4 || options.some((o) => !o)) {
    throw new Error('Invalid question shape');
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    throw new Error('Invalid correctIndex');
  }

  const explanation =
    typeof q.explanation === 'string' && q.explanation.trim()
      ? q.explanation.trim()
      : 'The correct option matches the topic and eliminates the distractors.';

  return { id, question, options, correctIndex, explanation };
}

function normalizeQuizPayload(data, expectedCount) {
  if (!data || !Array.isArray(data.questions)) {
    throw new Error('Missing questions array');
  }
  if (data.questions.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} questions, got ${data.questions.length}`);
  }
  const questions = data.questions.map((q, i) => normalizeQuestion(q, i));
  return { questions };
}

function buildFallbackQuiz(topic, questionCount) {
  const n = Math.min(Math.max(questionCount, 1), 20);
  const questions = [];
  for (let i = 0; i < n; i += 1) {
    questions.push({
      id: `q-${i + 1}`,
      question: `Review: which statement best relates to "${topic}" for question ${i + 1}?`,
      options: [
        'A core concept worth memorizing',
        'An unrelated historical date',
        'A common misconception to avoid',
        'A trick option with no clear link',
      ],
      correctIndex: 0,
      explanation: 'Option A states the main idea you should retain for this topic.',
    });
  }
  return { questions };
}

async function generateWithGemini({ topic, material, questionCount, apiKey }) {
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = buildQuizGenerationPrompt({ topic, material, questionCount });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const data = extractJsonObject(text);
  return normalizeQuizPayload(data, questionCount);
}

/**
 * Generate quiz questions. Uses Gemini when GEMINI_API_KEY is set; otherwise a local fallback (CI / dev).
 */
async function generateQuiz({ topic, material = '', questionCount = 5 }) {
  const n = Math.min(Math.max(Math.trunc(Number(questionCount)) || 5, 1), 20);
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return buildFallbackQuiz(topic, n);
  }

  try {
    return await generateWithGemini({
      topic,
      material,
      questionCount: n,
      apiKey: key,
    });
  } catch (err) {
    const wrapped = new Error('Gemini quiz generation failed');
    wrapped.cause = err;
    throw wrapped;
  }
}

module.exports = {
  generateQuiz,
  buildFallbackQuiz,
  normalizeQuizPayload,
  extractJsonObject,
};
