import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  userId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (values: string[]) =>
        Array.from(new Set((values || []).map((value) => value.trim()).filter(Boolean))),
    },
  },
  {
    timestamps: true,
  },
);

NoteSchema.index({ userId: 1, updatedAt: -1 });
NoteSchema.index({ userId: 1, subjectId: 1, updatedAt: -1 });
NoteSchema.index({ userId: 1, title: 'text', content: 'text' });

export const Note = model<INote>('Note', NoteSchema);