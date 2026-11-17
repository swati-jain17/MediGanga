-- ============================================
-- MEDIGANGA Seed Data
-- Varanasi & Ghaziabad
-- ============================================

-- ============================================
-- Dark Stores (Pharmacies)
-- ============================================
INSERT INTO dark_stores (id, name, city, address, latitude, longitude, geofence_radius_meters, pharmacist_name, pharmacist_license, phone) VALUES
  -- Varanasi (3 stores)
  ('b1000000-0000-0000-0000-000000000001', 'MediGanga Assi Ghat', 'Varanasi', 'Assi Ghat Road, Near Tulsi Ghat, Varanasi 221005', 25.2855, 83.0078, 3000, 'Dr. Ramesh Sharma', 'UP/PHR/2020/1234', '+919876543001'),
  ('b1000000-0000-0000-0000-000000000002', 'MediGanga Dashashwamedh', 'Varanasi', 'Dashashwamedh Ghat Road, Varanasi 221001', 25.3109, 83.0107, 2500, 'Dr. Priya Gupta', 'UP/PHR/2021/2345', '+919876543002'),
  ('b1000000-0000-0000-0000-000000000003', 'MediGanga Sigra', 'Varanasi', 'Sigra Main Road, Varanasi 221010', 25.3176, 82.9913, 3500, 'Dr. Anil Mishra', 'UP/PHR/2019/3456', '+919876543003')
ON CONFLICT DO NOTHING;

