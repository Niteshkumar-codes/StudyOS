import { Schema, model, Document, Types } from 'mongoose';

export type StudyTaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface IStudyTask extends Document {
  userId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes: number;
  status: StudyTaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StudyTaskSchema = new Schema<IStudyTask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: String,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  },
);

StudyTaskSchema.index({ userId: 1, scheduledDate: 1 });

export const StudyTask = model<IStudyTask>('StudyTask', StudyTaskSchema);