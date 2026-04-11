/**
 * Normalize raw string from a .txt upload (BOM, newlines).
 * @param {string} raw
 * @returns {string}
 */
function normalizeUploadedText(raw) {
  if (typeof raw !== 'string') {
    throw new TypeError('Expected string');
  }
  let s = raw.replace(/^\uFEFF/, '');
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return s.trim();
}

/**
 * Validate POST /api/upload JSON body and return normalized text or an error message.
 * @param {unknown} body
 * @returns {{ ok: true, text: string } | { ok: false, error: string }}
 */
function validateUploadBody(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'No text content provided' };
  }
  const text = body.text;
  if (typeof text !== 'string') {
    return { ok: false, error: 'No text content provided' };
  }
  try {
    const normalized = normalizeUploadedText(text);
    if (!normalized.length) {
      return { ok: false, error: 'No text content provided' };
    }
    return { ok: true, text: normalized };
  } catch {
    return { ok: false, error: 'No text content provided' };
  }
}

module.exports = {
  normalizeUploadedText,
  validateUploadBody,
};
