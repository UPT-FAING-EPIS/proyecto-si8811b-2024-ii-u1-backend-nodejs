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
 *                 description: Código del usuario (INTRANET) 
 *                 example: "2016764598"
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario (INTRANET)
 *                 example: "7610832"
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
 *                 description: Código del usuario (INTRANET) 
 *                 example: "2016764598"
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario (INTRANET)
 *                 example: "7610832"
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
 *                       horario:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             horaInicio:
 *                               type: string
 *                               example: "08:00"
 *                             horaFin:
 *                               type: string
 *                               example: "10:00"
 *                             materia:
 *                               type: string
 *                               example: "Matemáticas"
 *                             aula:
 *                               type: string
 *                               example: "A101"
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
 *                 description: Código del usuario (INTRANET) 
 *                 example: "2016764598"
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario (INTRANET)
 *                 example: "7610832"
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
 *                 userCode:
 *                   type: string
 *                   example: "2018062487"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-10-11T13:39:17.983Z"
 *                 attendanceData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       curso:
 *                         type: string
 *                         example: "Asistencia al curso de FILOSOFÍA"
 *                       asistencias:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fecha:
 *                               type: string
 *                               format: date
 *                               example: "04/10/2024"
 *                             dia:
 *                               type: string
 *                               example: "Viernes"
 *                             estado:
 *                               type: string
 *                               example: "Asiste"
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

export default router;
