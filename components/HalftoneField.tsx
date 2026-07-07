"use client";

import { useEffect, useRef } from "react";

type Blob = {
  bx: number;
  by: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  px: number;
  py: number;
  r: number;
};

const BLOBS: Blob[] = [
  { bx: 0.37, by: 0.44, ax: 0.08, ay: 0.064, fx: 0.00022, fy: 0.00017, px: 0, py: 1.3, r: 0.216 },
  { bx: 0.6, by: 0.52, ax: 0.096, ay: 0.08, fx: 0.00018, fy: 0.00026, px: 2.1, py: 0.4, r: 0.176 },
  { bx: 0.48, by: 0.38, ax: 0.072, ay: 0.104, fx: 0.00029, fy: 0.00015, px: 4.2, py: 3.1, r: 0.144 },
];

const STOPS: { t: number; c: [number, number, number] }[] = [
  { t: 0.0, c: [235, 235, 235] },
  { t: 0.5, c: [160, 160, 160] },
  { t: 1.0, c: [75, 75, 75] },
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

type HalftoneFieldProps = {
  className?: string;
};

export default function HalftoneField({ className }: HalftoneFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = 17;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;

    const pointer = { x: 0.5, y: 0.44, tx: 0.5, ty: 0.44 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const minDim = Math.min(width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      const centers = BLOBS.map((b) => ({
        x: (b.bx + b.ax * Math.sin(time * b.fx + b.px)) * width,
        y: (b.by + b.ay * Math.sin(time * b.fy + b.py)) * height,
        r2: (b.r * minDim) ** 2,
      }));
      centers.push({
        x: pointer.x * width,
        y: pointer.y * height,
        r2: (0.128 * minDim) ** 2,
      });

      const lo = 0.48;
      const hi = 0.97;

      for (let gy = 0; gy < rows; gy++) {
        const cy = gy * cell + cell / 2;
        for (let gx = 0; gx < cols; gx++) {
          const cx = gx * cell + cell / 2;
          let field = 0;
          for (let i = 0; i < centers.length; i++) {
            const c = centers[i];
            const dx = cx - c.x;
            const dy = cy - c.y;
            field += c.r2 / (dx * dx + dy * dy + c.r2);
          }
          let t = (field - lo) / (hi - lo);
          if (t <= 0) continue;
          if (t > 1) t = 1;
          const [r, g, b] = lerpColor(t);
          const size = cell * (0.176 + 0.576 * t);
          const s2 = size / 2;
          ctx.fillStyle = `rgba(${r},${g},${b},${(0.128 + 0.576 * t).toFixed(3)})`;
          ctx.fillRect(cx - s2, cy - s2, size, size);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = e.clientY / window.innerHeight;
    };

    resize();

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.addEventListener("resize", resize);

    if (prefersReduced) {
      draw(8000);
      cancelAnimationFrame(raf);
    } else {
      window.addEventListener("pointermove", onPointerMove);
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
