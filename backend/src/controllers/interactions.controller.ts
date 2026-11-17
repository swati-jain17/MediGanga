import { Request, Response, NextFunction } from 'express';
import { checkInteractions, checkHealthProfileContraindications, getMedicineInteractions } from '../services/interaction.service.js';

/**
 * Check drug interactions for a set of medicines
 */
export async function checkDrugInteractions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { medicineIds } = req.body;

        if (!medicineIds || medicineIds.length < 2) {
            res.json({
                success: true,
                data: [],
                message: 'At least 2 medicines required for interaction check'
            });
            return;
        }

        const interactions = await checkInteractions(medicineIds);

        // Group by severity for frontend
        const grouped = {
            contraindicated: interactions.filter(i => i.severity === 'CONTRAINDICATED'),
            major: interactions.filter(i => i.severity === 'MAJOR'),
            moderate: interactions.filter(i => i.severity === 'MODERATE'),
            minor: interactions.filter(i => i.severity === 'MINOR'),
        };

        res.json({
            success: true,
            data: interactions,
            grouped,
            hasBlocking: grouped.contraindicated.length > 0,
            hasMajor: grouped.major.length > 0,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all interactions for a single medicine
 */
export async function getSingleMedicineInteractions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        const interactions = await getMedicineInteractions(id);

        res.json({
            success: true,
            data: interactions,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Check interactions with user's health profile
 */
export async function checkWithHealthProfile(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { medicineIds, healthProfile } = req.body;

        // Get drug-drug interactions
        const drugInteractions = await checkInteractions(medicineIds);

        // Get health profile contraindications
        const healthWarnings = await checkHealthProfileContraindications(
            medicineIds,
            healthProfile
        );

        res.json({
            success: true,
            data: {
                drugInteractions,
                healthWarnings,
                hasBlockingInteractions: drugInteractions.some(i => i.severity === 'CONTRAINDICATED'),
            },
        });
    } catch (error) {
        next(error);
    }
}
