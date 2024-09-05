import { autenticar } from '../services/authService.js';

export const login = async (req, res) => {
    const { codigo, contrasena, captcha } = req.body;

    try {
        const cookies = await autenticar(codigo, contrasena, captcha);
        if (cookies) {
            res.status(200).json({ message: 'Autenticación exitosa', cookies });
        } else {
            res.status(401).json({ message: 'Error en la autenticación' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error interno en el servidor' });
    }
};
