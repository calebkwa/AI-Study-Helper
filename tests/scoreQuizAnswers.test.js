const { scoreQuizAnswers } = require('../src/services/scoreQuizAnswers');

describe('scoreQuizAnswers', () => {
  const key = { 'q-1': 0, 'q-2': 2, 'q-3': 1 };

  it('scores all correct', () => {
    const r = scoreQuizAnswers(key, [
      { questionId: 'q-1', selectedIndex: 0 },
      { questionId: 'q-2', selectedIndex: 2 },
      { questionId: 'q-3', selectedIndex: 1 },
    ]);
    expect(r.correct).toBe(3);
    expect(r.total).toBe(3);
    expect(r.percentage).toBe(100);
    expect(r.details.every((d) => d.isCorrect)).toBe(true);
  });

  it('counts wrong and missing answers', () => {
    const r = scoreQuizAnswers(key, [
      { questionId: 'q-1', selectedIndex: 1 },
      { questionId: 'q-2', selectedIndex: 2 },
    ]);
    expect(r.correct).toBe(1);
    expect(r.total).toBe(3);
    expect(r.percentage).toBe(33);
    const d3 = r.details.find((d) => d.questionId === 'q-3');
    expect(d3.isCorrect).toBe(false);
    expect(d3.selectedIndex).toBeNull();
  });

  it('coerces string selectedIndex', () => {
    const r = scoreQuizAnswers({ 'q-1': 2 }, [{ questionId: 'q-1', selectedIndex: '2' }]);
    expect(r.correct).toBe(1);
    expect(r.percentage).toBe(100);
  });

  it('treats out-of-range index as incorrect', () => {
    const r = scoreQuizAnswers({ 'q-1': 0 }, [{ questionId: 'q-1', selectedIndex: 9 }]);
    expect(r.correct).toBe(0);
    expect(r.details[0].selectedIndex).toBeNull();
  });

  it('returns zero total for empty key', () => {
    const r = scoreQuizAnswers({}, []);
    expect(r.total).toBe(0);
    expect(r.percentage).toBe(0);
  });
});
