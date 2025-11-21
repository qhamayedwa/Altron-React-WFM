import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/database';

const router = Router();

router.use(authenticate);

// Get user notifications
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unreadOnly } = req.query;
    
    let sql = 'SELECT * FROM notifications WHERE user_id = $1';
    const params: any[] = [req.user!.id];
    
    if (unreadOnly === 'true') {
      sql += ' AND is_read = false';
    }
    
    sql += ' AND (expires_at IS NULL OR expires_at > NOW())';
    sql += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await query(sql, params);

    res.json({
      notifications: result.rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        priority: row.priority,
        isRead: row.is_read,
        actionUrl: row.action_url,
        actionText: row.action_text,
        createdAt: row.created_at,
        expiresAt: row.expires_at
      }))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.post('/read-all', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user!.id]
    );

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread count
router.get('/unread-count', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false AND (expires_at IS NULL OR expires_at > NOW())',
      [req.user!.id]
    );

    res.json({
      unreadCount: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
