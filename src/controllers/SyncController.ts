import { Request, Response } from 'express';
import { autenticar, autenticarYExtraerAsistencias, autenticarYExtraerHorario } from '../services/intranetSync';
import logger from '../logs/logger';  
import Attendance from '../models/Attendace';
import Schedule from '../models/Schedule';

export class SyncController {

    static syncUserData = async (req: Request, res: Response) => {
        const { codigo, contrasena } = req.body;

        try {
            logger.info(`Starting sync for user with code: ${codigo}`);
            
            const result = await autenticar(codigo, contrasena);

            if (result) {
                const { cookies, page } = result; 
                const currentURL = page.url();

                logger.info(`Sync successful for user with code: ${codigo}`);
                return res.status(200).json({
                    message: 'Sincronización exitosa',
                    cookies,
                    currentURL,
                });
            } else {
                logger.warn(`Sync failed for user with code: ${codigo}`);
                return res.status(401).json({ message: 'Error en la autenticación o sincronización' });
            }
        } catch (error) {
            logger.error(`Error during sync for user with code: ${codigo}`, error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    static syncUserSchedule = async (req: Request, res: Response) => {
        const { codigo, contrasena } = req.body;
        const userId = req.user._id; // Asumiendo que tienes middleware de autenticación

        try {
            logger.info(`Iniciando sincronización de horario para el usuario con código: ${codigo}`);
            const result = await autenticarYExtraerHorario(codigo, contrasena);

            if (result && result.horarios) {
                // Procesar los datos del horario para asegurar que estén en el formato correcto
                const processedScheduleData = result.horarios.map(course => ({
                    ...course,
                    schedule: Object.fromEntries(
                        Object.entries(course.schedule).map(([day, slots]) => [
                            day,
                            Array.isArray(slots) ? slots : [slots]
                        ])
                    )
                }));

                const scheduleRecord = new Schedule({
                    userCode: codigo,
                    userId,
                    scheduleData: processedScheduleData,
                    timestamp: new Date(),
                });

                const saveResult = await scheduleRecord.save();

                if (saveResult) {
                    logger.info(`Sincronización y guardado de horario exitoso para el usuario con código: ${codigo}`);
                    return res.status(200).json({
                        message: 'Sincronización de horario exitosa y guardada en la base de datos',
                        userCode: codigo,
                        cookies: result.cookies,
                        scheduleData: processedScheduleData,
                    });
                } else {
                    logger.error(`Error al guardar los datos de horario para el usuario con código ${codigo}`);
                    return res.status(500).json({ error: 'Error al guardar los datos de horario en la base de datos' });
                }
            } else {
                logger.warn(`Sincronización fallida para el usuario con código: ${codigo}`);
                return res.status(401).json({ message: 'Error en la autenticación o sincronización del horario' });
            }
        } catch (error) {
            logger.error(`Error durante la sincronización de horario para el usuario ${codigo}:`, error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static syncUserAttendance = async (req: Request, res: Response) => {
        try {
            const { codigo, contrasena } = req.body;
            const userId = req.user._id; 

            logger.info(`Iniciando sincronización de asistencias para el usuario con código: ${codigo}`);

            const result = await autenticarYExtraerAsistencias(codigo, contrasena);

            if (!result || !result.asistencias) {
                logger.warn(`Sincronización fallida para el usuario con código: ${codigo}`);
                return res.status(401).json({ message: 'Error en la autenticación o sincronización' });
            }

            const attendanceRecord = new Attendance({
                userCode: codigo,
                userId, 
                attendanceData: result.asistencias, 
                timestamp: new Date(),
            });

            const saveResult = await Promise.allSettled([attendanceRecord.save()]);

            if (saveResult[0].status === 'fulfilled') {
                logger.info(`Sincronización y guardado de asistencias exitoso para el usuario con código: ${codigo}`);
                return res.status(200).json({
                    message: 'Sincronización de asistencias exitosa y guardada en la base de datos',
                    userCode: codigo,
                    cookies: result.cookies,
                    attendanceData: result.asistencias, 
                });
            } else {
                logger.error(`Error al guardar los datos de asistencia para el usuario con código ${codigo}`);
                return res.status(500).json({ error: 'Error al guardar los datos de asistencia en la base de datos' });
            }
        } catch (error) {
            logger.error(`Error durante la sincronización de asistencias para el usuario ${req.body.codigo}:`, error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

}

export default SyncController;
