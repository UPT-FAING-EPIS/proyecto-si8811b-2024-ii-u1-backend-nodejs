import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('No puede ir vacio'), 
    body('password')
        .isLength({min: 8}).withMessage('Password muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords no coinciden');
        }
        return true;
    }),
    body('email')
        .isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.createAccount
)

export default router