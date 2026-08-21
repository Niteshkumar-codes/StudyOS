import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import {
  addSubjectTopic,
  createSubject,
  createTask,
  deleteSubject,
  deleteSubjectTopic,
  deleteTask,
  getStudySummary,
  getSubject,
  listSubjects,
  listTasks,
  updateSubject,
  updateSubjectTopic,
  updateTask,
} from '../controllers/studyController';

const router: Router = Router();

const colorSchema = z.string().trim().max(24).optional();
const iconSchema = z.string().trim().max(32).optional();

const subjectSchema = z.object({
  name: z.string().trim().min(2, 'Subject name must be at least 2 characters').max(80),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  examId: z.union([z.string().trim().min(1), z.null()]).optional(),
  color: colorSchema.or(z.literal('')).optional(),
  icon: iconSchema.or(z.literal('')).optional(),
});

const subjectUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Subject name must be at least 2 characters').max(80).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  examId: z.union([z.string().trim().min(1), z.null()]).optional(),
  color: colorSchema.or(z.literal('')).optional().nullable(),
  icon: iconSchema.or(z.literal('')).optional().nullable(),
});

const topicSchema = z.object({
  title: z.string().trim().min(2, 'Topic title must be at least 2 characters').max(120),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
});

const topicUpdateSchema = z.object({
  title: z.string().trim().min(2, 'Topic title must be at least 2 characters').max(120).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
});

const taskSchema = z.object({
  subjectId: z.string().trim().min(1).optional().nullable(),
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(120),
  description: z.string().trim().max(500).optional().nullable(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date'),
  durationMinutes: z.coerce.number().int().min(5).max(720),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
});

const taskUpdateSchema = z.object({
  subjectId: z.string().trim().min(1).optional().nullable(),
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date').optional(),
  durationMinutes: z.coerce.number().int().min(5).max(720).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
});

router.use(authMiddleware as any);

router.get('/summary', getStudySummary as any);

router.get('/subjects', listSubjects as any);
router.get('/subjects/:subjectId', getSubject as any);
router.post('/subjects', validateBody(subjectSchema), createSubject as any);
router.put('/subjects/:subjectId', validateBody(subjectUpdateSchema), updateSubject as any);
router.delete('/subjects/:subjectId', deleteSubject as any);

router.post('/subjects/:subjectId/topics', validateBody(topicSchema), addSubjectTopic as any);
router.put('/subjects/:subjectId/topics/:topicId', validateBody(topicUpdateSchema), updateSubjectTopic as any);
router.delete('/subjects/:subjectId/topics/:topicId', deleteSubjectTopic as any);

router.get('/tasks', listTasks as any);
router.post('/tasks', validateBody(taskSchema), createTask as any);
router.put('/tasks/:taskId', validateBody(taskUpdateSchema), updateTask as any);
router.delete('/tasks/:taskId', deleteTask as any);

export default router;