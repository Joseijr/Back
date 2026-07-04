/**
 * UPLOAD MIDDLEWARE
 * This file configures multer for handling file uploads in the application.
 * Multer is a Node.js middleware for handling multipart/form-data, which is
 * primarily used for uploading files.
 */

import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { Request } from 'express';

/**
 * STORAGE CONFIGURATION
 * diskStorage() tells multer where to store the uploaded files and how to name them.
 * We use disk storage (instead of memory storage) to save files directly to the file system.
 */
const storage = multer.diskStorage({
    /**
     * DESTINATION FUNCTION
     * This determines where uploaded files will be saved.
     * - req: The incoming request object
     * - file: Information about the uploaded file
     * - cb: Callback function to specify the destination
     */
    destination: (req: Request, file: Express.Multer.File, cb) => {
        // Save all uploaded images to the 'uploads' folder at the root of the project
        cb(null, 'uploads/');
    },

    /**
     * FILENAME FUNCTION
     * This determines what name the uploaded file will have on disk.
     * We generate a unique name to avoid conflicts when multiple files have the same name.
     */
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Extract the original file extension (e.g., '.jpg', '.png')
        const fileExtension = path.extname(file.originalname);
        
        // Generate a unique filename using UUID (Universally Unique Identifier)
        // Example result: "550e8400-e29b-41d4-a716-446655440000.jpg"
        const uniqueFilename = `${randomUUID()}${fileExtension}`;
        
        // Return the unique filename via callback
        cb(null, uniqueFilename);
    }
});

/**
 * FILE FILTER FUNCTION
 * This function determines which files are accepted and which are rejected.
 * We only want to accept image files for vehicle uploads.
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Define which MIME types (file types) are allowed
    // MIME type is a standard way to identify file types on the internet
    const allowedMimeTypes = [
        'image/jpeg',    // .jpg or .jpeg files
        'image/jpg',     // .jpg files (alternative MIME type)
        'image/png',     // .png files
        'image/webp'     // .webp files (modern image format)
    ];

    // Check if the uploaded file's MIME type is in our allowed list
    if (allowedMimeTypes.includes(file.mimetype)) {
        // File is accepted - first parameter is null (no error), second is true (accept)
        cb(null, true);
    } else {
        // File is rejected - create an error message
        // We cast to 'any' to add a custom property to the error
        const error = new Error('Invalid file type. Only JPEG, JPG, PNG and WebP images are allowed.') as any;
        error.code = 'INVALID_FILE_TYPE';
        
        // Pass the error to multer - file will be rejected
        cb(error, false);
    }
};

/**
 * MULTER CONFIGURATION
 * This is the main multer configuration object that combines all our settings.
 */
export const upload = multer({
    storage: storage,           // Use our custom storage configuration
    fileFilter: fileFilter,     // Use our file type filter
    limits: {
        fileSize: 5 * 1024 * 1024  // Limit file size to 5MB (5 * 1024KB * 1024bytes)
                                    // This prevents users from uploading very large files
    }
});

/**
 * USAGE IN ROUTES:
 * For single file upload: upload.single('image')
 * - 'image' is the name of the form field that contains the file
 * 
 * Example:
 * router.post('/vehicles', upload.single('image'), createVehicle);
 * 
 * In the route handler, you can access the uploaded file via: req.file
 * - req.file.filename: The unique filename we generated
 * - req.file.path: The full path where the file was saved
 * - req.file.size: The file size in bytes
 * - req.file.mimetype: The MIME type of the file
 */
