import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as service from './redemptions.service.js';

const router = Router();

// Endpoints deste módulo (ver docs/api.md):
// POST /redemptions, GET /me/redemptions
// GET /admin/redemptions, PATCH /admin/redemptions/:id/status
// Exemplo:
// router.get('/admin/exemplo', authenticate, authorize('ADMIN'), async (req, res) => {
//   res.json(await service.listar());
// });

export default router;
