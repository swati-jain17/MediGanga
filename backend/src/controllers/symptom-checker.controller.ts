import { Request, Response } from 'express';
import { db } from '../config/database.js';

/**
 * Symptom Checker Controller
 * AI-powered symptom analysis with urgency levels
 * 
 * Note: For production, integrate with OpenAI API or Infermedica
 * This version uses a rule-based system for demonstration
 */

// Common symptom patterns and their urgency levels
const SYMPTOM_RULES = [
    // RED - Emergency
    { keywords: ['chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'unconscious', 'severe bleeding'], urgency: 'red', recommendation: 'Seek emergency medical care immediately. Call 108 or go to the nearest hospital.' },
    { keywords: ['high fever', 'seizure', 'convulsion', 'fainting', 'severe allergic'], urgency: 'red', recommendation: 'This requires immediate medical attention. Please visit an emergency room.' },

    // YELLOW - Consult Doctor
    { keywords: ['fever', 'persistent cough', 'breathing difficulty', 'blood in urine', 'blood in stool'], urgency: 'yellow', recommendation: 'Please consult a doctor. Book a video consultation for professional advice.' },
    { keywords: ['vomiting', 'diarrhea', 'abdominal pain', 'chest discomfort', 'dizziness'], urgency: 'yellow', recommendation: 'A doctor consultation is recommended. This could need professional evaluation.' },
    { keywords: ['skin rash', 'swelling', 'joint pain', 'ear pain', 'eye pain', 'sore throat'], urgency: 'yellow', recommendation: 'Consider booking a doctor consultation for proper diagnosis and treatment.' },

    // GREEN - Home Care
    { keywords: ['headache', 'common cold', 'runny nose', 'mild cough', 'body ache'], urgency: 'green', recommendation: 'This can likely be managed at home with OTC medicines. Rest and stay hydrated.' },
    { keywords: ['acidity', 'indigestion', 'gas', 'bloating', 'constipation'], urgency: 'green', recommendation: 'Try OTC antacids and dietary changes. If symptoms persist, consult a doctor.' },
    { keywords: ['muscle pain', 'back pain', 'neck pain', 'fatigue', 'minor cut'], urgency: 'green', recommendation: 'Home care with rest and OTC pain relief should help. Apply first aid for cuts.' },
];

// OTC medicine suggestions based on symptoms
const OTC_SUGGESTIONS: Record<string, { name: string; purpose: string }[]> = {
    'headache': [
        { name: 'Crocin Advance 500mg', purpose: 'Pain and fever relief' },
        { name: 'Combiflam', purpose: 'Anti-inflammatory pain relief' }
    ],
    'fever': [
        { name: 'Dolo 650', purpose: 'Fever reduction' },
        { name: 'Crocin Advance 500mg', purpose: 'Fever and pain relief' }
    ],
    'cold': [
        { name: 'Sinarest', purpose: 'Multi-symptom cold relief' },
        { name: 'Vicks Action 500', purpose: 'Cold and headache relief' }
    ],
    'cough': [
        { name: 'Sinarest', purpose: 'Cough and cold relief' }
    ],
    'allergy': [
        { name: 'Cetirizine 10mg', purpose: 'Antihistamine for allergies' },
        { name: 'Allegra 120', purpose: 'Non-drowsy antihistamine' }
    ],
    'acidity': [
        { name: 'Gelusil MPS', purpose: 'Antacid for gas and acidity' },
        { name: 'Digene', purpose: 'Chewable antacid' }
    ],
    'body_ache': [
        { name: 'Combiflam', purpose: 'Pain and inflammation relief' },
        { name: 'Brufen 400', purpose: 'Anti-inflammatory' }
    ],
    'muscle_pain': [
        { name: 'Moov Cream', purpose: 'Topical muscle pain relief' },
        { name: 'Brufen 400', purpose: 'Oral pain relief' }
    ]
};

// Analyze symptoms
export async function analyzeSymptoms(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        const { symptoms, description } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide symptoms as an array'
            });
        }

        const symptomsLower = symptoms.map((s: string) => s.toLowerCase());
        const descLower = (description || '').toLowerCase();
        const allText = [...symptomsLower, descLower].join(' ');

        // Determine urgency
        let urgency = 'green';
        let recommendation = 'Based on your symptoms, home care should be sufficient. Rest well and stay hydrated.';
        let matchedRule = null;

        for (const rule of SYMPTOM_RULES) {
            if (rule.keywords.some(keyword => allText.includes(keyword))) {
                if (rule.urgency === 'red' || (rule.urgency === 'yellow' && urgency !== 'red')) {
                    urgency = rule.urgency;
                    recommendation = rule.recommendation;
                    matchedRule = rule;
                }
            }
        }

        // Get OTC suggestions if green
        let otcSuggestions: { name: string; purpose: string }[] = [];
        if (urgency === 'green') {
            for (const symptom of symptomsLower) {
                const key = Object.keys(OTC_SUGGESTIONS).find(k => symptom.includes(k));
                if (key) {
                    otcSuggestions.push(...OTC_SUGGESTIONS[key]);
                }
            }
            // Deduplicate
            otcSuggestions = [...new Map(otcSuggestions.map(item => [item.name, item])).values()];
        }

        // Generate session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Save to database if user is logged in
        if (userId) {
            await db.query(`
                INSERT INTO symptom_checks 
                    (user_id, session_id, symptoms, urgency_level, ai_response, recommendations)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                userId,
                sessionId,
                symptoms,
                urgency,
                JSON.stringify({ matchedRule, otcSuggestions }),
                [recommendation]
            ]);
        }

        res.json({
            success: true,
            data: {
                sessionId,
                urgency,
                urgencyLabel: urgency === 'red' ? 'Emergency' : urgency === 'yellow' ? 'Consult Doctor' : 'Home Care',
                recommendation,
                otcSuggestions: urgency === 'green' ? otcSuggestions : [],
                nextSteps: getNextSteps(urgency),
                disclaimer: 'This AI assessment is for informational purposes only and does not replace professional medical advice. Always consult a healthcare provider for accurate diagnosis and treatment.'
            }
        });
    } catch (error: any) {
        console.error('Analyze symptoms error:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze symptoms' });
    }
}

function getNextSteps(urgency: string) {
    switch (urgency) {
        case 'red':
            return [
                { action: 'call_emergency', label: 'Call 108 (Emergency)', icon: '🚑' },
                { action: 'find_hospital', label: 'Find Nearest Hospital', icon: '🏥' }
            ];
        case 'yellow':
            return [
                { action: 'book_consult', label: 'Book Video Consultation', icon: '👨‍⚕️' },
                { action: 'emergency_delivery', label: 'Order Emergency Medicines', icon: '💊' }
            ];
        case 'green':
        default:
            return [
                { action: 'order_otc', label: 'Order OTC Medicines', icon: '💊' },
                { action: 'set_reminder', label: 'Set Medicine Reminder', icon: '⏰' },
                { action: 'book_consult', label: 'Still unsure? Talk to a Doctor', icon: '👨‍⚕️' }
            ];
    }
}

// Get symptom check history
export async function getHistory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            SELECT id, session_id, symptoms, urgency_level, recommendations, followed_up, created_at
            FROM symptom_checks
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
        `, [userId]);

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Get symptom history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
}

