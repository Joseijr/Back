"use strict";
/**
 * VALIDATION MIDDLEWARE
 * This file contains middleware functions for validating incoming requests.
 * We use Zod, a TypeScript-first schema validation library, to ensure
 * that the data we receive from clients is in the correct format.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
/**
 * VALIDATE BODY MIDDLEWARE
 * This function validates the request body against a Zod schema.
 * If validation fails, it returns a 400 error with details about what went wrong.
 *
 * @param schema - A Zod schema that defines the expected structure of the request body
 * @returns Middleware function that validates req.body
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            // Attempt to parse and validate the request body against the schema
            const validatedData = schema.parse(req.body);
            // If validation succeeds, replace req.body with the validated data
            // This ensures that only valid data is passed to the next middleware
            req.body = validatedData;
            // Continue to the next middleware or route handler
            next();
        }
        catch (error) {
            // If validation fails, Zod throws a ZodError
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: error.issues // Contains details about what failed validation
                });
            }
        }
    };
};
exports.validateBody = validateBody;
/**
 * VALIDATE PARAMS MIDDLEWARE
 * This function validates URL parameters (like /vehicles/:id) against a Zod schema.
 *
 * @param schema - A Zod schema that defines the expected URL parameters
 * @returns Middleware function that validates req.params
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            // Validate URL parameters against the schema
            schema.parse(req.params);
            // If validation succeeds, continue to the next middleware
            next();
        }
        catch (error) {
            // If validation fails, return error details
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: 'Invalid parameters',
                    errors: error.issues
                });
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
/**
 * VALIDATE QUERY MIDDLEWARE
 * This function validates query string parameters (like /vehicles?year=2024) against a Zod schema.
 *
 * @param schema - A Zod schema that defines the expected query parameters
 * @returns Middleware function that validates req.query
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            // Validate query string parameters against the schema
            schema.parse(req.query);
            // If validation succeeds, continue to the next middleware
            next();
        }
        catch (error) {
            // If validation fails, return error details
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: 'Invalid query parameters',
                    errors: error.issues
                });
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
// ============================================================
// NEW FOR IMAGE UPLOADING
// ============================================================
/**
 * VALIDATE FILE MIDDLEWARE
 * This function validates that a file was uploaded and meets certain requirements.
 * It's used after multer processes the file upload.
 *
 * @param options - Configuration options for file validation
 * @param options.required - Whether the file is required (true) or optional (false)
 * @param options.maxSize - Maximum file size in bytes (optional)
 * @returns Middleware function that validates req.file
 */
const validateFile = (options = {}) => {
    return (req, res, next) => {
        const { required = false, maxSize } = options;
        // Check if file is required but missing
        if (required && !req.file) {
            return res.status(400).json({
                message: 'File is required',
                errors: ['No file was uploaded']
            });
        }
        // If file is optional and not provided, continue
        if (!req.file) {
            return next();
        }
        // Validate file size if maxSize is specified
        if (maxSize && req.file.size > maxSize) {
            // Calculate size in MB for user-friendly error message
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
            const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
            return res.status(400).json({
                message: 'File size exceeds maximum allowed size',
                errors: [`File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`]
            });
        }
        // File validation passed, continue to next middleware
        next();
    };
};
exports.validateFile = validateFile;
// ============================================================
