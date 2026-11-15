import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as service from './rewards.service.js';

const router = Router();

// Endpoints deste módulo (ver docs/api.md):
// GET /rewards
// GET/POST /admin/rewards, PUT/DELETE /admin/rewards/:id
// Exemplo:
// router.get('/admin/exemplo', authenticate, authorize('ADMIN'), async (req, res) => {
//   res.json(await service.listar());
// });

export default router;
