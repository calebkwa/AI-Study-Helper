const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { createApp } = require('../src/app');

const SESSION_FILE = path.join(__dirname, '../sessions.json');

describe('GET /api/history', () => {
  const app = createApp();
  let backup;

  beforeAll(() => {
    if (fs.existsSync(SESSION_FILE)) {
      backup = fs.readFileSync(SESSION_FILE, 'utf8');
    }
  });

  afterAll(() => {
    if (backup !== undefined) {
      fs.writeFileSync(SESSION_FILE, backup);
    } else if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  });

  it('returns sessions array', async () => {
    fs.writeFileSync(
      SESSION_FILE,
      JSON.stringify([
        {
          id: 'test-id',
          notes: 'hello',
          result: 'world',
          mode: 'summary',
          title: null,
          score: null,
          date: new Date().toISOString(),
        },
      ]),
    );

    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
    expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);
  });
});
