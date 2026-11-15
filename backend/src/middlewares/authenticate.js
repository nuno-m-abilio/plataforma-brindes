import { verifyToken } from '../utils/token.js';
import { AppError } from '../utils/errors.js';

// Exige "Authorization: Bearer <token>". Preenche req.user = { id, role }.
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Token não informado');
  }
  try {
    const { id, role } = verifyToken(token);
    req.user = { id, role };
    next();
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Token inválido ou expirado');
  }
}
