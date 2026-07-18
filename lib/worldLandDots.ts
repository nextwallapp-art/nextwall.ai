import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

export type LandDot = {
  lat: number;
  lon: number;
  land: boolean;
  border?: boolean;
};

const WORLD_ATLAS_URL = "/world-countries-110m.json";

let loadPromise: Promise<LandDot[]> | null = null;
let cachedDots: LandDot[] | null = null;

function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon: number, lat: number, geometry: Geometry): boolean {
  if (geometry.type === "Polygon") {
    const [outer, ...holes] = geometry.coordinates;
    if (!pointInRing(lon, lat, outer)) return false;
    return !holes.some((hole) => pointInRing(lon, lat, hole));
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poly) =>
      pointInPolygon(lon, lat, { type: "Polygon", coordinates: poly }),
    );
  }

  return false;
}

function geometryBbox(geometry: Geometry): [number, number, number, number] {
  let minLon = 180;
  let minLat = 90;
  let maxLon = -180;
  let maxLat = -90;

  const rings: number[][][] = [];
  if (geometry.type === "Polygon") {
    rings.push(...geometry.coordinates);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) rings.push(...poly);
  }

  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }

  return [minLon, minLat, maxLon, maxLat];
}

function sampleGeometry(geometry: Geometry, step: number): LandDot[] {
  const [minLon, minLat, maxLon, maxLat] = geometryBbox(geometry);
  const dots: LandDot[] = [];

  for (let lat = minLat; lat <= maxLat; lat += step) {
    const lonStep = step / Math.max(0.4, Math.cos((lat * Math.PI) / 180));
    for (let lon = minLon; lon <= maxLon; lon += lonStep) {
      if (pointInPolygon(lon, lat, geometry)) {
        dots.push({ lat, lon, land: true });
      }
    }
  }

  return dots;
}

function sampleBorders(geometry: Geometry, spacing: number): LandDot[] {
  const dots: LandDot[] = [];
  const rings: number[][][] = [];

  if (geometry.type === "Polygon") {
    rings.push(geometry.coordinates[0]);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) rings.push(poly[0]);
  }

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];
      const dist = Math.hypot(lon2 - lon1, lat2 - lat1);
      const steps = Math.max(1, Math.ceil(dist / spacing));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        dots.push({
          lat: lat1 + (lat2 - lat1) * t,
          lon: lon1 + (lon2 - lon1) * t,
          land: true,
          border: true,
        });
      }
    }
  }

  return dots;
}

function buildOceanSphere(step = 3.2): LandDot[] {
  const dots: LandDot[] = [];
  for (let lat = -90; lat <= 90; lat += step) {
    const lonStep = step / Math.max(0.3, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180; lon < 180; lon += lonStep) {
      dots.push({ lat, lon, land: false });
    }
  }
  return dots;
}

async function fetchWorldDots(): Promise<LandDot[]> {
  const res = await fetch(WORLD_ATLAS_URL);
  if (!res.ok) throw new Error(`world-atlas HTTP ${res.status}`);

  const topology = (await res.json()) as Topology;
  const countries = feature(
    topology,
    topology.objects.countries as Parameters<typeof feature>[1],
  ) as FeatureCollection;

  const landDots: LandDot[] = [];

  for (const country of countries.features) {
    if (!country.geometry) continue;
    const [minLon, minLat, maxLon, maxLat] = geometryBbox(country.geometry);
    const area = (maxLon - minLon) * (maxLat - minLat);
    const step =
      area > 1200 ? 0.95 : area > 400 ? 1.15 : area > 80 ? 1.45 : 2.0;
    landDots.push(...sampleGeometry(country.geometry, step));
    landDots.push(...sampleBorders(country.geometry, 0.55));
  }

  const ocean = buildOceanSphere(3.2);
  return [...ocean, ...landDots];
}

export async function loadWorldLandDots(): Promise<LandDot[]> {
  if (cachedDots) return cachedDots;
  if (!loadPromise) {
    loadPromise = fetchWorldDots()
      .then((dots) => {
        cachedDots = dots;
        return dots;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export function getCachedWorldLandDots(): LandDot[] | null {
  return cachedDots;
}
