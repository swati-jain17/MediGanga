import { Request, Response } from 'express';
// import { db } from '../config/database.js'; // Unused

export const analyzePrescription = async (_req: Request, res: Response) => {
    try {
        // Mock delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return mock OCR data
        res.json({
            success: true,
            data: {
                raw_text: "Rx\nAmoxicillin 500mg - 1 tab TDS x 5 days\nParacetamol 650mg - 1 tab SOS\n\nDr. R. Sharma\nReg: 12345",
                medicines: [
                    "Crocin Advance 500mg",
                    "Pan 40"
                ],
                doctor_name: "Dr. R. Sharma",
                hospital_name: "City Hospital",
                confidence: 98.5
            }
        });
    } catch (error: any) {
        console.error('OCR Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze prescription',
            error: error.message
        });
    }
};
