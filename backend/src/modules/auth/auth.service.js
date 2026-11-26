import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import * as repo from './auth.repository.js';
import { withTransaction } from '../../db.js';
import { config } from '../../config.js';
import { AppError } from '../../utils/errors.js';
import { signToken } from '../../utils/token.js';
import { smsProvider } from '../../providers/index.js';

// Regras de negócio do módulo auth. Não escreva SQL aqui (use o repository).

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

// Comparado quando o e-mail não existe, para a resposta levar o mesmo tempo (não revela e-mails cadastrados).
const DUMMY_HASH = bcrypt.hashSync('senha-que-nunca-confere', 10);

function normalizePhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (!/^[0-9]{10,15}$/.test(digits)) {
    throw new AppError(400, 'INVALID_PHONE', 'Informe o telefone com DDD (somente números).');
  }
  return digits;
}

const invalidCode = () =>
  new AppError(400, 'OTP_INVALID', 'Código inválido ou expirado.');

export async function requestOtp(phone) {
  const normalized = normalizePhone(phone);
  const customer = await repo.findActiveCustomerByPhone(normalized);
  if (!customer) {
    throw new AppError(404, 'PHONE_NOT_FOUND',
      'Número não localizado. Procure uma loja parceira para participar do programa.');
  }

  const { otpRequestLimit, otpRequestWindowMinutes, otpTtlMinutes } = config.rules;
  if (await repo.countRecentOtps(customer.id, otpRequestWindowMinutes) >= otpRequestLimit) {
    throw new AppError(429, 'OTP_RATE_LIMIT',
      `Muitos códigos solicitados. Aguarde ${otpRequestWindowMinutes} minutos e tente novamente.`);
  }

  const code = String(crypto.randomInt(100000, 1000000));

  // Franquia e OTP na mesma transação: com saldo zero nada é gravado nem enviado (RF58).
  const quota = await withTransaction(async (conn) => {
    const q = await repo.getQuota(conn, { lock: true });
    if (q.used >= q.total) {
      throw new AppError(503, 'OTP_QUOTA_EXHAUSTED',
        'No momento não é possível enviar o código. Tente novamente mais tarde.');
    }
    await repo.incrementQuotaUsed(conn);
    await repo.insertOtp(conn, customer.id, sha256(code), otpTtlMinutes);
    return { ...q, used: q.used + 1 };
  });

  const remaining = quota.total - quota.used;
  if (remaining <= quota.total * quota.alertPct / 100) {
    console.warn(`[ALERTA] Franquia de SMS: restam ${remaining} de ${quota.total} disparos.`);
  }

  try {
    await smsProvider.send(normalized, `Seu código da Plataforma de Brindes: ${code}`);
  } catch (err) {
    // shortcut: o crédito já foi consumido e a falha só vai para o log; registrar em tabela (RF59) se o SMS real for implantado.
    console.error('[SMS] Falha no envio:', err);
    throw new AppError(503, 'SMS_UNAVAILABLE',
      'Não foi possível enviar o código agora. Tente novamente mais tarde.');
  }

  return {
    message: 'Código enviado por SMS.',
    ...(config.devShowOtp && { devCode: code }),
  };
}

export async function verifyOtp(phone, code) {
  const normalized = normalizePhone(phone);
  if (!/^[0-9]{6}$/.test(String(code ?? ''))) throw invalidCode();

  const customer = await repo.findActiveCustomerByPhone(normalized);
  const otp = customer && await repo.findLatestValidOtp(customer.id);
  if (!otp) throw invalidCode();

  if (otp.attempts >= config.rules.otpMaxAttempts) {
    throw new AppError(429, 'OTP_BLOCKED', 'Limite de tentativas atingido. Solicite um novo código.');
  }

  const matches = crypto.timingSafeEqual(Buffer.from(sha256(String(code))), Buffer.from(otp.codeHash));
  if (!matches) {
    await repo.incrementOtpAttempts(otp.id);
    throw invalidCode();
  }
  if (!await repo.markOtpUsed(otp.id)) throw invalidCode();

  return { token: signToken({ id: customer.id, role: 'CUSTOMER' }), role: 'CUSTOMER' };
}

export async function adminLogin(email, password) {
  const admin = typeof email === 'string' && await repo.findActiveAdminByEmail(email.trim());
  const ok = await bcrypt.compare(String(password ?? ''), admin ? admin.passwordHash : DUMMY_HASH);
  if (!admin || !ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
  }
  return { token: signToken({ id: admin.id, role: 'ADMIN' }), role: 'ADMIN' };
}

export async function getOtpBalance() {
  const { total, used, alertPct } = await repo.getQuota();
  const remaining = Math.max(total - used, 0);
  return { total, used, remaining, alert: remaining <= total * alertPct / 100 };
}
