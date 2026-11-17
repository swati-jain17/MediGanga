-- ============================================
-- MEDIGANGA Database Schema
-- PostgreSQL 15 with optional PostGIS
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS is optional - skip if not available
DO $$ 
BEGIN 
  CREATE EXTENSION IF NOT EXISTS postgis; 
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'PostGIS not available, geospatial features disabled'; 
END $$;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  aadhaar_hash VARCHAR(64), -- For Schedule X verification (SHA-256 hash)
  health_profile JSONB DEFAULT '{}', -- {diabetes: true, hypertension: false, allergies: []}
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'pharmacist', 'delivery_partner', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- Dark Stores Table (Mini Pharmacies)
-- ============================================
CREATE TABLE IF NOT EXISTS dark_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geofence_radius_meters INTEGER DEFAULT 2500,
  pharmacist_name VARCHAR(255),
  pharmacist_license VARCHAR(50),
  phone VARCHAR(15),
  opening_time TIME DEFAULT '08:00',
  closing_time TIME DEFAULT '22:00',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_darkstore_city ON dark_stores(city);
CREATE INDEX IF NOT EXISTS idx_darkstore_active ON dark_stores(is_active);

-- ============================================
-- Medicines Table
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  salt_composition TEXT,
  schedule_type VARCHAR(10) CHECK (schedule_type IN ('OTC', 'H', 'H1', 'X')),
  manufacturer VARCHAR(255),
  category VARCHAR(100), -- Pain Relief, Diabetes, Cardiac, Ayurveda, etc.
  is_ayurvedic BOOLEAN DEFAULT FALSE,
  mrp DECIMAL(10,2) NOT NULL,
  generic_mrp DECIMAL(10,2), -- Cheaper generic alternative price
  requires_cold_chain BOOLEAN DEFAULT FALSE,
  description TEXT,
  dosage_form VARCHAR(50), -- Tablet, Capsule, Syrup, Injection, etc.
  pack_size VARCHAR(50), -- "10 tablets", "100ml", etc.
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Full-text search index for medicine names
CREATE INDEX IF NOT EXISTS idx_medicine_name_fts ON medicines USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_medicine_generic_fts ON medicines USING GIN(to_tsvector('english', COALESCE(generic_name, '')));
CREATE INDEX IF NOT EXISTS idx_medicine_salt_fts ON medicines USING GIN(to_tsvector('english', COALESCE(salt_composition, '')));
CREATE INDEX IF NOT EXISTS idx_medicine_schedule ON medicines(schedule_type);
CREATE INDEX IF NOT EXISTS idx_medicine_ayurvedic ON medicines(is_ayurvedic);
CREATE INDEX IF NOT EXISTS idx_medicine_category ON medicines(category);

