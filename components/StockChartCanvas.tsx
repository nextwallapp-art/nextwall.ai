"use client";

import { useEffect, useRef } from "react";

const LINE_OPACITY = 0.08;
const LINE_RGB = "10, 10, 10";
const CYCLE_MS = 17000;

/** Jagged step noise — straight segments, not smooth curves */
function stepNoise(i: number) {
  const wave = Math.sin(i * 1.9) * Math.sin(i * 0.47 + 0.8);
  return wave * 0.022;
}

/** Builds an angular uptrend with visible horizontal-then-vertical stock moves */
function buildStockPoints(count: number): number[] {
  const points: number[] = [];
  let y = 0.82;

  for (let i = 0; i < count; i++) {
    const trend = -0.0055;
    const jitter =
      i % 2 === 0 ? stepNoise(i) * 1.6 : stepNoise(i + 11) * 0.9;
    y += trend + jitter;
    y = Math.max(0.14, Math.min(0.86, y));
    points.push(y);
  }

  return points;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

type StockChartCanvasProps = {
  className?: string;
};

export default function StockChartCanvas({ className }: StockChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const parent = canvasEl.parentElement;
    if (!parent) return;

    let context: CanvasRenderingContext2D;
    const initialContext = canvasEl.getContext("2d");
    if (!initialContext) return;
    context = initialContext;

    const cycleMs = CYCLE_MS;
    let points = buildStockPoints(120);
    let width = 0;
    let height = 0;
    let dpr = 1;

    function pointCountForWidth(w: number) {
      return Math.max(48, Math.min(140, Math.floor(w / 14)));
    }

    function resize() {
      const el = canvasRef.current;
      if (!el) return;
      const container = el.parentElement;
      if (!container) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;

      el.width = Math.floor(width * dpr);
      el.height = Math.floor(height * dpr);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;

      const nextContext = el.getContext("2d");
      if (!nextContext) return;
      context = nextContext;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = buildStockPoints(pointCountForWidth(width));
    }

    function pointXY(index: number, count: number) {
      return {
        x: (index / (count - 1)) * width,
        y: points[index] * height,
      };
    }

    function drawLine(visibleRatio: number, opacity: number, glow: boolean) {
      const count = points.length;
      const exactIndex = (count - 1) * visibleRatio;
      const lastIndex = Math.max(0, Math.floor(exactIndex));
      const tipBlend = exactIndex - lastIndex;

      context.beginPath();

      const start = pointXY(0, count);
      context.moveTo(start.x, start.y);

      for (let i = 1; i <= lastIndex; i++) {
        const { x, y } = pointXY(i, count);
        context.lineTo(x, y);
      }

      if (tipBlend > 0.001 && lastIndex < count - 1) {
        const from = pointXY(lastIndex, count);
        const to = pointXY(lastIndex + 1, count);
        context.lineTo(
          from.x + (to.x - from.x) * tipBlend,
          from.y + (to.y - from.y) * tipBlend,
        );
      }

      context.lineCap = "butt";
      context.lineJoin = "miter";

      if (glow) {
        context.strokeStyle = `rgba(${LINE_RGB}, ${opacity * 0.5})`;
        context.lineWidth = 2.5;
        context.shadowColor = `rgba(${LINE_RGB}, 0.12)`;
        context.shadowBlur = 8;
        context.stroke();
      }

      context.shadowBlur = glow ? 4 : 6;
      context.shadowColor = `rgba(${LINE_RGB}, 0.08)`;
      context.strokeStyle = `rgba(${LINE_RGB}, ${opacity})`;
      context.lineWidth = 1.5;
      context.stroke();

      context.shadowBlur = 0;
    }

    function render(timestamp: number) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        context.clearRect(0, 0, width, height);
        drawLine(1, LINE_OPACITY, true);
        drawLine(1, LINE_OPACITY * 0.9, false);
        return;
      }

      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = (timestamp - startTimeRef.current) % cycleMs;
      const cycle = elapsed / cycleMs;

      let visibleRatio = 1;
      let opacity = LINE_OPACITY;

      if (cycle < 0.82) {
        visibleRatio = easeInOutCubic(cycle / 0.82);
      } else {
        visibleRatio = 1;
        opacity = LINE_OPACITY * (1 - easeInOutCubic((cycle - 0.82) / 0.18));
      }

      context.clearRect(0, 0, width, height);

      if (opacity > 0.002) {
        drawLine(visibleRatio, opacity, true);
        drawLine(visibleRatio, opacity * 0.88, false);
      } else {
        startTimeRef.current = timestamp;
      }

      frameRef.current = requestAnimationFrame(render);
    }

    resize();
    frameRef.current = requestAnimationFrame(render);

    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={className} />
  );
}
