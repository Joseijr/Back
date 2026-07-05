import { Request, Response } from 'express';
import db from '../db/connection';
import { notifications } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createNotification = async (req: Request, res: Response) => {
  try {
    const {
      recipientId,
      claimantId,
      postId,
      postTitle,
      message,
      detail,
      timeReference,
      claimantName,
      claimantPhone,
      claimantCarnet,
      recipientName,
    } = req.body;

    if (!recipientId || !claimantId || !postId) {
      return res.status(400).json({ message: 'recipientId, claimantId and postId are required' });
    }

    const [created] = await db
      .insert(notifications)
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
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({
      message: 'Failed to create notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
