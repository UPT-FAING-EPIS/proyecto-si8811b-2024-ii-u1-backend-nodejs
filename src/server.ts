import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import authRoutes from './routes/authRoutes'

dotenv.config()
connectDB()

const app = express();
// app.use(cors(corsConfig))

app.use(express.json())

app.use('/api/v1/auth', authRoutes)

export default app