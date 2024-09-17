import type { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
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
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada, ahora puedes iniciar sesión')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if(!user){
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }

            if(!user.confirmed){
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Enviar email de confirmación
                AuthEmail.sendConfirmatioEmail({ 
                    email: user.email,
                    name: user.name,
                    token: token.token 
                })

                const error = new Error('Cuenta sin ser confirmada, se envio otro email de confirmacion')
                return res.status(401).json({error: error.message})
            }

            // Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('Password incorrecto')
                return res.status(401).json({error: error.message})
            }

            res.send('Autenticado.................')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            if(user.confirmed){
                const error = new Error('Usuario ya confirmado')
                return res.status(403).json({error: error.message})
            }

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email 
            AuthEmail.sendConfirmatioEmail({ 
                email: user.email,
                name: user.name,
                token: token.token 
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Se envio un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar email 
            AuthEmail.sendPasswordResetToken({ 
                email: user.email,
                name: user.name,
                token: token.token 
            })

            res.send('Revisa tu email')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            res.send('Token valido, Define tu nuevo password')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Password reestablecido correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}