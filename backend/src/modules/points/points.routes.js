import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as service from './points.service.js';

const router = Router();

// Endpoints deste módulo (ver docs/api.md):
// GET /me, GET /me/points/history
// POST /admin/points/import (multer + csv-parse + withTransaction)
// Exemplo:
// router.get('/admin/exemplo', authenticate, authorize('ADMIN'), async (req, res) => {
//   res.json(await service.listar());
// });

export default router;
