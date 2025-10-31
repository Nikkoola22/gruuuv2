import React, { useRef, useEffect } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
  driftPhase: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const Snow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // recreate sensible amount of particles based on viewport area
      const area = width * height;
      const target = Math.min(220, Math.max(40, Math.floor(area / 9000)));
      const arr: Particle[] = [];
      for (let i = 0; i < target; i++) {
        arr.push({
          x: rand(0, width),
          y: rand(0, height),
          r: rand(0.6, 3.2),
          vx: rand(-0.25, 0.6),
          vy: rand(0.3, 1.6),
          opacity: rand(0.45, 1),
          driftPhase: rand(0, Math.PI * 2),
        });
      }
      particlesRef.current = arr;
    };

  const windBase = rand(-0.1, 0.1);

    const loop = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const time = t / 1000;
      const wind = windBase + Math.sin(time * 0.6) * 0.6;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // subtle horizontal oscillation + wind
        p.x += p.vx + Math.sin(p.driftPhase + time * 0.8) * 0.25 + wind * (p.r / 2);
        p.y += p.vy * (1 + p.r / 3);

        // wrap or reset
        if (p.y - p.r > height) {
          p.y = -p.r;
          p.x = rand(0, width);
          p.vy = rand(0.3, 1.6);
          p.vx = rand(-0.25, 0.6);
          p.opacity = rand(0.45, 1);
        }
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        // draw
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-40"
      aria-hidden
    />
  );
};

export default Snow;
