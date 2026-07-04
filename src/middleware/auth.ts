// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
/**
 * This file contains middleware for protecting API routes
 * 
 * WHAT IS MIDDLEWARE?
 * - Middleware functions run BETWEEN receiving a request and sending a response
 * - They can modify the request, check permissions, log data, etc.
 * - Think of them as security checkpoints or gatekeepers
 * 
 * REQUEST FLOW WITH MIDDLEWARE:
 * 1. Client sends request → 
 * 2. Middleware checks authentication → 
 * 3. If valid, passes to route handler → 
 * 4. Route handler processes request → 
 * 5. Response sent back to client
 * 
 * AUTHENTICATION FLOW:
 * - Client includes JWT token in Authorization header
 * - Middleware extracts and verifies the token
 * - If valid, attaches user info to request object
 * - If invalid, blocks request and returns error
 * 
 * HOW TO USE:
 * Import and add to protected routes:
 * router.get('/protected-route', authenticateToken, yourController);
 *                                 ↑ middleware runs first
 */

// Import Express types for request/response handling
import type {Request, Response, NextFunction} from 'express';

// Import JWT verification function and payload type
import {verifyToken, type CustomJWTPayload} from '../utils/jwt';

// ============================================
// AUTHENTICATED REQUEST INTERFACE
// ============================================
/**
 * Extends Express's Request type to include authenticated user data
 * 
 * WHY DO WE NEED THIS?
 * - Express's default Request type doesn't have a 'user' property
 * - After authentication, we want to attach user info to the request
 * - This allows route handlers to access the authenticated user
 * 
 * TYPESCRIPT BENEFIT:
 * - Provides type safety and autocomplete for req.user
 * - Prevents typos when accessing user properties
 * - Makes code more maintainable
 * 
 * USAGE IN ROUTE HANDLERS:
 * const myController = (req: AuthenticatedRequest, res: Response) => {
 *   const userId = req.user?.id;  // TypeScript knows 'user' exists!
 * }
 */
export interface AuthenticatedRequest extends Request {
    user?: CustomJWTPayload;  // Optional because it's only set after authentication
}

// ============================================
// AUTHENTICATE TOKEN MIDDLEWARE FUNCTION
// ============================================
/**
 * Middleware that verifies JWT tokens and protects routes
 * Blocks unauthenticated requests from accessing protected resources
 * 
 * HOW IT WORKS:
 * 1. Extracts token from Authorization header
 * 2. Checks if token exists
 * 3. Verifies token is valid and not expired
 * 4. Attaches decoded user data to request object
 * 5. Calls next() to pass control to route handler
 * 6. OR returns error if authentication fails
 * 
 * AUTHORIZATION HEADER FORMAT:
 * "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                  ↑      ↑
 *                  type   token
 * 
 * HTTP STATUS CODES USED:
 * - 401 Unauthorized: No token provided (user not logged in)
 * - 403 Forbidden: Invalid/expired token (user tried to authenticate but failed)
 * 
 * @param req - Express request object (extended with user property)
 * @param res - Express response object for sending errors
 * @param next - Function to call to pass control to next middleware/handler
 * 
 * @example
 * // Protect a route with this middleware:
 * router.get('/profile', authenticateToken, getProfile);
 * 
 * // Access authenticated user in route handler:
 * const getProfile = (req: AuthenticatedRequest, res: Response) => {
 *   const userId = req.user?.id;  // Available after authenticateToken runs
 *   // ... fetch and return user profile
 * }
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    try {
        // STEP 1: Extract the Authorization header from the request
        // Headers are case-insensitive, but Node.js lowercases them
        // Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        const authHeader = req.headers['authorization'];
        
        // STEP 2: Extract the token from the Authorization header
        // Format is "Bearer <token>", so we:
        // - Split by space to get ["Bearer", "<token>"]
        // - Take second element [1] which is the actual token
        // The && operator ensures we only split if authHeader exists (prevents errors)
        const token = authHeader && authHeader.split(' ')[1];
        
        // STEP 3: Check if token exists
        // If no token provided, user is not authenticated
        if (!token) {
            // Status 401 = "Unauthorized" - authentication required but not provided
            return res.status(401).json({ message: 'No token provided' });
        }

        // STEP 4: Verify the token is valid
        // verifyToken() checks:
        // - Token signature is valid (not tampered with)
        // - Token hasn't expired
        // - Token format is correct
        // If any check fails, it throws an error (caught below)
        const payload = await verifyToken(token);
        
        // STEP 5: Attach decoded user data to request object
        // Now any subsequent middleware or route handler can access req.user
        // This avoids needing to verify the token again in the route handler
        req.user = payload;
        
        // STEP 6: Call next() to pass control to the next middleware or route handler
        // This is REQUIRED in middleware - it tells Express to continue processing
        // Without this, the request would hang and never get a response
        next();
        
    } catch (error) {
        // ERROR HANDLING: Token verification failed
        // Possible reasons:
        // - Token signature is invalid (tampered with or wrong secret)
        // - Token has expired (past JWT_EXPIRES_IN time)
        // - Token format is malformed
        // - Cryptographic error
        
        // Log the error for debugging (helps developers troubleshoot issues)
        console.error('Token verification failed:', error);
        
        // Send error response to client
        // Status 403 = "Forbidden" - authentication was attempted but failed
        // (Different from 401 which means no authentication was attempted)
        res.status(403).json({ message: 'Invalid token' });
    }
};