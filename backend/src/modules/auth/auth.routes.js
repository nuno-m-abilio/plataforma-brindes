import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import * as service from './auth.service.js';

const router = Router();

// Contrato em docs/api.md
router.post('/auth/otp/request', async (req, res) => {
  res.json(await service.requestOtp(req.body?.phone));
});

router.post('/auth/otp/verify', async (req, res) => {
  res.json(await service.verifyOtp(req.body?.phone, req.body?.code));
});

router.post('/auth/admin/login', async (req, res) => {
  res.json(await service.adminLogin(req.body?.email, req.body?.password));
});

router.get('/admin/otp/balance', authenticate, authorize('ADMIN'), async (req, res) => {
  res.json(await service.getOtpBalance());
});

export default router;
