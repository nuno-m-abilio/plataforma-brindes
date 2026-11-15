import { pool } from '../db.js';

// Simulação: grava o e-mail na tabela email_log e imprime no terminal.
export async function sendMail({ redemptionId = null, to, subject, body }) {
  await pool.query(
    'INSERT INTO email_log (redemption_id, to_email, subject, body) VALUES (?, ?, ?, ?)',
    [redemptionId, to, subject, body]
  );
  console.log(`[E-mail simulado] para ${to}: ${subject}`);
}
