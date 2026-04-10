const DEFAULT_TTL_MS = 60 * 60 * 1000;

const store = new Map();

function saveQuizAnswerKey(quizId, answerKey, ttlMs = DEFAULT_TTL_MS) {
  store.set(quizId, {
    answerKey,
    expiresAt: Date.now() + ttlMs,
  });
}

function getQuizAnswerKey(quizId) {
  const row = store.get(quizId);
  if (!row) {
    return null;
  }
  if (Date.now() > row.expiresAt) {
    store.delete(quizId);
    return null;
  }
  return row.answerKey;
}

/** @internal Test helper */
function clearQuizStore() {
  store.clear();
}

module.exports = {
  saveQuizAnswerKey,
  getQuizAnswerKey,
  clearQuizStore,
};
