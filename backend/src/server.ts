import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes 
import authRoutes from './routes/auth.routes.js';
import medicinesRoutes from './routes/medicines.routes.js';
import prescriptionsRoutes from './routes/prescriptions.routes.js';
import interactionsRoutes from './routes/interactions.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import darkstoresRoutes from './routes/darkstores.routes.js';
import adminRoutes from './routes/admin.routes.js';
// New feature routes 
import subscriptionRoutes from './routes/subscription.routes.js';
import loyaltyRoutes from './routes/loyalty.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import consultationsRoutes from './routes/consultations.routes.js';
import symptomCheckerRoutes from './routes/symptom-checker.routes.js';
import ocrRoutes from './routes/ocr.routes.js';
import reviewRoutes from './routes/review.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();
const httpServer = createServer(app);

// Allowed origins 
const allowedOrigins = [
    env.frontendUrl,
    'https://mediganga.in',
    'https://www.mediganga.in',
    'https://medi-ganga.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

// Socket.IO setup for real-time tracking 
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    },
});

// Middleware 
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files 
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('backend/uploads'));

// Serve medicine images from frontend public folder (fallback)
app.use('/medicines', express.static(path.join(process.cwd(), '../frontend/public/medicines')));
app.use('/medicines', express.static(path.join(__dirname, '../../frontend/public/medicines')));


// Health check 
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: env.nodeEnv,
    });
});

app.get('/', (_req, res) => {
    res.send('🏥 MEDIGANGA API is running');
});

// API Routes 
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/darkstores', darkstoresRoutes);
app.use('/api/admin', adminRoutes);

// New feature routes 
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/symptom-checker', symptomCheckerRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// Error handling 
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO connection handling 
io.on('connection', (socket) => {
    console.log('📱 Client connected:', socket.id);

    // Join order tracking room 
    socket.on('track-order', (orderId: string) => {
        socket.join(`order:${orderId}`);
        console.log(`📍 Socket ${socket.id} tracking order ${orderId}`);
    });

    // Leave order tracking room 
    socket.on('stop-tracking', (orderId: string) => {
        socket.leave(`order:${orderId}`);
    });

    // Delivery partner updates location 
    socket.on('update-location', (data: { orderId: string; latitude: number; longitude: number; heading?: number }) => {
        io.to(`order:${data.orderId}`).emit('rider-location', {
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading,
            timestamp: new Date().toISOString(),
        });
    });

    // Order status change 
    socket.on('order-status-change', (data: { orderId: string; status: string }) => {
        io.to(`order:${data.orderId}`).emit('order-status', {
            status: data.status,
            timestamp: new Date().toISOString(),
        });
    });

    socket.on('disconnect', () => {
        console.log('📴 Client disconnected:', socket.id);
    });
});

// Export for external use (e.g., from controllers) 
export { io };

// Start server 
httpServer.listen(env.port, () => {
    console.log(` 
🏥 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
   MEDIGANGA Backend Server 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
   🚀 Server running on port ${env.port} 
   🌍 Environment: ${env.nodeEnv} 
   📡 API: http://localhost:${env.port}/api 
   💚 Health: http://localhost:${env.port}/health 
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
  `);
}); 
