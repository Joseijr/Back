"use strict";
/**
 * CAR CONTROLLER
 * This file contains all the business logic for vehicle-related operations.
 * Controllers handle the requests, process data, interact with the database,
 * and send responses back to the client.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPostById = exports.getAllPosts = exports.createPost = void 0;
const connection_1 = __importDefault(require("../db/connection"));
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const fileHelper_1 = require("../utils/fileHelper");
/**
 * CREATE VEHICLE CONTROLLER
 * This function handles the creation of a new vehicle with an optional image.
 *
 * Process:
 * 1. Extract vehicle data from request body
 * 2. Get uploaded file information (if provided)
 * 3. Insert vehicle into database
 * 4. Return success response with vehicle data
 *
 * If database insert fails and a file was uploaded, the file is deleted to prevent orphaned files.
 */
const createPost = async (req, res) => {
    try {
        // Extract vehicle data from the request body
        // These fields are sent from the client in the form-data
        const { title, description, category, user_id, authorUsername, image } = req.body;
        // ============================================================
        // NEW FOR IMAGE UPLOADING
        // ============================================================
        // Check if a file was uploaded
        // When using multer middleware (upload.single('image')), 
        // the uploaded file information is available in req.file
        let imageFilename = null;
        if (req.file) {
            // If a file was uploaded, multer automatically generates a unique filename
            // and saves it in the 'uploads' folder. We get the filename here.
            imageFilename = req.file.filename;
            console.log(`Image uploaded: ${imageFilename}`);
        }
        // ============================================================
        // Ensure the category exists in the categories table before inserting the post.
        // This prevents foreign key errors when the frontend sends a new category name.
        const existingCategory = await connection_1.default.query.post_categories.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.post_categories.name, category),
        });
        if (!existingCategory) {
            await connection_1.default.insert(schema_1.post_categories).values({
                name: category,
            });
        }
        // Insert the new vehicle into the database
        // The .insert() method adds a new row to the vehicles table
        // The .returning() method returns the inserted data
        const [newPost] = await connection_1.default
            .insert(schema_1.post)
            .values({
            title,
            user_id,
            category,
            description,
            authorUsername,
            image: imageFilename // Store the filename (or null if no image)
        })
            .returning(); // Returns the newly created vehicle with all fields including generated id
        // ============================================================
        // NEW FOR IMAGE UPLOADING
        // ============================================================
        // Construct the full image URL if an image was uploaded
        // This URL can be used by the frontend to display the image
        let imageUrl = null;
        if (newPost.image) {
            // Construct the URL based on the current request
            // Example: http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${newPost.image}`;
        }
        // ============================================================
        // Send success response with the created post data
        res.status(201).json({
            message: 'Post created successfully',
            post: {
                ...newPost,
                imageUrl // Include the full image URL in the response
            }
        });
    }
    catch (error) {
        // ============================================================
        // NEW FOR IMAGE UPLOADING
        // ============================================================
        // If an error occurs after the file was uploaded, we need to clean up
        // by deleting the uploaded file to prevent orphaned files on the server
        if (req.file) {
            await (0, fileHelper_1.deleteFile)(req.file.filename);
            console.log(`Cleaned up uploaded file after error: ${req.file.filename}`);
        }
        // ============================================================
        console.error('Error creating vehicle:', error);
        res.status(500).json({
            message: 'Failed to create vehicle',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createPost = createPost;
/**
 * GET ALL VEHICLES CONTROLLER
 * This function retrieves all vehicles from the database with their related information
 * (brand, category, fuel type) and includes the full image URL.
 *
 * UPDATED: Now uses Drizzle's relational query API for better performance
 */
const getAllPosts = async (req, res) => {
    try {
        // Use Drizzle's relational query API (query.vehicles.findMany)
        // This is more efficient than manual joins when relations are defined
        const results = await connection_1.default.query.post.findMany();
        const postsWithImageUrls = results.map((post) => ({
            id: post.id,
            title: post.title,
            description: post.description,
            category: post.category,
            authorUsername: post.authorUsername,
            imageUrl: post.image
                ? `${req.protocol}://${req.get("host")}/uploads/${post.image}`
                : null,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user_id: post.user_id,
        }));
        res.status(200).json(postsWithImageUrls);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            message: 'Failed to fetch posts',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllPosts = getAllPosts;
/**
 * GET POST BY ID CONTROLLER
 * This function retrieves a single post by its ID with all related information.
 *
 * UPDATED: Now uses Drizzle's relational query API for better performance
 */
const getPostById = async (req, res) => {
    try {
        // Get the post ID from the URL parameters
        // Ensure id is treated as a string (Express params can be string or string[])
        const id = req.params.id;
        // Use Drizzle's query API to get the post by id
        const postA = await connection_1.default.query.post.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.post.id, id)
        });
        // If post not found, return 404 error
        if (!postA) {
            return res.status(404).json({
                message: 'post not found'
            });
        }
        // Construct the response with image URL
        const postResponse = {
            id: postA.id,
            title: postA.title,
            description: postA.description,
            category: postA.category,
            authorUsername: postA.authorUsername,
            image: postA.image,
            imageUrl: postA.image
                ? `${req.protocol}://${req.get('host')}/uploads/${postA.image}`
                : null,
            created_at: postA.created_at,
            updated_at: postA.updated_at,
            user_id: postA.user_id
        };
        res.status(200).json(postResponse);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            message: 'Failed to fetch post',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPostById = getPostById;
/**
 * UPDATE post CONTROLLER
 * This function updates a post's information, including replacing its image if a new one is uploaded.
 */
const updatePost = async (req, res) => {
    try {
        // Get the post ID from the URL parameters
        // Ensure id is treated as a string
        const id = req.params.id;
        const { title, category, authorUsername, description } = req.body;
        // First, get the existing post to access the old image filename
        const [existingPost] = await connection_1.default
            .select()
            .from(schema_1.post)
            .where((0, drizzle_orm_1.eq)(schema_1.post.id, id));
        if (!existingPost) {
            // If Post doesn't exist and a file was uploaded, delete it
            if (req.file) {
                await (0, fileHelper_1.deleteFile)(req.file.filename);
            }
            return res.status(404).json({
                message: 'Post not found'
            });
        }
        // ============================================================
        // NEW FOR IMAGE UPLOADING
        // ============================================================
        // Handle image update
        let imageFilename = existingPost.image; // Keep the old image by default
        if (req.file) {
            // A new image was uploaded
            imageFilename = req.file.filename;
            // Delete the old image if it exists
            if (existingPost.image) {
                await (0, fileHelper_1.deleteFile)(existingPost.image);
                console.log(`Old image deleted: ${existingPost.image}`);
            }
        }
        // ============================================================
        // Update the post in the database
        const [updatedPost] = await connection_1.default
            .update(schema_1.post)
            .set({
            title,
            category,
            authorUsername,
            description: description || null,
            image: imageFilename,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.post.id, id))
            .returning();
        // ============================================================
        // NEW FOR IMAGE UPLOADING
        // ============================================================
        const imageUrl = updatedPost.image
            ? `${req.protocol}://${req.get('host')}/uploads/${updatedPost.image}`
            : null;
        // ============================================================
        res.status(200).json({
            message: 'Post updated successfully',
            post: {
                ...updatedPost,
                imageUrl
            }
        });
    }
    catch (error) {
        // Clean up uploaded file if update fails
        if (req.file) {
            await (0, fileHelper_1.deleteFile)(req.file.filename);
        }
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            message: 'Failed to update vehicle',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updatePost = updatePost;
/**
 * DELETE POST CONTROLLER
 * This function deletes a post from the database and removes its associated image file.
 */
const deletePost = async (req, res) => {
    try {
        // Get the post ID from the URL parameters
        // Ensure id is treated as a string
        const id = req.params.id;
        // First, get the post to access the image filename
        const [existingPost] = await connection_1.default
            .select()
            .from(schema_1.post)
            .where((0, drizzle_orm_1.eq)(schema_1.post.id, id));
        if (!existingPost) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }
        // Delete the post from the database
        await connection_1.default
            .delete(schema_1.post)
            .where((0, drizzle_orm_1.eq)(schema_1.post.id, id));
        // ============================================================
        // NEW FOR IMAGE UPLOADING
        // ============================================================
        // Delete the associated image file if it exists
        if (existingPost.image) {
            await (0, fileHelper_1.deleteFile)(existingPost.image);
            console.log(`Image deleted: ${existingPost.image}`);
        }
        // ============================================================
        res.status(200).json({
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting Post:', error);
        res.status(500).json({
            message: 'Failed to delete Post',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deletePost = deletePost;
