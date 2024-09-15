import type { Request, Response } from 'express'
import User from '../models/User'
import { hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import Token from '../models/Token'
import { AuthEmail } from '../emails/AuthEmail'
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

            // Enviar email de confirmación
            AuthEmail.sendConfirmatioEmail({ 
                email: user.email,
                name: user.name,
                token: token.token 
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, revisa tu email')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no válido')
                return res.status(401).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada, ahora puedes iniciar sesión')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}