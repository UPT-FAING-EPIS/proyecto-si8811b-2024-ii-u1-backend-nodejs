import { Router } from 'express';
import { syncUserData } from '../controllers/SyncController';

const router = Router();

// Definir la ruta POST para sincronización de usuario
router.post('/sync', syncUserData);

export default router;
