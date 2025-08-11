const request = require('supertest');
const app = require('../app');

describe('Guestbook API', () => {
  it('GET /api/messages returns array', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/messages validates input', async () => {
    const res = await request(app).post('/api/messages').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/messages creates item', async () => {
    const res = await request(app).post('/api/messages').send({ name: 'A', message: 'Hi' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('PUT /api/messages/:id updates item (happy path)', async () => {
    const created = await request(app).post('/api/messages').send({ name: 'B', message: 'Yo' });
    const id = created.body.id;
    const updated = await request(app).put('/api/messages/' + id).send({ name: 'B2', message: 'Yo2' });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.name).toBe('B2');
  });

  it('DELETE /api/messages/:id removes item', async () => {
    const created = await request(app).post('/api/messages').send({ name: 'C', message: 'Bye' });
    const id = created.body.id;
    const del = await request(app).delete('/api/messages/' + id);
    expect(del.statusCode).toBe(204);
  });
});
