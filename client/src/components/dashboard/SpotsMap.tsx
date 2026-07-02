import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { spotApi } from "../../services/api";
import { Store, Zap } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

// Fix standard leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A mock function to convert spot names into Tunisian coordinates, since we don't have
// actual lat/lng in the Prisma schema for VendingSpot.
function getMockCoords(spotName: string): [number, number] {
  const hash = spotName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Center roughly on Tunis
  const lat = 36.8065 + (hash % 100) / 1000 - 0.05;
  const lng = 10.1815 + ((hash * 7) % 100) / 1000 - 0.05;
  return [lat, lng];
}

export function SpotsMap() {
  const { data: spots, isLoading } = useQuery({
    queryKey: ["spots"],
    queryFn: spotApi.list,
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-2xl" />;
  }

  if (!spots || spots.length === 0) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Network Map</h3>
          <p className="text-sm text-muted">Geographic distribution of your vending spots and warehouses.</p>
        </div>
      </div>
      
      <div className="h-[400px] overflow-hidden rounded-xl border border-line bg-surface-2 z-0">
        <MapContainer 
          center={[36.8065, 10.1815]} 
          zoom={12} 
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {spots.map((spot) => {
            const isWarehouse = spot.isWarehouse;
            return (
              <Marker 
                key={spot.id} 
                position={getMockCoords(spot.name)}
                icon={isWarehouse ? redIcon : new L.Icon.Default()}
              >
                <Popup>
                  <div className="flex flex-col gap-1 p-1">
                    <strong className="flex items-center gap-1.5 text-content text-sm">
                      {isWarehouse ? <Zap size={14} className="text-red-500" /> : <Store size={14} className="text-primary" />}
                      {spot.name}
                    </strong>
                    <span className="text-xs text-muted">{spot.location}</span>
                    <span className="text-xs text-muted">{spot.address}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
