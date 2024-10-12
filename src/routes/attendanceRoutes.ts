import express from 'express';
import { authenticate } from '../middleware/auth';
import AttendanceController from '../controllers/AttendanceController';

const router = express.Router();

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Obtener las asistencias del usuario autenticado
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de asistencia del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCode:
 *                   type: string
 *                   example: "2018062487"
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
 *                               example: "04/10/2024"
 *                             dia:
 *                               type: string
 *                               example: "Viernes"
 *                             estado:
 *                               type: string
 *                               example: "Asiste"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticate, AttendanceController.getUserAttendance);

export default router;
