'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function Map({ center, location, city, zoom = 13 }) {
  const [mapError, setMapError] = useState(false);

  // Supporta sia 'center' che 'location' come prop
  const coords = center || location || { lat: 41.9028, lng: 12.4964 };
  const lat = coords.lat;
  const lng = coords.lng;

  if (mapError || !lat || !lng) {
    return (
      <div className="bg-gray-100 h-full min-h-[180px] flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Mappa non disponibile</p>
          {city && <p className="text-xs mt-1">{city}</p>}
        </div>
      </div>
    );
  }

  // Calcola bbox in base allo zoom
  const delta = 0.02 / (zoom / 10);

  return (
    <div className="relative h-full min-h-[180px] bg-gray-200 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-delta},${lat-delta},${lng+delta},${lat+delta}&layer=mapnik&marker=${lat},${lng}`}
        className="w-full h-full border-0"
        onError={() => setMapError(true)}
        loading="lazy"
        title="Mappa posizione"
      />
      {city && (
        <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs">
          {city}
        </div>
      )}
    </div>
  );
}
