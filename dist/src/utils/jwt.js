"use strict";
// ============================================
// JWT (JSON Web Token) UTILITIES
// ============================================
/**
 * This file handles JWT token creation and verification
 *
 * WHAT IS A JWT?
 * - JWT = JSON Web Token
 * - A secure way to transmit information between parties
 * - Think of it like a digital "access badge" that proves who you are
 * - Used for authentication: proves a user is logged in without storing sessions
 *
 * HOW IT WORKS:
 * 1. User logs in with username/password
 * 2. Server generates a JWT containing user info (id, email, username)
 * 3. Server sends JWT to client (browser/mobile app)
 * 4. Client stores JWT (usually in localStorage or httpOnly cookie)
 * 5. Client sends JWT with every request to protected routes
 * 6. Server verifies JWT to confirm user identity
 *
 * JWT STRUCTURE: Three parts separated by dots
 * - Header.Payload.Signature
 * - Example: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyJ9.abc123def456"
 *
 * WHY USE JWT?
 * - Stateless: Server doesn't need to store session data
 * - Scalable: Works across multiple servers
 * - Mobile-friendly: Easy to use in apps
 * - Self-contained: Contains all needed user info
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
// Import JWT functions from 'jose' library (modern JWT library for Node.js)
// - SignJWT: Creates and signs new tokens
// - jwtVerify: Verifies and decodes tokens
// - JoseJWTPayload: TypeScript type for JWT payload
const jose_1 = require("jose");
// Import crypto function to create secret keys for signing/verifying tokens
const crypto_1 = require("crypto");
// Import environment configuration (contains JWT_SECRET and JWT_EXPIRES_IN)
const env_1 = __importDefault(require("../../env"));
// ============================================
// GENERATE TOKEN FUNCTION
// ============================================
/**
 * Creates a new JWT token for an authenticated user
 * This is called after successful login or registration
 *
 * HOW IT WORKS:
 * 1. Takes user data (id, email, username)
 * 2. Gets secret key from environment config
 * 3. Creates a JWT with:
 *    - User data in payload
 *    - Algorithm for signing (HS256)
 *    - Issue timestamp (when created)
 *    - Expiration time (when it expires)
 * 4. Signs the token with secret key (prevents tampering)
 * 5. Returns the complete token string
 *
 * TOKEN LIFECYCLE:
 * - Generated: During login/registration
 * - Stored: By client (browser/app)
 * - Used: Sent with every API request
 * - Verified: By server on protected routes
 * - Expires: After JWT_EXPIRES_IN time (default: 1 hour)
 *
 * @param payload - User information to embed in the token
 * @returns A promise that resolves to a signed JWT token string
 *
 * @example
 * const token = await generateToken({
 *   id: "123e4567-e89b-12d3-a456-426614174000",
 *   carnet: "123456",
 *   username: "john_doe"
 * });
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyM..."
 */
const generateToken = async (payload) => {
    // STEP 1: Get the secret key from environment variables
    // This secret is used to sign the token (like a digital signature)
    // CRITICAL: This must be kept secret! Never expose it to clients.
    const secret = env_1.default.JWT_SECRET;
    // STEP 2: Convert the secret string into a proper cryptographic key
    // createSecretKey() creates a Key object suitable for signing JWTs
    const secretKey = (0, crypto_1.createSecretKey)(secret, 'utf-8');
    // STEP 3: Create and sign the JWT token
    const token = await new jose_1.SignJWT(payload) // Create new JWT with user data
        .setProtectedHeader({ alg: 'HS256' }) // Set algorithm: HS256 (HMAC with SHA-256)
        .setIssuedAt() // Add 'iat' claim: timestamp when token was created
        .setExpirationTime(env_1.default.JWT_EXPIRES_IN) // Add 'exp' claim: when token expires (e.g., '1h')
        .sign(secretKey); // Sign with secret key (creates signature)
    // STEP 4: Return the complete token string
    // Format: "header.payload.signature"
    // Client should store this and include it in Authorization header
    return token;
};
exports.generateToken = generateToken;
// ============================================
// VERIFY TOKEN FUNCTION
// ============================================
/**
 * Verifies and decodes a JWT token
 * Used in authentication middleware to validate incoming requests
 *
 * HOW IT WORKS:
 * 1. Takes a token string (from Authorization header)
 * 2. Gets the same secret key used to sign the token
 * 3. Verifies the signature (ensures token wasn't tampered with)
 * 4. Checks expiration (ensures token is still valid)
 * 5. Returns the decoded payload (user data)
 *
 * WHAT CAN GO WRONG?
 * - Invalid signature: Token was modified or signed with wrong key
 * - Expired token: Token is too old (past JWT_EXPIRES_IN)
 * - Malformed token: Not a valid JWT format
 * - All errors throw exceptions that should be caught by calling code
 *
 * SECURITY CHECKS (automatic):
 * ✓ Signature verification: Proves token wasn't tampered with
 * ✓ Expiration check: Ensures token isn't too old
 * ✓ Algorithm check: Prevents algorithm substitution attacks
 *
 * @param token - The JWT token string to verify (from Authorization header)
 * @returns A promise that resolves to the decoded user payload
 * @throws Error if token is invalid, expired, or tampered with
 *
 * @example
 * try {
 *   const payload = await verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6...");
 *   console.log(payload.id);       // "123e4567-e89b-12d3-a456-426614174000"
 *   console.log(payload.carnet);    // "123456"
 *   console.log(payload.username); // "john_doe"
 * } catch (error) {
 *   // Token is invalid, expired, or tampered with
 *   console.error("Invalid token:", error);
 * }
 */
const verifyToken = async (token) => {
    // STEP 1: Get the secret key from environment variables
    // Must be the SAME secret used to sign the token
    const secret = env_1.default.JWT_SECRET;
    // STEP 2: Convert secret string to cryptographic key
    const secretKey = (0, crypto_1.createSecretKey)(secret, 'utf-8');
    // STEP 3: Verify and decode the token
    // jwtVerify() does multiple security checks:
    // - Verifies signature matches (proves token is authentic)
    // - Checks token hasn't expired
    // - Validates JWT structure
    // If any check fails, it throws an error
    const { payload } = await (0, jose_1.jwtVerify)(token, secretKey);
    // STEP 4: Return the decoded payload as our custom type
    // TypeScript cast: We know this payload matches our CustomJWTPayload structure
    return payload;
};
exports.verifyToken = verifyToken;
