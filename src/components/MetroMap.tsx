import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station } from '@/types/metro';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MetroMapProps {
  stations: Station[];
  selectedStation?: Station;
  routeCoordinates?: [number, number][];
  onStationClick?: (station: Station) => void;
  height?: string;
}

export function MetroMap({ 
  stations, 
  selectedStation, 
  routeCoordinates,
  onStationClick,
  height = '500px'
}: MetroMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Delhi
    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 11);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add station markers
    stations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      const isInterchange = station.isInterchange;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="flex items-center justify-center">
            <div class="${isSelected ? 'w-6 h-6 bg-accent' : isInterchange ? 'w-5 h-5 bg-primary' : 'w-4 h-4 bg-blue-500'} 
              rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(mapInstanceRef.current!);

      marker.bindPopup(`
        <div class="text-sm">
          <div class="font-semibold">${station.name}</div>
          <div class="text-xs text-gray-600">${station.lines.join(', ')} Line</div>
        </div>
      `);

      if (onStationClick) {
        marker.on('click', () => onStationClick(station));
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if there's a selected station
    if (selectedStation) {
      mapInstanceRef.current.setView([selectedStation.lat, selectedStation.lng], 14, {
        animate: true,
      });
    }
  }, [stations, selectedStation, onStationClick]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Draw route if provided
    if (routeCoordinates && routeCoordinates.length > 0) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#F97316',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;

      // Fit bounds to route
      mapInstanceRef.current.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
      });
    }
  }, [routeCoordinates]);

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg shadow-lg" />;
}