// Get common symptoms for quick selection
export async function getCommonSymptoms(_req: Request, res: Response) {
    try {
        const symptoms = [
            { id: 'headache', name: 'Headache', icon: '🤕' },
            { id: 'fever', name: 'Fever', icon: '🤒' },
            { id: 'cold', name: 'Cold/Runny Nose', icon: '🤧' },
            { id: 'cough', name: 'Cough', icon: '😷' },
            { id: 'body_ache', name: 'Body Ache', icon: '💪' },
            { id: 'stomach_pain', name: 'Stomach Pain', icon: '🫃' },
            { id: 'nausea', name: 'Nausea/Vomiting', icon: '🤢' },
            { id: 'diarrhea', name: 'Diarrhea', icon: '🚽' },
            { id: 'acidity', name: 'Acidity/Heartburn', icon: '🔥' },
            { id: 'allergy', name: 'Allergy/Skin Rash', icon: '🌡️' },
            { id: 'sore_throat', name: 'Sore Throat', icon: '😣' },
            { id: 'fatigue', name: 'Fatigue/Weakness', icon: '😴' },
        ];

        res.json({ success: true, data: symptoms });
    } catch (error: any) {
        console.error('Get common symptoms error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch symptoms' });
    }
}

// Mark symptom check as followed up
export async function markFollowedUp(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        const { checkId } = req.params;
        const { consultationId } = req.body;

        await db.query(`
            UPDATE symptom_checks 
            SET followed_up = TRUE, consultation_id = $3
            WHERE id = $1 AND user_id = $2
        `, [checkId, userId, consultationId]);

        res.json({ success: true, message: 'Marked as followed up' });
    } catch (error: any) {
        console.error('Mark followed up error:', error);
        res.status(500).json({ success: false, error: 'Failed to update' });
    }
}
