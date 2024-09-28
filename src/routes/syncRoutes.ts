import { Router } from 'express';
import { body } from 'express-validator';
import { SyncController } from '../controllers/SyncController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/sync/user:
 *   post:
 *     summary: Sincronizar datos del usuario
 *     security:
 *       - bearerAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sincronización exitosa
 *       401:
 *         description: Error en la autenticación o sincronización
 */
router.post(
    '/user', 
    body('codigo').notEmpty().withMessage('El código no puede estar vacío'),
    body('contrasena').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    authenticate,
    SyncController.syncUserData
);

export default router;
