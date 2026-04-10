/**
 * Compare submitted answers to the server-held answer key.
 * Missing or invalid submissions count as incorrect.
 *
 * @param {Record<string, number>} answerKey questionId -> correctIndex (0–3)
 * @param {Array<{ questionId: string, selectedIndex: number }>} answers
 * @returns {{ correct: number, total: number, percentage: number, details: Array }}
 */
function normalizeSelectedIndex(raw) {
  if (raw === null || raw === undefined) {
    return null;
  }
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  if (!Number.isInteger(n) || n < 0 || n > 3) {
    return null;
  }
  return n;
}

function scoreQuizAnswers(answerKey, answers) {
  const ids = Object.keys(answerKey);
  const total = ids.length;
  const byId = new Map(
    answers.map((a) => [a.questionId, normalizeSelectedIndex(a.selectedIndex)]),
  );

  let correct = 0;
  const details = ids.map((questionId) => {
    const correctIndex = answerKey[questionId];
    const selectedIndex = byId.get(questionId);
    const inRange = selectedIndex !== null && selectedIndex !== undefined;
    const isCorrect = inRange && selectedIndex === correctIndex;
    if (isCorrect) {
      correct += 1;
    }
    return {
      questionId,
      selectedIndex: inRange ? selectedIndex : null,
      correctIndex,
      isCorrect,
    };
  });

  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { correct, total, percentage, details };
}

module.exports = { scoreQuizAnswers };
