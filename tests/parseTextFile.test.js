const {
  normalizeUploadedText,
  validateUploadBody,
} = require('../src/services/parseTextFile');

describe('parseTextFile', () => {
  describe('normalizeUploadedText', () => {
    it('trims whitespace', () => {
      expect(normalizeUploadedText('  hello  ')).toBe('hello');
    });

    it('strips UTF-8 BOM', () => {
      expect(normalizeUploadedText('\uFEFFhello')).toBe('hello');
    });

    it('normalizes CRLF and CR to LF before trim', () => {
      expect(normalizeUploadedText('a\r\nb\rc')).toBe('a\nb\nc');
    });

    it('throws on non-string', () => {
      expect(() => normalizeUploadedText(null)).toThrow(TypeError);
    });
  });

  describe('validateUploadBody', () => {
    it('accepts valid text', () => {
      const r = validateUploadBody({ text: '  notes  ' });
      expect(r).toEqual({ ok: true, text: 'notes' });
    });

    it('rejects missing body', () => {
      const r = validateUploadBody(null);
      expect(r.ok).toBe(false);
      expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/text/i) });
    });

    it('rejects missing text field', () => {
      const r = validateUploadBody({});
      expect(r.ok).toBe(false);
    });

    it('rejects non-string text', () => {
      const r = validateUploadBody({ text: 123 });
      expect(r.ok).toBe(false);
    });

    it('rejects empty or whitespace-only text', () => {
      expect(validateUploadBody({ text: '' }).ok).toBe(false);
      expect(validateUploadBody({ text: '   \n  ' }).ok).toBe(false);
    });
  });
});
