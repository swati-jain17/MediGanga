import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { useVideoCredit } from './subscription.controller.js';
import { initiatePhonePePayment } from '../services/payment.service.js';
import { env } from '../config/env.js';

/**
 * Consultations Controller
 * Handles video consultations with doctors
 */

// Get all available doctors
export async function getDoctors(req: Request, res: Response) {
    try {
        const { specialization, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause = 'WHERE is_available = TRUE';
        const params: any[] = [];

        if (specialization) {
            params.push(specialization);
            whereClause += ` AND specialization = $${params.length}`;
        }

        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM doctors ${whereClause}`,
            params
        );

        params.push(Number(limit), offset);
        const result = await db.query(`
            SELECT id, name, specialization, qualification, experience_years,
                   consultation_fee, rating, total_consultations, profile_image, bio, languages
            FROM doctors
            ${whereClause}
            ORDER BY rating DESC, total_consultations DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Get doctors error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
}

// Get doctor by ID
export async function getDoctorById(req: Request, res: Response) {
    try {
        const { doctorId } = req.params;

        const result = await db.query(
            'SELECT * FROM doctors WHERE id = $1',
            [doctorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Get doctor error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch doctor' });
    }
}

// Get available slots for a doctor
export async function getAvailableSlots(req: Request, res: Response) {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        let dateFilter = 'AND date >= CURRENT_DATE';
        const params: any[] = [doctorId];

        if (date) {
            params.push(date);
            dateFilter = `AND date = $${params.length}`;
        }

        const result = await db.query(`
            SELECT id, date, start_time, end_time, slot_duration_minutes
            FROM doctor_availability
            WHERE doctor_id = $1 ${dateFilter}
            ORDER BY date, start_time
            LIMIT 100
        `, params);

        // Get existing bookings to filter out taken slots
        const bookingsResult = await db.query(`
            SELECT scheduled_at 
            FROM consultations 
            WHERE doctor_id = $1 
            AND status != 'cancelled' 
            AND status != 'rejected'
            AND scheduled_at >= CURRENT_DATE
        `, [doctorId]);

        const bookedTimes = new Set(
            bookingsResult.rows.map(row => new Date(row.scheduled_at).toISOString())
        );

        // Generate individual slots from availability windows
        const slots = result.rows.flatMap(row => {
            const slots = [];
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            const start = new Date(`2000-01-01T${row.start_time}`);
            const end = new Date(`2000-01-01T${row.end_time}`);
            const duration = row.slot_duration_minutes || 15;

            while (start < end) {
                const timeStr = start.toTimeString().slice(0, 5);

                // Construct approximation of the slot time for checking conflicts
                // We use the date from row.date and time from start
                // Note: The comparison logic must align with how booking stores timestamps.
                // Since strict timezone alignment is hard without user context,
                // we rely on the fact that if a user books "10:00", it is stored.
                // We just need to ensure we don't allow "10:00" again.
                // Ideally, we'd check if `scheduledAt` matches. 
                // However, without precise timezone match, we might show a slot that is actually taken
                // if the server generates a slightly different ISO string than the frontend did.
                // Ideally, we should check ranges.

                // For now, let's assume standard behavior:
                // Frontend sends local time in ISO, Backend stores it.
                // We are generating slots. We need to filter out taken ones.

                const slotDateTime = new Date(`${dateStr}T${timeStr}:00`);
                // Check if any booking is within < 1 min of this slot
                const isBooked = [...bookedTimes].some(bookedIso => {
                    return Math.abs(new Date(bookedIso).getTime() - slotDateTime.getTime()) < 60000;
                });

                if (!isBooked) {
                    slots.push({
                        availabilityId: row.id,
                        date: dateStr,
                        time: timeStr,
                        duration
                    });
                }
                start.setMinutes(start.getMinutes() + duration);
            }
            return slots;
        });

        res.json({ success: true, data: slots });
    } catch (error: any) {
        console.error('Get slots error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch slots' });
    }
}

// Book a consultation
export async function bookConsultation(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { doctorId, slotId, scheduledAt, useCredit, patientNotes } = req.body;

        // Validation
        if (!scheduledAt) {
            return res.status(400).json({ success: false, error: 'Scheduled time is required' });
        }

        // Check for double booking
        const conflictResult = await db.query(`
            SELECT id FROM consultations 
            WHERE doctor_id = $1 
            AND status != 'cancelled' 
            AND status != 'rejected'
            AND (
                scheduled_at = $2::timestamp 
                OR (scheduled_at > $2::timestamp - INTERVAL '2 minutes' AND scheduled_at < $2::timestamp + INTERVAL '2 minutes')
            )
        `, [doctorId, scheduledAt]);

        if (conflictResult.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'This time slot is already booked' });
        }

        // Get doctor fee
        const doctorResult = await db.query(
            'SELECT consultation_fee, name FROM doctors WHERE id = $1',
            [doctorId]
        );

        if (doctorResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        const doctor = doctorResult.rows[0];
        let feePaid = parseFloat(doctor.consultation_fee);
        let usedCredit = false;

        // Check for payment if not using credit
        if (!useCredit) {
            const { paymentMethod } = req.body;

            if (paymentMethod === 'phonepe') {
                // Double check if payment is needed (fee > 0)
                if (feePaid > 0) {
                    const transactionId = `CONS_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                    // Create a temp slot reservation or just pass slotId to verify later

                    const paymentResult = await initiatePhonePePayment(
                        feePaid,
                        `CONS-${doctorId}-${slotId}`, // Pseudo order ID
                        userId,
                        '9999999999', // TODO: User phone
                        {
                            redirectUrl: `${env.frontendUrl}/consultations/my?source=phonepe&transactionId=${transactionId}&action=book&doctorId=${doctorId}&slotId=${slotId}&scheduledAt=${scheduledAt}&patientNotes=${encodeURIComponent(patientNotes || '')}`,
                            callbackUrl: `${env.frontendUrl}/api/consultations/payment/callback/phonepe`,
                            merchantTransactionId: transactionId
                        }
                    );

                    if (paymentResult.success) {
                        return res.json({
                            success: true,
                            data: {
                                redirectUrl: paymentResult.data.redirectUrl,
                                transactionId
                            },
                            message: 'Redirecting to payment...'
                        });
                    } else {
                        return res.status(400).json({ success: false, error: 'Payment initiation failed' });
                    }
                }
            }
        }

        // Check if user wants to use video credit (Max subscription)
        if (useCredit) {
            const creditResult = await useVideoCredit(userId);
            if (creditResult.success) {
                feePaid = 0;
                usedCredit = true;
            } else {
                return res.status(400).json({ success: false, error: creditResult.message });
            }
        }

        // Generate room ID for video call
        const roomId = `mediganga_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Create consultation
        const result = await db.query(`
            INSERT INTO consultations 
                (patient_id, doctor_id, slot_id, scheduled_at, fee_original, fee_paid, used_credit, room_id, patient_notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [userId, doctorId, slotId, scheduledAt, doctor.consultation_fee, feePaid, usedCredit, roomId, patientNotes]);

        // Do NOT mark availability window as booked, as it blocks other slots in the same window.

        res.json({
            success: true,
            data: result.rows[0],
            message: usedCredit
                ? `Consultation booked with ${doctor.name} using your free credit!`
                : `Consultation booked with ${doctor.name}. Amount: ₹${feePaid}`
        });
    } catch (error: any) {
        console.error('Book consultation error:', error);
        res.status(500).json({ success: false, error: 'Failed to book consultation' });
    }
}

// Get user's consultations
export async function getMyConsultations(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { status } = req.query;
        let whereClause = 'WHERE c.patient_id = $1';
        const params: any[] = [userId];

        if (status) {
            params.push(status);
            whereClause += ` AND c.status = $${params.length}`;
        }

        const result = await db.query(`
            SELECT c.*, d.name as doctor_name, d.specialization, d.profile_image, d.qualification
            FROM consultations c
            JOIN doctors d ON c.doctor_id = d.id
            ${whereClause}
            ORDER BY c.scheduled_at DESC
        `, params);

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Get consultations error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch consultations' });
    }
}

// Get consultation details (for joining video call)
export async function getConsultationDetails(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        const { consultationId } = req.params;

        const result = await db.query(`
            SELECT c.*, d.name as doctor_name, d.specialization, d.profile_image
            FROM consultations c
            JOIN doctors d ON c.doctor_id = d.id
            WHERE c.id = $1 AND (c.patient_id = $2 OR d.user_id = $2)
        `, [consultationId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Consultation not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Get consultation details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch consultation' });
    }
}

// Start consultation (update status to in_progress)
export async function startConsultation(req: Request, res: Response) {
    try {
        const { consultationId } = req.params;

        await db.query(
            `UPDATE consultations SET status = 'in_progress', updated_at = NOW() WHERE id = $1`,
            [consultationId]
        );

        res.json({ success: true, message: 'Consultation started' });
    } catch (error: any) {
        console.error('Start consultation error:', error);
        res.status(500).json({ success: false, error: 'Failed to start consultation' });
    }
}

// End consultation
export async function endConsultation(req: Request, res: Response) {
    try {
        const { consultationId } = req.params;
        const { doctorNotes } = req.body;

        await db.query(`
            UPDATE consultations 
            SET status = 'completed', doctor_notes = $2, updated_at = NOW()
            WHERE id = $1
        `, [consultationId, doctorNotes]);

        // Update doctor stats
        await db.query(`
            UPDATE doctors 
            SET total_consultations = total_consultations + 1
            WHERE id = (SELECT doctor_id FROM consultations WHERE id = $1)
        `, [consultationId]);

        res.json({
            success: true,
            message: 'Consultation completed. You can now generate a prescription.'
        });
    } catch (error: any) {
        console.error('End consultation error:', error);
        res.status(500).json({ success: false, error: 'Failed to end consultation' });
    }
}

// Cancel consultation
export async function cancelConsultation(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        const { consultationId } = req.params;

        // Check ownership and status
        const consultation = await db.query(
            'SELECT * FROM consultations WHERE id = $1 AND patient_id = $2',
            [consultationId, userId]
        );

        if (consultation.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Consultation not found' });
        }

        if (consultation.rows[0].status !== 'scheduled') {
            return res.status(400).json({ success: false, error: 'Cannot cancel this consultation' });
        }

        await db.query(
            `UPDATE consultations SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
            [consultationId]
        );

        // Free up the slot - logic handled dynamically by time check now
        // if (consultation.rows[0].slot_id) {
        //     await db.query(
        //         'UPDATE doctor_availability SET is_booked = FALSE, booked_by = NULL WHERE id = $1',
        //         [consultation.rows[0].slot_id]
        //     );
        // }

        // Refund credit if used
        if (consultation.rows[0].used_credit) {
            await db.query(`
                UPDATE video_consult_credits
                SET credits_used = credits_used - 1
                WHERE user_id = $1 AND period_end >= CURRENT_DATE
            `, [userId]);
        }

        res.json({ success: true, message: 'Consultation cancelled' });
    } catch (error: any) {
        console.error('Cancel consultation error:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel consultation' });
    }
}

// Get specializations list
export async function getSpecializations(_req: Request, res: Response) {
    try {
        const result = await db.query(`
            SELECT DISTINCT specialization, COUNT(*) as doctor_count
            FROM doctors
            WHERE is_available = TRUE
            GROUP BY specialization
            ORDER BY doctor_count DESC
        `);

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Get specializations error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch specializations' });
    }
}
