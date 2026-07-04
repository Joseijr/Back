/**
 * FILE HELPER UTILITIES
 * This file contains utility functions for managing files in the application.
 * These functions help with tasks like deleting files and generating unique filenames.
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * DELETE FILE FUNCTION
 * This function safely deletes a file from the file system.
 * It's useful when we need to clean up old images (e.g., when updating or deleting a vehicle).
 * 
 * @param filename - The name of the file to delete (e.g., "550e8400-e29b-41d4-a716-446655440000.jpg")
 * @returns Promise<boolean> - Returns true if deletion was successful, false otherwise
 * 
 * Example usage:
 * await deleteFile('old-vehicle-image.jpg');
 */
export const deleteFile = async (filename: string): Promise<boolean> => {
    try {
        // If no filename is provided, there's nothing to delete
        if (!filename) {
            return false;
        }

        // Construct the full path to the file
        // path.join() safely combines directory paths regardless of operating system
        // __dirname would be the 'src/utils' directory, so we go up two levels (.., ..)
        // to reach the project root, then into the 'uploads' folder
        const filePath = path.join(__dirname, '..', '..', 'uploads', filename);

        // Check if the file exists before attempting to delete it
        // fs.existsSync() returns true if the file exists, false otherwise
        if (fs.existsSync(filePath)) {
            // Delete the file synchronously (waits until deletion is complete)
            // fs.unlinkSync() removes the file from the file system
            fs.unlinkSync(filePath);
            
            console.log(`File deleted successfully: ${filename}`);
            return true;
        } else {
            // File doesn't exist, so there's nothing to delete
            console.log(`File not found: ${filename}`);
            return false;
        }
    } catch (error) {
        // If any error occurs during deletion, log it and return false
        console.error(`Error deleting file ${filename}:`, error);
        return false;
    }
};

/**
 * GENERATE UNIQUE FILENAME FUNCTION
 * This function creates a unique filename using UUID to prevent naming conflicts.
 * It preserves the original file extension.
 * 
 * @param originalName - The original name of the uploaded file
 * @returns string - A unique filename with the same extension
 * 
 * Example:
 * Input: "my-car-photo.jpg"
 * Output: "550e8400-e29b-41d4-a716-446655440000.jpg"
 */
export const generateUniqueFilename = (originalName: string): string => {
    // Extract the file extension from the original filename
    // path.extname() returns the extension including the dot (e.g., ".jpg")
    const fileExtension = path.extname(originalName);
    
    // Generate a UUID (Universally Unique Identifier)
    // UUID is a 128-bit number represented as a string like:
    // "550e8400-e29b-41d4-a716-446655440000"
    // This ensures each filename is unique
    const uniqueId = randomUUID();
    
    // Combine the UUID with the file extension
    return `${uniqueId}${fileExtension}`;
};

/**
 * CHECK FILE EXISTS FUNCTION
 * This function checks if a file exists in the uploads directory.
 * Useful for validation before performing operations on files.
 * 
 * @param filename - The name of the file to check
 * @returns boolean - Returns true if file exists, false otherwise
 */
export const fileExists = (filename: string): boolean => {
    try {
        // If no filename provided, return false
        if (!filename) {
            return false;
        }

        // Construct the full path to the file
        const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
        
        // Check if file exists and return the result
        return fs.existsSync(filePath);
    } catch (error) {
        console.error(`Error checking file existence for ${filename}:`, error);
        return false;
    }
};

/**
 * GET FILE SIZE FUNCTION
 * This function returns the size of a file in bytes.
 * Useful for validating file sizes or displaying file information.
 * 
 * @param filename - The name of the file
 * @returns number - File size in bytes, or 0 if file doesn't exist
 */
export const getFileSize = (filename: string): number => {
    try {
        if (!filename) {
            return 0;
        }

        const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return 0;
        }

        // Get file stats (information about the file)
        const stats = fs.statSync(filePath);
        
        // Return the size in bytes
        return stats.size;
    } catch (error) {
        console.error(`Error getting file size for ${filename}:`, error);
        return 0;
    }
};

/**
 * VALIDATE IMAGE FILE FUNCTION
 * This function validates if a file is a valid image based on its extension.
 * 
 * @param filename - The name of the file to validate
 * @returns boolean - Returns true if file has a valid image extension
 */
export const isValidImageExtension = (filename: string): boolean => {
    // List of valid image extensions (in lowercase)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // Get the file extension and convert to lowercase for comparison
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Check if the extension is in our list of valid extensions
    return validExtensions.includes(fileExtension);
};
