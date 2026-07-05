"use strict";
/**
 * EXPRESS APPLICATION SETUP
 * This file configures the Express application with middleware and settings.
 * It sets up security, parsing, logging, and static file serving.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
/**
 * CORS (Cross-Origin Resource Sharing)
 * Allows the API to accept requests from different domains/origins
 * This is essential for frontend applications hosted on different servers
 */
// Allow any origin. Use origin: true to reflect the request origin and keep credentials support.
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
/**
 * HELMET
 * Sets various HTTP headers to help protect the app from common web vulnerabilities
 * Examples: XSS attacks, clickjacking, etc.
 */
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
/**
 * JSON PARSER
 * Parses incoming requests with JSON payloads
 * Makes the parsed data available in req.body
 */
app.use(express_1.default.json());
/**
 * URL-ENCODED PARSER
 * Parses incoming requests with URL-encoded payloads (form submissions)
 * extended: true allows for rich objects and arrays to be encoded
 */
app.use(express_1.default.urlencoded({ extended: true }));
/**
 * MORGAN LOGGER
 * HTTP request logger middleware
 * Logs request information in 'dev' format (colored by response status)
 * Skips logging when running tests
 */
app.use((0, morgan_1.default)('dev', {
    skip: () => process.env.NODE_ENV === 'test'
}));
/**
 * STATIC FILE SERVING - PUBLIC FOLDER
 * Serves static files from the 'public' folder
 * Files in this folder can be accessed directly via URL
 * Example: public/logo.png can be accessed at http://localhost:3000/logo.png
 */
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
// ============================================================
// NEW FOR IMAGE UPLOADING
// ============================================================
/**
 * STATIC FILE SERVING - UPLOADS FOLDER
 * Serves uploaded vehicle images from the 'uploads' folder
 * This allows clients to access uploaded images via URL
 *
 * Example:
 * If an image is saved as: uploads/550e8400-e29b-41d4-a716-446655440000.jpg
 * It can be accessed at: http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg
 *
 * The first parameter '/uploads' is the URL path prefix
 * The second parameter is the actual folder path on the server
 */
//app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// ============================================================
exports.default = app;
