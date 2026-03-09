"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function WavyBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    function draw() {
      t += 0.01;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );

      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.5, "#1e3a8a");
      gradient.addColorStop(1, "#2563eb");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2 + Math.sin(t + i) * 400,
          canvas.height / 2 + Math.cos(t + i) * 400,
          300,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return (
    <div className={cn("relative w-full min-h-screen overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}