import { Router } from 'express'
import { body, param } from 'express-validator'
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

router.post('/confirm-account',
    body('token')
       .notEmpty().withMessage('Token no puede ir vacio'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login', 
    body('email')
       .isEmail().withMessage('E-mail no valido'),
    body('password')
       .notEmpty().withMessage('Password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code', 
    body('email')
       .isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',  
    body('email')
       .isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
       .notEmpty().withMessage('Token no puede ir vacio'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token')
     .isNumeric().withMessage('Token no valido'),
    body('password')
        .isLength({min: 8}).withMessage('Password muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords no coinciden');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

export default router