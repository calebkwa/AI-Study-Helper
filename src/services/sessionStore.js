const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const FILE = path.join(__dirname, '../../sessions.json');

function readSessions() {
  if (!fs.existsSync(FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * @param {{ notes: string, result: string, mode?: string, title?: string | null, score?: string | null, date?: Date, id?: string }} data
 */
function saveSession(data) {
  const sessions = readSessions();
  sessions.push({
    id: data.id || randomUUID(),
    notes: data.notes,
    result: data.result,
    mode: data.mode || 'summary',
    title: data.title || null,
    score: data.score ?? null,
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
  });
  fs.writeFileSync(FILE, JSON.stringify(sessions, null, 2));
}

function listSessions() {
  return [...readSessions()].reverse();
}

module.exports = { saveSession, listSessions };
