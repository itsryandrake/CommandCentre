import { useEffect, useRef } from "react";

/**
 * Gentle floating coloured dots in the brand palette.
 * Canvas overlay with low opacity — fun ambient effect.
 */
export function ConfettiDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const colours = [
      "#F2A93B", // warm orange/gold
      "#0E8A6E", // teal green
      "#4A9FD9", // sky blue
      "#E85D3A", // coral/red-orange
      "#F5C842", // golden yellow
    ];

    const particleCount = Math.min(Math.floor((width * height) / 50000), 20);

    interface Dot {
      x: number;
      y: number;
      size: number;
      speedY: number;
      drift: number;
      opacity: number;
      opacityDir: number;
      colour: string;
      shape: "circle" | "square" | "triangle";
    }

    const dots: Dot[] = [];
    const shapes: Dot["shape"][] = ["circle", "square", "triangle"];

    for (let i = 0; i < particleCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.5,
        speedY: -(Math.random() * 0.2 + 0.05),
        drift: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.3 + 0.1,
        opacityDir: (Math.random() - 0.5) * 0.003,
        colour: colours[Math.floor(Math.random() * colours.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    function drawShape(
      ctx: CanvasRenderingContext2D,
      dot: Dot,
    ) {
      ctx.globalAlpha = dot.opacity;
      ctx.fillStyle = dot.colour;

      if (dot.shape === "circle") {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (dot.shape === "square") {
        const half = dot.size;
        ctx.fillRect(dot.x - half, dot.y - half, half * 2, half * 2);
      } else {
        ctx.beginPath();
        ctx.moveTo(dot.x, dot.y - dot.size);
        ctx.lineTo(dot.x - dot.size, dot.y + dot.size);
        ctx.lineTo(dot.x + dot.size, dot.y + dot.size);
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const dot of dots) {
        dot.x += dot.drift;
        dot.y += dot.speedY;
        dot.opacity += dot.opacityDir;

        if (dot.opacity > 0.4 || dot.opacity < 0.05) {
          dot.opacityDir *= -1;
        }

        if (dot.y < -10) {
          dot.y = height + 10;
          dot.x = Math.random() * width;
        }
        if (dot.x < -10) dot.x = width + 10;
        if (dot.x > width + 10) dot.x = -10;

        drawShape(ctx, dot);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
      aria-hidden="true"
    />
  );
}
