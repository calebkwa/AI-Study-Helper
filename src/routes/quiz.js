const express = require('express');
const { randomUUID } = require('crypto');
const { generateQuiz } = require('../services/generateQuiz');
const { saveQuizAnswerKey, getQuizAnswerKey, getQuizSession } = require('../services/quizAnswerStore');
const { scoreQuizAnswers } = require('../services/scoreQuizAnswers');

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { topic, material = '', questionCount = 5 } = req.body || {};

  if (typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'topic is required (non-empty string)' });
  }

  const count = Number(questionCount);
  const n = Number.isFinite(count)
    ? Math.min(Math.max(Math.trunc(count), 1), 20)
    : 5;

  try {
    const { questions } = await generateQuiz({
      topic: topic.trim(),
      material: typeof material === 'string' ? material : '',
      questionCount: n,
    });

    const answerKey = Object.fromEntries(
      questions.map((q) => [q.id, q.correctIndex]),
    );
    const explanations = Object.fromEntries(
      questions.map((q) => [q.id, q.explanation || '']),
    );
    const quizId = randomUUID();
    saveQuizAnswerKey(quizId, answerKey, explanations);

    const clientQuestions = questions.map(({ id, question, options }) => ({
      id,
      question,
      options,
    }));

    return res.status(200).json({ quizId, questions: clientQuestions });
  } catch (err) {
    console.error(err);
    return res.status(502).json({
      error: 'Failed to generate quiz',
      message: err.message || 'Unknown error',
    });
  }
});

router.post('/score', (req, res) => {
  const { quizId, answers } = req.body || {};

  if (typeof quizId !== 'string' || !quizId.trim()) {
    return res.status(400).json({ error: 'quizId is required' });
  }
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array' });
  }

  const answerKey = getQuizAnswerKey(quizId.trim());
  if (!answerKey) {
    return res.status(404).json({ error: 'Quiz not found or expired' });
  }

  const invalid = answers.some(
    (a) => !a || typeof a.questionId !== 'string' || !a.questionId.trim(),
  );
  if (invalid) {
    return res.status(400).json({
      error: 'Each answer needs questionId (string)',
    });
  }

  const result = scoreQuizAnswers(answerKey, answers);
  return res.status(200).json({
    quizId: quizId.trim(),
    ...result,
  });
});

router.post('/check', (req, res) => {
  const { quizId, questionId, selectedIndex } = req.body || {};

  if (typeof quizId !== 'string' || !quizId.trim()) {
    return res.status(400).json({ error: 'quizId is required' });
  }
  if (typeof questionId !== 'string' || !questionId.trim()) {
    return res.status(400).json({ error: 'questionId is required' });
  }
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
    return res.status(400).json({ error: 'selectedIndex must be 0–3' });
  }

  const session = getQuizSession(quizId.trim());
  if (!session) {
    return res.status(404).json({ error: 'Quiz not found or expired' });
  }

  const correctIndex = session.answerKey[questionId];
  if (correctIndex === undefined) {
    return res.status(400).json({ error: 'Unknown question' });
  }

  const correct = correctIndex === selectedIndex;
  const explanation = session.explanations[questionId] || '';

  return res.status(200).json({
    correct,
    explanation,
    correctIndex,
  });
});

module.exports = router;
