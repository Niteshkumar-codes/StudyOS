import { Schema, model, Document, Types } from 'mongoose';

export type SubjectTopicStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ISubjectTopic {
  _id: Types.ObjectId;
  title: string;
  status: SubjectTopicStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject extends Document {
  userId: Types.ObjectId;
  examId?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  topics: Types.DocumentArray<ISubjectTopic>;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectTopicSchema = new Schema<ISubjectTopic>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
  },
  {
    timestamps: true,
  },
);

const SubjectSchema = new Schema<ISubject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    examId: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    topics: {
      type: [SubjectTopicSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

SubjectSchema.index({ userId: 1, createdAt: -1 });
SubjectSchema.index({ userId: 1, examId: 1 });

export const Subject = model<ISubject>('Subject', SubjectSchema);