/**
 * End-to-end API checks.
 *
 * Weather tests call the live Open-Meteo API, so they need internet access.
 * Auth tests need MongoDB. Each group skips itself with a clear message when
 * its dependency is missing, so `npm test` never fails for the wrong reason.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const env = require('../config/env');

jest.setTimeout(45000);

const BELLARY = { lat: 15.1394, lon: 76.9214 };
let online = false;

beforeAll(async () => {
  try {
    const res = await request(app).get(`/api/weather/current?lat=${BELLARY.lat}&lon=${BELLARY.lon}`);
    online = res.status === 200;
  } catch {
    online = false;
  }
  if (!online) console.warn('Skipping live weather tests: Open-Meteo is not reachable from this machine.');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('service health', () => {
  test('GET /api/health responds', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.checks).toBeDefined();
  });

  test('unknown routes return a clean 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('weather endpoints', () => {
  test('current weather returns real values', async () => {
    if (!online) return;
    const res = await request(app).get(`/api/weather/current?lat=${BELLARY.lat}&lon=${BELLARY.lon}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.temperature).toBe('number');
    expect(res.body.data.source.name).toBe('Open-Meteo');
  });

  test('hourly forecast returns up to 24 entries', async () => {
    if (!online) return;
    const res = await request(app).get(`/api/weather/hourly?lat=${BELLARY.lat}&lon=${BELLARY.lon}&hours=24`);
    expect(res.status).toBe(200);
    expect(res.body.data.hours.length).toBeGreaterThan(0);
    expect(res.body.data.hours.length).toBeLessThanOrEqual(24);
  });

  test('daily forecast returns 7 days', async () => {
    if (!online) return;
    const res = await request(app).get(`/api/weather/daily?lat=${BELLARY.lat}&lon=${BELLARY.lon}&days=7`);
    expect(res.status).toBe(200);
    expect(res.body.data.days.length).toBe(7);
  });

  test('missing coordinates give a helpful 400', async () => {
    const res = await request(app).get('/api/weather/current');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/lat/i);
  });

  test('out-of-range coordinates are rejected', async () => {
    const res = await request(app).get('/api/weather/current?lat=999&lon=999');
    expect(res.status).toBe(400);
  });
});

describe('location search', () => {
  test('finds Bellary', async () => {
    if (!online) return;
    const res = await request(app).get('/api/location/search?q=Bellary');
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0]).toHaveProperty('latitude');
  });

  test('a nonsense place returns an empty list, not invented coordinates', async () => {
    if (!online) return;
    const res = await request(app).get('/api/location/search?q=zzxqwertyplace');
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBe(0);
  });

  test('a one character query is rejected', async () => {
    const res = await request(app).get('/api/location/search?q=a');
    expect(res.status).toBe(400);
  });
});

describe('risk endpoint', () => {
  test('analyses supplied values without calling any API', async () => {
    const res = await request(app)
      .post('/api/risk/analyze')
      .send({ weather: { maxTemp: 42, rainProbability: 10, windGusts: 20 } });
    expect(res.status).toBe(200);
    expect(res.body.data.level).toBe('HIGH');
    expect(res.body.data.source).toBe('WeatherGPT Risk Assessment');
  });
});

describe('chat endpoint', () => {
  test('rejects an empty question', async () => {
    const res = await request(app).post('/api/chat').send({ message: '   ' });
    expect(res.status).toBe(400);
  });

  test('answers a weather question with grounded data', async () => {
    if (!online) return;
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Will it rain tomorrow evening?', location: { name: 'Bellary', latitude: BELLARY.lat, longitude: BELLARY.lon } });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.answer).toBe('string');
    expect(res.body.data.sources.length).toBeGreaterThan(0);
    if (res.body.data.risk) expect(res.body.data.risk.label).toBe('WeatherGPT Risk Assessment');
  });
});

describe('protected routes', () => {
  test('the dashboard profile endpoint needs a token', async () => {
    const res = await request(app).get('/api/user/profile');
    expect([401, 503]).toContain(res.status);
  });

  test('a forged token is rejected', async () => {
    const res = await request(app).get('/api/user/profile').set('Authorization', 'Bearer not.a.real.token');
    expect([401, 503]).toContain(res.status);
  });
});

describe('authentication flow (needs MongoDB)', () => {
  const email = `test.${Date.now()}@weathergpt.local`;
  const password = 'Monsoon2026';
  let token = null;
  let dbReady = false;

  beforeAll(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
      }
      dbReady = mongoose.connection.readyState === 1;
    } catch {
      dbReady = false;
      console.warn('Skipping auth tests: MongoDB is not reachable. Set MONGODB_URI in backend/.env.');
    }
  });

  test('registers a new account', async () => {
    if (!dbReady) return;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password, confirmPassword: password, preferredLanguage: 'en' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    token = res.body.token;
  });

  test('rejects a weak password', async () => {
    if (!dbReady) return;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak', email: `weak.${Date.now()}@weathergpt.local`, password: 'abc', confirmPassword: 'abc' });
    expect(res.status).toBe(400);
  });

  test('rejects a duplicate email', async () => {
    if (!dbReady) return;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Copy', email, password, confirmPassword: password });
    expect(res.status).toBe(409);
  });

  test('signs in with the right password', async () => {
    if (!dbReady) return;
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('refuses the wrong password', async () => {
    if (!dbReady) return;
    const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass123' });
    expect(res.status).toBe(401);
  });

  test('returns the signed-in user', async () => {
    if (!dbReady || !token) return;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  test('saves and deletes a location', async () => {
    if (!dbReady || !token) return;
    const add = await request(app)
      .post('/api/user/locations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'College', city: 'Bellary', state: 'Karnataka', country: 'India', latitude: BELLARY.lat, longitude: BELLARY.lon });
    expect(add.status).toBe(201);

    const list = await request(app).get('/api/user/locations').set('Authorization', `Bearer ${token}`);
    expect(list.body.locations.length).toBeGreaterThan(0);

    const del = await request(app)
      .delete(`/api/user/locations/${add.body.location.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  test('forgot password never reveals whether the account exists', async () => {
    if (!dbReady) return;
    const known = await request(app).post('/api/auth/forgot-password').send({ email });
    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@weathergpt.local' });
    expect(known.body.message).toBe(unknown.body.message);
  });

  test('reset password works with a fresh token and then stops working', async () => {
    if (!dbReady) return;
    const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
    const devToken = forgot.body.dev?.token;
    if (!devToken) return; // EXPOSE_DEV_TOKENS is off
    const newPassword = 'Cyclone2026';

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: devToken, password: newPassword, confirmPassword: newPassword });
    expect(reset.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email, password: newPassword });
    expect(login.status).toBe(200);

    const reuse = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: devToken, password: newPassword, confirmPassword: newPassword });
    expect(reuse.status).toBe(400);
  });

  test('an invalid reset token is refused', async () => {
    if (!dbReady) return;
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid-token', password: 'Monsoon2026', confirmPassword: 'Monsoon2026' });
    expect(res.status).toBe(400);
  });
});
