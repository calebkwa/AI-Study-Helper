const {
  parseFlashcardResponse,
  buildFlashcardPrompt,
} = require('../src/services/flashcards');

describe('flashcards module', () => {
  describe('parseFlashcardResponse', () => {
    it('returns empty cards for empty input', () => {
      expect(parseFlashcardResponse('')).toEqual({ cards: [] });
      expect(parseFlashcardResponse('   ')).toEqual({ cards: [] });
      expect(parseFlashcardResponse(null)).toEqual({ cards: [] });
    });

    it('parses Q:/A: blocks separated by blank lines', () => {
      const text = `Q: What is 2+2?
A: Four

Q: Capital of France?
A: Paris`;
      const { cards } = parseFlashcardResponse(text);
      expect(cards).toHaveLength(2);
      expect(cards[0]).toEqual({ question: 'What is 2+2?', answer: 'Four' });
      expect(cards[1]).toEqual({ question: 'Capital of France?', answer: 'Paris' });
    });

    it('parses markdown-style **Q:** / **A:** and headers from model output', () => {
      const text = `### Flashcards (Q&A Format)

**Q:** What are the three practices?
**A:** Continuous Integration, Continuous Delivery, and Continuous Deployment.

**Q:** What is the goal of CI?
**A:** Quick feedback on code integration.`;
      const { cards } = parseFlashcardResponse(text);
      expect(cards.length).toBeGreaterThanOrEqual(2);
      expect(cards[0].question).toContain('three practices');
      expect(cards[0].answer).toContain('Continuous Integration');
      expect(cards[1].question).toContain('goal of CI');
    });

    it('parses Question:/Answer: labels', () => {
      const text = `Question: First?
Answer: One`;
      const { cards } = parseFlashcardResponse(text);
      expect(cards.length).toBeGreaterThanOrEqual(1);
      expect(cards[0].question).toContain('First');
      expect(cards[0].answer).toContain('One');
    });

    it('falls back to alternating lines when no Q/A blocks', () => {
      const text = 'Term one\nDefinition one\nTerm two\nDefinition two';
      const { cards } = parseFlashcardResponse(text);
      expect(cards).toHaveLength(2);
      expect(cards[0]).toEqual({ question: 'Term one', answer: 'Definition one' });
      expect(cards[1]).toEqual({ question: 'Term two', answer: 'Definition two' });
    });

    it('uses single-card fallback for unstructured single line', () => {
      const { cards } = parseFlashcardResponse('only one line');
      expect(cards).toHaveLength(1);
      expect(cards[0].question).toBe('only one line');
    });
  });

  describe('buildFlashcardPrompt', () => {
    it('includes language and notes', () => {
      const p = buildFlashcardPrompt('my notes here', 'French');
      expect(p).toContain('French');
      expect(p).toContain('my notes here');
      expect(p).toContain('flashcards');
    });

    it('defaults language to English', () => {
      expect(buildFlashcardPrompt('x')).toContain('English');
    });
  });
});