-- ============================================
-- Medicines (Sample - Modern Medicines Only)
-- ============================================
INSERT INTO medicines (id, name, generic_name, salt_composition, schedule_type, manufacturer, category, is_ayurvedic, mrp, generic_mrp, dosage_form, pack_size, description, image_url) VALUES
  -- Pain Relief / Fever
  ('a0000000-0000-0000-0000-000000000001', 'Crocin Advance 500mg', 'Paracetamol', 'Paracetamol 500mg', 'OTC', 'GSK', 'Pain Relief', FALSE, 32.50, 12.00, 'Tablet', '15 tablets', 'Fast-acting pain and fever relief', '/medicines/crocin_advance_500mg.png'),
  ('a0000000-0000-0000-0000-000000000002', 'Dolo 650', 'Paracetamol', 'Paracetamol 650mg', 'OTC', 'Micro Labs', 'Pain Relief', FALSE, 35.00, 14.00, 'Tablet', '15 tablets', 'For fever and mild to moderate pain', '/medicines/dolo_650.jpg'),
  ('a0000000-0000-0000-0000-000000000003', 'Combiflam', 'Ibuprofen + Paracetamol', 'Ibuprofen 400mg + Paracetamol 325mg', 'OTC', 'Sanofi', 'Pain Relief', FALSE, 42.00, 18.00, 'Tablet', '20 tablets', 'Dual action pain relief', '/medicines/combiflam.jpg'),
  ('a0000000-0000-0000-0000-000000000004', 'Brufen 400', 'Ibuprofen', 'Ibuprofen 400mg', 'OTC', 'Abbott', 'Pain Relief', FALSE, 28.00, 10.00, 'Tablet', '10 tablets', 'Anti-inflammatory pain relief', '/medicines/brufen_400.jpg'),
  ('a0000000-0000-0000-0000-000000000005', 'Disprin', 'Aspirin', 'Aspirin 350mg', 'OTC', 'Reckitt', 'Pain Relief', FALSE, 18.00, 8.00, 'Tablet', '10 tablets', 'Headache and body pain relief', '/medicines/tablet_pain.jpg'),
  
  -- Antibiotics (Schedule H)
  ('a0000000-0000-0000-0000-000000000010', 'Augmentin 625 Duo', 'Amoxicillin + Clavulanate', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'H', 'GSK', 'Antibiotics', FALSE, 285.00, 95.00, 'Tablet', '10 tablets', 'Broad-spectrum antibiotic', '/medicines/augmentin_625_duo.jpg'),
  ('a0000000-0000-0000-0000-000000000011', 'Azithral 500', 'Azithromycin', 'Azithromycin 500mg', 'H', 'Alembic', 'Antibiotics', FALSE, 115.00, 45.00, 'Tablet', '3 tablets', 'Macrolide antibiotic for infections', '/medicines/azithral_500.jpg'),
  ('a0000000-0000-0000-0000-000000000012', 'Cipro 500', 'Ciprofloxacin', 'Ciprofloxacin 500mg', 'H', 'Bayer', 'Antibiotics', FALSE, 98.00, 35.00, 'Tablet', '10 tablets', 'Fluoroquinolone antibiotic', '/medicines/cifran_500.jpg'),
  ('a0000000-0000-0000-0000-000000000013', 'Monocef 200', 'Cefixime', 'Cefixime 200mg', 'H', 'Aristo', 'Antibiotics', FALSE, 165.00, 55.00, 'Tablet', '10 tablets', 'Cephalosporin antibiotic', '/medicines/tablet_antibiotic.jpg'),
  ('a0000000-0000-0000-0000-000000000014', 'Taxim-O 200', 'Cefixime', 'Cefixime 200mg', 'H', 'Alkem', 'Antibiotics', FALSE, 175.00, 55.00, 'Tablet', '10 tablets', 'Third-gen cephalosporin', '/medicines/taxim_o_200.jpg'),
  
  -- Diabetes (Schedule H)
  ('a0000000-0000-0000-0000-000000000020', 'Glycomet 500', 'Metformin', 'Metformin 500mg', 'H', 'USV', 'Diabetes', FALSE, 32.00, 15.00, 'Tablet', '20 tablets', 'First-line diabetes medication', '/medicines/tablet_diabetes.jpg'),
  ('a0000000-0000-0000-0000-000000000021', 'Glycomet GP 2', 'Metformin + Glimepiride', 'Metformin 500mg + Glimepiride 2mg', 'H', 'USV', 'Diabetes', FALSE, 145.00, 65.00, 'Tablet', '15 tablets', 'Combined diabetes control', '/medicines/glycomet_gp_1.jpg'),
  ('a0000000-0000-0000-0000-000000000022', 'Januvia 100', 'Sitagliptin', 'Sitagliptin 100mg', 'H', 'MSD', 'Diabetes', FALSE, 650.00, NULL, 'Tablet', '14 tablets', 'DPP-4 inhibitor for diabetes', '/medicines/tablet_diabetes.jpg'),
  ('a0000000-0000-0000-0000-000000000023', 'Galvus Met 50/500', 'Vildagliptin + Metformin', 'Vildagliptin 50mg + Metformin 500mg', 'H', 'Novartis', 'Diabetes', FALSE, 485.00, 180.00, 'Tablet', '20 tablets', 'Dual therapy for Type 2 diabetes', '/medicines/galvus_met_50_500.jpg'),
  ('a0000000-0000-0000-0000-000000000024', 'Amaryl M 2mg', 'Glimepiride + Metformin', 'Glimepiride 2mg + Metformin 500mg', 'H', 'Sanofi', 'Diabetes', FALSE, 165.00, 70.00, 'Tablet', '15 tablets', 'Combination for blood sugar control', '/medicines/tablet_diabetes.jpg'),
  
  -- Cardiac / Blood Pressure (Schedule H)
  ('a0000000-0000-0000-0000-000000000030', 'Ecosprin 75', 'Aspirin', 'Aspirin 75mg (Low Dose)', 'H', 'USV', 'Cardiac', FALSE, 25.00, 10.00, 'Tablet', '14 tablets', 'Blood thinning for heart health', '/medicines/tablet_cardiac.jpg'),
  ('a0000000-0000-0000-0000-000000000031', 'Clopitab 75', 'Clopidogrel', 'Clopidogrel 75mg', 'H', 'Lupin', 'Cardiac', FALSE, 85.00, 35.00, 'Tablet', '15 tablets', 'Antiplatelet for heart patients', '/medicines/tablet_cardiac.jpg'),
  ('a0000000-0000-0000-0000-000000000032', 'Atorva 10', 'Atorvastatin', 'Atorvastatin 10mg', 'H', 'Zydus', 'Cardiac', FALSE, 115.00, 45.00, 'Tablet', '15 tablets', 'Cholesterol-lowering statin', '/medicines/atorva_10.jpg'),
  ('a0000000-0000-0000-0000-000000000033', 'Telma 40', 'Telmisartan', 'Telmisartan 40mg', 'H', 'Glenmark', 'Cardiac', FALSE, 95.00, 38.00, 'Tablet', '15 tablets', 'ARB for hypertension', '/medicines/telma_40.jpg'),
  ('a0000000-0000-0000-0000-000000000034', 'Amlong 5', 'Amlodipine', 'Amlodipine 5mg', 'H', 'Micro Labs', 'Cardiac', FALSE, 45.00, 18.00, 'Tablet', '15 tablets', 'Calcium channel blocker for BP', '/medicines/amlokind_5.jpg'),
  ('a0000000-0000-0000-0000-000000000035', 'Concor 5', 'Bisoprolol', 'Bisoprolol 5mg', 'H', 'Merck', 'Cardiac', FALSE, 125.00, 55.00, 'Tablet', '14 tablets', 'Beta blocker for heart conditions', '/medicines/tablet_cardiac.jpg'),
  
  -- Gastric / Digestive (OTC & H)
  ('a0000000-0000-0000-0000-000000000040', 'Pan 40', 'Pantoprazole', 'Pantoprazole 40mg', 'H', 'Alkem', 'Gastric', FALSE, 85.00, 32.00, 'Tablet', '15 tablets', 'Proton pump inhibitor for acidity', '/medicines/pan_d.jpg'),
  ('a0000000-0000-0000-0000-000000000041', 'Omez 20', 'Omeprazole', 'Omeprazole 20mg', 'H', 'Dr. Reddys', 'Gastric', FALSE, 75.00, 28.00, 'Capsule', '15 capsules', 'For GERD and ulcers', '/medicines/omez.jpg'),
  ('a0000000-0000-0000-0000-000000000042', 'Rantac 150', 'Ranitidine', 'Ranitidine 150mg', 'OTC', 'JB Chemicals', 'Gastric', FALSE, 35.00, 15.00, 'Tablet', '30 tablets', 'H2 blocker for heartburn', '/medicines/rantac_150.jpg'),
  ('a0000000-0000-0000-0000-000000000043', 'Gelusil MPS', NULL, 'Magaldrate + Simethicone', 'OTC', 'Pfizer', 'Gastric', FALSE, 95.00, NULL, 'Syrup', '170ml', 'Antacid for gas and acidity', '/medicines/gelusil_mps.jpg'),
  ('a0000000-0000-0000-0000-000000000044', 'Digene', NULL, 'Dried Aluminium Hydroxide Gel + Magnesium Hydroxide', 'OTC', 'Abbott', 'Gastric', FALSE, 45.00, NULL, 'Tablet', '15 tablets', 'Chewable antacid', '/medicines/digene_gel_mint_.jpg'),
  
  -- Allergy / Cold (OTC)
  ('a0000000-0000-0000-0000-000000000050', 'Cetirizine 10mg', 'Cetirizine', 'Cetirizine 10mg', 'OTC', 'Various', 'Allergy', FALSE, 25.00, 8.00, 'Tablet', '10 tablets', 'Antihistamine for allergies', '/medicines/tablet_allergy.jpg'),
  ('a0000000-0000-0000-0000-000000000051', 'Allegra 120', 'Fexofenadine', 'Fexofenadine 120mg', 'OTC', 'Sanofi', 'Allergy', FALSE, 145.00, 55.00, 'Tablet', '10 tablets', 'Non-drowsy antihistamine', '/medicines/allegra_120.jpg'),
  ('a0000000-0000-0000-0000-000000000052', 'Montair LC', 'Montelukast + Levocetirizine', 'Montelukast 10mg + Levocetirizine 5mg', 'H', 'Cipla', 'Allergy', FALSE, 185.00, 75.00, 'Tablet', '15 tablets', 'For allergic rhinitis and asthma', '/medicines/montair_lc.jpg'),
  ('a0000000-0000-0000-0000-000000000053', 'Sinarest', 'Paracetamol + Phenylephrine + Cetirizine', 'Multi-ingredient cold formula', 'OTC', 'Centaur', 'Cold & Flu', FALSE, 38.00, 18.00, 'Tablet', '10 tablets', 'Multi-symptom cold relief', '/medicines/sinarest.jpg'),
  ('a0000000-0000-0000-0000-000000000054', 'Vicks Action 500', NULL, 'Paracetamol + Caffeine + Phenylephrine', 'OTC', 'P&G', 'Cold & Flu', FALSE, 35.00, NULL, 'Tablet', '10 tablets', 'Cold and headache relief', '/medicines/tablet_cold.jpg'),
  
  -- Vitamins & Supplements (OTC)
  ('a0000000-0000-0000-0000-000000000060', 'Becosules Z', NULL, 'Vitamin B Complex + Zinc', 'OTC', 'Pfizer', 'Vitamins', FALSE, 95.00, 45.00, 'Capsule', '20 capsules', 'B vitamins with zinc for immunity', '/medicines/becosules_z.jpg'),
  ('a0000000-0000-0000-0000-000000000061', 'Shelcal 500', NULL, 'Calcium + Vitamin D3', 'OTC', 'Torrent', 'Vitamins', FALSE, 145.00, 65.00, 'Tablet', '15 tablets', 'Calcium supplement for bone health', '/medicines/shelcal_500.jpg'),
  ('a0000000-0000-0000-0000-000000000062', 'Limcee', NULL, 'Vitamin C 500mg', 'OTC', 'Abbott', 'Vitamins', FALSE, 35.00, 12.00, 'Tablet', '15 tablets', 'Chewable vitamin C', '/medicines/limcee_500.jpg'),
  ('a0000000-0000-0000-0000-000000000063', 'Neurobion Forte', NULL, 'Vitamin B1 + B6 + B12', 'OTC', 'Merck', 'Vitamins', FALSE, 45.00, 22.00, 'Tablet', '30 tablets', 'For nerve health', '/medicines/neurobion_forte.jpg'),
  ('a0000000-0000-0000-0000-000000000064', 'Evion 400', NULL, 'Vitamin E 400mg', 'OTC', 'Merck', 'Vitamins', FALSE, 125.00, 55.00, 'Capsule', '10 capsules', 'Antioxidant vitamin E', '/medicines/evion_400.jpg'),
  
  -- Skin Care (OTC)
  ('a0000000-0000-0000-0000-000000000080', 'Betadine Ointment', 'Povidone Iodine', 'Povidone Iodine 5%', 'OTC', 'Win-Medicare', 'Skin Care', FALSE, 85.00, NULL, 'Ointment', '20g', 'Antiseptic for wounds', '/medicines/betadine_ointment.jpg'),
  ('a0000000-0000-0000-0000-000000000081', 'Soframycin Cream', 'Framycetin', 'Framycetin 1%', 'OTC', 'Sanofi', 'Skin Care', FALSE, 75.00, NULL, 'Cream', '30g', 'Antibiotic cream for cuts', '/medicines/soframycin.jpg'),
  ('a0000000-0000-0000-0000-000000000082', 'Candid B Cream', 'Clotrimazole + Beclometasone', 'Clotrimazole 1% + Beclometasone 0.025%', 'H', 'Glenmark', 'Skin Care', FALSE, 95.00, 38.00, 'Cream', '15g', 'Antifungal with steroid', '/medicines/candid_cream.jpg'),
  ('a0000000-0000-0000-0000-000000000083', 'Moov Cream', NULL, 'Wintergreen Oil + Turpentine Oil', 'OTC', 'Reckitt', 'Pain Relief', FALSE, 85.00, NULL, 'Cream', '50g', 'Muscle pain relief cream', '/medicines/balm_pain.jpg'),
  
  -- Eye & Ear (OTC & H)
  ('a0000000-0000-0000-0000-000000000090', 'Moxifloxacin Eye Drops', 'Moxifloxacin', 'Moxifloxacin 0.5%', 'H', 'Cipla', 'Eye Care', FALSE, 125.00, 55.00, 'Drops', '5ml', 'Antibiotic eye drops', '/medicines/moxikind_cv_625.jpg'),
  ('a0000000-0000-0000-0000-000000000091', 'Tears Naturale II', NULL, 'Hydroxypropyl Methylcellulose', 'OTC', 'Alcon', 'Eye Care', FALSE, 175.00, NULL, 'Drops', '15ml', 'Lubricating eye drops', '/medicines/eye_drops.jpg'),
  
  -- Schedule X (Controlled - require special prescription)
  ('a0000000-0000-0000-0000-000000000095', 'Tramadol 50mg', 'Tramadol', 'Tramadol Hydrochloride 50mg', 'X', 'Sun Pharma', 'Pain Relief', FALSE, 45.00, 22.00, 'Tablet', '10 tablets', 'Strong pain relief (controlled)', '/medicines/tablet_pain.jpg'),
  ('a0000000-0000-0000-0000-000000000096', 'Alprazolam 0.5mg', 'Alprazolam', 'Alprazolam 0.5mg', 'X', 'Sun Pharma', 'Psychiatry', FALSE, 35.00, 15.00, 'Tablet', '10 tablets', 'Anti-anxiety (controlled)', '/medicines/tablet_psych.jpg'),

  -- Additional Medicines requested by user
  -- Pain Relief
  ('a0000000-1000-0000-0000-000000000001', 'Volini Gel', 'Diclofenac', 'Diclofenac Diethylamine 1.16%', 'OTC', 'Sun Pharma', 'Pain Relief', FALSE, 145.00, 60.00, 'Gel', '50g', 'Rapid pain relief for joints and muscles', '/medicines/volini_pain_relief_spray.jpg'),
  ('a0000000-1000-0000-0000-000000000002', 'Saridon', 'Paracetamol + Propyphenazone + Caffeine', 'Paracetamol 250mg + Propyphenazone 150mg + Caffeine 50mg', 'OTC', 'Bayer', 'Pain Relief', FALSE, 45.00, 15.00, 'Tablet', '10 tablets', 'Effective relief from headache', '/medicines/tablet_pain.jpg'),
  ('a0000000-1000-0000-0000-000000000003', 'Ibugesic Plus', 'Ibuprofen + Paracetamol', 'Ibuprofen 100mg + Paracetamol 125mg', 'OTC', 'Cipla', 'Pain Relief', FALSE, 38.00, 12.00, 'Syrup', '60ml', 'For fever and pain in children', '/medicines/syrup_antacid.jpg'),
  
  -- Gastric
  ('a0000000-1000-0000-0000-000000000010', 'Zinetac 150', 'Ranitidine', 'Ranitidine 150mg', 'OTC', 'GSK', 'Gastric', FALSE, 32.00, 10.00, 'Tablet', '30 tablets', 'Relief from acidity and heartburn', '/medicines/rantac_150.jpg'),
  ('a0000000-1000-0000-0000-000000000011', 'Eno Lemon Flavor', NULL, 'Svarjiksara + Nimbukamlam', 'OTC', 'GSK', 'Gastric', FALSE, 9.00, NULL, 'Sachet', '5g', 'Fast relief from acidity', '/medicines/eno_fruit_salt_lemon_.jpg'),
  ('a0000000-1000-0000-0000-000000000012', 'Pudina Hara', NULL, 'Pudinah', 'OTC', 'Dabur', 'Gastric', TRUE, 15.00, NULL, 'Liquid', '30ml', 'Ayurvedic relief for stomach ache and gas', '/medicines/pudin_hara.jpg'),
  
  -- Diabetes
  ('a0000000-1000-0000-0000-000000000020', 'Galvus 50mg', 'Vildagliptin', 'Vildagliptin 50mg', 'H', 'Novartis', 'Diabetes', FALSE, 390.00, 150.00, 'Tablet', '14 tablets', 'Treats Type 2 Diabetes', '/medicines/tablet_diabetes.jpg'),
  ('a0000000-1000-0000-0000-000000000021', 'Jardiance 10mg', 'Empagliflozin', 'Empagliflozin 10mg', 'H', 'Boehringer Ingelheim', 'Diabetes', FALSE, 750.00, NULL, 'Tablet', '10 tablets', 'SGLT2 inhibitor for blood sugar control', '/medicines/tablet_diabetes.jpg'),
  
  -- Vitamins
  ('a0000000-1000-0000-0000-000000000030', 'Revital H', NULL, 'Ginseng + Vitamins + Minerals', 'OTC', 'Sun Pharma', 'Vitamins', FALSE, 310.00, NULL, 'Capsule', '30 capsules', 'Daily health supplement for energy', '/medicines/revital_h.jpg'),
  ('a0000000-1000-0000-0000-000000000031', 'Zincovit', NULL, 'Multivitamin + Multimineral + Grape Seed Extract', 'OTC', 'Apex', 'Vitamins', FALSE, 105.00, 50.00, 'Tablet', '15 tablets', 'Nutritional supplement with vitamins and zinc', '/medicines/zincovit.jpg'),
  ('a0000000-1000-0000-0000-000000000032', 'Seven Seas Cod Liver Oil', NULL, 'Cod Liver Oil', 'OTC', 'P&G', 'Vitamins', FALSE, 420.00, NULL, 'Capsule', '100 capsules', 'Natural source of Omega-3 and Vitamin D', '/medicines/capsule_vitamin.jpg'),
  
  -- Personal Care (New Category)
  ('a0000000-1000-0000-0000-000000000040', 'Dettol Antiseptic Liquid', NULL, 'Chloroxylenol', 'OTC', 'Reckitt', 'Personal Care', FALSE, 185.00, NULL, 'Liquid', '500ml', 'First aid and surface disinfection', '/medicines/betadine_ointment.jpg'),
  ('a0000000-1000-0000-0000-000000000041', 'Savlon Antiseptic', NULL, 'Chlorhexidine Gluconate + Cetrimide', 'OTC', 'ITC', 'Personal Care', FALSE, 160.00, NULL, 'Liquid', '500ml', 'Gentle antiseptic for skin', '/medicines/betadine_ointment.jpg'),
  ('a0000000-1000-0000-0000-000000000042', 'Sensodyne Fresh Mint', NULL, 'Potassium Nitrate + Sodium Fluoride', 'OTC', 'GSK', 'Personal Care', FALSE, 195.00, NULL, 'Paste', '100g', 'For sensitive teeth and cavity protection', '/medicines/tube_ointment.jpg'),
  
  -- Cardiac
  ('a0000000-1000-0000-0000-000000000050', 'Lipitor 10mg', 'Atorvastatin', 'Atorvastatin 10mg', 'H', 'Pfizer', 'Cardiac', FALSE, 250.00, 45.00, 'Tablet', '10 tablets', 'Original brand statin for cholesterol', '/medicines/atorva_10.jpg'),
  ('a0000000-1000-0000-0000-000000000051', 'Rosuvas 10', 'Rosuvastatin', 'Rosuvastatin 10mg', 'H', 'Sun Pharma', 'Cardiac', FALSE, 185.00, 60.00, 'Tablet', '15 tablets', 'High-intensity statin', '/medicines/rosuvas_10.jpg'),
  
  -- Baby Care (New Category)
  ('a0000000-1000-0000-0000-000000000060', 'Johnsons Baby Powder', NULL, 'Talc', 'OTC', 'J&J', 'Baby Care', FALSE, 220.00, NULL, 'Powder', '400g', 'Classic baby powder for soft skin', '/medicines/powder_antacid.jpg'),
  ('a0000000-1000-0000-0000-000000000061', 'Himalaya Baby Lotion', NULL, 'Olive Oil + Country Mallow', 'OTC', 'Himalaya', 'Baby Care', TRUE, 165.00, NULL, 'Lotion', '200ml', 'Moisturizes baby''s delicate skin', '/medicines/tube_ointment.jpg'),
  ('a0000000-1000-0000-0000-000000000062', 'Pampers Baby Wipes', NULL, NULL, 'OTC', 'P&G', 'Baby Care', FALSE, 150.00, NULL, 'Wipes', '72 count', 'Gentle cleaning for babies', '/medicines/tube_ointment.jpg'),
  
  -- Antibiotics
  ('a0000000-1000-0000-0000-000000000070', 'Zithrox 500', 'Azithromycin', 'Azithromycin 500mg', 'H', 'Macleods', 'Antibiotics', FALSE, 110.00, 45.00, 'Tablet', '3 tablets', 'Broad-spectrum macrolide antibiotic', '/medicines/azithral_500.jpg'),
  ('a0000000-1000-0000-0000-000000000071', 'Doxy-1 LDR', 'Doxycycline', 'Doxycycline 100mg', 'H', 'USV', 'Antibiotics', FALSE, 95.00, 25.00, 'Capsule', '10 capsules', 'Antibiotic for bacterial infections', '/medicines/capsule_gas.jpg'),
  
  -- Cold & Flu
  ('a0000000-1000-0000-0000-000000000080', 'Otrivin Adult Nasal Spray', 'Xylometazoline', 'Xylometazoline 0.1%', 'OTC', 'GSK', 'Cold & Flu', FALSE, 98.00, 40.00, 'Spray', '10ml', 'Fast relief from nasal congestion', '/medicines/spray_pain.jpg'),
  ('a0000000-1000-0000-0000-000000000081', 'Koflet Syrup', NULL, 'Holy Basil + Honey', 'OTC', 'Himalaya', 'Cold & Flu', TRUE, 115.00, NULL, 'Syrup', '100ml', 'Ayurvedic cough relief syrup', '/medicines/syrup_cough.jpg'),
  ('a0000000-1000-0000-0000-000000000082', 'Strepsils Honey & Lemon', NULL, '2,4-Dichlorobenzyl Alcohol + Amylmetacresol', 'OTC', 'Reckitt', 'Cold & Flu', FALSE, 35.00, NULL, 'Lozenge', '8 pack', 'Relief from sore throat', '/medicines/tablet_cold.jpg'),

  -- Batch 2 - Populating all categories
  -- Allergy
  ('a0000000-2000-0000-0000-000000000001', 'Avil 25', 'Pheniramine', 'Pheniramine Maleate 25mg', 'OTC', 'Sanofi', 'Allergy', FALSE, 12.00, 5.00, 'Tablet', '15 tablets', 'Antihistamine for allergic conditions', '/medicines/tablet_allergy.jpg'),
  ('a0000000-2000-0000-0000-000000000002', 'Levocet 5', 'Levocetirizine', 'Levocetirizine 5mg', 'OTC', 'Himalaya', 'Allergy', FALSE, 55.00, 25.00, 'Tablet', '10 tablets', 'Relief from runny nose and watery eyes', '/medicines/tablet_allergy.jpg'),
  
  -- Skin Care
  ('a0000000-2000-0000-0000-000000000010', 'Boroline', NULL, 'Boric Acid + Zinc Oxide + Anhydrous Lanolin', 'OTC', 'GD Pharmaceuticals', 'Skin Care', FALSE, 45.00, NULL, 'Cream', '20g', 'Antiseptic ayurvedic cream for dry skin', '/medicines/betadine_ointment.jpg'),
  ('a0000000-2000-0000-0000-000000000011', 'Vicco Turmeric Cream', NULL, 'Turmeric + Sandalwood Oil', 'OTC', 'Vicco', 'Skin Care', TRUE, 180.00, NULL, 'Cream', '50g', 'Ayurvedic skin cream', '/medicines/tube_ointment.jpg'),
  ('a0000000-2000-0000-0000-000000000012', 'Multani Mitti Pack', NULL, 'Fullers Earth', 'OTC', 'Banjara', 'Skin Care', TRUE, 65.00, NULL, 'Powder', '100g', 'Natural clay for skin glowing', '/medicines/powder_antacid.jpg'),
  
  -- Personal Care
  ('a0000000-2000-0000-0000-000000000020', 'Colgate MaxFresh', NULL, 'Fluoride', 'OTC', 'Colgate', 'Personal Care', FALSE, 145.00, NULL, 'Paste', '150g', 'Cooling spicy fresh toothpaste', '/medicines/tube_ointment.jpg'),
  ('a0000000-2000-0000-0000-000000000021', 'Ariel Matic Liquid', NULL, NULL, 'OTC', 'P&G', 'Personal Care', FALSE, 450.00, NULL, 'Liquid', '1L', 'Front load liquid detergent', '/medicines/syrup_antacid.jpg'),
  ('a0000000-2000-0000-0000-000000000022', 'Whisper Ultra Clean', NULL, NULL, 'OTC', 'P&G', 'Personal Care', FALSE, 165.00, NULL, 'Pads', '15 count', 'Sanitary napkins for women', '/medicines/tube_ointment.jpg'),
  ('a0000000-2000-0000-0000-000000000023', 'Gillete Mach3 Razor', NULL, NULL, 'OTC', 'Gillete', 'Personal Care', FALSE, 450.00, NULL, 'Razor', '1 unit', '3-blade manual shaving razor', '/medicines/tube_ointment.jpg'),
  
  -- Baby Care
  ('a0000000-2000-0000-0000-000000000030', 'Cerelac Wheat Apple', NULL, NULL, 'OTC', 'Nestle', 'Baby Care', FALSE, 285.00, NULL, 'Cereal', '300g', 'Fortified baby cereal for 6+ months', '/medicines/powder_antacid.jpg'),
  ('a0000000-2000-0000-0000-000000000031', 'Himalaya Baby Shampoo', NULL, 'Chickpea + Hibiscus', 'OTC', 'Himalaya', 'Baby Care', TRUE, 185.00, NULL, 'Shampoo', '200ml', 'No tears formula for baby hair', '/medicines/syrup_cough.jpg'),
  ('a0000000-2000-0000-0000-000000000032', 'Dexolac Stage 1', NULL, NULL, 'OTC', 'Nurticia', 'Baby Care', FALSE, 450.00, NULL, 'Formula', '400g', 'Infant milk substitute', '/medicines/powder_antacid.jpg'),
  
  -- Eye Care
  ('a0000000-2000-0000-0000-000000000040', 'Itone Eye Drops', NULL, 'Ayurvedic Blend', 'OTC', 'Dey', 'Eye Care', TRUE, 65.00, NULL, 'Drops', '10ml', 'Ayurvedic herbal eye drops', '/medicines/eye_drops.jpg'),
  ('a0000000-2000-0000-0000-000000000041', 'Clear-eyes', 'Naphazoline', 'Naphazoline 0.012%', 'OTC', 'Prestige', 'Eye Care', FALSE, 145.00, 60.00, 'Drops', '15ml', 'Redness relief eye drops', '/medicines/eye_drops.jpg'),
  
  -- Antibiotics
  ('a0000000-2000-0000-0000-000000000050', 'Amoxycillin 250 DT', 'Amoxycillin', 'Amoxycillin 250mg', 'H', 'Cipla', 'Antibiotics', FALSE, 45.00, 18.00, 'Tablet', '10 tablets', 'Dispersible antibiotic for kids', '/medicines/tablet_antibiotic.jpg'),
  ('a0000000-2000-0000-0000-000000000051', 'Norflox 400', 'Norfloxacin', 'Norfloxacin 400mg', 'H', 'Cipla', 'Antibiotics', FALSE, 85.00, 32.00, 'Tablet', '10 tablets', 'Antibiotic for urinary infections', '/medicines/tablet_antibiotic.jpg'),
  
  -- Diabetes
  ('a0000000-2000-0000-0000-000000000060', 'Istamet 50/500', 'Sitagliptin + Metformin', 'Sitagliptin 50mg + Metformin 500mg', 'H', 'MSD', 'Diabetes', FALSE, 410.00, 180.00, 'Tablet', '15 tablets', 'Advanced diabetes combination', '/medicines/tablet_diabetes.jpg'),
  ('a0000000-2000-0000-0000-000000000061', 'Voglibose 0.3', 'Voglibose', 'Voglibose 0.3mg', 'H', 'Sun Pharma', 'Diabetes', FALSE, 125.00, 45.00, 'Tablet', '10 tablets', 'Controls post-meal blood sugar', '/medicines/tablet_diabetes.jpg'),
  
  -- Cardiac
  ('a0000000-2000-0000-0000-000000000070', 'Lasilix 40', 'Furosemide', 'Furosemide 40mg', 'H', 'Sanofi', 'Cardiac', FALSE, 15.00, 6.00, 'Tablet', '15 tablets', 'Diuretic for water retention and BP', '/medicines/tablet_cardiac.jpg'),
  ('a0000000-2000-0000-0000-000000000071', 'Metolar XR 25', 'Metoprolol', 'Metoprolol 25mg', 'H', 'JB Chemicals', 'Cardiac', FALSE, 95.00, 40.00, 'Tablet', '15 tablets', 'Extended release beta blocker', '/medicines/tablet_cardiac.jpg'),

  -- Pain Relief
  ('a0000000-2000-0000-0000-000000000080', 'Nimesulide 100', 'Nimesulide', 'Nimesulide 100mg', 'H', 'Various', 'Pain Relief', FALSE, 25.00, 10.00, 'Tablet', '10 tablets', 'Acute pain and inflammation relief', '/medicines/tablet_pain.jpg'),
  ('a0000000-2000-0000-0000-000000000081', 'Meftas 500', 'Mefenamic Acid', 'Mefenamic Acid 500mg', 'H', 'Blue Cross', 'Pain Relief', FALSE, 35.00, 12.00, 'Tablet', '10 tablets', 'Relief from period pain and mild pain', '/medicines/meftal_spas.jpg')
