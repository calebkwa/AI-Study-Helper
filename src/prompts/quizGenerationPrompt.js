/**
 * System + user instructions for Gemini to return strict JSON quiz shape.
 */
function buildQuizGenerationPrompt({ topic, material, questionCount }) {
  const n = questionCount;
  const contextBlock = material.trim()
    ? `Study material / notes (use only as source when relevant):\n${material.trim()}\n\n`
    : '';

  return `${contextBlock}You are an educational assistant. Create exactly ${n} distinct multiple-choice quiz questions about this topic:

Topic: ${topic.trim()}

Requirements:
- Each question has exactly 4 answer options (short phrases, no "A)" prefixes).
- Exactly one option is correct; distractors must be plausible.
- Vary difficulty slightly across questions when ${n} > 1.
- Questions must be factual and self-contained.

Output rules (critical):
- Respond with ONLY valid JSON. No markdown, no code fences, no commentary.
- Use this exact JSON shape:
{"questions":[{"question":"string","options":["string","string","string","string"],"correctIndex":0,"explanation":"one short sentence why the correct option is right"}]}
- correctIndex is an integer from 0 to 3 (index into options).
- explanation must be a non-empty string for each question.
- The "questions" array length must be exactly ${n}.`;
}

module.exports = { buildQuizGenerationPrompt };
