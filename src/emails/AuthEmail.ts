import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmatioEmail = async ( user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'Topicos <admin@topic.com>',
            to: user.email,
            subject: 'Topicos - Confirma tu cuenta',
            text: 'Topicos - Confirma tu cuenta',
            html: `<p>Hola: ${user.name}, ya te has registrado en la aplicacion de Topicos,
            ya casi esta todo listo, solo debes confirmar tu cuenta<p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                <p>Ingresa el codigo: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })

        console.log('Mensaje enviado', info.messageId)
    }

    static sendPasswordResetToken = async ( user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'Topicos <admin@topic.com>',
            to: user.email,
            subject: 'Topicos - Restablecer el Password',
            text: 'Topicos - Restablecer el Password',
            html: `<p>Hola: ${user.name}, has solicitado reestablecer tu password<p>
                <p>Visita el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
                <p>Ingresa el codigo: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })

        console.log('Mensaje enviado', info.messageId)
    }
}