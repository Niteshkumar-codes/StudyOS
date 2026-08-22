import { Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Note } from '../models/Note';
import { Subject } from '../models/Subject';

const getUserId = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'User context not found' });
    return null;
  }
  return userId;
};

const serializeNote = (note: any, subjectsMap?: Map<string, any>) => {
  const subject = note.subjectId && subjectsMap ? subjectsMap.get(note.subjectId.toString()) : null;

  return {
    id: note._id.toString(),
    userId: note.userId.toString(),
    subjectId: note.subjectId ? note.subjectId.toString() : undefined,
    subjectName: subject?.name,
    subjectColor: subject?.color,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
};

const subjectLookup = (subjects: any[]) => {
  const map = new Map<string, any>();
  subjects.forEach((subject) => {
    map.set(subject._id.toString(), subject);
  });
  return map;
};

const noteQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  subjectId: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

const noteSchema = z.object({
  subjectId: z.string().trim().min(1).optional().nullable(),
  title: z.string().trim().min(2, 'Note title must be at least 2 characters').max(120),
  content: z.string().trim().min(1, 'Note content cannot be empty').max(50000),
  tags: z.array(z.string().trim().min(1).max(32)).max(12).optional(),
});

const noteUpdateSchema = z.object({
  subjectId: z.string().trim().min(1).optional().nullable(),
  title: z.string().trim().min(2, 'Note title must be at least 2 characters').max(120).optional(),
  content: z.string().trim().min(1, 'Note content cannot be empty').max(50000).optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(12).optional().nullable(),
});

export const listNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsedQuery = noteQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        message: 'Invalid notes query',
        errors: parsedQuery.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { q, subjectId } = parsedQuery.data;
    const limit = parsedQuery.data.limit ?? 50;
    const offset = parsedQuery.data.offset ?? 0;

    const filter: Record<string, unknown> = { userId };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const [notes, totalCount, subjects] = await Promise.all([
      Note.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip(offset).limit(limit),
      Note.countDocuments(filter),
      Subject.find({ userId }),
    ]);

    const subjectsMap = subjectLookup(subjects);

    return res.status(200).json({
      notes: notes.map((note) => serializeNote(note, subjectsMap)),
      totalCount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

export const getNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const note = await Note.findOne({ _id: req.params.noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const subjects = await Subject.find({ userId });
    return res.status(200).json({ note: serializeNote(note, subjectLookup(subjects)) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch note' });
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { subjectId, title, content, tags } = req.body;

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId });
      if (!subject) {
        return res.status(404).json({ message: 'Selected subject not found' });
      }
    }

    const note = await Note.create({
      userId: new Types.ObjectId(userId),
      subjectId: subjectId ? new Types.ObjectId(subjectId) : undefined,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
    });

    const subjects = await Subject.find({ userId });
    return res.status(201).json({
      message: 'Note created successfully',
      note: serializeNote(note, subjectLookup(subjects)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create note' });
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const note = await Note.findOne({ _id: req.params.noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { subjectId, title, content, tags } = req.body;

    if (subjectId !== undefined) {
      if (subjectId) {
        const subject = await Subject.findOne({ _id: subjectId, userId });
        if (!subject) {
          return res.status(404).json({ message: 'Selected subject not found' });
        }
        note.subjectId = new Types.ObjectId(subjectId);
      } else {
        note.subjectId = undefined;
      }
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (tags !== undefined) note.tags = tags || [];

    await note.save();

    const subjects = await Subject.find({ userId });
    return res.status(200).json({
      message: 'Note updated successfully',
      note: serializeNote(note, subjectLookup(subjects)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update note' });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const note = await Note.findOneAndDelete({ _id: req.params.noteId, userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete note' });
  }
};