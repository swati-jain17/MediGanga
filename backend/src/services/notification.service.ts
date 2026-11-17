import { env } from '../config/env.js';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Note: In production, use actual Twilio client
// This is a placeholder that logs notifications

interface SMSPayload {
    to: string;
    message: string;
}

interface WhatsAppPayload {
    to: string;
    message: string;
    templateId?: string;
}

/**
 * Send SMS notification
 * In production: Use Twilio SMS API
 */
export async function sendSMS(payload: SMSPayload): Promise<boolean> {
    if (!env.twilioAccountSid || !env.twilioAuthToken) {
        console.log(`[SMS Mock] To: ${payload.to} | Message: ${payload.message}`);
        return true;
    }

    // Production Twilio implementation:
    // const client = twilio(env.twilioAccountSid, env.twilioAuthToken);
    // await client.messages.create({
    //   body: payload.message,
    //   from: env.twilioPhoneNumber,
    //   to: `+91${payload.to}`
    // });

    console.log(`[SMS] Sent to ${payload.to}`);
    return true;
}

/**
 * Send WhatsApp notification
 * In production: Use Twilio WhatsApp API
 */
export async function sendWhatsApp(payload: WhatsAppPayload): Promise<boolean> {
    if (!env.twilioAccountSid || !env.twilioAuthToken) {
        console.log(`[WhatsApp Mock] To: ${payload.to} | Message: ${payload.message}`);
        return true;
    }

    // Production Twilio implementation:
    // const client = twilio(env.twilioAccountSid, env.twilioAuthToken);
    // await client.messages.create({
    //   body: payload.message,
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:+91${payload.to}`
    // });

    console.log(`[WhatsApp] Sent to ${payload.to}`);
    return true;
}

/**
 * Send Email notification
 * In production: Use Nodemailer or SendGrid
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
        // Option 1: Use Resend (Preferred for Cloud/Render)
        if (env.emailService === 'resend' && env.resendApiKey) {
            const resend = new Resend(env.resendApiKey);
            const data = await resend.emails.send({
                from: `MediGanga <${env.emailUser}>`, // Uses EMAIL_USER from .env (e.g. no-reply@mediganga.com)
                to: [to],
                subject: subject,
                html: html,
            });

            if (data.error) {
                console.error('❌ Resend API Error:', data.error);
                return false;
            }

            console.log(`✅ Email sent via Resend: ${data.data?.id}`);
            return true;
        }

        // Option 2: Fallback to Nodemailer (Gmail/SMTP)
        if (!env.emailUser || !env.emailPass) {
            console.warn('⚠️ EMAIL_USER or EMAIL_PASS missing. Falling back to mock email logging.');
            console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
            return true;
        }

        const isGmail = env.emailService === 'gmail';
        const transporterConfig = isGmail ? {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: env.emailUser,
                pass: env.emailPass,
            },
        } : {
            service: env.emailService,
            auth: {
                user: env.emailUser,
                pass: env.emailPass,
            },
        };

        // Explicitly set family to 4 for Gmail to avoid IPv6 issues
        if (isGmail) {
            // @ts-ignore
            transporterConfig.family = 4;
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        const info = await transporter.sendMail({
            from: `"MediGanga Support" <${env.emailUser}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent via SMTP: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
}

/**
 * Send OTP via SMS
 */
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Your MediGanga OTP is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
    });
}

/**
 * Send order confirmation
 */
export async function sendOrderConfirmation(
    phone: string,
    orderId: string,
    estimatedMinutes: number
): Promise<boolean> {
    return sendWhatsApp({
        to: phone,
        message: `🏥 MediGanga Order Confirmed!\n\nOrder ID: ${orderId.slice(0, 8).toUpperCase()}\n⏱️ Estimated delivery: ${estimatedMinutes} minutes\n\nTrack your order in the app.`,
    });
}

/**
 * Send order status update
 */
export async function sendOrderStatusUpdate(
    phone: string,
    orderId: string,
    status: string
): Promise<boolean> {
    const statusMessages: Record<string, string> = {
        verified: '✅ Your order has been verified by our pharmacist',
        preparing: '📦 Your medicines are being prepared',
        out_for_delivery: '🚴 Your order is out for delivery!',
        delivered: '🎉 Your order has been delivered. Thank you!',
        cancelled: '❌ Your order has been cancelled',
    };

    const message = statusMessages[status] || `Order status: ${status}`;

    return sendWhatsApp({
        to: phone,
        message: `MediGanga Order ${orderId.slice(0, 8).toUpperCase()}\n\n${message}`,
    });
}

/**
 * Send refill reminder
 */
export async function sendRefillReminder(
    phone: string,
    medicineName: string,
    daysRemaining: number
): Promise<boolean> {
    return sendWhatsApp({
        to: phone,
        message: `💊 Refill Reminder\n\nYour ${medicineName} supply will run out in ${daysRemaining} days.\n\nTap to reorder now in the MediGanga app.`,
    });
}

/**
 * Send prescription verification notification
 */
export async function sendPrescriptionVerified(
    phone: string,
    _prescriptionId: string,
    approved: boolean
): Promise<boolean> {
    if (approved) {
        return sendSMS({
            to: phone,
            message: `Your prescription has been verified by our pharmacist. You can now order Schedule H medicines. - MediGanga`,
        });
    } else {
        return sendSMS({
            to: phone,
            message: `Your prescription could not be verified. Please upload a clearer image or contact support. - MediGanga`,
        });
    }
}
