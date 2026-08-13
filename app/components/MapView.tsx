"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { avgRating, formatRating, type Entry } from "@/lib/types";
import CategoryRail, { FILTERS, type Filter } from "./CategoryRail";
import PlaceCard from "./PlaceCard";
import PlaceDetail from "./PlaceDetail";
import { CITY_PIN_SIZE, PIN_SELECTED_SIZE, PIN_SIZE, cityPinHtml, pinHtml } from "./Pin";

// Zoomed out past this, individual places collapse into one marker per city
// — the overview. Zoom in and they separate again.
const CITY_ZOOM_THRESHOLD = 9;

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
  const containerRef = useRef<HTMLDivElement>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(12);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.type === filter)),
    [entries, filter]
  );

  const counts = useMemo(() => {
    const out = {} as Record<Filter, number>;
    for (const f of FILTERS) {
      out[f] = f === "all" ? entries.length : entries.filter((e) => e.type === f).length;
    }
    return out;
  }, [entries]);

  const selected = useMemo(
    () => filtered.find((e) => e.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  const stats = useMemo(() => {
    const rated = entries.map(avgRating).filter((r): r is number => r !== null);
    return {
      places: entries.length,
      cities: new Set(entries.map((e) => e.city)).size,
      average: rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : null,
    };
  }, [entries]);

  /* ---- set the map up once ---- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const leafletModule = await import("leaflet");
      const L = leafletModule.default ?? leafletModule;
      if (cancelled || !containerRef.current || mapRef.current || !L?.map) return;

      LRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: false, // replaced by the buttons on the right edge
        attributionControl: true,
        worldCopyJump: false,
      });
      mapRef.current = map;

      // Dark greyscale basemap, so the coloured pins are the only thing
      // competing for attention.
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);

      if (entries.length > 0) {
        const bounds = L.latLngBounds(entries.map((e) => [e.lat, e.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [90, 90], maxZoom: 13 });
      } else {
        map.setView([52.2053, 0.1218], 13); // Cambridge, as a sensible empty state
      }

      map.on("zoomend", () => setZoom(map.getZoom()));
      setZoom(map.getZoom());
      setReady(true);
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

  /* ---- redraw the markers whenever what should be on the map changes ---- */
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();

    if (zoom < CITY_ZOOM_THRESHOLD) {
      for (const c of groupByCity(filtered)) {
        L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: "pin-marker",
            html: cityPinHtml(c.city, c.count),
            iconSize: [CITY_PIN_SIZE, CITY_PIN_SIZE],
            iconAnchor: [CITY_PIN_SIZE / 2, CITY_PIN_SIZE / 2],
          }),
        })
          .on("click", () => map.flyTo([c.lat, c.lng], 14, { duration: 0.8 }))
          .addTo(layer);
      }
      return;
    }

    for (const e of filtered) {
      const isSelected = e.id === selectedId;
      const size = isSelected ? PIN_SELECTED_SIZE : PIN_SIZE;
      L.marker([e.lat, e.lng], {
        icon: L.divIcon({
          className: "pin-marker",
          html: pinHtml(e, isSelected),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .on("click", () => setSelectedId(e.id))
        .addTo(layer);
    }
  }, [ready, filtered, selectedId, zoom]);

  // A place that's been filtered out shouldn't stay selected behind the card.
  useEffect(() => {
    if (selectedId !== null && !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  function select(entry: Entry) {
    setSelectedId(entry.id);
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([entry.lat, entry.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
  }

  function fitAll() {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (filtered.length === 0) {
      map.flyTo([52.2053, 0.1218], 12, { duration: 0.8 });
      return;
    }
    const bounds = L.latLngBounds(filtered.map((e) => [e.lat, e.lng] as [number, number]));
    map.flyToBounds(bounds, { padding: [90, 90], maxZoom: 13, duration: 0.8 });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      <CategoryRail value={filter} counts={counts} onChange={setFilter} />

      {/* Zoom and recentre, down the right edge */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[600] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={fitAll}
          aria-label="Show everything"
          className="w-9 h-9 rounded-sm bg-accent hover:bg-accent-hot text-cream flex items-center justify-center text-sm"
        >
          ⌖
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="panel w-9 h-9 flex items-center justify-center text-cream hover:border-muted text-lg leading-none"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="panel w-9 h-9 flex items-center justify-center text-cream hover:border-muted text-lg leading-none"
        >
          −
        </button>
      </div>

      {/* Detail card for the selected place */}
      {selected && (
        <div className="absolute z-[600] left-4 right-4 bottom-[120px] md:left-auto md:right-4 md:bottom-[124px] md:w-[300px]">
          <PlaceDetail entry={selected} onClose={() => setSelectedId(null)} />
        </div>
      )}

      {/* Stats, then the strip of places */}
      <div className="absolute inset-x-0 bottom-0 z-[600] pointer-events-none">
        <div className="flex items-end gap-3 px-4 pb-4 pt-10 bg-gradient-to-t from-ink via-ink/80 to-transparent">
          <div className="panel px-3.5 py-2.5 shrink-0 pointer-events-auto hidden sm:block">
            <p className="field-label">Places</p>
            <p className="font-display text-3xl text-cream leading-none mt-0.5">{stats.places}</p>
            <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-1.5">
              {stats.cities} {stats.cities === 1 ? "city" : "cities"}
              {stats.average !== null && ` · avg ${formatRating(stats.average)}`}
            </p>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pointer-events-auto flex-1 min-w-0 pb-0.5">
            {filtered.map((e) => (
              <PlaceCard
                key={e.id}
                entry={e}
                selected={e.id === selectedId}
                onSelect={select}
              />
            ))}
            {filtered.length === 0 && (
              <div className="panel px-4 py-3">
                <p className="font-body text-sm text-muted">
                  Nothing here yet. Add the first one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
