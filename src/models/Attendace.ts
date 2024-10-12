import mongoose, { Schema, Document } from 'mongoose';

interface IAttendance {
  fecha: string;
  dia: string;
  estado: string;
}

interface ICourseAttendance {
  curso: string;
  asistencias: IAttendance[];
}

export interface IAttendanceDocument extends Document {
  userCode: string;
  userId: mongoose.Schema.Types.ObjectId; 
  timestamp: Date;
  attendanceData: ICourseAttendance[];
}

const AttendanceSchema: Schema = new Schema({
  userCode: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  attendanceData: [
    {
      curso: { 
        type: String, 
        required: true 
      },
      asistencias: [
        {
          fecha: { 
            type: String, 
            required: true 
          },
          dia: { 
            type: String, 
            required: true 
          },
          estado: { 
            type: String, 
            required: true 
          },
        },
      ],
    },
  ],
});

const Attendance = mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);
export default Attendance;

