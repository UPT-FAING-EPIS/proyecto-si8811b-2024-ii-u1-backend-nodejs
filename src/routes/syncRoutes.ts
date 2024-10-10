import { Router } from 'express';
import { body } from 'express-validator';
import { SyncController } from '../controllers/SyncController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/sync/data:
 *   post:
 *     summary: Sincronizar datos del usuario
 *     tags:
 *       - Sync
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
    '/data', 
    body('codigo').notEmpty().withMessage('El código no puede estar vacío'),
    body('contrasena').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    authenticate,
    SyncController.syncUserData
);

/**
 * @swagger
 * /api/v1/sync/schedule:
 *   post:
 *     summary: Sincronizar y obtener el horario del usuario
 *     tags:
 *       - Sync
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
 *                 description: Código del usuario
 *                 example: "123456"
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Sincronización de horario exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sincronización de horario exitosa"
 *                 schedule:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       dia:
 *                         type: string
 *                         example: "Lunes"
 *                       horaInicio:
 *                         type: string
 *                         example: "08:00"
 *                       horaFin:
 *                         type: string
 *                         example: "10:00"
 *                       materia:
 *                         type: string
 *                         example: "Matemáticas"
 *                       aula:
 *                         type: string
 *                         example: "A101"
 *       401:
 *         description: Error en la autenticación o sincronización del horario
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/schedule',
    body('codigo').notEmpty().withMessage('El código no puede estar vacío'),
    body('contrasena').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    authenticate,
    SyncController.syncUserSchedule
);

/**
 * @swagger
 * /api/v1/sync/attendance:
 *   post:
 *     summary: Sincronizar y obtener las asistencias del usuario
 *     tags:
 *       - Sync
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
 *                 description: Código del usuario
 *                 example: "123456"
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Sincronización de asistencias exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sincronización de asistencias exitosa"
 *                 attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fecha:
 *                         type: string
 *                         example: "2023-10-12"
 *                       presente:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Error en la autenticación o sincronización de asistencias
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/attendance',
    body('codigo').notEmpty().withMessage('El código no puede estar vacío'),
    body('contrasena').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    authenticate,
    SyncController.syncUserAttendance
);

/**
 * @swagger
 * /api/v1/sync/credits:
 *   post:
 *     summary: Sincronizar y obtener los créditos acumulados del usuario
 *     tags:
 *       - Sync
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
 *                 description: Código del usuario
 *                 example: "123456"
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Sincronización de créditos exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sincronización de créditos exitosa"
 *                 credits:
 *                   type: integer
 *                   example: 120
 *       401:
 *         description: Error en la autenticación o sincronización de créditos
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/credits',
    body('codigo').notEmpty().withMessage('El código no puede estar vacío'),
    body('contrasena').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    authenticate,
    SyncController.syncUserCredits
);

export default router;
