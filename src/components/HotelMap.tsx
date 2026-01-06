import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = L.divIcon({
  className: 'custom-hotel-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #9b87f5 0%, #0EA5E9 100%);
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="transform: rotate(45deg)">
        <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/>
        <path d="m7 16.5-4.74-2.85"/>
        <path d="m7 16.5 5-3"/>
        <path d="M7 16.5v5.17"/>
        <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/>
        <path d="m17 16.5-5-3"/>
        <path d="m17 16.5 4.74-2.85"/>
        <path d="M17 16.5v5.17"/>
        <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/>
        <path d="M12 8 7.26 5.15"/>
        <path d="m12 8 4.74-2.85"/>
        <path d="M12 13.5V8"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

interface Hotel {
  id: number;
  name: string;
  rating: number;
  price: number;
  location: string;
  lat: number;
  lng: number;
}

interface HotelMapProps {
  hotels: Hotel[];
  onHotelClick?: (hotelId: number) => void;
  selectedHotelId?: number;
}

const MapUpdater = ({ hotels, selectedHotelId }: { hotels: Hotel[]; selectedHotelId?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedHotelId) {
      const hotel = hotels.find(h => h.id === selectedHotelId);
      if (hotel) {
        map.flyTo([hotel.lat, hotel.lng], 15, {
          duration: 1.5
        });
      }
    }
  }, [selectedHotelId, hotels, map]);

  return null;
};

const HotelMap = ({ hotels, onHotelClick, selectedHotelId }: HotelMapProps) => {
  const centerLat = hotels.reduce((sum, h) => sum + h.lat, 0) / hotels.length;
  const centerLng = hotels.reduce((sum, h) => sum + h.lng, 0) / hotels.length;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-xl relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotels.map((hotel) => (
          <Marker
            key={hotel.id}
            position={[hotel.lat, hotel.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                if (onHotelClick) {
                  onHotelClick(hotel.id);
                }
              }
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{hotel.location}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{hotel.rating}</span>
                  </div>
                  <span className="font-bold text-purple-600">{hotel.price.toLocaleString()} ₽</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater hotels={hotels} selectedHotelId={selectedHotelId} />
      </MapContainer>
    </div>
  );
};

export default HotelMap;
