/**
 * Strip common markdown from model output so Q:/A: patterns match reliably.
 */
function normalizeFlashcardMarkdown(raw) {
  let t = String(raw ?? '').replace(/\r\n/g, '\n');
  t = t.replace(/^#{1,6}\s*.+$/gm, '');
  t = t.replace(/\*\*/g, '');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

/**
 * Parse flashcard-style Q&A text (e.g. from Gemini) into structured cards.
 *
 * @param {string} text
 * @returns {{ cards: Array<{ question: string, answer: string }> }}
 */
function parseFlashcardResponse(text) {
  const raw = normalizeFlashcardMarkdown(text);
  if (!raw) {
    return { cards: [] };
  }

  const cards = [];

  const blocks = raw.split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i += 1) {
      const qMatch = /^Q(?:uestion)?\s*:\s*(.+)$/i.exec(lines[i]);
      if (qMatch && i + 1 < lines.length) {
        const aMatch = /^A(?:nswer)?\s*:\s*(.+)$/i.exec(lines[i + 1]);
        if (aMatch) {
          cards.push({
            question: qMatch[1].trim(),
            answer: aMatch[1].trim(),
          });
          i += 1;
        }
      }
    }
  }

  if (cards.length > 0) {
    return { cards };
  }

  const allLines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i + 1 < allLines.length; i += 2) {
    cards.push({ question: allLines[i], answer: allLines[i + 1] });
  }

  if (cards.length > 0) {
    return { cards };
  }

  return { cards: [{ question: raw.slice(0, 200), answer: raw.length > 200 ? raw.slice(200) : '—' }] };
}

/**
 * Build the user prompt for flashcard generation (used by API layer).
 */
function buildFlashcardPrompt(notes, language = 'English') {
  return `Convert the notes below into flashcards for study. Write every question and every answer in ${language} only.

Formatting (required for parsing): start each question line with "Q: " and each answer line with "A: " (Latin letters). Put one pair per block, separated by a blank line.

Notes:\n${notes}`;
}

module.exports = {
  parseFlashcardResponse,
  normalizeFlashcardMarkdown,
  buildFlashcardPrompt,
};
