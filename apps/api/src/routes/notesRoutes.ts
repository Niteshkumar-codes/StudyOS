import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { createNote, deleteNote, getNote, listNotes, updateNote } from '../controllers/notesController';

const router: Router = Router();

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

router.use(authMiddleware as any);

router.get('/', listNotes as any);
router.get('/:noteId', getNote as any);
router.post('/', validateBody(noteSchema), createNote as any);
router.put('/:noteId', validateBody(noteUpdateSchema), updateNote as any);
router.delete('/:noteId', deleteNote as any);

export default router;