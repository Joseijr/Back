// ============================================
// IMPORTS: External libraries and dependencies
// ============================================

// Import TypeScript types for Express.js Request and Response objects
// These help TypeScript understand what properties and methods are available
import type {Request, Response} from 'express';

// Import bcrypt library for password hashing (keeping for potential direct use)
import bcrypt from 'bcrypt';

// Import database connection instance configured with Drizzle ORM
import {db} from '../db/connection';

// Import the users table schema definition from our database schema
import {users} from '../db/schema';

// Import JWT token generation utility for authentication
import {generateToken} from '../utils/jwt';

// Import password utility functions for hashing and comparing passwords
import { hashPassword, comparePasswords } from '../utils/passwords';

// Import 'eq' helper from Drizzle ORM for equality comparisons in queries
// Used like: eq(users.email, 'test@example.com') instead of SQL: WHERE email = 'test@example.com'
import {eq} from 'drizzle-orm';

// ============================================
// REGISTER FUNCTION
// ============================================
/**
 * Handles user registration (sign up)
 * This function creates a new user account in the database
 * 
 * Process:
 * 1. Extract user data from request body
 * 2. Hash the password for security
 * 3. Save user to database
 * 4. Generate authentication token
 * 5. Return success response with token
 * 
 * @param req - Express Request object containing user registration data
 * @param res - Express Response object used to send back the result
 */
export const register = async (req: Request, res: Response) => {
    try{
        // STEP 1: Extract user data from the request body
        // Destructuring: pulls specific properties from req.body object
        const {carnet, password, username, phone} = req.body;
        
        // STEP 2: Hash the password before storing it
        // SECURITY: Never store plain text passwords! Hashing is one-way encryption.
        // Even if someone steals the database, they can't see actual passwords
        const hashedPassword = await hashPassword(password);
        
        // STEP 3: Insert new user into database
        // db.insert() creates a new row in the users table
        // .values() specifies what data to insert
        // .returning() tells the database to return the newly created user data
        // The [user] syntax destructures the first element from the returned array
        const [user] = await db.insert(users).values({
            carnet: carnet,
            username: username,
            password: hashedPassword,
            phone: phone,
        }).returning({
            // Specify which fields to return (don't return the password!)
            id: users.id,
            carnet: users.carnet,
            username: users.username,
            phone: users.phone,
            created_at: users.created_at
        });

        // STEP 4: Generate JWT (JSON Web Token) for authentication
        // This token will be sent to the client and used for future authenticated requests
        // Think of it like a temporary access badge that proves the user is logged in
        const token = await generateToken({
            id: user.id,
            carnet: user.carnet,
            username: user.username
        });
        
        // STEP 5: Send success response
        // Status 201 = "Created" - standard HTTP code for successful resource creation
        // Include the created user so the frontend can initialize auth state immediately
        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                carnet: user.carnet,
                username: user.username,
                created_at: user.created_at
            }
        });
        
    }catch (error){
        // ERROR HANDLING: If anything goes wrong (duplicate email, database error, etc.)
        // Log the error for debugging
        console.error('Error during registration:', error);
        
        // Send error response to client
        // Status 500 = "Internal Server Error" - something went wrong on the server
        res.status(500).json({message: 'Failed to register user'});
    }
}

// ============================================
// LOGIN FUNCTION
// ============================================
/**
 * Handles user login (sign in)
 * This function authenticates existing users
 * 
 * Process:
 * 1. Extract email and password from request
 * 2. Find user in database by email
 * 3. Verify user exists
 * 4. Compare provided password with stored hashed password
 * 5. Generate authentication token if valid
 * 6. Return success response with user data and token
 * 
 * @param req - Express Request object containing login credentials (email, password)
 * @param res - Express Response object used to send back the result
 */
export const login = async (req: Request, res: Response) => {
    try{
        // STEP 1: Extract login credentials from request body
        const {carnet, password} = req.body;
        
        // STEP 2: Search for user in database by email
        // db.query.users.findFirst() returns the first matching user or undefined
        // eq(users.email, email) creates a WHERE clause: WHERE email = 'provided_email'
        const user = await db.query.users.findFirst({
            where: eq(users.carnet, carnet)
        })

        // STEP 3: Check if user exists
        // SECURITY: Use generic message "Invalid credentials" to avoid revealing
        // whether the email exists in the database (prevents user enumeration attacks)
        if(!user){
            // Status 401 = "Unauthorized" - authentication failed
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // STEP 4: Verify password
        // comparePasswords() hashes the provided password and compares it with stored hash
        // This is secure because we never decrypt the stored password
        const isPasswordValid = await comparePasswords(password, user.password);
        
        if(!isPasswordValid){
            // SECURITY: Same generic error message for wrong password
            // This prevents attackers from knowing if email was correct
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // STEP 5: Generate JWT token for authenticated session
        // This token proves the user successfully logged in
        // Client will include this token in future requests to access protected routes
        const token = await generateToken({
            id: user.id,
            username: user.username,
            carnet: user.carnet
        });

        // STEP 6: Send success response with user data and token
        // Status 201 = "Created" (though 200 "OK" would also be appropriate for login)
        // Return user info (excluding password) and authentication token
        return res.status(201).json({
            message: 'Login successful', 
            user:{
                id: user.id,
                carnet: user.carnet,
                username: user.username,
                created_at: user.created_at
            },
            token  // Client should store this and send it with future requests
        });

    }catch (error){
        // ERROR HANDLING: Catch any unexpected errors (database connection issues, etc.)
        console.error('Error during login:', error);
        
        // Status 500 = "Internal Server Error"
        res.status(500).json({message: 'Failed to login user'});
    }
}