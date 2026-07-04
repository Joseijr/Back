/**
 * CAR ROUTES
 * This file defines all the routes (endpoints) for vehicle-related operations.
 * Routes specify the HTTP method (GET, POST, PUT, DELETE) and the URL path,
 * then connect them to the appropriate controller functions.
 */

import {Router} from 'express';
import {z} from 'zod';

// Import validation middleware
import {validateBody, validateParams, validateFile} from '../middleware/validations';

// ============================================================
// NEW FOR IMAGE UPLOADING
// ============================================================
// Import the upload middleware for handling file uploads
import {upload} from '../middleware/upload';
// ============================================================

// Import authentication middleware
import { authenticateToken} from '../middleware/auth';

// Import controller functions that contain the business logic
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
} from '../controllers/postController';

/**
 * VALIDATION SCHEMAS
 * These Zod schemas define the expected structure and types for request data.
 * They help ensure that clients send valid data to our API.
 */

// Schema for creating a new post
// When using multipart/form-data (with file upload), all fields come as strings
// The backend stores category by name, not by UUID
const createPostSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters long').max(100, 'Title must be at most 100 characters long'),
    description: z.string().min(10, 'Description must be at least 10 characters long').max(200, 'Description must be at most 200 characters long'),
    category: z.string().min(2, 'Category must be at least 2 characters long').max(50, 'Category must be at most 50 characters long'),
    user_id: z.string().uuid('User ID must be a valid UUID').optional(),
    authorUsername: z.string().min(2, 'Author username must be at least 2 characters long').max(50, 'Author username must be at most 50 characters long'),
    image: z.string().optional() // Image filename will be set by multer, so it's optional here
});

// Schema for updating a post (same as create)
const updatePostSchema = createPostSchema;

// Schema for validating post ID in URL parameters
const postIdSchema = z.object({
    id: z.uuid('Post ID must be a valid UUID')
});

/**
 * ROUTER SETUP
 * Create an Express Router instance to define our routes
 */
const router = Router();

/**
 * AUTHENTICATION MIDDLEWARE
 * All routes below this line require authentication.
 * The authenticateToken middleware checks if the user has a valid JWT token.
 */
router.use(authenticateToken);

/**
 * GET ALL POSTS
 * Route: GET /api/posts
 * Description: Retrieves a list of all posts
 * Authentication: Required
 * Response: Array of post objects
 */
router.get('/', getAllPosts);

/**
 * GET POST BY ID
 * Route: GET /api/posts/:id
 * Description: Retrieves a single post by its ID
 * Authentication: Required
 * URL Parameter: id (UUID)
 * Response: Post object or 404 if not found
 */
router.get('/:id', validateParams(postIdSchema), getPostById);

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
router.post(
    '/', 
    upload.single('image'),              // Handle file upload first
    validateFile({ required: false }),    // Validate file (optional)
    validateBody(createPostSchema),    // Validate post data
    createPost                         // Execute controller
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
router.put(
    '/:id',
    validateParams(postIdSchema),      // Validate post ID
    upload.single('image'),               // Handle optional new image
    validateFile({ required: false }),     // Validate file (optional)
    validateBody(updatePostSchema),     // Validate post data
    updatePost                          // Execute controller
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
router.delete('/:id', validateParams(postIdSchema), deletePost);

export default router;