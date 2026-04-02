const {
  extractJsonObject,
  normalizeQuizPayload,
} = require('../src/services/generateQuiz');

describe('generateQuiz helpers', () => {
  it('extractJsonObject strips markdown fences', () => {
    const text = '```json\n{"questions":[]}\n```';
    expect(extractJsonObject(text)).toEqual({ questions: [] });
  });

  it('normalizeQuizPayload assigns stable ids', () => {
    const data = {
      questions: [
        {
          question: 'Q1?',
          options: ['a', 'b', 'c', 'd'],
          correctIndex: 1,
        },
        {
          question: 'Q2?',
          options: ['w', 'x', 'y', 'z'],
          correctIndex: 3,
        },
      ],
    };
    const out = normalizeQuizPayload(data, 2);
    expect(out.questions[0].id).toBe('q-1');
    expect(out.questions[1].id).toBe('q-2');
    expect(out.questions[0].correctIndex).toBe(1);
  });
});
