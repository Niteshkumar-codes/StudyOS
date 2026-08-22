import { Schema, model, Document, Types } from 'mongoose';

export type StudySessionStatus = 'Completed';

export interface IStudySession extends Document {
  userId: Types.ObjectId;
  subjectId: Types.ObjectId;
  title?: string;
  note?: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  sessionDate: string;
  status: StudySessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>(
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
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
      required: true,
      index: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    sessionDate: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Completed'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  },
);

StudySessionSchema.index({ userId: 1, startedAt: -1 });
StudySessionSchema.index({ userId: 1, sessionDate: -1 });
StudySessionSchema.index({ userId: 1, subjectId: 1, startedAt: -1 });

export const StudySession = model<IStudySession>('StudySession', StudySessionSchema);