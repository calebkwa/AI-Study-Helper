const DEFAULT_TTL_MS = 60 * 60 * 1000;

const store = new Map();

/**
 * @param {Record<string, number>} answerKey
 * @param {Record<string, string>} [explanations] questionId -> explanation text
 */
function saveQuizAnswerKey(quizId, answerKey, explanations = {}, ttlMs = DEFAULT_TTL_MS) {
  store.set(quizId, {
    answerKey,
    explanations,
    expiresAt: Date.now() + ttlMs,
  });
}

function getQuizSession(quizId) {
  const row = store.get(quizId);
  if (!row) {
    return null;
  }
  if (Date.now() > row.expiresAt) {
    store.delete(quizId);
    return null;
  }
  return {
    answerKey: row.answerKey,
    explanations: row.explanations || {},
  };
}

function getQuizAnswerKey(quizId) {
  const s = getQuizSession(quizId);
  return s ? s.answerKey : null;
}

function clearQuizStore() {
  store.clear();
}

module.exports = {
  saveQuizAnswerKey,
  getQuizAnswerKey,
  getQuizSession,
  clearQuizStore,
};
