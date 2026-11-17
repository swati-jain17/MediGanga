// ============================================
// User Types
// ============================================
export interface User {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
    aadhaar_hash: string | null;
    health_profile: HealthProfile | null;
    created_at: Date;
}

export interface HealthProfile {
    diabetes?: boolean;
    hypertension?: boolean;
    heart_disease?: boolean;
    kidney_disease?: boolean;
    allergies?: string[];
    chronic_conditions?: string[];
}

export interface AuthPayload {
    userId: string;
    phone: string;
}

// ============================================
// Medicine Types
// ============================================
export type ScheduleType = 'OTC' | 'H' | 'H1' | 'X';

export interface Medicine {
    id: string;
    name: string;
    generic_name: string | null;
    salt_composition: string | null;
    schedule_type: ScheduleType;
    manufacturer: string | null;
    is_ayurvedic: boolean;
    mrp: number;
    generic_mrp: number | null;
    requires_cold_chain: boolean;
    image_url: string | null;
    created_at: Date;
}

export interface MedicineSearchResult extends Medicine {
    relevance: number;
}

export interface GenericAlternative {
    id: string;
    name: string;
    manufacturer: string | null;
    price: number;
    savings: number;
    savings_percent: number;
}

// ============================================
// Dark Store Types
// ============================================
export interface DarkStore {
    id: string;
    name: string;
    city: string;
    address: string | null;
    phone: string | null;
    latitude: number;
    longitude: number;
    geofence_radius_meters: number;
    pharmacist_name: string | null;
    pharmacist_license: string | null;
    is_active: boolean;
}

export interface NearestDarkStore extends DarkStore {
    distance_meters: number;
}

// ============================================
// Inventory Types
// ============================================
export interface Inventory {
    id: string;
    medicine_id: string;
    dark_store_id: string;
    stock_quantity: number;
    last_updated: Date;
}

export interface InventoryWithMedicine extends Inventory {
    medicine: Medicine;
}

// ============================================
// Drug Interaction Types
// ============================================
export type InteractionSeverity = 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR';

export interface DrugInteraction {
    id: string;
    medicine_a_id: string;
    medicine_b_id: string;
    severity: InteractionSeverity;
    description: string | null;
    alternative_suggestion: string | null;
}

export interface InteractionResult {
    severity: InteractionSeverity;
    description: string;
    alternative: string | null;
    medicineA: string;
    medicineB: string;
    medicineAId: string;
    medicineBId: string;
}

// ============================================
// Prescription Types
// ============================================
export interface Prescription {
    id: string;
    user_id: string;
    image_url: string;
    ocr_data: OCRData | null;
    ocr_confidence: number | null;
    pharmacist_verified: boolean;
    verified_by: string | null;
    verified_at: Date | null;
    issued_date: Date;
    expiry_date: Date;
    is_expired: boolean;
    created_at: Date;
}

export interface OCRData {
    raw_text: string;
    medicines: string[];
    doctor_name?: string;
    hospital_name?: string;
    extracted_data?: any[];
}

// ============================================
// Order Types
// ============================================
export type OrderStatus =
    | 'placed'
    | 'verified'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
    id: string;
    user_id: string;
    dark_store_id: string;
    prescription_id: string | null;
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    total_amount: number;
    generic_savings: number;
    status: OrderStatus;
    delivery_partner_id: string | null;
    interaction_warnings_acknowledged: boolean;
    payment_status: PaymentStatus;
    estimated_delivery: Date | null;
    delivered_at: Date | null;
    created_at: Date;
}

export interface OrderItem {
    id: string;
    order_id: string;
    medicine_id: string;
    quantity: number;
    price: number;
    is_generic: boolean;
}

export interface OrderWithItems extends Order {
    items: (OrderItem & { medicine: Medicine })[];
    dark_store: DarkStore;
}

// ============================================
// Chronic Refill Types
// ============================================
export interface ChronicRefill {
    id: string;
    user_id: string;
    medicine_id: string;
    dosage_frequency: string | null;
    days_supply: number | null;
    auto_refill_enabled: boolean;
    next_refill_date: Date | null;
    created_at: Date;
}

// ============================================
// Cart Types (Frontend-focused, but useful for API)
// ============================================
export interface CartItem {
    medicineId: string;
    name: string;
    quantity: number;
    price: number;
    isGeneric: boolean;
    scheduleType: ScheduleType;
    genericAlternative?: GenericAlternative;
}

export interface CreateOrderRequest {
    items: {
        medicineId: string;
        quantity: number;
        price: number;
        isGeneric: boolean;
    }[];
    deliveryAddress: string;
    deliveryLocation: {
        latitude: number;
        longitude: number;
    };
    prescriptionId?: string;
    acknowledgedInteractions?: boolean;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================
// Location Types
// ============================================
export interface Location {
    latitude: number;
    longitude: number;
}

export interface DeliveryETA {
    minutes: number;
    distanceKm: number;
    darkStore: NearestDarkStore;
}

// ============================================
// OTP Types
// ============================================
export interface OTPRecord {
    phone: string;
    otp: string;
    expires_at: Date;
    attempts: number;
}
