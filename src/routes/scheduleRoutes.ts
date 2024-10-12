import express from 'express';
import { authenticate } from '../middleware/auth';
import ScheduleController from '../controllers/ScheduleController';

const router = express.Router();

/**
 * @swagger
 * /api/v1/schedule:
 *   get:
 *     summary: Obtener el horario del usuario autenticado
 *     tags:
 *       - Schedule
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de horario del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCode:
 *                   type: string
 *                   example: "2018062487"
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
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticate, ScheduleController.getUserSchedule);

export default router;