ON CONFLICT DO NOTHING;

-- ============================================
-- Drug Interactions (Safety Critical)
-- ============================================
INSERT INTO drug_interactions (medicine_a_id, medicine_b_id, severity, description, mechanism, alternative_suggestion) VALUES
  -- Aspirin interactions
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000031', 'MAJOR', 'Increased bleeding risk when Aspirin combined with Clopidogrel', 'Both inhibit platelet aggregation through different mechanisms', 'Consult cardiologist for dual antiplatelet therapy'),
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'MODERATE', 'NSAIDs may reduce cardioprotective effects of low-dose aspirin', 'Competition for COX-1 binding site', 'Take aspirin 30 min before ibuprofen'),
  
  -- Metformin interactions
  ('a0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000012', 'MODERATE', 'Metformin with Ciprofloxacin may cause hypoglycemia', 'Fluoroquinolones can affect glucose metabolism', 'Monitor blood glucose frequently'),
  
  -- BP medication interactions
  ('a0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000034', 'MINOR', 'Telmisartan + Amlodipine is a common combination, monitor for hypotension', 'Additive blood pressure lowering effect', NULL),
  
  -- Contraindicated combinations
  ('a0000000-0000-0000-0000-000000000095', 'a0000000-0000-0000-0000-000000000096', 'CONTRAINDICATED', 'Tramadol + Alprazolam: High risk of respiratory depression, sedation, and death', 'CNS depression potentiation', 'Use non-opioid pain relief OR consult psychiatrist'),
  
  -- Statins with certain drugs
  ('a0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000011', 'MAJOR', 'Atorvastatin + Azithromycin increases risk of rhabdomyolysis', 'Azithromycin inhibits CYP3A4, increasing statin levels', 'Choose alternative antibiotic if possible'),
  
  -- PPI interactions
  ('a0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000031', 'MODERATE', 'Pantoprazole may reduce Clopidogrel effectiveness', 'PPI inhibits CYP2C19, reducing Clopidogrel activation', 'Consider H2 blocker (Ranitidine) instead')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Inventory (All stores have these medicines)
