import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic3NtcGFydG5lciIsImEiOiJjbW40bDI4engwMWg3MnFzbnp4emJua2hhIn0.5u0JuVsRDe6DSNBOEpSh1A";

interface Agency {
  name: string;
  slug: string;
  map_lat: number | null;
  map_lng: number | null;
}

interface SwissMapProps {
  agencies: Agency[];
  onAgencyClick?: (slug: string) => void;
}

const SwissMap = ({ agencies, onAgencyClick }: SwissMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [8.2275, 46.8182],
      zoom: 7.2,
      minZoom: 6,
      maxZoom: 12,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    agencies.forEach((agency) => {
      if (!agency.map_lat || !agency.map_lng || !map.current) return;

      const el = document.createElement("div");
      el.className = "ssm-map-marker";
      el.innerHTML = `
        <div style="
          width: 36px; height: 36px;
          background: #243e3a;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(36,62,58,0.35);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;
      el.addEventListener("mouseenter", () => {
        (el.firstElementChild as HTMLElement).style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        (el.firstElementChild as HTMLElement).style.transform = "scale(1)";
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "ssm-popup",
      }).setHTML(`
        <div style="font-family: inherit; padding: 4px 0;">
          <strong style="font-size: 14px; color: #243e3a;">${agency.name}</strong>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([agency.map_lng, agency.map_lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onAgencyClick?.(agency.slug);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [agencies, onAgencyClick]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
};

export default SwissMap;
