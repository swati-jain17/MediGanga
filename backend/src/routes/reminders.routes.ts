import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as remindersController from '../controllers/reminders.controller.js';

const router = Router();

// All routes require authentication
router.get('/', authenticate, remindersController.getReminders);
router.post('/', authenticate, remindersController.createReminder);
router.post('/:reminderId/log', authenticate, remindersController.logReminderAction);
router.delete('/:reminderId', authenticate, remindersController.deleteReminder);
router.get('/today', authenticate, remindersController.getTodayLogs);

// Inventory routes
router.get('/inventory', authenticate, remindersController.getInventory);
router.post('/inventory', authenticate, remindersController.addToInventory);
router.get('/inventory/low-stock', authenticate, remindersController.getLowStockForRefill);

export default router;
