const request = require('supertest');
const { createApp } = require('../src/app');

describe('POST /api/upload', () => {
  const app = createApp();

  it('returns 400 when text is missing', async () => {
    const res = await request(app).post('/api/upload').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns parsed text when valid', async () => {
    const res = await request(app)
      .post('/api/upload')
      .send({ text: '\uFEFF  hello world  \r\n' });
    expect(res.status).toBe(200);
    expect(res.body.parsedText).toBe('hello world');
    expect(res.body.message).toMatch(/success/i);
  });
});
