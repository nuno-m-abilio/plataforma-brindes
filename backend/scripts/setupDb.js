// Recria o banco do zero: schema.sql + seed.sql + admin com senha em hash.
// ATENÇÃO: apaga o banco "brindes" existente. Uso: npm run db:setup
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { config } from '../src/config.js';

const dir = path.join(import.meta.dirname, '../database');
const schemaPath = path.join(dir, 'schema.sql');
const seedPath = path.join(dir, 'seed.sql');

if (!fs.existsSync(schemaPath) || fs.readFileSync(schemaPath, 'utf8').trim() === '') {
  console.error('backend/database/schema.sql não existe ou está vazio. Cole o schema antes.');
  process.exit(1);
}

const { database, ...connection } = config.db;
const conn = await mysql.createConnection({ ...connection, multipleStatements: true });

try {
  console.log('Criando tabelas...');
  await conn.query(fs.readFileSync(schemaPath, 'utf8'));

  console.log('Carregando dados de teste...');
  await conn.query(fs.readFileSync(seedPath, 'utf8'));

  console.log('Criando administrador...');
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await conn.query(
    'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
    ['Administrador', 'admin@brindes.local', hash]
  );

  console.log('Banco pronto: admin@brindes.local');
} catch (err) {
  console.error('Falha no setup do banco:', err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
