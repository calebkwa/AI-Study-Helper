const request = require('supertest');
const { createApp } = require('../src/app');
const { clearQuizStore } = require('../src/services/quizAnswerStore');

describe('Quiz API', () => {
  const app = createApp();
  let savedGeminiKey;

  beforeEach(() => {
    clearQuizStore();
    savedGeminiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (savedGeminiKey !== undefined) {
      process.env.GEMINI_API_KEY = savedGeminiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('POST /api/quiz/generate', () => {
    it('returns 400 when topic is missing', async () => {
      const res = await request(app).post('/api/quiz/generate').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/topic/i);
    });

    it('returns quiz without correct indices (fallback when no API key)', async () => {
      const res = await request(app)
        .post('/api/quiz/generate')
        .send({ topic: 'Photosynthesis', questionCount: 3 });

      expect(res.status).toBe(200);
      expect(res.body.quizId).toBeDefined();
      expect(res.body.questions).toHaveLength(3);
      res.body.questions.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('question');
        expect(q.options).toHaveLength(4);
        expect(q).not.toHaveProperty('correctIndex');
      });
    });
  });

  describe('POST /api/quiz/score', () => {
    it('returns 404 for unknown quizId', async () => {
      const res = await request(app)
        .post('/api/quiz/score')
        .send({ quizId: '00000000-0000-0000-0000-000000000000', answers: [] });
      expect(res.status).toBe(404);
    });

    it('returns 400 when answers is not an array', async () => {
      const res = await request(app)
        .post('/api/quiz/score')
        .send({ quizId: 'x', answers: {} });
      expect(res.status).toBe(400);
    });

    it('scores against server answer key after generate', async () => {
      const gen = await request(app)
        .post('/api/quiz/generate')
        .send({ topic: 'Math', questionCount: 2 });

      expect(gen.status).toBe(200);
      const { quizId, questions } = gen.body;

      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: 0,
      }));

      const score = await request(app)
        .post('/api/quiz/score')
        .send({ quizId, answers });

      expect(score.status).toBe(200);
      expect(score.body.correct).toBe(2);
      expect(score.body.total).toBe(2);
      expect(score.body.percentage).toBe(100);
    });
  });
});
