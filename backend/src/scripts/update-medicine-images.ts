import { Client } from 'pg';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

const medicineImages: Record<string, string> = {
    // Pain Relief
    'Crocin Advance 500mg': '/medicines/crocin_advance_500mg.png',
    'Dolo 650': '/medicines/dolo_650.jpg',
    'Combiflam': '/medicines/combiflam.jpg',
    'Brufen 400': '/medicines/brufen_400.jpg',
    'Disprin': '/medicines/tablet_pain.jpg',
    'Volini Gel': '/medicines/volini_pain_relief_spray.jpg',
    'Saridon': '/medicines/tablet_pain.jpg',
    'Ibugesic Plus': '/medicines/syrup_antacid.jpg',
    'Meftal-Spas': '/medicines/meftal_spas.jpg',
    'Zerodol-P': '/medicines/zerodol_p.jpg',
    'Nimesulide 100': '/medicines/tablet_pain.jpg',
    'Meftas 500': '/medicines/meftal_spas.jpg',
    'Omnigel': '/medicines/omnigel.jpg',

    // Antibiotics
    'Augmentin 625 Duo': '/medicines/augmentin_625_duo.jpg',
    'Azithral 500': '/medicines/azithral_500.jpg',
    'Cipro 500': '/medicines/cifran_500.jpg',
    'Monocef 200': '/medicines/tablet_antibiotic.jpg',
    'Taxim-O 200': '/medicines/taxim_o_200.jpg',
    'Zithrox 500': '/medicines/azithral_500.jpg',
    'Doxy-1 LDR': '/medicines/capsule_gas.jpg',
    'Moxikind-CV 625': '/medicines/moxikind_cv_625.jpg',
    'Cifran 500': '/medicines/cifran_500.jpg',
    'Oflox 200': '/medicines/oflox_200.jpg',
    'Amoxycillin 250 DT': '/medicines/tablet_antibiotic.jpg',
    'Norflox 400': '/medicines/tablet_antibiotic.jpg',

    // Diabetes
    'Glycomet 500': '/medicines/tablet_diabetes.jpg',
    'Glycomet GP 2': '/medicines/glycomet_gp_1.jpg',
    'Januvia 100': '/medicines/tablet_diabetes.jpg',
    'Galvus Met 50/500': '/medicines/galvus_met_50_500.jpg',
    'Amaryl M 2mg': '/medicines/tablet_diabetes.jpg',
    'Galvus 50mg': '/medicines/tablet_diabetes.jpg',
    'Jardiance 10mg': '/medicines/tablet_diabetes.jpg',
    'Istamet 50/500': '/medicines/tablet_diabetes.jpg',
    'Voglibose 0.3': '/medicines/tablet_diabetes.jpg',
    'Janumet 50/500': '/medicines/janumet_50_500.jpg',

    // Cardiac
    'Ecosprin 75': '/medicines/tablet_cardiac.jpg',
    'Clopitab 75': '/medicines/tablet_cardiac.jpg',
    'Atorva 10': '/medicines/atorva_10.jpg',
    'Telma 40': '/medicines/telma_40.jpg',
    'Amlong 5': '/medicines/amlokind_5.jpg',
    'Concor 5': '/medicines/tablet_cardiac.jpg',
    'Lipitor 10mg': '/medicines/atorva_10.jpg',
    'Rosuvas 10': '/medicines/rosuvas_10.jpg',
    'Lasilix 40': '/medicines/tablet_cardiac.jpg',
    'Metolar XR 25': '/medicines/tablet_cardiac.jpg',
    'Amlokind 5': '/medicines/amlokind_5.jpg',

    // Gastric
    'Pan 40': '/medicines/pan_d.jpg',
    'Omez 20': '/medicines/omez.jpg',
    'Rantac 150': '/medicines/rantac_150.jpg',
    'Aciloc 150': '/medicines/aciloc_150.jpg',
    'Gelusil MPS': '/medicines/gelusil_mps.jpg',
    'Digene': '/medicines/digene_gel_mint_.jpg',
    'Zinetac 150': '/medicines/rantac_150.jpg',
    'Eno Lemon Flavor': '/medicines/eno_fruit_salt_lemon_.jpg',
    'Pudina Hara': '/medicines/pudin_hara.jpg',
    'Pan-D': '/medicines/pan_d.jpg',
    'Omez': '/medicines/omez.jpg',

    // Allergy / Cold
    'Cetirizine 10mg': '/medicines/tablet_allergy.jpg',
    'Allegra 120': '/medicines/allegra_120.jpg',
    'Montair LC': '/medicines/montair_lc.jpg',
    'Sinarest': '/medicines/sinarest.jpg',
    'Vicks Action 500': '/medicines/tablet_cold.jpg',
    'Otrivin Adult Nasal Spray': '/medicines/spray_pain.jpg',
    'Koflet Syrup': '/medicines/syrup_cough.jpg',
    'Strepsils Honey & Lemon': '/medicines/tablet_cold.jpg',
    'Avil 25': '/medicines/tablet_allergy.jpg',
    'Levocet 5': '/medicines/tablet_allergy.jpg',
    'Alex Syrup': '/medicines/alex_syrup.jpg',
    'Benadryl': '/medicines/benadryl.jpg',
    'Grillinctus': '/medicines/grillinctus.jpg',
    'Cheston Cold': '/medicines/cheston_cold.jpg',
    'Maxtra Syrup': '/medicines/maxtra_syrup.jpg',

    // Vitamins
    'Becosules Z': '/medicines/becosules_z.jpg',
    'Shelcal 500': '/medicines/shelcal_500.jpg',
    'Limcee': '/medicines/limcee_500.jpg',
    'Limcee 500': '/medicines/limcee_500.jpg',
    'Neurobion Forte': '/medicines/neurobion_forte.jpg',
    'Evion 400': '/medicines/evion_400.jpg',
    'Revital H': '/medicines/revital_h.jpg',
    'Zincovit': '/medicines/zincovit.jpg',
    'Seven Seas Cod Liver Oil': '/medicines/capsule_vitamin.jpg',
    'Supradyn': '/medicines/supradyn.jpg',
    'A to Z NS': '/medicines/a_to_z_ns.jpg',

    // Skin / Personal
    'Betadine Ointment': '/medicines/betadine_ointment.jpg',
    'Soframycin Cream': '/medicines/soframycin.jpg',
    'Candid B Cream': '/medicines/candid_cream.jpg',
    'Candid Cream': '/medicines/candid_cream.jpg',
    'Moov Cream': '/medicines/balm_pain.jpg',
    'Dettol Antiseptic Liquid': '/medicines/betadine_ointment.jpg',
    'Savlon Antiseptic': '/medicines/betadine_ointment.jpg',
    'Sensodyne Fresh Mint': '/medicines/tube_ointment.jpg',
    'Boroline': '/medicines/betadine_ointment.jpg',
    'Vicco Turmeric Cream': '/medicines/tube_ointment.jpg',
    'Multani Mitti Pack': '/medicines/powder_antacid.jpg',
    'Colgate MaxFresh': '/medicines/tube_ointment.jpg',
    'Ariel Matic Liquid': '/medicines/syrup_antacid.jpg',
    'Whisper Ultra Clean': '/medicines/tube_ointment.jpg',
    'Gillete Mach3 Razor': '/medicines/tube_ointment.jpg',
    'T-Bact': '/medicines/t_bact.jpg',

    // Baby
    'Johnsons Baby Powder': '/medicines/powder_antacid.jpg',
    'Himalaya Baby Lotion': '/medicines/tube_ointment.jpg',
    'Pampers Baby Wipes': '/medicines/tube_ointment.jpg',
    'Cerelac Wheat Apple': '/medicines/powder_antacid.jpg',
    'Himalaya Baby Shampoo': '/medicines/syrup_cough.jpg',
    'Dexolac Stage 1': '/medicines/powder_antacid.jpg',

    // Eye
    'Moxifloxacin Eye Drops': '/medicines/moxikind_cv_625.jpg',
    'Tears Naturale II': '/medicines/eye_drops.jpg',
    'Itone Eye Drops': '/medicines/eye_drops.jpg',
    'Clear-eyes': '/medicines/eye_drops.jpg',

    // Controlled
    'Tramadol 50mg': '/medicines/tablet_pain.jpg',
    'Alprazolam 0.5mg': '/medicines/tablet_psych.jpg',

    // Ayurvedic
    'Himalaya Liv.52': '/medicines/himalaya_liv_52.jpg',
    'Cystone': '/medicines/cystone.jpg',
    'Septilin': '/medicines/septilin.jpg',
    'Tentex Royal': '/medicines/tentex_royal.jpg',
    'Zandu Balm': '/medicines/zandu_balm.jpg',
    'Digene Gel (Mint)': '/medicines/digene_gel_mint_.jpg',
};

async function updateImages() {
    console.log('🔄 Updating medicine images...');
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        for (const [name, imageUrl] of Object.entries(medicineImages)) {
            const res = await client.query('UPDATE medicines SET image_url = $1 WHERE name = $2', [imageUrl, name]);
            if (res.rowCount && res.rowCount > 0) {
                // console.log(`✅ Updated ${name}`);
            } else {
                // console.warn(`⚠️ Medicine not found: ${name}`);
            }
        }

        console.log('✨ Image update complete.');
    } catch (err) {
        console.error('❌ Error updating images:', err);
    } finally {
        await client.end();
    }
}

updateImages();
