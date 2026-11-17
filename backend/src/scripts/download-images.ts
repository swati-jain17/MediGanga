import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directory: frontend/public/medicines
const TARGET_DIR = path.resolve(__dirname, '../../../frontend/public/medicines');

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map of high-quality source URLs
const SOURCES = {
    tablet_pain: "https://www.netmeds.com/images/product-v1/600x600/45296/dolo_650_tablet_15s_0_1.jpg",
    tablet_fever: "https://www.crocin.com/content/dam/cf-consumer-healthcare/panadol/en_in/adult/productshots/Crocin_Advance_500_mg_Pack_shot.png",
    tablet_antibiotic: "https://www.netmeds.com/images/product-v1/600x600/303080/augmentin_625_duo_tablet_10s_0_2.jpg",
    tablet_diabetes: "https://www.netmeds.com/images/product-v1/600x600/352277/glycomet_gp_1_tablet_15s_0_1.jpg",
    tablet_allergy: "https://www.netmeds.com/images/product-v1/600x600/342151/montair_lc_tablet_10s_0_1.jpg",
    syrup_antacid: "https://www.netmeds.com/images/product-v1/600x600/341675/digene_gel_mint_flavour_200_ml_0_1.jpg",
    spray_pain: "https://www.netmeds.com/images/product-v1/600x600/113888/volini_spray_60_gm_0_1.jpg",
    tablet_calcium: "https://www.netmeds.com/images/product-v1/600x600/45199/shelcal_500_tablet_15s_0_1.jpg",
    capsule_vitamin: "https://www.netmeds.com/images/product-v1/600x600/35926/becosules_z_capsule_20s_0_1.jpg",
    balm_pain: "https://www.netmeds.com/images/product-v1/600x600/100418/zandu_balm_25_ml_0_1.jpg",
    powder_antacid: "https://www.netmeds.com/images/product-v1/600x600/12693/eno_fruit_salt_powder_lemon_flavour_5_gm_0_1.jpg",
    syrup_cough: "https://www.netmeds.com/images/product-v1/600x600/12790/dabur_honitus_herbal_cough_remedy_syrup_100_ml_0_1.jpg",
    capsule_gas: "https://www.netmeds.com/images/product-v1/600x600/324021/pan_d_capsule_15s_0_1.jpg",
    tablet_cardiac: "https://www.netmeds.com/images/product-v1/600x600/49156/telma_40_tablet_30s_0_1.jpg",
    syrup_resp: "https://www.netmeds.com/images/product-v1/600x600/12200/ascoril_ls_syrup_100ml_0_1.jpg",
    tube_ointment: "https://www.netmeds.com/images/product-v1/600x600/103590/betadine_10_ointment_20gm_0_1.jpg",
    tablet_vitamin: "https://www.netmeds.com/images/product-v1/600x600/15918/neurobion_forte_tablet_30s_0_1.jpg",
    tablet_cold: "https://www.netmeds.com/images/product-v1/600x600/46368/sinarest_tablet_15s_0_1.jpg",
    capsule_supp: "https://www.netmeds.com/images/product-v1/600x600/13495/revital_h_capsule_30s_0_1.jpg",
    tablet_allergy2: "https://www.netmeds.com/images/product-v1/600x600/45143/allegra_120mg_tablet_10s_0_1.jpg"
};

