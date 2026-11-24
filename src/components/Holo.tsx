"use client";
import { useRef } from "react";

// Inclinaison 3D + reflet holographique qui suit le doigt ou la souris.
export function Holo({ children, className = "", onClick, label }: { children: React.ReactNode; className?: string; onClick?: () => void; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 22}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 26}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--o", "1");
  };
  const leave = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.style.setProperty("--o", "0");
  };
  return (
    <div ref={ref} className={`holo ${className}`} onPointerMove={move} onPointerLeave={leave} onPointerUp={leave}
      onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={label}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}>
      {children}
    </div>
  );
}
