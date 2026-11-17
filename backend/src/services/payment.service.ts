import { env } from '../config/env.js';
import crypto from 'crypto';

// Note: In production, use actual Razorpay SDK
// This is a placeholder implementation

interface PaymentOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}

interface PaymentVerification {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * Create a payment order
 * In production: Use Razorpay Orders API
 */
export async function createPaymentOrder(
    amount: number,
    orderId: string
): Promise<PaymentOrder> {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
        // Mock payment order for development
        return {
            id: `order_${crypto.randomBytes(12).toString('hex')}`,
            amount: amount * 100, // Razorpay uses paise
            currency: 'INR',
            receipt: orderId,
            status: 'created',
        };
    }

    // Production Razorpay implementation:
    // const instance = new Razorpay({
    //   key_id: env.razorpayKeyId,
    //   key_secret: env.razorpayKeySecret,
    // });
    // 
    // const order = await instance.orders.create({
    //   amount: amount * 100,
    //   currency: 'INR',
    //   receipt: orderId,
    // });
    // 
    // return order;

    return {
        id: `order_${crypto.randomBytes(12).toString('hex')}`,
        amount: amount * 100,
        currency: 'INR',
        receipt: orderId,
        status: 'created',
    };
}

/**
 * Verify payment signature
 * In production: Verify Razorpay signature
 */
export function verifyPaymentSignature(payload: PaymentVerification): boolean {
    if (!env.razorpayKeySecret) {
        // In development, always return true
        return true;
    }

    const body = payload.razorpay_order_id + '|' + payload.razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', env.razorpayKeySecret)
        .update(body)
        .digest('hex');

    return expectedSignature === payload.razorpay_signature;
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string): Promise<{
    id: string;
    amount: number;
    status: string;
    method: string;
}> {
    // Mock payment details
    return {
        id: paymentId,
        amount: 50000, // ₹500 in paise
        status: 'captured',
        method: 'upi',
    };
}

/**
 * Process refund
 */
export async function processRefund(
    paymentId: string,
    amount: number
): Promise<{ id: string; status: string }> {
    console.log(`[Refund] Processing refund of ₹${amount} for payment ${paymentId}`);

    // Mock refund
    return {
        id: `refund_${crypto.randomBytes(8).toString('hex')}`,
        status: 'processed',
    };
}


/**
 * Initiate PhonePe Payment
 */
export async function initiatePhonePePayment(
    amount: number,
    orderId: string,
    userId: string,
    mobileNumber: string,
    options?: { redirectUrl?: string; callbackUrl?: string; merchantTransactionId?: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        if (!env.phonePeMerchantId || !env.phonePeSaltKey) {
            throw new Error('PhonePe credentials not configured');
        }

        const transactionId = options?.merchantTransactionId || `TXN_${orderId}_${Date.now()}`;

        const redirectUrl = options?.redirectUrl || `${env.frontendUrl}/orders/${orderId}?source=phonepe&transactionId=${transactionId}`;
        const callbackUrl = options?.callbackUrl || `${env.frontendUrl}/api/orders/payment/callback/phonepe`;

        const payload = {
            merchantId: env.phonePeMerchantId,
            merchantTransactionId: transactionId,
            merchantUserId: userId,
            amount: amount * 100, // Amount in paise
            redirectUrl: redirectUrl,
            redirectMode: 'REDIRECT',
            callbackUrl: callbackUrl,
            mobileNumber: mobileNumber,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const saltKey = env.phonePeSaltKey;
        const saltIndex = env.phonePeSaltIndex;

        const stringToSign = base64Payload + '/pg/v1/pay' + saltKey;
        const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const checksum = sha256 + '###' + saltIndex;

        const optionsReq = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
            },
            body: JSON.stringify({ request: base64Payload })
        };

        const response = await fetch(`${env.phonePeHostUrl}/pg/v1/pay`, optionsReq);
        const data = await response.json() as any;

        if (data.success) {
            return {
                success: true,
                data: {
                    redirectUrl: data.data.instrumentResponse.redirectInfo.url,
                    transactionId
                }
            };
        } else {
            return { success: false, error: data.message || 'Payment initiation failed' };
        }

    } catch (error: any) {
        console.error('PhonePe Initiation Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify PhonePe Payment Status
 */
export async function verifyPhonePePayment(merchantTransactionId: string): Promise<{ success: boolean; status: string }> {
    try {
        const merchantId = env.phonePeMerchantId;
        const saltKey = env.phonePeSaltKey;
        const saltIndex = env.phonePeSaltIndex;

        const stringToSign = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
        const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const checksum = sha256 + '###' + saltIndex;

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            }
        };

        const response = await fetch(`${env.phonePeHostUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`, options);
        const data = await response.json() as any;

        if (data.success && data.code === 'PAYMENT_SUCCESS') {
            return { success: true, status: 'paid' };
        } else if (data.code === 'PAYMENT_PENDING') {
            return { success: false, status: 'pending' };
        } else {
            return { success: false, status: 'failed' };
        }

    } catch (error) {
        console.error('PhonePe Verification Error:', error);
        return { success: false, status: 'error' };
    }
}
