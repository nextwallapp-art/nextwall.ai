"use client";

import { useEffect, useRef } from "react";

export type HalftoneShapeKind = "funnel" | "circles" | "diamond";

const STOPS: { t: number; c: [number, number, number] }[] = [
  { t: 0.0, c: [209, 213, 218] },
  { t: 0.5, c: [145, 153, 165] },
  { t: 1.0, c: [71, 85, 105] },
];

function lerpColor(t: number): [number, number, number] {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (t >= a.t && t <= b.t) {
      const k = (t - a.t) / (b.t - a.t);
      return [
        Math.round(a.c[0] + (b.c[0] - a.c[0]) * k),
        Math.round(a.c[1] + (b.c[1] - a.c[1]) * k),
        Math.round(a.c[2] + (b.c[2] - a.c[2]) * k),
      ];
    }
  }
  return STOPS[STOPS.length - 1].c;
}

function field(shape: HalftoneShapeKind, nx: number, ny: number): number {
  if (shape === "diamond") {
    return 1 - (Math.abs(nx) + Math.abs(ny));
  }
  if (shape === "funnel") {
    const yy = (ny + 1) / 2;
    const halfW = 0.92 * (1 - yy * 0.72);
    if (Math.abs(nx) > halfW) return 0;
    return 0.4 + 0.6 * (1 - yy);
  }
  const centers = [-0.5, -0.17, 0.17, 0.5];
  const r2 = 0.14;
  let f = 0;
  for (const c of centers) {
    const dx = nx - c;
    const dy = ny;
    f += r2 / (dx * dx + dy * dy + r2);
  }
  return f - 0.72;
}

type HalftoneShapeProps = {
  shape: HalftoneShapeKind;
  className?: string;
};

export default function HalftoneShape({ shape, className }: HalftoneShapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = 9;

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);

      for (let gy = 0; gy < rows; gy++) {
        const cy = gy * cell + cell / 2;
        const ny = (cy / h) * 2 - 1;
        for (let gx = 0; gx < cols; gx++) {
          const cx = gx * cell + cell / 2;
          const nx = (cx / w) * 2 - 1;
          let v = field(shape, nx, ny);
          if (v <= 0) continue;
          if (v > 1) v = 1;
          const t = Math.round(v * 6) / 6;
          if (t <= 0) continue;
          const [r, g, b] = lerpColor(t);
          const size = cell * (0.32 + 0.68 * t);
          const s2 = size / 2;
          ctx.fillStyle = `rgba(${r},${g},${b},${(0.18 + 0.78 * t).toFixed(3)})`;
          ctx.fillRect(cx - s2, cy - s2, size, size);
        }
      }
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [shape]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
