import dotenv from 'dotenv';
dotenv.config();

export const env = {
    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // External APIs
    googleCloudVisionKey: process.env.GOOGLE_CLOUD_VISION_KEY || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    emailUser: process.env.EMAIL_USER || '',
    emailPass: process.env.EMAIL_PASS || '',
    resendApiKey: process.env.RESEND_API_KEY || '',

    // PhonePe
    phonePeMerchantId: process.env.PHONEPE_MERCHANT_ID || '',
    phonePeSaltKey: process.env.PHONEPE_SALT_KEY || '',
    phonePeSaltIndex: process.env.PHONEPE_SALT_INDEX || '1',
    phonePeHostUrl: process.env.PHONEPE_HOST_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox',


    // Server
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Computed
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
};
