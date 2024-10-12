import { Request, Response } from 'express'
import Schedule from '../models/Schedule'

class ScheduleController {
    static getUserSchedule = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            const schedule = await Schedule.findOne({ userId })

            if (!schedule) {
                return res.status(404).json({ message: 'No se encontró el horario para el usuario.' })
            }

            res.status(200).json({
                userCode: schedule.userCode,
                schedule: schedule.scheduleData
            })
        } catch (error) {
            console.error('Error obteniendo horario:', error);
            res.status(500).json({ message: 'Error al obtener el horario.' })
        }
    }
}

export default ScheduleController;
