// The basemap both maps draw on. Kept in one place so switching providers is a
// single edit rather than a hunt through the components.
//
// This was CARTO's Voyager tiles, which the design's cream/sage palette was
// picked against. CARTO now requires an API key and renders "API KEY REQUIRED"
// into unkeyed tiles server-side, so we serve straight from OpenStreetMap
// instead: busier and more saturated, but keyless and unstamped. To go back,
// sign up for a CARTO key and restore:
//   https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=...
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// OSM's tile usage policy requires this attribution to stay visible.
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// OSM's raster tiles stop at 19; asking for 20 just 404s.
export const TILE_MAX_ZOOM = 19;
