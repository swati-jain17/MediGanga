import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/admin/dashboardController.js';
import { getPrescriptions, verifyPrescription } from '../controllers/admin/prescriptionController.js';
import { getOrders, updateOrderStatus, getOrderDetails } from '../controllers/admin/orderController.js';
import { getUsers, updateUserRole } from '../controllers/admin/userController.js';
import { getInventory, addMedicine, updateMedicine, deleteMedicine } from '../controllers/admin/inventoryController.js';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/admin/subscriptionController.js';
import { getAllReviews, deleteReview } from '../controllers/reviewController.js';

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorize(['admin', 'super_admin', 'order_manager', 'inventory_manager']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions/:id/verify', verifyPrescription);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

// Inventory
router.get('/inventory', getInventory);
router.post('/inventory', addMedicine);
router.put('/inventory/:id', updateMedicine);
router.delete('/inventory/:id', deleteMedicine);

// Subscription Plans
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

export default router;
