// ============================================
// User Types
// ============================================
export interface User {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
    profile_picture?: string;
    role?: string;
    health_profile: HealthProfile | null;
    addresses?: Address[];
}

export interface HealthProfile {
    diabetes?: boolean;
    hypertension?: boolean;
    heart_disease?: boolean;
    kidney_disease?: boolean;
    allergies?: string[];
    chronic_conditions?: string[];
    // New fields
    conditions?: string[]; // Alias for chronic_conditions if needed, or separate
    medications?: string[];
    bloodGroup?: string;
    height?: string;
    weight?: string;
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
    category: string | null;
    is_ayurvedic: boolean;
    mrp: number;
    generic_mrp: number | null;
    requires_cold_chain: boolean;
    dosage_form: string | null;
    pack_size: string | null;
    image_url: string | null;
    description: string | null;
    is_emergency_available: boolean;
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
    distance_meters?: number;
}

// ============================================
// Drug Interaction Types
// ============================================
export type InteractionSeverity = 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR';

export interface DrugInteraction {
    severity: InteractionSeverity;
    description: string;
    alternative: string | null;
    medicineA: string;
    medicineB: string;
    medicineAId: string;
    medicineBId: string;
}

export interface InteractionCheckResult {
    data: DrugInteraction[];
    grouped: {
        contraindicated: DrugInteraction[];
        major: DrugInteraction[];
        moderate: DrugInteraction[];
        minor: DrugInteraction[];
    };
    hasBlocking: boolean;
    hasMajor: boolean;
}

// ============================================
// Prescription Types
// ============================================
export interface Prescription {
    id: string;
    image_url: string;
    ocr_data: {
        raw_text: string;
        medicines: string[];
        doctor_name?: string;
        hospital_name?: string;
    } | null;
    ocr_confidence: number | null;
    pharmacist_verified: boolean;
    issued_date: string;
    expiry_date: string;
    is_expired: boolean;
    created_at: string;
}

// ============================================
// Cart Types
// ============================================
export interface CartItem {
    medicineId: string;
    name: string;
    quantity: number;
    price: number;
    originalPrice: number;
    isGeneric: boolean;
    scheduleType: ScheduleType;
    manufacturer: string | null;
    imageUrl: string | null;
    genericAlternative?: GenericAlternative;
    isEmergency?: boolean;
}

// ============================================
// Order Types
// ============================================
export type OrderStatus =
    | 'placed'
    | 'verified'
    | 'preparing'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
    id: string;
    status: OrderStatus;
    total_amount: number;
    generic_savings: number;
    subtotal: number;
    delivery_fee: number;
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    estimated_delivery: string | null;
    delivered_at: string | null;
    created_at: string;
    items: OrderItem[];
    dark_store_name: string;
    dark_store_address: string;
    dark_store_phone: string;
}

export interface OrderItem {
    id: string;
    medicine_id: string;
    medicine_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_generic: boolean;
    image_url: string | null;
}

// ============================================
// Location Types
// ============================================
export interface Location {
    latitude: number;
    longitude: number;
}

export interface Address {
    id: string;
    label: string;
    full_address: string;
    location: Location;
    is_default: boolean;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    code?: string;
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
// Consultation Types
// ============================================
export interface Consultation {
    id: string;
    doctor_id: string;
    doctor_name: string;
    specialization: string;
    profile_image: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    scheduled_at: string;
    notes?: string;
}
