"use client";

import type { GeoHotspot } from "@/lib/geoHotspots";
import { loadWorldLandDots, type LandDot } from "@/lib/worldLandDots";
import { useCallback, useEffect, useRef, useState } from "react";

type GeoGlobeProps = {
  hotspots: GeoHotspot[];
  hintLabel?: string;
  selectedLabel?: string;
  loading?: boolean;
};

type Projected = {
  x: number;
  y: number;
  z: number;
  scale: number;
};

const DEG = Math.PI / 180;

function latLonToVec(lat: number, lon: number): [number, number, number] {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  const x = -(Math.sin(phi) * Math.cos(theta));
  const z = Math.sin(phi) * Math.sin(theta);
  const y = Math.cos(phi);
  return [x, y, z];
}

function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c + z * s, y, -x * s + z * c];
}

function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x, y * c - z * s, y * s + z * c];
}

function angularDistanceDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const [x1, y1, z1] = latLonToVec(lat1, lon1);
  const [x2, y2, z2] = latLonToVec(lat2, lon2);
  const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  return (Math.acos(dot) * 180) / Math.PI;
}

function project(
  lat: number,
  lon: number,
  rotY: number,
  rotX: number,
  radius: number,
  cx: number,
  cy: number,
): Projected {
  let [x, y, z] = latLonToVec(lat, lon);
  [x, y, z] = rotateY(x, y, z, rotY);
  [x, y, z] = rotateX(x, y, z, rotX);
  const scale = (z + 1.5) / 2.5;
  return {
    x: cx + x * radius,
    y: cy - y * radius,
    z,
    scale: Math.max(0.12, scale),
  };
}

function hotspotColor(intensity: GeoHotspot["intensity"]): string {
  if (intensity === 3) return "#b81818";
  if (intensity === 2) return "#d63030";
  return "#ef5555";
}

function zoneHeat(
  lat: number,
  lon: number,
  hotspots: GeoHotspot[],
): { heat: number; color: string | null } {
  let heat = 0;
  let color: string | null = null;
  for (const spot of hotspots) {
    const dist = angularDistanceDeg(lat, lon, spot.lat, spot.lon);
    if (dist > 20) continue;
    const local = Math.max(0, 1 - dist / 20) * spot.intensity;
    if (local > heat) {
      heat = local;
      color = hotspotColor(spot.intensity);
    }
  }
  return { heat, color };
}

