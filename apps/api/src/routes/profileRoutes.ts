import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { getProfile, updateProfile } from '../controllers/profileController';

const router: Router = Router();

// Validation Schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores')
    .optional(),
  preparationTypes: z
    .array(z.string())
    .min(1, 'Please select at least one preparation type')
    .optional(),
});

// Profile endpoints
router.get('/', authMiddleware as any, getProfile as any);
router.put('/', authMiddleware as any, validateBody(updateProfileSchema), updateProfile as any);

export default router;