-- ============================================
INSERT INTO inventory (medicine_id, dark_store_id, stock_quantity)
SELECT m.id, ds.id, 
  CASE 
    WHEN m.schedule_type = 'X' THEN 5  -- Low stock for controlled
    WHEN m.schedule_type = 'H' THEN 25 
    ELSE 50 
  END
FROM medicines m
CROSS JOIN dark_stores ds
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Test User
-- ============================================
INSERT INTO users (id, phone, name, email, health_profile, role, password_hash) VALUES
  ('c0000000-0000-0000-0000-000000000001', '9999999999', 'Test User', 'test@mediganga.in', '{"diabetes": false, "hypertension": false}', 'customer', '$2a$10$7XK3KoJmS78G71uEPp/51.orrSiEiD3b/0tIhyAIhxO0.rM52aaxq'),
  ('c0000000-0000-0000-0000-000000000002', '9999999998', 'Dr. Test Pharmacist', 'pharmacist@mediganga.in', '{}', 'pharmacist', '$2a$10$7XK3KoJmS78G71uEPp/51.orrSiEiD3b/0tIhyAIhxO0.rM52aaxq'),
  ('c0000000-0000-0000-0000-000000000003', '9999999997', 'Delivery Test', 'delivery@mediganga.in', '{}', 'delivery_partner', '$2a$10$7XK3KoJmS78G71uEPp/51.orrSiEiD3b/0tIhyAIhxO0.rM52aaxq')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ============================================
