// ============================================
// PASSWORD SECURITY UTILITIES
// ============================================
/**
 * This file handles password hashing and verification using bcrypt
 * 
 * WHY BCRYPT?
 * - Bcrypt is a password hashing algorithm designed to be SLOW
 * - Being slow is GOOD for security - it makes brute-force attacks impractical
 * - It automatically adds a random "salt" to each password
 * - Even if two users have the same password, the hashes will be different
 * 
 * SECURITY PRINCIPLE: Never store plain text passwords!
 * If someone steals your database, hashed passwords can't be easily reversed
 */

// Import bcrypt library for secure password hashing
import bcrypt from 'bcrypt';

// Import environment configuration (contains BCRYPT_ROUNDS setting)
import env from '../../env';

// ============================================
// HASH PASSWORD FUNCTION
// ============================================
/**
 * Converts a plain text password into a secure hash
 * 
 * HOW IT WORKS:
 * 1. Takes the user's password (plain text like "password123")
 * 2. Adds a random "salt" (random data) to prevent rainbow table attacks
 * 3. Runs it through bcrypt algorithm multiple times (based on BCRYPT_ROUNDS)
 * 4. Returns a hash like: "$2b$12$KIXl6Y9Z8Q7X5..."
 * 
 * BCRYPT_ROUNDS (from env.ts):
 * - Controls how many times the algorithm runs
 * - Higher = more secure but slower
 * - Default is 12 (good balance between security and performance)
 * - Each increment doubles the time needed
 * 
 * IMPORTANT: This is a ONE-WAY function
 * You cannot convert the hash back to the original password
 * To verify a password, you must hash it again and compare hashes
 * 
 * @param password - The plain text password from user input
 * @returns A promise that resolves to the hashed password string
 * 
 * @example
 * const hashed = await hashPassword("mySecretPass");
 * // Returns: "$2b$12$KIXl6Y9Z8Q7X5P9qR3vW4.eL2mN6oP8qR5sT7uV9wX1yZ3aB5cD7e"
 */
export const hashPassword = async (password: string) => {
    // bcrypt.hash() performs the actual hashing
    // - First parameter: the plain text password to hash
    // - Second parameter: number of rounds (from environment config)
    // - Returns: a hashed version that's safe to store in database
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

// ============================================
// COMPARE PASSWORDS FUNCTION
// ============================================
/**
 * Verifies if a plain text password matches a stored hash
 * Used during login to check if user entered correct password
 * 
 * HOW IT WORKS:
 * 1. Takes the password user just typed in (plain text)
 * 2. Takes the hashed password from database
 * 3. Bcrypt extracts the salt from the stored hash
 * 4. Hashes the plain text password using that same salt
 * 5. Compares the two hashes
 * 6. Returns true if they match, false if they don't
 * 
 * WHY NOT JUST COMPARE STRINGS?
 * Because we never store plain passwords! We only store hashes.
 * This function is the ONLY way to verify a password is correct.
 * 
 * SECURITY NOTE:
 * This comparison is done in "constant time" to prevent timing attacks
 * (attackers can't guess the password by measuring how long comparison takes)
 * 
 * @param password - The plain text password user entered (e.g., at login)
 * @param hashedPassword - The hashed password stored in database
 * @returns A promise that resolves to true if passwords match, false otherwise
 * 
 * @example
 * // During login:
 * const userInput = "mySecretPass";
 * const storedHash = "$2b$12$KIXl6Y9Z8Q7X5P9qR3vW4.eL2mN6oP8qR5sT7uV9wX1yZ3aB5cD7e";
 * const isValid = await comparePasswords(userInput, storedHash);
 * // Returns: true if password is correct, false if wrong
 */
export const comparePasswords = async(password: string, hashedPassword: string) => {
    // bcrypt.compare() securely checks if passwords match
    // - First parameter: plain text password user just entered
    // - Second parameter: hashed password from database
    // - Returns: boolean - true if match, false if no match
    return bcrypt.compare(password, hashedPassword);
};