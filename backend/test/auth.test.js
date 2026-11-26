// Testes de integração do módulo auth. Usam o banco do .env com os dados do seed
// (rode `npm run db:setup` antes) e exigem DEV_SHOW_OTP=true.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { pool } from '../src/db.js';

const MARIA = '5544999990001';
const JOAO = '5544999990002';
const ANA = '5544999990003';
let server;
let base;

async function post(path, body, token) {
  const res = await fetch(`${base}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function get(path, token) {
  const res = await fetch(`${base}/api${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return { status: res.status, body: await res.json() };
}

// Limpa os códigos dos clientes de teste para o limite de pedidos não travar novas execuções.
const clearOtps = () => pool.query(
  'DELETE o FROM otp_codes o JOIN customers c ON c.id = o.customer_id WHERE c.phone IN (?, ?, ?)',
  [MARIA, JOAO, ANA]
);

before(async () => {
  await clearOtps();
  server = app.listen(0);
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  await clearOtps();
  server.close();
  await pool.end();
});

test('telefone fora da base: 404 PHONE_NOT_FOUND', async () => {
  const r = await post('/auth/otp/request', { phone: '5511900000000' });
  assert.equal(r.status, 404);
  assert.equal(r.body.error.code, 'PHONE_NOT_FOUND');
});

test('telefone mal formatado: 400 INVALID_PHONE', async () => {
  const r = await post('/auth/otp/request', { phone: '123' });
  assert.equal(r.status, 400);
  assert.equal(r.body.error.code, 'INVALID_PHONE');
});

test('pedir e validar código devolve token de cliente; o código não serve duas vezes', async () => {
  const req = await post('/auth/otp/request', { phone: '+55 (44) 99999-0001' }); // normaliza
  assert.equal(req.status, 200);
  assert.match(req.body.devCode, /^\d{6}$/);

  const ok = await post('/auth/otp/verify', { phone: MARIA, code: req.body.devCode });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.role, 'CUSTOMER');
  assert.ok(ok.body.token);

  const again = await post('/auth/otp/verify', { phone: MARIA, code: req.body.devCode });
  assert.equal(again.status, 400);
  assert.equal(again.body.error.code, 'OTP_INVALID');

  const balance = await get('/admin/otp/balance', ok.body.token);
  assert.equal(balance.status, 403);
});

test('3 códigos errados bloqueiam o código, mesmo que o certo venha depois', async () => {
  const req = await post('/auth/otp/request', { phone: JOAO });
  const wrong = req.body.devCode === '000000' ? '111111' : '000000';
  for (let i = 0; i < 3; i++) {
    const r = await post('/auth/otp/verify', { phone: JOAO, code: wrong });
    assert.equal(r.body.error.code, 'OTP_INVALID');
  }
  const blocked = await post('/auth/otp/verify', { phone: JOAO, code: req.body.devCode });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.error.code, 'OTP_BLOCKED');
});

test('4º pedido de código em 10 minutos: 429 OTP_RATE_LIMIT', async () => {
  for (let i = 0; i < 3; i++) {
    assert.equal((await post('/auth/otp/request', { phone: ANA })).status, 200);
  }
  const r = await post('/auth/otp/request', { phone: ANA });
  assert.equal(r.status, 429);
  assert.equal(r.body.error.code, 'OTP_RATE_LIMIT');
});

test('login do admin: senha errada e e-mail inexistente dão o mesmo erro; senha certa dá token', async () => {
  const wrongPass = await post('/auth/admin/login', { email: 'admin@brindes.local', password: 'errada' });
  const noEmail = await post('/auth/admin/login', { email: 'ninguem@brindes.local', password: 'errada' });
  assert.equal(wrongPass.status, 401);
  assert.deepEqual(wrongPass.body, noEmail.body);

  const ok = await post('/auth/admin/login', {
    email: 'admin@brindes.local',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.role, 'ADMIN');

  const balance = await get('/admin/otp/balance', ok.body.token);
  assert.equal(balance.status, 200);
  assert.equal(balance.body.remaining, balance.body.total - balance.body.used);
  assert.equal(typeof balance.body.alert, 'boolean');
});
