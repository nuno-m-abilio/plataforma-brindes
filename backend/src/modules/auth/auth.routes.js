import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as service from './auth.service.js';

const router = Router();

// Endpoints deste módulo (ver docs/api.md):
// POST /auth/otp/request, POST /auth/otp/verify, POST /auth/admin/login
// (a geração de token está pronta em utils/token.js; o SMS em providers/)
// Exemplo:
// router.get('/admin/exemplo', authenticate, authorize('ADMIN'), async (req, res) => {
//   res.json(await service.listar());
// });

export default router;
