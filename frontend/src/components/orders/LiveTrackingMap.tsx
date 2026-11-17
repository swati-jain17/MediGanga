import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Default to Varanasi coordinates if no location provided
const DEFAULT_CENTER = { lat: 25.3176, lng: 82.9739 };

interface LiveTrackingMapProps {
    riderLocation?: { latitude: number; longitude: number } | null;
    deliveryLocation?: { latitude: number; longitude: number } | null;
}

export function LiveTrackingMap({ riderLocation, deliveryLocation }: LiveTrackingMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const riderMarker = useRef<mapboxgl.Marker | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Check for token
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
            setMapError("Mapbox token not found. Please set VITE_MAPBOX_TOKEN.");
            return;
        }

        mapboxgl.accessToken = token;

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
                zoom: 13,
            });

            // Add navigation controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Add delivery marker (static)
            if (deliveryLocation) {
                const el = document.createElement('div');
                el.className = 'delivery-marker';
                el.innerHTML = '<div class="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>';

                new mapboxgl.Marker(el)
                    .setLngLat([deliveryLocation.longitude, deliveryLocation.latitude])
                    .addTo(map.current);
            }

        } catch (err) {
            console.error("Error initializing map:", err);
            setMapError("Failed to load map.");
        }

        return () => {
            map.current?.remove();
        };
    }, []);

    // Update rider location
    useEffect(() => {
        if (!map.current || !riderLocation) return;

        if (!riderMarker.current) {
            // Create rider marker
            const el = document.createElement('div');
            el.className = 'rider-marker';
            el.innerHTML = '<div class="w-10 h-10 bg-primary-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white p-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/></svg></div>';

            riderMarker.current = new mapboxgl.Marker(el)
                .setLngLat([riderLocation.longitude, riderLocation.latitude])
                .addTo(map.current);
        } else {
            // Animate to new location
            riderMarker.current.setLngLat([riderLocation.longitude, riderLocation.latitude]);
        }

        // Pan map to keep rider in view
        map.current.flyTo({
            center: [riderLocation.longitude, riderLocation.latitude],
            zoom: 15,
            essential: true
        });

    }, [riderLocation]);

    if (mapError) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                <MapPin size={48} className="mb-4 text-gray-400" />
                <p className="font-medium">Live Map Unavailable</p>
                <p className="text-sm mt-1">{mapError}</p>
                {riderLocation && (
                    <div className="mt-4 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <p className="text-xs text-uppercase font-bold text-gray-400">Rider Coordinates</p>
                        <p className="font-mono text-sm">{riderLocation.latitude.toFixed(4)}, {riderLocation.longitude.toFixed(4)}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full h-80 rounded-2xl overflow-hidden card-shadow">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                    <p className="text-sm font-bold text-primary-600">Live Tracking Active</p>
                </div>
            </div>
        </div>
    );
}
