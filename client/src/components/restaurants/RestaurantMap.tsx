import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Restaurant } from "@shared/types/restaurant";
import { STATUS_LABELS } from "./mapConstants";

const HOME_LAT = -27.4183;
const HOME_LNG = 153.0764;
const HOME_LABEL = "17 The Promenade, Hendra";

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const STATUS_COLOURS: Record<string, string> = {
  want_to_try: "#f59e0b",
  would_go_back: "#22c55e",
  would_not_go_back: "#ef4444",
};

function restaurantIcon(status: string) {
  const colour = STATUS_COLOURS[status] || "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${colour};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><path d="M3 2l2.002 18.672A2 2 0 0 0 6.986 22h.028a2 2 0 0 0 1.984-1.328L11 14l7-2V2H3z"/><path d="M15 2a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5" fill="none" stroke="white" stroke-width="2"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
}

function FitBounds({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [[HOME_LAT, HOME_LNG]];
    restaurants.forEach((r) => {
      if (r.latitude && r.longitude) {
        points.push([r.latitude, r.longitude]);
      }
    });
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points.map(([lat, lng]) => [lat, lng])), {
        padding: [40, 40],
        maxZoom: 14,
      });
    }
  }, [restaurants, map]);

  return null;
}

function RestaurantMarker({
  restaurant,
  routeInfo,
  onHover,
}: {
  restaurant: Restaurant;
  routeInfo?: RouteInfo;
  onHover: (r: Restaurant) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const handlers = useMemo(
    () => ({
      mouseover: () => {
        onHover(restaurant);
        markerRef.current?.openTooltip();
      },
    }),
    [restaurant, onHover]
  );

  return (
    <Marker
      ref={markerRef}
      position={[restaurant.latitude!, restaurant.longitude!]}
      icon={restaurantIcon(restaurant.status)}
      eventHandlers={handlers}
    >
      <Tooltip direction="top" offset={[0, -14]} opacity={1}>
        <div style={{ minWidth: 160, padding: "2px 0" }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{restaurant.name}</div>
          {restaurant.cuisineType && (
            <div style={{ fontSize: 11, color: "#6b7280" }}>{restaurant.cuisineType}</div>
          )}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              marginTop: 2,
              color: STATUS_COLOURS[restaurant.status] || "#6b7280",
            }}
          >
            {STATUS_LABELS[restaurant.status] || restaurant.status}
          </div>
          {routeInfo && (
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                marginTop: 6,
                paddingTop: 6,
                fontSize: 11,
                color: "#4b5563",
                lineHeight: 1.6,
              }}
            >
              <div>📍 {routeInfo.distanceKm} km from home</div>
              <div>🚗 ~{routeInfo.durationMin} min drive</div>
            </div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}

export function RestaurantMap({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const [routeCache, setRouteCache] = useState<Record<string, RouteInfo>>({});
  const abortRef = useRef<AbortController | null>(null);

  const mappable = useMemo(
    () => restaurants.filter((r) => r.latitude && r.longitude),
    [restaurants]
  );

  const fetchRoute = useCallback(async (restaurant: Restaurant) => {
    if (!restaurant.latitude || !restaurant.longitude) return;
    if (routeCache[restaurant.id]) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${HOME_LNG},${HOME_LAT};${restaurant.longitude},${restaurant.latitude}?overview=false`;
      const resp = await fetch(url, { signal: controller.signal });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.routes?.[0]) {
        const route = data.routes[0];
        setRouteCache((prev) => ({
          ...prev,
          [restaurant.id]: {
            distanceKm: Math.round((route.distance / 1000) * 10) / 10,
            durationMin: Math.round(route.duration / 60),
          },
        }));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("[Map] Route fetch failed:", err);
      }
    }
  }, [routeCache]);

  return (
    <div className="rounded-xl border overflow-hidden relative" style={{ height: 400, zIndex: 0 }}>
      <MapContainer
        center={[HOME_LAT, HOME_LNG]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds restaurants={mappable} />

        <Marker position={[HOME_LAT, HOME_LNG]} icon={homeIcon}>
          <Tooltip direction="top" offset={[0, -16]} opacity={1}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{HOME_LABEL}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Home</div>
          </Tooltip>
        </Marker>

        {mappable.map((r) => (
          <RestaurantMarker
            key={r.id}
            restaurant={r}
            routeInfo={routeCache[r.id]}
            onHover={fetchRoute}
          />
        ))}
      </MapContainer>
    </div>
  );
}
