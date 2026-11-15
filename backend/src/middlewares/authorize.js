import { AppError } from '../utils/errors.js';

// Uso: router.get('/admin/x', authenticate, authorize('ADMIN'), handler)
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Acesso negado');
    }
    next();
  };
}