-- ============================================
-- Inventory Table (Per Dark Store Stock)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  dark_store_id UUID REFERENCES dark_stores(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(medicine_id, dark_store_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(dark_store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_medicine ON inventory(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(stock_quantity) WHERE stock_quantity <= 10;

-- ============================================
-- Drug Interactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_a_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  medicine_b_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('CONTRAINDICATED', 'MAJOR', 'MODERATE', 'MINOR')),
  description TEXT,
  mechanism TEXT, -- How the interaction works
  alternative_suggestion VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(medicine_a_id, medicine_b_id)
);

CREATE INDEX IF NOT EXISTS idx_interactions_a ON drug_interactions(medicine_a_id);
CREATE INDEX IF NOT EXISTS idx_interactions_b ON drug_interactions(medicine_b_id);
CREATE INDEX IF NOT EXISTS idx_interactions_severity ON drug_interactions(severity);

-- ============================================
-- Prescriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  ocr_data JSONB, -- {raw_text, medicines: [], doctor_name, hospital_name}
  ocr_confidence DECIMAL(3,2), -- 0.00 to 1.00
  pharmacist_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  verification_notes TEXT,
  issued_date DATE NOT NULL,
  expiry_date DATE, -- Set by application as issued_date + 30 days
  is_expired BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_verified ON prescriptions(pharmacist_verified);
CREATE INDEX IF NOT EXISTS idx_prescriptions_expiry ON prescriptions(expiry_date);

-- ============================================
-- Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  dark_store_id UUID REFERENCES dark_stores(id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  
  -- Delivery Details
  delivery_address TEXT NOT NULL,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  delivery_instructions TEXT,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 29.00,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  generic_savings DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(30) DEFAULT 'placed' CHECK (status IN (
    'placed', 
    'verified', 
    'preparing', 
    'ready_for_pickup',
    'out_for_delivery', 
    'delivered', 
    'cancelled',
    'refunded'
  )),
  cancel_reason TEXT,
  
  -- Delivery Partner
  delivery_partner_id UUID REFERENCES users(id),
  
  -- Safety
  interaction_warnings_acknowledged BOOLEAN DEFAULT FALSE,
  requires_prescription BOOLEAN DEFAULT FALSE,
  
  -- Payment
  payment_method VARCHAR(30) CHECK (payment_method IN ('cod', 'upi', 'card', 'wallet')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id VARCHAR(100), -- Razorpay payment ID
  
  -- Timestamps
  estimated_delivery TIMESTAMP,
  prepared_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(dark_store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================
-- Order Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name VARCHAR(255) NOT NULL, -- Snapshot at order time
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  is_generic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_medicine ON order_items(medicine_id);

-- ============================================
-- Chronic Refills Table
-- ============================================
CREATE TABLE IF NOT EXISTS chronic_refills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  dosage_frequency VARCHAR(100), -- "1 tablet twice daily"
  days_supply INTEGER DEFAULT 30,
  auto_refill_enabled BOOLEAN DEFAULT TRUE,
  last_refill_date DATE,
  next_refill_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refills_user ON chronic_refills(user_id);
CREATE INDEX IF NOT EXISTS idx_refills_next ON chronic_refills(next_refill_date) WHERE is_active = TRUE;

-- ============================================
-- Interaction Warnings Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS interaction_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  medicine_a_id UUID REFERENCES medicines(id),
  medicine_b_id UUID REFERENCES medicines(id),
  medicine_a_name VARCHAR(255),
  medicine_b_name VARCHAR(255),
  severity VARCHAR(20),
  description TEXT,
  user_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_order ON interaction_warnings(order_id);

-- ============================================
-- OTP Table (for phone verification)
-- ============================================
CREATE TABLE IF NOT EXISTS otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);
CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);

-- ============================================
-- Delivery Partners Location (for real-time tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  heading DECIMAL(5,2), -- Direction in degrees
  speed DECIMAL(5,2), -- km/h
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_locations_order ON delivery_locations(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_locations_time ON delivery_locations(recorded_at DESC);

-- ============================================
-- Updated at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PHASE 1: Subscription Plans (Membership)
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'plus', 'max'
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  free_delivery_min_cart DECIMAL(10,2), -- NULL for Max (no minimum)
  video_consult_credits INTEGER DEFAULT 0, -- Monthly credits
  features JSONB DEFAULT '[]',
  badge_color VARCHAR(20) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at);

CREATE TABLE IF NOT EXISTS video_consult_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits_total INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_credits_user ON video_consult_credits(user_id);

-- ============================================
-- PHASE 2: Loyalty Program (GangaPoints)
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  points_balance INTEGER DEFAULT 0,
  points_earned_total INTEGER DEFAULT 0,
  points_redeemed_total INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus')),
  source VARCHAR(50), -- 'order', 'adherence_streak', 'referral', 'signup_bonus'
  reference_id UUID, -- order_id, streak_id, etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);

CREATE TABLE IF NOT EXISTS adherence_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_adherence_date DATE,
  streak_started_at DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 3: Emergency Delivery
-- ============================================
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_emergency_available BOOLEAN DEFAULT FALSE;
ALTER TABLE dark_stores ADD COLUMN IF NOT EXISTS supports_emergency BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS emergency_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  priority_level VARCHAR(20) DEFAULT 'high' CHECK (priority_level IN ('high', 'critical')),
  surge_fee DECIMAL(10,2) DEFAULT 0,
  estimated_delivery_minutes INTEGER DEFAULT 60,
  rider_assigned_at TIMESTAMP,
  rider_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 4: Smart Reminders & Auto-Refill
-- ============================================
CREATE TABLE IF NOT EXISTS medicine_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  schedule_time TIME NOT NULL,
  schedule_period VARCHAR(20) CHECK (schedule_period IN ('morning', 'afternoon', 'evening', 'night')),
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'alternate', 'as_needed')),
  days_of_week INTEGER[], -- [0,1,2,3,4,5,6] for weekly
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON medicine_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON medicine_reminders(is_active);

CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES medicine_reminders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  action VARCHAR(20) DEFAULT 'pending' CHECK (action IN ('taken', 'skipped', 'pending', 'missed')),
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder ON reminder_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_date ON reminder_logs(scheduled_at);

CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  total_quantity INTEGER NOT NULL,
  used_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  auto_refill_enabled BOOLEAN DEFAULT TRUE,
  last_refill_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, medicine_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);

-- ============================================
-- PHASE 5: Video Consultations
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  registration_number VARCHAR(50) UNIQUE,
  experience_years INTEGER DEFAULT 0,
  qualification VARCHAR(255),
  consultation_fee DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  profile_image VARCHAR(500),
  bio TEXT,
  languages VARCHAR(255)[], -- ['Hindi', 'English']
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON doctors(is_available);

CREATE TABLE IF NOT EXISTS doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 15,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_date ON doctor_availability(date);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES doctor_availability(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  room_id VARCHAR(100), -- Video room ID
  room_token TEXT, -- JWT token for video
  fee_original DECIMAL(10,2),
  fee_paid DECIMAL(10,2),
  used_credit BOOLEAN DEFAULT FALSE,
  patient_notes TEXT,
  doctor_notes TEXT,
  prescription_id UUID REFERENCES prescriptions(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled ON consultations(scheduled_at);

-- ============================================
-- PHASE 6: AI Symptom Checker
-- ============================================
CREATE TABLE IF NOT EXISTS symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  symptoms TEXT[] NOT NULL,
  urgency_level VARCHAR(20) CHECK (urgency_level IN ('green', 'yellow', 'red')),
  ai_response JSONB,
  recommendations TEXT[],
  followed_up BOOLEAN DEFAULT FALSE,
  consultation_id UUID REFERENCES consultations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptom_checks_user ON symptom_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_urgency ON symptom_checks(urgency_level);

-- ============================================
-- Triggers for new tables
-- ============================================
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

