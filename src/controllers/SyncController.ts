import { Request, Response } from 'express';
import { autenticar } from '../services/intranetSync';

export const syncUserData = async (req: Request, res: Response) => {
    const { codigo, contrasena } = req.body;

    try {
        // No pedimos captcha ahora porque se resolverá automáticamente con OCR
        const result = await autenticar(codigo, contrasena);

        if (result) {
            const { cookies, currentURL } = result;
            res.status(200).json({
                message: 'Sincronización exitosa',
                cookies,
                currentURL,
            });
        } else {
            res.status(401).json({ message: 'Error en la autenticación o sincronización' });
        }
    } catch (error) {
        console.error('Error en la sincronización:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};