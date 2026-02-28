import Fastify from 'fastify';
import { registerRoutes } from '../routes';

describe('Health Check', () => {
  const app = Fastify();

  beforeAll(async () => {
    await registerRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
