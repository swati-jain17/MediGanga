import { Client } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';


function getLocalPath(name: string, ext = '.jpg'): string {
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    // Special case for some extensions if needed, but download script defaults to .jpg mostly
    // We noticed some were .png, let's checking the download script logic.
    // The download script kept extensions.
    // Crocin is .png.
    if (name.includes('Crocin')) return `/medicines/${safeName}.png`;
    if (name.includes('Tablet_fever')) return `/medicines/${safeName}.png`; // fallback
    return `/medicines/${safeName}.jpg`;
}

const medicines = [
    // --- Original 20 ---
    {
        name: "Dolo 650",
        generic_name: "Paracetamol",
        manufacturer: "Micro Labs Ltd",
        category: "Pain Relief",
        mrp: 32.00,
        image_url: getLocalPath("Dolo 650"),
        description: "Dolo 650 Tablet is used to relieve pain and reduce fever. It is known for its effectiveness in treating headaches, body aches, and toothaches.",
        dosage_form: "Tablet",
        pack_size: "15 tablets",
        schedule_type: "OTC",
        salt_composition: "Paracetamol (650mg)"
    },
    {
        name: "Crocin Advance 500mg",
        generic_name: "Paracetamol",
        manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd",
        category: "Pain Relief",
        mrp: 20.00,
        image_url: getLocalPath("Crocin Advance 500mg"),
        description: "Crocin Advance provides fast and effective relief from pain and fever.",
        dosage_form: "Tablet",
        pack_size: "20 tablets",
        schedule_type: "OTC",
        salt_composition: "Paracetamol (500mg)"
    },
    {
        name: "Augmentin 625 Duo",
        generic_name: "Amoxicillin + Clavulanic Acid",
        manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd",
        category: "Antibiotics",
        mrp: 204.00,
        image_url: getLocalPath("Augmentin 625 Duo"),
        description: "Augmentin 625 Duo Tablet is an antibiotic used to treat bacterial infections.",
        dosage_form: "Tablet",
        pack_size: "10 tablets",
        schedule_type: "H1",
        salt_composition: "Amoxicillin (500mg) + Clavulanic Acid (125mg)"
    },
    {
        name: "Glycomet-GP 1",
        generic_name: "Glimepiride + Metformin",
        manufacturer: "USV Ltd",
        category: "Diabetes",
        mrp: 123.00,
        image_url: getLocalPath("Glycomet-GP 1"),
        description: "Glycomet-GP 1 Tablet is a combination medicine used to treat type 2 diabetes mellitus.",
        dosage_form: "Tablet",
        pack_size: "15 tablets",
        schedule_type: "H",
        salt_composition: "Glimepiride (1mg) + Metformin (500mg)"
    },
    {
        name: "Montair LC",
        generic_name: "Levocetirizine + Montelukast",
        manufacturer: "Cipla Ltd",
        category: "Respiratory",
        mrp: 185.00,
        image_url: getLocalPath("Montair LC"),
        description: "Montair LC Tablet is used for sneezing and runny nose due to allergies.",
        dosage_form: "Tablet",
        pack_size: "10 tablets",
        schedule_type: "H",
        salt_composition: "Levocetirizine (5mg) + Montelukast (10mg)"
    },
    {
        name: "Digene Gel (Mint)",
        generic_name: "Antacid",
        manufacturer: "Abbott",
        category: "Stomach Care",
        mrp: 180.00,
        image_url: getLocalPath("Digene Gel (Mint)"),
        description: "Digene Gel provides quick relief from acidity, gas, and heartburn.",
        dosage_form: "Syrup",
        pack_size: "200 ml",
        schedule_type: "OTC",
        salt_composition: "Magnesium Hydroxide + Simethicone + Aluminum Hydroxide"
    },
    {
        name: "Volini Pain Relief Spray",
        generic_name: "Diclofenac",
        manufacturer: "Sun Pharmaceutical Industries Ltd",
        category: "Pain Relief",
        mrp: 206.00,
        image_url: getLocalPath("Volini Pain Relief Spray"),
        description: "Volini Spray provides instant relief from muscle pain, sprain, strain, and joint pain.",
        dosage_form: "Spray",
        pack_size: "60 gm",
        schedule_type: "OTC",
        salt_composition: "Diclofenac Diethylamine + Methyl Salicylate + Menthol"
    },
    {
        name: "Shelcal 500",
        generic_name: "Calcium + Vitamin D3",
        manufacturer: "Torrent Pharmaceuticals Ltd",
        category: "Supplements",
        mrp: 131.00,
        image_url: getLocalPath("Shelcal 500"),
        description: "Shelcal 500 Tablet is a calcium supplement used to treat low blood calcium levels.",
        dosage_form: "Tablet",
        pack_size: "15 tablets",
        schedule_type: "OTC",
        salt_composition: "Calcium Carbonate (1250mg) + Vitamin D3 (250 IU)"
    },
    {
        name: "Becosules Z",
        generic_name: "B Complex + Vitamin C + Zinc",
        manufacturer: "Pfizer Ltd",
        category: "Supplements",
        mrp: 45.00,
        image_url: getLocalPath("Becosules Z"),
        description: "Becosules Z Capsule is a multivitamin formulation mainly used for tissue repair.",
        dosage_form: "Capsule",
        pack_size: "20 capsules",
        schedule_type: "OTC",
        salt_composition: "B Complex + Vitamin C + Zinc"
    },
    {
        name: "Zandu Balm",
        generic_name: "Ayurvedic Pain Balm",
        manufacturer: "Emami Ltd",
        category: "Ayurvedic",
        mrp: 45.00,
        image_url: getLocalPath("Zandu Balm"),
        description: "Zandu Balm is India's No.1 pain relief balm.",
        dosage_form: "Balm",
        pack_size: "25 ml",
        schedule_type: "OTC",
        salt_composition: "Mentha Extract + Gaultheria Fragrantissima"
    },
    {
        name: "Eno Fruit Salt (Lemon)",
        generic_name: "Antacid",
        manufacturer: "GlaxoSmithKline",
        category: "Stomach Care",
        mrp: 10.00,
        image_url: getLocalPath("Eno Fruit Salt (Lemon)"),
        description: "Eno Fruit Salt provides fast relief from acidity and gets to work in 6 seconds.",
        dosage_form: "Powder",
        pack_size: "5 gm",
        schedule_type: "OTC",
        salt_composition: "Svarjiksara (Shudh) + Nimbukamlam (Shushkam)"
    },
    {
        name: "Dabur Honitus",
        generic_name: "Herbal Cough Syrup",
        manufacturer: "Dabur India Ltd",
        category: "Ayurvedic",
        mrp: 115.00,
        image_url: getLocalPath("Dabur Honitus"),
        description: "Dabur Honitus Cough Syrup provides effective relief from cough without side effects.",
        dosage_form: "Syrup",
        pack_size: "100 ml",
        schedule_type: "OTC",
        salt_composition: "Tulsi + Mulethi + Banapsha"
    },
    {
        name: "Pan-D",
        generic_name: "Pantoprazole + Domperidone",
        manufacturer: "Alkem Laboratories Ltd",
        category: "Stomach Care",
        mrp: 199.00,
        image_url: getLocalPath("Pan-D"),
        description: "Pan-D Capsule SR is used to treat gastroesophageal reflux disease (Acid reflux) and indigestion.",
        dosage_form: "Capsule",
        pack_size: "15 capsules",
        schedule_type: "H",
        salt_composition: "Pantoprazole (40mg) + Domperidone (30mg)"
    },
    {
        name: "Telma 40",
        generic_name: "Telmisartan",
        manufacturer: "Glenmark Pharmaceuticals Ltd",
        category: "Cardiac",
        mrp: 247.00,
        image_url: getLocalPath("Telma 40"),
        description: "Telma 40 Tablet is widely used to treat high blood pressure and heart failure.",
        dosage_form: "Tablet",
        pack_size: "30 tablets",
        schedule_type: "H",
        salt_composition: "Telmisartan (40mg)"
    },
    {
        name: "Ascoril LS Syrup",
        generic_name: "Ambroxol + Levosalbutamol + Guaifenesin",
        manufacturer: "Glenmark Pharmaceuticals Ltd",
        category: "Respiratory",
        mrp: 118.00,
        image_url: getLocalPath("Ascoril LS Syrup"),
        description: "Ascoril LS Syrup is used to treat cough with mucus.",
        dosage_form: "Syrup",
        pack_size: "100 ml",
        schedule_type: "H",
        salt_composition: "Ambroxol + Levosalbutamol + Guaifenesin"
    },
    {
        name: "Betadine Ointment",
        generic_name: "Povidone Iodine",
        manufacturer: "Win-Medicare Pvt Ltd",
        category: "Wound Care",
        mrp: 125.00,
        image_url: getLocalPath("Betadine Ointment"),
        description: "Betadine 10% Ointment is an antiseptic applied on skin to prevent infection.",
        dosage_form: "Ointment",
        pack_size: "20 gm",
        schedule_type: "OTC",
        salt_composition: "Povidone Iodine (10% w/w)"
    },
    {
        name: "Neurobion Forte",
        generic_name: "Vitamin B Complex",
        manufacturer: "Procter & Gamble Health Ltd",
        category: "Supplements",
        mrp: 42.00,
        image_url: getLocalPath("Neurobion Forte"),
        description: "Neurobion Forte Tablet is a vitamin supplement used to treat vitamin B deficiency and nerve damage.",
        dosage_form: "Tablet",
        pack_size: "30 tablets",
        schedule_type: "OTC",
        salt_composition: "Vitamin B1 + B2 + B3 + B5 + B6 + B12"
    },
    {
        name: "Sinarest",
        generic_name: "Paracetamol + Phenylephrine + Chlorpheniramine",
        manufacturer: "Centaur Pharmaceuticals Pvt Ltd",
        category: "Cold & Flu",
        mrp: 67.00,
        image_url: getLocalPath("Sinarest"),
        description: "Sinarest Tablet is used for the relief of common cold symptoms like blocked nose, headache, and fever.",
        dosage_form: "Tablet",
        pack_size: "15 tablets",
        schedule_type: "OTC",
        salt_composition: "Paracetamol (500mg) + Phenylephrine (10mg) + Chlorpheniramine (2mg)"
    },
    {
        name: "Revital H",
        generic_name: "Multivitamin",
        manufacturer: "Sun Pharmaceutical Industries Ltd",
        category: "Supplements",
        mrp: 330.00,
        image_url: getLocalPath("Revital H"),
        description: "Revital H Capsule is a daily health supplement that helps improve energy, immunity, and stamina.",
        dosage_form: "Capsule",
        pack_size: "30 capsules",
        schedule_type: "OTC",
        salt_composition: "Ginseng + Vitamins + Minerals"
    },
    {
        name: "Allegra 120",
        generic_name: "Fexofenadine",
        manufacturer: "Sanofi India Ltd",
        category: "Allergy",
        mrp: 218.00,
        image_url: getLocalPath("Allegra 120"),
        description: "Allegra 120mg Tablet is an anti-allergic medicine used to treat symptoms of hay fever and skin allergies.",
        dosage_form: "Tablet",
        pack_size: "10 tablets",
        schedule_type: "H",
        salt_composition: "Fexofenadine (120mg)"
    },

    // --- New Additions (80+) ---

    // Pain & Fever
    { name: "Combiflam", generic_name: "Ibuprofen + Paracetamol", manufacturer: "Sanofi India Ltd", category: "Pain Relief", mrp: 45.00, image_url: getLocalPath("Combiflam"), description: "Combiflam Tablet is a pain relief medicine.", dosage_form: "Tablet", pack_size: "20 tablets", schedule_type: "H", salt_composition: "Ibuprofen (400mg) + Paracetamol (325mg)" },
    { name: "Calpol 650", generic_name: "Paracetamol", manufacturer: "GlaxoSmithKline", category: "Pain Relief", mrp: 30.00, image_url: getLocalPath("Calpol 650"), description: "Calpol 650 is widely used to treat pain and fever.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "OTC", salt_composition: "Paracetamol (650mg)" },
    { name: "Meftal-Spas", generic_name: "Mefenamic Acid + Dicyclomine", manufacturer: "Blue Cross Laboratories", category: "Pain Relief", mrp: 50.00, image_url: getLocalPath("Meftal-Spas"), description: "Meftal-Spas Tablet is used to treat menstrual pain and cramps.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H", salt_composition: "Mefenamic Acid + Dicyclomine" },
    { name: "Zerodol-P", generic_name: "Aceclofenac + Paracetamol", manufacturer: "Ipca Laboratories Ltd", category: "Pain Relief", mrp: 60.00, image_url: getLocalPath("Zerodol-P"), description: "Zerodol-P Tablet gives relief from pain and inflammation.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H", salt_composition: "Aceclofenac + Paracetamol" },
    { name: "Brufen 400", generic_name: "Ibuprofen", manufacturer: "Abbott", category: "Pain Relief", mrp: 20.00, image_url: getLocalPath("Brufen 400"), description: "Brufen 400 Tablet is used to relieve pain and swelling.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "H", salt_composition: "Ibuprofen (400mg)" },

    // Antibiotics
    { name: "Taxim-O 200", generic_name: "Cefixime", manufacturer: "Alkem Laboratories Ltd", category: "Antibiotics", mrp: 150.00, image_url: getLocalPath("Taxim-O 200"), description: "Taxim-O 200 Tablet is an antibiotic used to treat bacterial infections.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H1", salt_composition: "Cefixime (200mg)" },
    { name: "Azithral 500", generic_name: "Azithromycin", manufacturer: "Alembic Pharmaceuticals Ltd", category: "Antibiotics", mrp: 120.00, image_url: getLocalPath("Azithral 500"), description: "Azithral 500 Tablet is an antibiotic used to treat various infections.", dosage_form: "Tablet", pack_size: "5 tablets", schedule_type: "H1", salt_composition: "Azithromycin (500mg)" },
    { name: "Moxikind-CV 625", generic_name: "Amoxicillin + Clavulanic Acid", manufacturer: "Mankind Pharma Ltd", category: "Antibiotics", mrp: 180.00, image_url: getLocalPath("Moxikind-CV 625"), description: "Moxikind-CV 625 Tablet is effective against bacterial infections.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H1", salt_composition: "Amoxicillin + Clavulanic Acid" },
    { name: "Cifran 500", generic_name: "Ciprofloxacin", manufacturer: "Sun Pharma", category: "Antibiotics", mrp: 55.00, image_url: getLocalPath("Cifran 500"), description: "Cifran 500 Tablet is used to treat bacterial infections.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H", salt_composition: "Ciprofloxacin (500mg)" },
    { name: "Oflox 200", generic_name: "Ofloxacin", manufacturer: "Cipla Ltd", category: "Antibiotics", mrp: 80.00, image_url: getLocalPath("Oflox 200"), description: "Oflox 200 Tablet is an antibiotic for urinary and respiratory infections.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H", salt_composition: "Ofloxacin (200mg)" },

    // Stomach Care
    { name: "Pantocid 40", generic_name: "Pantoprazole", manufacturer: "Sun Pharma", category: "Stomach Care", mrp: 150.00, image_url: getLocalPath("Pantocid 40"), description: "Pantocid 40 Tablet treats acidity and heartburn.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "H", salt_composition: "Pantoprazole (40mg)" },
    { name: "Omez", generic_name: "Omeprazole", manufacturer: "Dr. Reddy's Laboratories", category: "Stomach Care", mrp: 55.00, image_url: getLocalPath("Omez"), description: "Omez Capsule is used to treat ulcers and acid reflux.", dosage_form: "Capsule", pack_size: "20 capsules", schedule_type: "H", salt_composition: "Omeprazole (20mg)" },
    { name: "Rantac 150", generic_name: "Ranitidine", manufacturer: "J B Chemicals", category: "Stomach Care", mrp: 35.00, image_url: getLocalPath("Rantac 150"), description: "Rantac 150 Tablet relieves indigestion and heartburn.", dosage_form: "Tablet", pack_size: "30 tablets", schedule_type: "H", salt_composition: "Ranitidine (150mg)" },
    { name: "Aciloc 150", generic_name: "Ranitidine", manufacturer: "Cadila Pharmaceuticals", category: "Stomach Care", mrp: 30.00, image_url: getLocalPath("Aciloc 150"), description: "Aciloc 150 Tablet is an antacid for acidity relief.", dosage_form: "Tablet", pack_size: "30 tablets", schedule_type: "H", salt_composition: "Ranitidine (150mg)" },
    { name: "Gelusil MPS", generic_name: "Antacid", manufacturer: "Pfizer", category: "Stomach Care", mrp: 120.00, image_url: getLocalPath("Gelusil MPS"), description: "Gelusil MPS Liquid provides relief from acidity and gas.", dosage_form: "Syrup", pack_size: "200 ml", schedule_type: "OTC", salt_composition: "Aluminium Hydroxide + Magnesium" },

    // Cardiac & Diabetes
    { name: "Amlokind 5", generic_name: "Amlodipine", manufacturer: "Mankind Pharma", category: "Cardiac", mrp: 30.00, image_url: getLocalPath("Amlokind 5"), description: "Amlokind 5 Tablet treats high blood pressure.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "H", salt_composition: "Amlodipine (5mg)" },
    { name: "Atorva 10", generic_name: "Atorvastatin", manufacturer: "Zydus Cadila", category: "Cardiac", mrp: 60.00, image_url: getLocalPath("Atorva 10"), description: "Atorva 10 Tablet is used to lower cholesterol.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "H", salt_composition: "Atorvastatin (10mg)" },
    { name: "Rosuvas 10", generic_name: "Rosuvastatin", manufacturer: "Sun Pharma", category: "Cardiac", mrp: 190.00, image_url: getLocalPath("Rosuvas 10"), description: "Rosuvas 10 Tablet reduces bad cholesterol.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "H", salt_composition: "Rosuvastatin (10mg)" },
    { name: "Galvus Met 50/500", generic_name: "Vildagliptin + Metformin", manufacturer: "Novartis", category: "Diabetes", mrp: 280.00, image_url: getLocalPath("Galvus Met 50/500"), description: "Galvus Met controls high blood sugar.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "H", salt_composition: "Vildagliptin + Metformin" },
    { name: "Janumet 50/500", generic_name: "Sitagliptin + Metformin", manufacturer: "MSD", category: "Diabetes", mrp: 300.00, image_url: getLocalPath("Janumet 50/500"), description: "Janumet Tablet helps treat type 2 diabetes.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "H", salt_composition: "Sitagliptin + Metformin" },

    // Vitamins & Supplements
    { name: "Zincovit", generic_name: "Multivitamin", manufacturer: "Apex Laboratories", category: "Supplements", mrp: 105.00, image_url: getLocalPath("Zincovit"), description: "Zincovit Tablet boosts immunity and overall health.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "OTC", salt_composition: "Vitamins + Zinc" },
    { name: "Limcee 500", generic_name: "Vitamin C", manufacturer: "Abbott", category: "Supplements", mrp: 25.00, image_url: getLocalPath("Limcee 500"), description: "Limcee 500 Tablet treats Vitamin C deficiency.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "OTC", salt_composition: "Vitamin C (500mg)" },
    { name: "Supradyn", generic_name: "Multivitamin", manufacturer: "Bayer", category: "Supplements", mrp: 40.00, image_url: getLocalPath("Supradyn"), description: "Supradyn Tablet improves energy and immunity.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "OTC", salt_composition: "Multivitamins" },
    { name: "A to Z NS", generic_name: "Multivitamin", manufacturer: "Alkem", category: "Supplements", mrp: 110.00, image_url: getLocalPath("A to Z NS"), description: "A to Z NS Tablet is a nutritional supplement.", dosage_form: "Tablet", pack_size: "15 tablets", schedule_type: "OTC", salt_composition: "Multivitamins" },
    { name: "Evion 400", generic_name: "Vitamin E", manufacturer: "Merck", category: "Supplements", mrp: 35.00, image_url: getLocalPath("Evion 400"), description: "Evion 400 Capsule treats Vitamin E deficiency.", dosage_form: "Capsule", pack_size: "10 capsules", schedule_type: "OTC", salt_composition: "Vitamin E (400mg)" },

    // Cold, Cough & Respiratory
    { name: "Alex Syrup", generic_name: "Dextromethorphan", manufacturer: "Glenmark", category: "Cold & Flu", mrp: 130.00, image_url: getLocalPath("Alex Syrup"), description: "Alex Syrup is used for dry cough.", dosage_form: "Syrup", pack_size: "100 ml", schedule_type: "H", salt_composition: "Dextromethorphan + Chlorpheniramine" },
    { name: "Benadryl", generic_name: "Diphenhydramine", manufacturer: "Johnson & Johnson", category: "Cold & Flu", mrp: 110.00, image_url: getLocalPath("Benadryl"), description: "Benadryl Syrup relieves cough and cold symptoms.", dosage_form: "Syrup", pack_size: "150 ml", schedule_type: "OTC", salt_composition: "Diphenhydramine" },
    { name: "Grillinctus", generic_name: "Dextromethorphan", manufacturer: "Franco-Indian", category: "Cold & Flu", mrp: 120.00, image_url: getLocalPath("Grillinctus"), description: "Grillinctus Syrup is effective for cough relief.", dosage_form: "Syrup", pack_size: "100 ml", schedule_type: "H", salt_composition: "Dextromethorphan" },
    { name: "Cheston Cold", generic_name: "Paracetamol + Cetirizine", manufacturer: "Cipla", category: "Cold & Flu", mrp: 55.00, image_url: getLocalPath("Cheston Cold"), description: "Cheston Cold Tablet relieves cold and flu symptoms.", dosage_form: "Tablet", pack_size: "10 tablets", schedule_type: "OTC", salt_composition: "Paracetamol + Cetirizine" },
    { name: "Maxtra Syrup", generic_name: "Phenylephrine", manufacturer: "Zuventus", category: "Cold & Flu", mrp: 95.00, image_url: getLocalPath("Maxtra Syrup"), description: "Maxtra Syrup is used for common cold in children.", dosage_form: "Syrup", pack_size: "60 ml", schedule_type: "OTC", salt_composition: "Phenylephrine + Chlorpheniramine" },

    // Skin & Miscellaneous
    { name: "Candid Cream", generic_name: "Clotrimazole", manufacturer: "Glenmark", category: "Skin Care", mrp: 110.00, image_url: getLocalPath("Candid Cream"), description: "Candid Cream is used for fungal skin infections.", dosage_form: "Cream", pack_size: "30 gm", schedule_type: "OTC", salt_composition: "Clotrimazole" },
    { name: "Soframycin", generic_name: "Framycetin", manufacturer: "Sanofi", category: "Skin Care", mrp: 50.00, image_url: getLocalPath("Soframycin"), description: "Soframycin Cream is an antibiotic skin cream.", dosage_form: "Cream", pack_size: "30 gm", schedule_type: "OTC", salt_composition: "Framycetin" },
    { name: "Omnigel", generic_name: "Diclofenac Gel", manufacturer: "Cipla", category: "Pain Relief", mrp: 85.00, image_url: getLocalPath("Omnigel"), description: "Omnigel provides relief from muscular pain.", dosage_form: "Gel", pack_size: "30 gm", schedule_type: "OTC", salt_composition: "Diclofenac" },
    { name: "T-Bact", generic_name: "Mupirocin", manufacturer: "GlaxoSmithKline", category: "Skin Care", mrp: 130.00, image_url: getLocalPath("T-Bact"), description: "T-Bact Ointment treats bacterial skin infections.", dosage_form: "Ointment", pack_size: "5 gm", schedule_type: "H", salt_composition: "Mupirocin" },

    // Ayurvedic
    { name: "Himalaya Liv.52", generic_name: "Herbal Supplement", manufacturer: "Himalaya", category: "Ayurvedic", mrp: 150.00, image_url: getLocalPath("Himalaya Liv.52"), description: "Himalaya Liv.52 promotes liver health.", dosage_form: "Tablet", pack_size: "60 tablets", schedule_type: "OTC", salt_composition: "Herbal" },
    { name: "Cystone", generic_name: "Herbal Supplement", manufacturer: "Himalaya", category: "Ayurvedic", mrp: 160.00, image_url: getLocalPath("Cystone"), description: "Cystone Tablet supports kidney health.", dosage_form: "Tablet", pack_size: "60 tablets", schedule_type: "OTC", salt_composition: "Herbal" },
    { name: "Pudin Hara", generic_name: "Mint Oil", manufacturer: "Dabur", category: "Ayurvedic", mrp: 30.00, image_url: getLocalPath("Pudin Hara"), description: "Pudin Hara pearls provide relief from gas.", dosage_form: "Capsule", pack_size: "10 capsules", schedule_type: "OTC", salt_composition: "Mentha Oil" },
    { name: "Septilin", generic_name: "Herbal Supplement", manufacturer: "Himalaya", category: "Ayurvedic", mrp: 140.00, image_url: getLocalPath("Septilin"), description: "Septilin Tablet boosts general immunity.", dosage_form: "Tablet", pack_size: "60 tablets", schedule_type: "OTC", salt_composition: "Herbal" },
    { name: "Tentex Royal", generic_name: "Herbal Supplement", manufacturer: "Himalaya", category: "Ayurvedic", mrp: 200.00, image_url: getLocalPath("Tentex Royal"), description: "Tentex Royal promotes sexual wellness.", dosage_form: "Capsule", pack_size: "10 capsules", schedule_type: "OTC", salt_composition: "Herbal" }
];

async function seedMedicines() {
    console.log('🌱 Seeding medicines...');

    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        let count = 0;
        // Loop through medicines and insert
        for (const med of medicines) {
            // Check if medicine already exists to avoid duplicates or updates
            const checkRes = await client.query('SELECT id FROM medicines WHERE name = $1', [med.name]);

            if (checkRes.rows.length > 0) {
                // Update existing medicine (especially pertinent for image_url)
                await client.query(
                    `UPDATE medicines SET 
                        image_url = $1,
                        mrp = $2,
                        description = $3,
                        manufacturer = $4,
                        category = $5,
                        pack_size = $6
                     WHERE name = $7`,
                    [med.image_url, med.mrp, med.description, med.manufacturer, med.category, med.pack_size, med.name]
                );
                // console.log(`Updated: ${med.name}`);
            } else {
                // Insert new medicine
                await client.query(
                    `INSERT INTO medicines (
                        id, 
                        name, 
                        generic_name, 
                        manufacturer, 
                        category, 
                        mrp, 
                        image_url, 
                        description, 
                        dosage_form, 
                        pack_size, 
                        schedule_type, 
                        salt_composition,
                        is_active
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)`,
                    [
                        uuidv4(),
                        med.name,
                        med.generic_name,
                        med.manufacturer,
                        med.category,
                        med.mrp,
                        med.image_url,
                        med.description,
                        med.dosage_form,
                        med.pack_size,
                        med.schedule_type,
                        med.salt_composition
                    ]
                );
                // console.log(`Inserted: ${med.name}`);
            }
            count++;
        }

        console.log(`✅ ${count} medicines processed successfully.`);

    } catch (err) {
        console.error('❌ Error seeding medicines:', err);
    } finally {
        await client.end();
    }
}

seedMedicines();
