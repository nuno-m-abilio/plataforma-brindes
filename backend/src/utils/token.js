import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// role: 'CUSTOMER' ou 'ADMIN'
export function signToken({ id, role }) {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.rules.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
