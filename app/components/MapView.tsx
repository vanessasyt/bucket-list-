"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RATING_BANDS, avgRating, type Entry } from "@/lib/types";
import CategoryBar, { FILTERS, filterLabel, type Filter } from "./CategoryBar";
import PlaceDetail from "./PlaceDetail";
import Timeline from "./Timeline";
import {
  CITY_PIN_SIZE,
  PIN_BOX_H,
  PIN_BOX_W,
  PIN_TIP_Y,
  cityPinHtml,
  pinHtml,
} from "./Pin";

// Zoomed out past this, individual places collapse into one marker per city
// — the overview. Zoom in and they separate again.
const CITY_ZOOM_THRESHOLD = 9;

interface CityGroup {
  city: string;
  lat: number;
  lng: number;
  count: number;
  average: number | null;
}

function groupByCity(entries: Entry[]): CityGroup[] {
  const map = new Map<
    string,
    { latSum: number; lngSum: number; count: number; ratings: number[] }
  >();
  for (const e of entries) {
    const g = map.get(e.city) ?? { latSum: 0, lngSum: 0, count: 0, ratings: [] };
    g.latSum += e.lat;
    g.lngSum += e.lng;
    g.count += 1;
    const r = avgRating(e);
    if (r !== null) g.ratings.push(r);
    map.set(e.city, g);
  }
  return Array.from(map.entries()).map(([city, g]) => ({
    city,
    lat: g.latSum / g.count,
    lng: g.lngSum / g.count,
    count: g.count,
    average: g.ratings.length
      ? g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length
      : null,
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
  const [timelineOpen, setTimelineOpen] = useState(false);

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

  const stats = useMemo(
    () => ({
      places: filtered.length,
      cities: new Set(filtered.map((e) => e.city)).size,
    }),
    [filtered]
  );

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

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
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
      // Clicking empty map dismisses the card, the way a map app behaves.
      map.on("click", () => setSelectedId(null));
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
            html: cityPinHtml(c.city, c.count, c.average),
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
      L.marker([e.lat, e.lng], {
        icon: L.divIcon({
          className: "pin-marker",
          html: pinHtml(e, isSelected),
          iconSize: [PIN_BOX_W, PIN_BOX_H],
          // Anchor on the pin's point rather than the middle of the box,
          // so the label hanging below doesn't shift the pin off its spot.
          iconAnchor: [PIN_BOX_W / 2, PIN_TIP_Y],
        }),
        zIndexOffset: isSelected ? 1000 : 0,
      })
        // Leaflet would otherwise bubble this to the map's own click handler
        // and immediately clear the selection we just made.
        .on("click", (ev: { originalEvent?: Event }) => {
          ev.originalEvent?.stopPropagation();
          select(e);
        })
        .addTo(layer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, filtered, selectedId, zoom]);

  // A place that's been filtered out shouldn't stay selected behind the card.
  useEffect(() => {
    if (selectedId !== null && !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  function select(entry: Entry) {
    setSelectedId(entry.id);
    mapRef.current?.panTo([entry.lat, entry.lng], { animate: true, duration: 0.4 });
  }

  // Picking from the list can happen while zoomed out, where individual pins
  // aren't drawn yet, so this one zooms in far enough to actually show it.
  function selectFromList(entry: Entry) {
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

      {/* What you're looking at, and what the pin colours mean */}
      <div className="absolute left-4 top-[68px] z-[600] panel px-3 py-2">
        <p className="field-label">{filterLabel(filter)}</p>
        <p className="font-display text-2xl text-ink leading-none mt-0.5">{stats.places}</p>
        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-1">
          {stats.cities} {stats.cities === 1 ? "city" : "cities"}
        </p>

        <div className="mt-2 pt-2 border-t border-line">
          <div className="flex items-center gap-1">
            {RATING_BANDS.map((band) => (
              <span
                key={band.hex}
                className="w-4 h-2 rounded-sm first:rounded-l last:rounded-r"
                style={{ backgroundColor: band.hex }}
                title={band.label}
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-[8px] text-muted mt-1">
            <span>9+</span>
            <span>4.5</span>
          </div>
        </div>
      </div>

      {/* Everything we've been to, newest first */}
      <button
        type="button"
        onClick={() => setTimelineOpen(true)}
        className="absolute right-4 top-[68px] z-[600] panel px-3 py-2 flex items-center gap-2 text-ink hover:border-muted"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase">List</span>
      </button>

      {/* Zoom and recentre, down the right edge */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[600] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={fitAll}
          aria-label="Show everything"
          className="w-9 h-9 rounded-lg bg-accent hover:bg-accent-hot text-white flex items-center justify-center text-sm shadow-md"
        >
          ⌖
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="panel w-9 h-9 flex items-center justify-center text-ink text-lg leading-none"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="panel w-9 h-9 flex items-center justify-center text-ink text-lg leading-none"
        >
          −
        </button>
      </div>

      {/* Names and reviews live here only, behind a click. */}
      {selected && (
        <div className="absolute z-[600] left-4 right-4 bottom-[112px] md:left-auto md:right-4 md:bottom-[110px] md:w-[300px]">
          <PlaceDetail entry={selected} onClose={() => setSelectedId(null)} />
        </div>
      )}

      {/* Category bar along the bottom */}
      <div className="absolute inset-x-0 bottom-0 z-[600] flex justify-center pb-4 px-4 pointer-events-none">
        <CategoryBar value={filter} counts={counts} onChange={setFilter} />
      </div>

      <Timeline
        entries={filtered}
        selectedId={selectedId}
        open={timelineOpen}
        onSelect={(entry) => {
          selectFromList(entry);
          setTimelineOpen(false);
        }}
        onClose={() => setTimelineOpen(false)}
      />

      {filtered.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none">
          <div className="panel px-5 py-4 text-center max-w-xs">
            <p className="font-body text-sm text-ink">No places yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
