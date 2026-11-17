import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/database.js';
import type { OCRData } from '../types/index.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Process prescription image and extract text using Gemini Flash 1.5
 */
export async function processPrescription(
  imageBuffer: Buffer,
  _imageUrl: string
): Promise<{ ocrData: OCRData; confidence: number }> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Initialize Gemini Flash 1.5 model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create prompt for prescription analysis
    const prompt = `You are a medical prescription analyzer. Analyze this prescription image and extract the following information in JSON format:

{
  "raw_text": "complete text from the prescription",
  "doctor_name": "doctor's name if visible",
  "hospital_name": "hospital/clinic name if visible",
  "patient_name": "patient name if visible",
  "date": "prescription date if visible",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dosage information (e.g., 500mg, 1 tablet)",
      "frequency": "frequency (e.g., twice daily, TDS, BD)",
      "duration": "duration (e.g., 7 days, 1 week)"
    }
  ]
}

Focus on extracting medicine names accurately. Common Indian medicine formats include brand names like Crocin, Dolo, Pan, Combiflam, etc.
If you cannot read something clearly, omit that field. Return only valid JSON.`;

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let parsedData: any;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      parsedData = JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback to basic extraction
      parsedData = {
        raw_text: text,
        medicines: [],
        doctor_name: undefined,
        hospital_name: undefined,
      };
    }

    // Extract just medicine names for database matching
    const medicineNames = parsedData.medicines?.map((m: any) => m.name) || [];

    // Match extracted medicines against database
    const matchedMedicines = await matchMedicinesInDatabase(medicineNames);

    // Calculate confidence: based on how many extracted medicines match our database
    let confidence = 0.5; // Default medium confidence
    if (medicineNames.length > 0) {
      const matchRate = matchedMedicines.length / medicineNames.length;
      confidence = 0.6 + (matchRate * 0.3); // 0.6 to 0.9 based on match rate
    }

    // If Gemini successfully extracted structured data, boost confidence
    if (parsedData.medicines?.length > 0 && parsedData.doctor_name) {
      confidence = Math.min(confidence + 0.1, 0.95);
    }

    return {
      ocrData: {
        raw_text: parsedData.raw_text || text,
        medicines: matchedMedicines,
        doctor_name: parsedData.doctor_name,
        hospital_name: parsedData.hospital_name,
        extracted_data: parsedData.medicines, // Store full extracted data
      },
      confidence: Math.round(confidence * 100) / 100,
    };
  } catch (error) {
    console.error('Gemini OCR failed:', error);

    // Fallback to basic text extraction
    return {
      ocrData: {
        raw_text: 'OCR processing failed. Manual verification required.',
        medicines: [],
        doctor_name: undefined,
        hospital_name: undefined,
      },
      confidence: 0.3,
    };
  }
}

/**
 * Match extracted medicine names against database
 */
async function matchMedicinesInDatabase(medicineNames: string[]): Promise<string[]> {
  if (medicineNames.length === 0) return [];

  try {
    const matches: string[] = [];
    for (const medicineName of medicineNames) {
      const result = await pool.query(
        `SELECT DISTINCT name FROM medicines WHERE LOWER(name) LIKE LOWER($1) OR LOWER(generic_name) LIKE LOWER($1) LIMIT 3`,
        [`%${medicineName}%`]
      );
      matches.push(...result.rows.map(r => r.name));
    }

    return [...new Set(matches)]; // Remove duplicates
  } catch (error) {
    console.error('Database matching failed:', error);
    return medicineNames; // Return original names if DB query fails
  }
}

/**
 * Verify OCR extraction quality
 * Returns true if confidence is high enough for auto-approval
 */
export function isHighConfidenceOCR(confidence: number): boolean {
  return confidence >= 0.85;
}

/**
 * Upload prescription image
 */
export async function uploadPrescriptionImage(
  buffer: Buffer,
  userId: string,
  filename: string
): Promise<string> {
  // Define upload path
  const uploadDir = path.join(process.cwd(), 'uploads', 'prescriptions', userId);
  const fileName = `${Date.now()}_${filename.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadDir, fileName);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filePath, buffer);

  // Return publicly accessible path
  return `/uploads/prescriptions/${userId}/${fileName}`;
}
