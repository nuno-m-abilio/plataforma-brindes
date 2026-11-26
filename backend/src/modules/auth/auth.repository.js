import { pool } from '../../db.js';

// Único lugar com SQL do módulo auth. Sempre use queries parametrizadas (?).
// Funções que recebem `conn` rodam dentro de withTransaction.

export async function findActiveCustomerByPhone(phone) {
  const [rows] = await pool.query(
    'SELECT id FROM customers WHERE phone = ? AND active = 1',
    [phone]
  );
  return rows[0];
}

export async function countRecentOtps(customerId, minutes) {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS total FROM otp_codes WHERE customer_id = ? AND created_at > NOW() - INTERVAL ? MINUTE',
    [customerId, minutes]
  );
  return row.total;
}

// Lê total, consumo e limiar de alerta da franquia. Com `conn`, trava as linhas até o commit.
export async function getQuota(conn = pool, { lock = false } = {}) {
  const [rows] = await conn.query(
    `SELECT key_name, CAST(value AS UNSIGNED) AS value FROM settings
      WHERE key_name IN ('otp_quota_total', 'otp_quota_used', 'otp_alert_threshold_pct')
      ${lock ? 'FOR UPDATE' : ''}`
  );
  const get = (key) => Number(rows.find((r) => r.key_name === key)?.value ?? 0);
  return {
    total: get('otp_quota_total'),
    used: get('otp_quota_used'),
    alertPct: get('otp_alert_threshold_pct'),
  };
}

export async function incrementQuotaUsed(conn) {
  await conn.query(
    "UPDATE settings SET value = CAST(value AS UNSIGNED) + 1 WHERE key_name = 'otp_quota_used'"
  );
}

export async function insertOtp(conn, customerId, codeHash, ttlMinutes) {
  await conn.query(
    'INSERT INTO otp_codes (customer_id, code_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL ? MINUTE)',
    [customerId, codeHash, ttlMinutes]
  );
}

export async function findLatestValidOtp(customerId) {
  const [rows] = await pool.query(
    `SELECT id, code_hash AS codeHash, attempts FROM otp_codes
      WHERE customer_id = ? AND used = 0 AND expires_at > NOW()
      ORDER BY id DESC LIMIT 1`,
    [customerId]
  );
  return rows[0];
}

export async function incrementOtpAttempts(otpId) {
  await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [otpId]);
}

// Devolve true só para quem marcou primeiro (dois verifies simultâneos não geram dois logins).
export async function markOtpUsed(otpId) {
  const [result] = await pool.query(
    'UPDATE otp_codes SET used = 1 WHERE id = ? AND used = 0',
    [otpId]
  );
  return result.affectedRows === 1;
}

export async function addQuotaTotal(conn, amount) {
  await conn.query(
    "UPDATE settings SET value = CAST(value AS UNSIGNED) + ? WHERE key_name = 'otp_quota_total'",
    [amount]
  );
}

export async function insertSmsEvent({ type, adminId = null, amount = null, detail = null }, conn = pool) {
  await conn.query(
    'INSERT INTO sms_events (type, admin_id, amount, detail) VALUES (?, ?, ?, ?)',
    [type, adminId, amount, detail?.slice(0, 255) ?? null]
  );
}

export async function listSmsEvents(limit) {
  const [rows] = await pool.query(
    `SELECT e.id, e.type, e.amount, e.detail, e.created_at AS createdAt, a.name AS adminName
       FROM sms_events e LEFT JOIN admins a ON a.id = e.admin_id
      ORDER BY e.id DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function findActiveAdminByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, password_hash AS passwordHash FROM admins WHERE email = ? AND active = 1',
    [email]
  );
  return rows[0];
}