-- Subscription Plans
-- ============================================
INSERT INTO subscription_plans (id, name, display_name, description, price_monthly, price_yearly, free_delivery_min_cart, video_consult_credits, features, badge_color) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'plus', 'MediGanga Plus', 'The Shopper Plan - Free delivery on orders above ₹100', 99.00, 999.00, 100.00, 0, 
   '["Unlimited free delivery on ₹100+ orders", "5% extra discount on all medicines", "Priority customer support", "Early access to offers"]', '#6366f1'),
  ('d0000000-0000-0000-0000-000000000002', 'max', 'MediGanga Max', 'The Care Plan - Complete healthcare package', 299.00, 2999.00, NULL, 2,
   '["Unlimited free delivery (no minimum)", "2 free video consultations/month", "10% extra discount on all medicines", "Priority customer support", "Free health checkup reminders", "Family sharing (up to 4 members)"]', '#f59e0b')
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Doctors for Video Consultations
-- ============================================
INSERT INTO doctors (id, name, specialization, registration_number, experience_years, qualification, consultation_fee, rating, bio, languages) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Dr. Priya Sharma', 'General Physician', 'MCI/UP/2015/12345', 9, 'MBBS, MD (General Medicine)', 299.00, 4.8, 'Experienced general physician specializing in preventive healthcare and chronic disease management.', ARRAY['Hindi', 'English']),
  ('e0000000-0000-0000-0000-000000000002', 'Dr. Rajesh Gupta', 'Cardiologist', 'MCI/UP/2012/23456', 12, 'MBBS, MD, DM (Cardiology)', 499.00, 4.9, 'Senior cardiologist with expertise in interventional cardiology and heart failure management.', ARRAY['Hindi', 'English']),
  ('e0000000-0000-0000-0000-000000000003', 'Dr. Anita Verma', 'Diabetologist', 'MCI/UP/2014/34567', 10, 'MBBS, MD (Endocrinology)', 399.00, 4.7, 'Diabetes specialist focusing on lifestyle management and insulin therapy optimization.', ARRAY['Hindi', 'English', 'Bhojpuri']),
  ('e0000000-0000-0000-0000-000000000004', 'Dr. Vikram Singh', 'Dermatologist', 'MCI/UP/2016/45678', 8, 'MBBS, MD (Dermatology)', 349.00, 4.6, 'Skin specialist treating various dermatological conditions including allergies and infections.', ARRAY['Hindi', 'English']),
  ('e0000000-0000-0000-0000-000000000005', 'Dr. Meera Agarwal', 'Pediatrician', 'MCI/UP/2013/56789', 11, 'MBBS, MD (Pediatrics)', 299.00, 4.9, 'Child health specialist with focus on newborn care and childhood vaccinations.', ARRAY['Hindi', 'English']),
  ('e0000000-0000-0000-0000-000000000006', 'Dr. Suresh Pandey', 'Gastroenterologist', 'MCI/UP/2011/67890', 13, 'MBBS, MD, DM (Gastroenterology)', 449.00, 4.7, 'GI specialist treating digestive disorders, liver diseases, and IBD.', ARRAY['Hindi', 'English'])
ON CONFLICT DO NOTHING;

-- ============================================
-- Mark Emergency-Available Medicines
-- ============================================
UPDATE medicines SET is_emergency_available = TRUE WHERE category IN ('Pain Relief', 'Allergy', 'Cold & Flu', 'Gastric');

-- ============================================
-- Initialize Loyalty Points for Test User
-- ============================================
INSERT INTO loyalty_points (user_id, points_balance, points_earned_total, points_redeemed_total) VALUES
  ('c0000000-0000-0000-0000-000000000001', 150, 200, 50)
ON CONFLICT DO NOTHING;

-- ============================================
-- Sample Doctor Availability (Next 7 days)
-- ============================================
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, slot_duration_minutes) 
SELECT 
  d.id,
  CURRENT_DATE + i,
  '09:00'::TIME,
  '17:00'::TIME,
  15
FROM doctors d
CROSS JOIN generate_series(1, 7) AS i
ON CONFLICT DO NOTHING;

