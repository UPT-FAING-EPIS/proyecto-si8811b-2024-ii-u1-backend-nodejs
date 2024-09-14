import type { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import Token from '../models/Token'

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Prevenir duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('Usuario ya registrado')
                return res.status(409).json({error: error.message})
            }

            // Crea el usuario
            const user = new User(req.body)

            user.password = await hashPassword(password)

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, revisa tu email')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}