import 'dotenv/config';

for (const key of ['DB_USER', 'DB_NAME', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Variável ${key} ausente no backend/.env`);
    process.exit(1);
  }
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
  devShowOtp: process.env.DEV_SHOW_OTP === 'true',
  // Regras de negócio parametrizadas (não espalhar números pelo código)
  rules: {
    brlPerPoint: 100,        // 1 ponto a cada R$ 100,00
    otpTtlMinutes: 5,
    otpMaxAttempts: 3,
    jwtExpiresIn: '2h',
    pickupDeadlineDays: 30,
  },
};
