"use strict";
/**
 * CAR ROUTES
 * This file defines all the routes (endpoints) for vehicle-related operations.
 * Routes specify the HTTP method (GET, POST, PUT, DELETE) and the URL path,
 * then connect them to the appropriate controller functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
// Import validation middleware
const validations_1 = require("../middleware/validations");
// ============================================================
// NEW FOR IMAGE UPLOADING
// ============================================================
// Import the upload middleware for handling file uploads
const upload_1 = require("../middleware/upload");
// ============================================================
// Import authentication middleware
const auth_1 = require("../middleware/auth");
// Import controller functions that contain the business logic
const postController_1 = require("../controllers/postController");
/**
 * VALIDATION SCHEMAS
 * These Zod schemas define the expected structure and types for request data.
 * They help ensure that clients send valid data to our API.
 */
// Schema for creating a new post
// When using multipart/form-data (with file upload), all fields come as strings
// The backend stores category by name, not by UUID
const createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters long').max(100, 'Title must be at most 100 characters long'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters long').max(200, 'Description must be at most 200 characters long'),
    category: zod_1.z.string().min(2, 'Category must be at least 2 characters long').max(50, 'Category must be at most 50 characters long'),
    user_id: zod_1.z.string().uuid('User ID must be a valid UUID').optional(),
    authorUsername: zod_1.z.string().min(2, 'Author username must be at least 2 characters long').max(50, 'Author username must be at most 50 characters long'),
    image: zod_1.z.string().optional() // Image filename will be set by multer, so it's optional here
});
// Schema for updating a post (same as create)
const updatePostSchema = createPostSchema;
// Schema for validating post ID in URL parameters
const postIdSchema = zod_1.z.object({
    id: zod_1.z.uuid('Post ID must be a valid UUID')
});
/**
 * ROUTER SETUP
 * Create an Express Router instance to define our routes
 */
const router = (0, express_1.Router)();
/**
 * AUTHENTICATION MIDDLEWARE
 * All routes below this line require authentication.
 * The authenticateToken middleware checks if the user has a valid JWT token.
 */
router.use(auth_1.authenticateToken);
/**
 * GET ALL POSTS
 * Route: GET /api/posts
 * Description: Retrieves a list of all posts
 * Authentication: Required
 * Response: Array of post objects
 */
router.get('/', postController_1.getAllPosts);
/**
 * GET POST BY ID
 * Route: GET /api/posts/:id
 * Description: Retrieves a single post by its ID
 * Authentication: Required
 * URL Parameter: id (UUID)
 * Response: Post object or 404 if not found
 */
router.get('/:id', (0, validations_1.validateParams)(postIdSchema), postController_1.getPostById);
// ============================================================
// NEW FOR IMAGE UPLOADING
// ============================================================
/**
 * CREATE NEW POST WITH IMAGE
 * Route: POST /api/posts
 * Description: Creates a new post with an optional image
 * Authentication: Required
 * Body: multipart/form-data with post information and optional image file
 *
 * Middleware chain explanation:
 * 1. upload.single('image') - Handles the file upload (field name must be 'image')
 *    - Saves the file to the uploads folder
 *    - Generates a unique filename
 *    - Makes file info available in req.file
 *
 * 2. validateFile({ required: false }) - Validates the uploaded file (optional)
 *    - Checks if file size is within limits
 *    - File is optional, so it won't error if no file is uploaded
 *
 * 3. validateBody(createVehicleSchema) - Validates the vehicle data
 *    - Checks brand_id, category_id, fuel_type_id, model, year, description
 *
 * 4. createVehicle - Controller function that saves vehicle to database
 */
router.post('/', upload_1.upload.single('image'), // Handle file upload first
(0, validations_1.validateFile)({ required: false }), // Validate file (optional)
(0, validations_1.validateBody)(createPostSchema), // Validate post data
postController_1.createPost // Execute controller
);
/**
 * UPDATE POST WITH IMAGE
 * Route: PUT /api/posts/:id
 * Description: Updates an existing post, optionally replacing its image
 * Authentication: Required
 * URL Parameter: id (UUID)
 * Body: multipart/form-data with post information and optional new image file
 *
 * If a new image is uploaded, the old image will be deleted automatically.
 */
router.put('/:id', (0, validations_1.validateParams)(postIdSchema), // Validate post ID
upload_1.upload.single('image'), // Handle optional new image
(0, validations_1.validateFile)({ required: false }), // Validate file (optional)
(0, validations_1.validateBody)(updatePostSchema), // Validate post data
postController_1.updatePost // Execute controller
);
// ============================================================
/**
 * DELETE VEHICLE
 * Route: DELETE /api/vehicles/:id
 * Description: Deletes a vehicle and its associated image file
 * Authentication: Required
 * URL Parameter: id (UUID)
 * Response: Success message or 404 if vehicle not found
 */
router.delete('/:id', (0, validations_1.validateParams)(postIdSchema), postController_1.deletePost);
exports.default = router;
