const request = require('supertest');
const { createApp } = require('../src/app');

describe('createApp', () => {
  it('exports a factory', () => {
    expect(typeof createApp).toBe('function');
  });

  it('returns an Express app with listen', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});

describe('GET /health', () => {
  const app = createApp();

  it('responds with 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('returns JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.type).toMatch(/json/);
  });

  it('includes status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /', () => {
  const app = createApp();

  it('responds with 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('returns plain text body', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('AI Study Helper');
  });

  it('sets text/html or text/plain content', async () => {
    const res = await request(app).get('/');
    expect(res.text.length).toBeGreaterThan(0);
  });
});

describe('GET /api/info', () => {
  const app = createApp();

  it('responds with 200', async () => {
    const res = await request(app).get('/api/info');
    expect(res.status).toBe(200);
  });

  it('returns JSON', async () => {
    const res = await request(app).get('/api/info');
    expect(res.type).toMatch(/json/);
  });

  it('includes name and version', async () => {
    const res = await request(app).get('/api/info');
    expect(res.body).toMatchObject({
      name: 'ai-study-helper',
      version: '0.1.0',
    });
  });
});

describe('404 handling', () => {
  const app = createApp();

  it('returns 404 for unknown path', async () => {
    const res = await request(app).get('/no-such-route-xyz');
    expect(res.status).toBe(404);
  });
});
