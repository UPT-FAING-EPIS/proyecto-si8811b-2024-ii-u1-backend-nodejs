import mongoose, { Schema, Document } from 'mongoose';

interface IDaySchedule {
  [key: string]: string[];
}

interface ICourseSchedule {
  code: string;
  name: string;
  section: string;
  schedule: IDaySchedule;
}

export interface IScheduleDocument extends Document {
  userCode: string;
  userId: mongoose.Schema.Types.ObjectId;
  timestamp: Date;
  scheduleData: ICourseSchedule[];
}

const DayScheduleSchema: Schema = new Schema({
  Lunes: [String],
  Martes: [String],
  Miercoles: [String],
  Jueves: [String],
  Viernes: [String],
  Sabado: [String],
  Domingo: [String]
}, { _id: false });

const CourseScheduleSchema: Schema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  section: { type: String, required: true },
  schedule: DayScheduleSchema
}, { _id: false });

const ScheduleSchema: Schema = new Schema({
  userCode: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  scheduleData: [CourseScheduleSchema]
});

const Schedule = mongoose.model<IScheduleDocument>('Schedule', ScheduleSchema);

export default Schedule;