export default function GeoGlobe({
  hotspots,
  hintLabel = "Arrastra para girar · Toca una zona roja",
  selectedLabel = "Zona activa",
  loading = false,
}: GeoGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef({ y: 0.55, x: 0.12 });
  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
    startX: number;
    startY: number;
  }>({
    active: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  });

  const landDotsRef = useRef<LandDot[]>([]);
  const [selected, setSelected] = useState<GeoHotspot | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadWorldLandDots()
      .then((dots) => {
        if (!cancelled) {
          landDotsRef.current = dots;
          setMapReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setMapError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !mapReady) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = Math.min(Math.max(container.clientWidth * 0.85, 360), 560);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.4;
    const { y: rotY, x: rotX } = rotRef.current;
    const dots = landDotsRef.current;

    const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.15);
    glow.addColorStop(0, "rgba(220, 225, 235, 0.35)");
    glow.addColorStop(0.55, "rgba(200, 205, 215, 0.12)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
    ctx.fill();

    type DrawDot = {
      x: number;
      y: number;
      z: number;
      r: number;
      color: string;
      alpha: number;
      glow?: boolean;
    };

    const drawList: DrawDot[] = [];

    for (const dot of dots) {
      const p = project(dot.lat, dot.lon, rotY, rotX, radius, cx, cy);
      if (p.z < -0.25) continue;

      if (!dot.land) {
        const t = p.scale;
        const gray = Math.round(210 + t * 30);
        drawList.push({
          x: p.x,
          y: p.y,
          z: p.z,
          r: 0.55 + t * 0.45,
          color: `rgb(${gray},${gray},${gray})`,
          alpha: 0.1 + t * 0.22,
        });
        continue;
      }

      const { heat, color } = zoneHeat(dot.lat, dot.lon, hotspots);
      const depth = p.scale;

      if (dot.border) {
        const borderBase = Math.round(35 + depth * 70);
        let fill = `rgb(${borderBase},${borderBase},${borderBase})`;
        let alpha = 0.65 + depth * 0.3;
        let r = 1.05 + depth * 0.55;

        if (heat > 0.1 && color) {
          fill = color;
          alpha = 0.7 + heat * 0.28;
          r = 1.25 + heat * 1.1;
        }

        drawList.push({ x: p.x, y: p.y, z: p.z + 0.001, r, color: fill, alpha });
        continue;
      }

      const base = Math.round(70 + depth * 110);
      let fill = `rgb(${base},${base},${base})`;
      let alpha = 0.5 + depth * 0.45;
      let r = 1.05 + depth * 0.75;

      if (heat > 0.1 && color) {
        fill = color;
        alpha = 0.55 + heat * 0.42;
        r = 1.35 + heat * 1.35 + depth * 0.45;
      }

      drawList.push({ x: p.x, y: p.y, z: p.z, r, color: fill, alpha });
    }

    for (const spot of hotspots) {
      const p = project(spot.lat, spot.lon, rotY, rotX, radius, cx, cy);
      if (p.z < 0.01) continue;
      const pulse = spot.intensity === 3 ? 6 : spot.intensity === 2 ? 5 : 4;
      const glowRadius = pulse * 2.8 + p.scale;
      drawList.push({
        x: p.x,
        y: p.y,
        z: p.z + 0.02,
        r: glowRadius,
        color: hotspotColor(spot.intensity),
        alpha: 0.08 + spot.intensity * 0.04,
        glow: true,
      });
      drawList.push({
        x: p.x,
        y: p.y,
        z: p.z + 0.03,
        r: pulse + p.scale * 0.6,
        color: hotspotColor(spot.intensity),
        alpha: 1,
      });
      drawList.push({
        x: p.x,
        y: p.y,
        z: p.z + 0.035,
        r: 2 + p.scale * 0.4,
        color: "#ffffff",
        alpha: 0.85,
      });
    }

    drawList.sort((a, b) => a.z - b.z);
    for (const d of drawList) {
      if (d.glow) {
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        g.addColorStop(0, d.color);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = g;
      } else {
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(180, 185, 195, 0.25)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }, [hotspots, mapReady]);

  useEffect(() => {
    if (!mapReady) return;

    let frame = 0;
    const tick = () => {
      if (!dragRef.current.active) {
        rotRef.current.y += 0.0012;
      }
      draw();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draw, mapReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mapReady) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw, mapReady]);

  function pickHotspot(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.4;
    const { y: rotY, x: rotX } = rotRef.current;

    let best: { spot: GeoHotspot; dist: number } | null = null;
    for (const spot of hotspots) {
      const p = project(spot.lat, spot.lon, rotY, rotX, radius, cx, cy);
      if (p.z < 0.08) continue;
      const dist = Math.hypot(p.x - x, p.y - y);
      const threshold = 20 + spot.intensity * 5;
      if (dist <= threshold && (!best || dist < best.dist)) {
        best = { spot, dist };
      }
    }
    setSelected(best?.spot ?? null);
  }

  const showOverlay = loading || !mapReady;

  return (
    <div className="geo-globe-wrap">
      <div ref={containerRef} className="geo-globe-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="geo-globe-canvas"
          aria-label="Globo terráqueo interactivo"
          onPointerDown={(e) => {
            dragRef.current = {
              active: true,
              lastX: e.clientX,
              lastY: e.clientY,
              startX: e.clientX,
              startY: e.clientY,
            };
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragRef.current.active) return;
            const dx = e.clientX - dragRef.current.lastX;
            const dy = e.clientY - dragRef.current.lastY;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;
            rotRef.current.y += dx * 0.0045;
            rotRef.current.x = Math.max(
              -0.55,
              Math.min(0.55, rotRef.current.x + dy * 0.0035),
            );
          }}
          onPointerUp={(e) => {
            const moved =
              Math.abs(e.clientX - dragRef.current.startX) +
              Math.abs(e.clientY - dragRef.current.startY);
            dragRef.current.active = false;
            if (moved < 8) pickHotspot(e.clientX, e.clientY);
          }}
          onPointerCancel={() => {
            dragRef.current.active = false;
          }}
        />
        {showOverlay ? (
          <div className="geo-globe-loading">
            <span className="geo-globe-loading-dot" />
            <span className="geo-globe-loading-dot" />
            <span className="geo-globe-loading-dot" />
          </div>
        ) : null}
      </div>

      {mapError ? (
        <p className="geo-globe-hint text-[#d93636]">
          No se pudo cargar el mapa. Recarga la página.
        </p>
      ) : (
        <p className="geo-globe-hint">{hintLabel}</p>
      )}

      {selected ? (
        <div className="geo-globe-detail" role="status">
          <div className="geo-globe-detail-header">
            <span
              className="geo-globe-detail-badge"
              data-intensity={selected.intensity}
            />
            <div>
              <p className="geo-globe-detail-kicker">{selectedLabel}</p>
              <h3 className="geo-globe-detail-title">{selected.name}</h3>
            </div>
          </div>
          <p className="geo-globe-detail-headline">{selected.headline}</p>
          <p className="geo-globe-detail-body">{selected.explanation}</p>
          {selected.relatedAssets.length > 0 ? (
            <p className="geo-globe-detail-assets">
              {selected.relatedAssets.join(" · ")}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="geo-globe-legend">
          {hotspots.slice(0, 4).map((spot) => (
            <button
              key={spot.id}
              type="button"
              className="geo-globe-legend-item"
              onClick={() => setSelected(spot)}
            >
              <span
                className="geo-globe-legend-dot"
                data-intensity={spot.intensity}
              />
              {spot.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
