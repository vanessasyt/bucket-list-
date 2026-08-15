"use client";

import { useEffect, useRef, useState } from "react";

export interface PickedLocation {
  lat: number;
  lng: number;
  city: string;
  placeName: string;
}

interface SearchHit {
  display_name: string;
  lat: string;
  lon: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address?: any;
}

// Nominatim returns the town under one of several keys depending on how
// the place is classified, so check them in rough order of preference.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cityFrom(address: any): string {
  if (!address) return "";
  return (
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.county ||
    address.state ||
    ""
  );
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: PickedLocation | null;
  // Nullable because a location can be taken back off an entry, not just
  // moved. Without that, one stray click on the map is permanent.
  onChange: (loc: PickedLocation | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  // Keep the newest onChange without re-running the map setup effect
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  async function place(lat: number, lng: number, fallbackName?: string) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng]).addTo(map);

    // Optimistic value first, so the form is usable even if the reverse
    // lookup is slow or fails.
    onChangeRef.current({ lat, lng, city: "", placeName: fallbackName || "" });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
      );
      const data = await res.json();
      onChangeRef.current({
        lat,
        lng,
        city: cityFrom(data.address),
        placeName: fallbackName || data.name || data.display_name?.split(",")[0] || "",
      });
    } catch {
      /* keep the optimistic value */
    }
  }

  function clear() {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onChangeRef.current(null);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current).setView(
        value ? [value.lat, value.lng] : [52.2053, 0.1218],
        value ? 15 : 13
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      if (value) markerRef.current = L.marker([value.lat, value.lng]).addTo(map);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => place(e.latlng.lat, e.latlng.lng));
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

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          query
        )}`
      );
      setHits(await res.json());
    } catch {
      setHits([]);
    } finally {
      setSearching(false);
    }
  }

  function chooseHit(hit: SearchHit) {
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    mapRef.current?.setView([lat, lng], 16);
    place(lat, lng, hit.display_name.split(",")[0]);
    setHits([]);
    setQuery("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch(e);
          }}
          placeholder="Search a place, or click the map"
          className="input flex-1"
        />
        <button type="button" onClick={runSearch} disabled={searching} className="btn shrink-0">
          {searching ? "…" : "Find"}
        </button>
        {value && (
          <button type="button" onClick={clear} className="btn-ghost shrink-0">
            Clear
          </button>
        )}
      </div>

      {hits.length > 0 && (
        <ul className="border border-line rounded-sm bg-card mt-1.5 divide-y divide-line max-h-44 overflow-y-auto">
          {hits.map((hit, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => chooseHit(hit)}
                className="w-full text-left px-3 py-2 font-body text-sm text-ink hover:bg-card-2"
              >
                {hit.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={containerRef}
        className="h-56 sm:h-64 mt-2 rounded-sm border border-line overflow-hidden"
      />

      <p className="font-mono text-[10px] tracking-[0.1em] text-muted mt-1.5">
        {value
          ? `${value.placeName || "Pinned"}${value.city ? ` · ${value.city}` : ""} · ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`
          : "No location — that's fine"}
      </p>
    </div>
  );
}
