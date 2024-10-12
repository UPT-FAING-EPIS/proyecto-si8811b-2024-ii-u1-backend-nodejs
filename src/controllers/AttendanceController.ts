import { Request, Response } from 'express'
import Attendance from '../models/Attendace'

class AttendanceController {
    static getUserAttendance = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            const attendance = await Attendance.findOne({ userId })

            if (!attendance) {
                return res.status(404).json({ message: 'No se encontraron asistencias para el usuario.' })
            }

            res.status(200).json({
                userCode: attendance.userCode,
                attendanceData: attendance.attendanceData
            })
        } catch (error) {
            console.error('Error obteniendo asistencias:', error)
            res.status(500).json({ message: 'Error al obtener asistencias.' })
        }
    }
}

export default AttendanceController;
