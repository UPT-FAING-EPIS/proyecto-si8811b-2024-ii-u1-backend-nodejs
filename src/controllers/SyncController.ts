import { Request, Response } from 'express';
import { autenticar, autenticarYExtraerAsistencias, autenticarYExtraerCreditos, autenticarYExtraerHorario } from '../services/intranetSync';
import logger from '../logs/logger';  // Añadir el logger

export class SyncController {

    static syncUserData = async (req: Request, res: Response) => {
        const { codigo, contrasena } = req.body;

        try {
            logger.info(`Starting sync for user with code: ${codigo}`);
            
            // No pedimos captcha ahora porque se resolverá automáticamente con OCR
            const result = await autenticar(codigo, contrasena);

            if (result) {
                const { cookies, currentURL } = result;
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

        try {
            logger.info(`Starting schedule sync for user with code: ${codigo}`);
            const result = await autenticarYExtraerHorario(codigo, contrasena);

            if (result) {
                return res.status(200).json({
                    message: 'Sincronización de horario exitosa',
                    schedule: result.horarios,
                    cookies: result.cookies,
                });
            } else {
                return res.status(401).json({ message: 'Error en la autenticación o sincronización del horario' });
            }
        } catch (error) {
            logger.error(`Error during schedule sync for user with code: ${codigo}`, error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static syncUserAttendance = async (req: Request, res: Response) => {
        const { codigo, contrasena } = req.body;

        try {
            logger.info(`Starting attendance sync for user with code: ${codigo}`);
            const result = await autenticarYExtraerAsistencias(codigo, contrasena);

            if (result) {
                return res.status(200).json({
                    message: 'Sincronización de asistencias exitosa',
                    attendance: result.asistencias,
                    cookies: result.cookies,
                });
            } else {
                return res.status(401).json({ message: 'Error en la autenticación o sincronización de asistencias' });
            }
        } catch (error) {
            logger.error(`Error during attendance sync for user with code: ${codigo}`, error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    static syncUserCredits = async (req: Request, res: Response) => {
        const { codigo, contrasena } = req.body;

        try {
            logger.info(`Starting credits sync for user with code: ${codigo}`);
            const result = await autenticarYExtraerCreditos(codigo, contrasena);

            if (result) {
                return res.status(200).json({
                    message: 'Sincronización de créditos exitosa',
                    credits: result.creditos,
                    cookies: result.cookies,
                });
            } else {
                return res.status(401).json({ message: 'Error en la autenticación o sincronización de créditos' });
            }
        } catch (error) {
            logger.error(`Error during credits sync for user with code: ${codigo}`, error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
}

export default SyncController;
