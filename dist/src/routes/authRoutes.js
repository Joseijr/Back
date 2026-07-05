"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import controllers
const authController_1 = require("../controllers/authController");
//validation
const validations_1 = require("../middleware/validations");
//schemas
const schema_1 = require("../db/schema");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    carnet: zod_1.z.string().min(1, 'Carnet is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long')
});
const router = (0, express_1.Router)();
router.post("/login", (0, validations_1.validateBody)(loginSchema), authController_1.login);
router.post("/register", (0, validations_1.validateBody)(schema_1.insertUserSchema), authController_1.register);
exports.default = router;
