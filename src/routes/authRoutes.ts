import { Router } from "express";
//import controllers
import {register, login} from '../controllers/authController';
//validation
import {validateBody} from '../middleware/validations';
//schemas
import {insertUserSchema} from '../db/schema';

import {z} from 'zod';

const loginSchema = z.object({
    carnet: z.string().min(1, 'Carnet is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

const router = Router();

router.post("/login", validateBody(loginSchema), login);

router.post("/register", validateBody(insertUserSchema), register);

export default router;