import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import options from '../swaggerOptions'; // importa el archivo de opciones de Swagger
import logger from '../src/logs/logger'; // importa el archivo de configuración del logger

dotenv.config();
connectDB();

const app = express();

// Configura Swagger
const swaggerDocs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para loguear las solicitudes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use('/api/v1/auth', authRoutes);

// Log cuando el servidor esté corriendo


export default app;
