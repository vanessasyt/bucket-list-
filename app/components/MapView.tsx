"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TYPE_INK, type Entry } from "@/lib/types";
import { tiltFor } from "./Stamp";

// Zoom level at which individual stamps replace the city cluster. Below
// this the map would be a pile of overlapping stamps.
const CITY_ZOOM_THRESHOLD = 9;

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function shortDate(dateKey: string) {
  const [y, m, d] = dateKey.split("-");
  return `${d} ${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

function stampHtml(entry: Entry) {
  const ink = TYPE_INK[entry.type];
  const tilt = tiltFor(`${entry.title}${entry.date}`);
  return `
    <div class="stamp stamp-${entry.type} w-[74px] h-[74px] px-1"
         style="color:${ink.hex};border-color:${ink.hex};transform:rotate(${tilt}deg)">
      <span class="text-[7px] tracking-[0.2em] opacity-80">${escapeHtml(entry.city)}</span>
      <span class="text-[8px] font-semibold leading-tight my-0.5">${escapeHtml(entry.title)}</span>
      <span class="text-[6px] tracking-[0.12em] opacity-75">${shortDate(entry.date)}</span>
    </div>`;
}

function cityHtml(city: string, count: number) {
  return `
    <div class="stamp stamp-activity w-[92px] h-[92px] px-2"
         style="color:#14213D;border-color:#14213D;transform:rotate(-3deg)">
      <span class="text-[13px] font-semibold leading-tight">${escapeHtml(city)}</span>
      <span class="text-[8px] tracking-[0.14em] opacity-75 mt-0.5">${count} stamp${count === 1 ? "" : "s"}</span>
    </div>`;
}

interface CityGroup {
  city: string;
  lat: number;
  lng: number;
  count: number;
}

function groupByCity(entries: Entry[]): CityGroup[] {
  const map = new Map<string, { latSum: number; lngSum: number; count: number }>();
  for (const e of entries) {
    const g = map.get(e.city) ?? { latSum: 0, lngSum: 0, count: 0 };
    g.latSum += e.lat;
    g.lngSum += e.lng;
    g.count += 1;
    map.set(e.city, g);
  }
  return Array.from(map.entries()).map(([city, g]) => ({
    city,
    lat: g.latSum / g.count,
    lng: g.lngSum / g.count,
    count: g.count,
  }));
}

export default function MapView({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const cities = groupByCity(entries);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const leafletModule = await import("leaflet");
      const L = leafletModule.default ?? leafletModule;
      if (cancelled || !containerRef.current || mapRef.current || !L?.map) return;

      LRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        // Keeps the world from repeating sideways, which makes the
        // zoomed-out city view read more like a printed page.
        worldCopyJump: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);

      if (entries.length > 0) {
        const bounds = L.latLngBounds(entries.map((e) => [e.lat, e.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
      } else {
        map.setView([52.2053, 0.1218], 12); // Cambridge, as a sensible empty state
      }

      map.on("zoomend", () => draw());
      setReady(true);
      draw();
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const zoom = map.getZoom();

    if (zoom < CITY_ZOOM_THRESHOLD) {
      for (const c of cities) {
        const marker = L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: "stamp-marker",
            html: cityHtml(c.city, c.count),
            iconSize: [92, 92],
            iconAnchor: [46, 46],
          }),
        });
        marker.on("click", () => map.flyTo([c.lat, c.lng], 13, { duration: 0.8 }));
        marker.addTo(layer);
      }
    } else {
      for (const e of entries) {
        const marker = L.marker([e.lat, e.lng], {
          icon: L.divIcon({
            className: "stamp-marker",
            html: stampHtml(e),
            iconSize: [74, 74],
            iconAnchor: [37, 37],
          }),
        });
        marker.on("click", () => router.push(`/entry/${e.id}`));
        marker.addTo(layer);
      }
    }
  }

  // Redraw whenever the entry list changes (e.g. after navigating back)
  useEffect(() => {
    if (ready) draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, ready]);

  function jumpTo(lat: number, lng: number, zoom: number) {
    mapRef.current?.flyTo([lat, lng], zoom, { duration: 0.9 });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5">
        <button onClick={() => jumpTo(52.2053, 0.1218, 13)} className="btn-ghost backdrop-blur-sm">
          Cambridge
        </button>
        <button onClick={() => jumpTo(51.5074, -0.1278, 12)} className="btn-ghost backdrop-blur-sm">
          London
        </button>
        <button
          onClick={() => {
            const L = LRef.current;
            if (!L || !mapRef.current || entries.length === 0) {
              mapRef.current?.flyTo([30, 5], 2, { duration: 0.9 });
              return;
            }
            const bounds = L.latLngBounds(entries.map((e) => [e.lat, e.lng] as [number, number]));
            mapRef.current.flyToBounds(bounds, { padding: [60, 60], maxZoom: 12, duration: 0.9 });
          }}
          className="btn-ghost backdrop-blur-sm"
        >
          All
        </button>
      </div>

      {entries.length === 0 && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
          <div className="bg-page-light/95 border border-navy/25 rounded-sm px-6 py-5 text-center max-w-xs pointer-events-auto">
            <p className="field-label">No stamps yet</p>
            <p className="font-body text-sm text-navy mt-2">
              Do something from the list, then log it. It'll show up here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
