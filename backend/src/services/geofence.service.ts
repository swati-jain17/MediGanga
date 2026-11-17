import pool from '../config/database.js';
import type { Location, NearestDarkStore, DeliveryETA } from '../types/index.js';

/**
 * Find the nearest active dark store within geofence range
 */
/**
 * Find the nearest active dark store within geofence range
 */
export async function findNearestDarkStore(userLocation: Location): Promise<NearestDarkStore> {
  // Harvesine formula in SQL
  // 6371 * acos(cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(long2) - radians(long1)) + sin(radians(lat1)) * sin(radians(lat2)))
  const query = `
    SELECT 
      id, 
      name, 
      city,
      address,
      phone,
      pharmacist_name,
      pharmacist_license,
      geofence_radius_meters,
      latitude,
      longitude,
      (
        6371000 * acos(
          least(1.0, greatest(-1.0,
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          ))
        )
      ) as distance_meters
    FROM dark_stores
    WHERE is_active = TRUE
    ORDER BY distance_meters ASC
    LIMIT 1;
  `;

  const result = await pool.query(query, [userLocation.latitude, userLocation.longitude]);

  if (result.rows.length === 0) {
    const error = new Error('No dark store available in your area') as Error & { code: string };
    error.code = 'OUT_OF_GEOFENCE';
    throw error;
  }

  const store = result.rows[0];

  // Check if within radius
  if (store.distance_meters > store.geofence_radius_meters) {
    const error = new Error('Delivery not available at your location yet') as Error & { code: string };
    error.code = 'OUT_OF_GEOFENCE';
    throw error;
  }

  return store;
}

/**
 * Find all dark stores servicing a specific city
 */
export async function getDarkStoresByCity(city: string): Promise<NearestDarkStore[]> {
  const query = `
    SELECT 
      id, 
      name, 
      city,
      address,
      phone,
      pharmacist_name,
      geofence_radius_meters,
      latitude,
      longitude
    FROM dark_stores
    WHERE is_active = TRUE
      AND LOWER(city) = LOWER($1)
    ORDER BY name;
  `;

  const result = await pool.query(query, [city]);
  return result.rows;
}

/**
 * Check if a location is within any dark store's geofence
 */
export async function isLocationServiceable(location: Location): Promise<boolean> {
  try {
    const store = await findNearestDarkStore(location);
    return !!store;
  } catch (e) {
    return false;
  }
}

/**
 * Get list of all serviceable cities
 */
export async function getServiceableCities(): Promise<string[]> {
  const query = `
    SELECT DISTINCT city 
    FROM dark_stores 
    WHERE is_active = TRUE 
    ORDER BY city;
  `;

  const result = await pool.query(query);
  return result.rows.map(row => row.city);
}

/**
 * Calculate estimated delivery time
 * Uses Haversine distance and average delivery speed
 */
export function calculateDeliveryETA(darkStoreLocation: Location, deliveryLocation: Location): DeliveryETA {
  const R = 6371; // Earth's radius in km

  const dLat = toRad(deliveryLocation.latitude - darkStoreLocation.latitude);
  const dLon = toRad(deliveryLocation.longitude - darkStoreLocation.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(darkStoreLocation.latitude)) *
    Math.cos(toRad(deliveryLocation.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // Average delivery speed: 20 km/h in city traffic
  const travelTimeMinutes = (distanceKm / 20) * 60;

  // Add preparation time (5 min) + buffer (2 min)
  const totalMinutes = Math.ceil(travelTimeMinutes + 7);

  return {
    minutes: Math.max(10, totalMinutes), // Minimum 10 minutes
    distanceKm: Math.round(distanceKm * 100) / 100,
    darkStore: {} as NearestDarkStore, // Will be populated by caller
  };
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