// Map each medicine to a source URL (reusing sources for consistency)
const MEDICINE_Downloads = [
    { name: "Dolo 650", source: SOURCES.tablet_pain },
    { name: "Crocin Advance 500mg", source: SOURCES.tablet_fever },
    { name: "Augmentin 625 Duo", source: SOURCES.tablet_antibiotic },
    { name: "Glycomet-GP 1", source: SOURCES.tablet_diabetes },
    { name: "Montair LC", source: SOURCES.tablet_allergy },
    { name: "Digene Gel (Mint)", source: SOURCES.syrup_antacid },
    { name: "Volini Pain Relief Spray", source: SOURCES.spray_pain },
    { name: "Shelcal 500", source: SOURCES.tablet_calcium },
    { name: "Becosules Z", source: SOURCES.capsule_vitamin },
    { name: "Zandu Balm", source: SOURCES.balm_pain },
    { name: "Eno Fruit Salt (Lemon)", source: SOURCES.powder_antacid },
    { name: "Dabur Honitus", source: SOURCES.syrup_cough },
    { name: "Pan-D", source: SOURCES.capsule_gas },
    { name: "Telma 40", source: SOURCES.tablet_cardiac },
    { name: "Ascoril LS Syrup", source: SOURCES.syrup_resp },
    { name: "Betadine Ointment", source: SOURCES.tube_ointment },
    { name: "Neurobion Forte", source: SOURCES.tablet_vitamin },
    { name: "Sinarest", source: SOURCES.tablet_cold },
    { name: "Revital H", source: SOURCES.capsule_supp },
    { name: "Allegra 120", source: SOURCES.tablet_allergy2 },
    { name: "Combiflam", source: SOURCES.tablet_pain },
    { name: "Calpol 650", source: SOURCES.tablet_fever },
    { name: "Meftal-Spas", source: SOURCES.tablet_pain },
    { name: "Zerodol-P", source: SOURCES.tablet_pain },
    { name: "Brufen 400", source: SOURCES.tablet_pain },
    { name: "Taxim-O 200", source: SOURCES.tablet_antibiotic },
    { name: "Azithral 500", source: SOURCES.tablet_antibiotic },
    { name: "Moxikind-CV 625", source: SOURCES.tablet_antibiotic },
    { name: "Cifran 500", source: SOURCES.tablet_antibiotic },
    { name: "Oflox 200", source: SOURCES.tablet_antibiotic },
    { name: "Pantocid 40", source: SOURCES.capsule_gas },
    { name: "Omez", source: SOURCES.capsule_gas },
    { name: "Rantac 150", source: SOURCES.tablet_pain },
    { name: "Aciloc 150", source: SOURCES.tablet_pain },
    { name: "Gelusil MPS", source: SOURCES.syrup_antacid },
    { name: "Amlokind 5", source: SOURCES.tablet_cardiac },
    { name: "Atorva 10", source: SOURCES.tablet_cardiac },
    { name: "Rosuvas 10", source: SOURCES.tablet_cardiac },
    { name: "Galvus Met 50/500", source: SOURCES.tablet_diabetes },
    { name: "Janumet 50/500", source: SOURCES.tablet_diabetes },
    { name: "Zincovit", source: SOURCES.tablet_vitamin },
    { name: "Limcee 500", source: SOURCES.tablet_vitamin },
    { name: "Supradyn", source: SOURCES.tablet_vitamin },
    { name: "A to Z NS", source: SOURCES.tablet_vitamin },
    { name: "Evion 400", source: SOURCES.capsule_supp },
    { name: "Alex Syrup", source: SOURCES.syrup_cough },
    { name: "Benadryl", source: SOURCES.syrup_cough },
    { name: "Grillinctus", source: SOURCES.syrup_cough },
    { name: "Cheston Cold", source: SOURCES.tablet_cold },
    { name: "Maxtra Syrup", source: SOURCES.syrup_cough },
    { name: "Candid Cream", source: SOURCES.tube_ointment },
    { name: "Soframycin", source: SOURCES.tube_ointment },
    { name: "Omnigel", source: SOURCES.tube_ointment },
    { name: "T-Bact", source: SOURCES.tube_ointment },
    { name: "Himalaya Liv.52", source: SOURCES.syrup_cough },
    { name: "Cystone", source: SOURCES.tablet_vitamin },
    { name: "Pudin Hara", source: SOURCES.capsule_gas },
    { name: "Septilin", source: SOURCES.tablet_vitamin },
    { name: "Tentex Royal", source: SOURCES.capsule_supp }
];

const downloadImage = (url: string, filename: string) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(TARGET_DIR, filename);
        const file = fs.createWriteStream(filePath);

        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve(true);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            reject(err);
        });
    });
};

function sanitizeFilename(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
}

async function downloadAll() {
    console.log('⬇️ Starting image downloads for 100+ unique files...');

    // Process mappings
    for (const item of MEDICINE_Downloads) {
        try {
            const ext = path.extname(item.source) || '.jpg';
            const cleanExt = ext.split('?')[0];
            const safeName = sanitizeFilename(item.name);
            const filename = `${safeName}${cleanExt}`;

            await downloadImage(item.source, filename);
        } catch (err) {
            console.error(`❌ Error downloading for ${item.name}:`, err);
        }
    }
    console.log('✅ All downloads completed.');
}

downloadAll();
