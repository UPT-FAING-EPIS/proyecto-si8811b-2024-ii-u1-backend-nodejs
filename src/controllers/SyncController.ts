import { Request, Response } from 'express';
import { autenticar } from '../services/intranetSync';
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
}

export default SyncController;
