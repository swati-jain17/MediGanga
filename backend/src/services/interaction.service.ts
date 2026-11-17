import pool from '../config/database.js';
import type { InteractionResult, InteractionSeverity } from '../types/index.js';

/**
 * Check drug interactions for a set of medicines
 * Returns interactions sorted by severity (CONTRAINDICATED first)
 */
export async function checkInteractions(medicineIds: string[]): Promise<InteractionResult[]> {
    if (medicineIds.length < 2) return [];

    // Remove duplicates
    const uniqueIds = [...new Set(medicineIds)];

    const query = `
    SELECT 
      di.severity,
      di.description,
      di.mechanism,
      di.alternative_suggestion,
      m1.id as medicine_a_id,
      m1.name as medicine_a_name,
      m2.id as medicine_b_id,
      m2.name as medicine_b_name
    FROM drug_interactions di
    JOIN medicines m1 ON di.medicine_a_id = m1.id
    JOIN medicines m2 ON di.medicine_b_id = m2.id
    WHERE 
      (di.medicine_a_id = ANY($1) AND di.medicine_b_id = ANY($1))
      AND di.medicine_a_id != di.medicine_b_id
    ORDER BY 
      CASE di.severity
        WHEN 'CONTRAINDICATED' THEN 1
        WHEN 'MAJOR' THEN 2
        WHEN 'MODERATE' THEN 3
        WHEN 'MINOR' THEN 4
      END;
  `;

    const result = await pool.query(query, [uniqueIds]);

    return result.rows.map(row => ({
        severity: row.severity as InteractionSeverity,
        description: row.description || '',
        alternative: row.alternative_suggestion,
        medicineA: row.medicine_a_name,
        medicineB: row.medicine_b_name,
        medicineAId: row.medicine_a_id,
        medicineBId: row.medicine_b_id,
    }));
}

/**
 * Check if any CONTRAINDICATED interactions exist
 */
export async function hasContraindicatedInteractions(medicineIds: string[]): Promise<boolean> {
    const interactions = await checkInteractions(medicineIds);
    return interactions.some(i => i.severity === 'CONTRAINDICATED');
}

/**
 * Get all interactions for a specific medicine
 */
export async function getMedicineInteractions(medicineId: string): Promise<InteractionResult[]> {
    const query = `
    SELECT 
      di.severity,
      di.description,
      di.mechanism,
      di.alternative_suggestion,
      m1.id as medicine_a_id,
      m1.name as medicine_a_name,
      m2.id as medicine_b_id,
      m2.name as medicine_b_name
    FROM drug_interactions di
    JOIN medicines m1 ON di.medicine_a_id = m1.id
    JOIN medicines m2 ON di.medicine_b_id = m2.id
    WHERE di.medicine_a_id = $1 OR di.medicine_b_id = $1
    ORDER BY 
      CASE di.severity
        WHEN 'CONTRAINDICATED' THEN 1
        WHEN 'MAJOR' THEN 2
        WHEN 'MODERATE' THEN 3
        WHEN 'MINOR' THEN 4
      END;
  `;

    const result = await pool.query(query, [medicineId]);

    return result.rows.map(row => ({
        severity: row.severity as InteractionSeverity,
        description: row.description || '',
        alternative: row.alternative_suggestion,
        medicineA: row.medicine_a_name,
        medicineB: row.medicine_b_name,
        medicineAId: row.medicine_a_id,
        medicineBId: row.medicine_b_id,
    }));
}

/**
 * Check interactions against user's health profile
 * Returns warnings if medicines contraindicate with conditions
 */
export async function checkHealthProfileContraindications(
    medicineIds: string[],
    healthProfile: Record<string, boolean | string[]>
): Promise<string[]> {
    const warnings: string[] = [];

    // Get schedule types for all medicines
    const result = await pool.query(
        'SELECT id, name, schedule_type, salt_composition FROM medicines WHERE id = ANY($1)',
        [medicineIds]
    );

    const medicines = result.rows;

    // Check diabetes contraindications
    if (healthProfile.diabetes) {
        for (const med of medicines) {
            const salt = (med.salt_composition || '').toLowerCase();
            if (salt.includes('prednisolone') || salt.includes('dexamethasone')) {
                warnings.push(`${med.name}: Corticosteroids may increase blood sugar levels`);
            }
        }
    }

    // Check hypertension contraindications
    if (healthProfile.hypertension) {
        for (const med of medicines) {
            const salt = (med.salt_composition || '').toLowerCase();
            if (salt.includes('pseudoephedrine') || salt.includes('phenylephrine')) {
                warnings.push(`${med.name}: Decongestants may raise blood pressure`);
            }
        }
    }

    // Check kidney disease
    if (healthProfile.kidney_disease) {
        for (const med of medicines) {
            const salt = (med.salt_composition || '').toLowerCase();
            if (salt.includes('ibuprofen') || salt.includes('naproxen') || salt.includes('diclofenac')) {
                warnings.push(`${med.name}: NSAIDs should be used with caution in kidney disease`);
            }
        }
    }

    return warnings;
}
