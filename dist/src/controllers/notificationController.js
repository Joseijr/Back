"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const connection_1 = __importDefault(require("../db/connection"));
const schema_1 = require("../db/schema");
const createNotification = async (req, res) => {
    try {
        const { recipientId, claimantId, postId, postTitle, message, detail, timeReference, claimantName, claimantPhone, claimantCarnet, recipientName, } = req.body;
        if (!recipientId || !claimantId || !postId) {
            return res.status(400).json({ message: 'recipientId, claimantId and postId are required' });
        }
        const [created] = await connection_1.default
            .insert(schema_1.notifications)
            .values({
            recipient_id: recipientId,
            actor_id: claimantId,
            post_id: postId,
            type: 'post_request',
            title: postTitle || 'Nuevo reclamo',
            content: message || detail || 'Nuevo reclamo recibido',
            is_read: false,
        })
            .returning();
        return res.status(201).json({
            message: 'Notification created successfully',
            notification: {
                ...created,
                claimantName,
                claimantPhone,
                claimantCarnet,
                recipientName,
                postTitle,
                timeReference,
                detail,
            },
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({
            message: 'Failed to create notification',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.createNotification = createNotification;
