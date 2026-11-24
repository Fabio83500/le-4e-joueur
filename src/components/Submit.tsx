"use client";
import { useFormStatus } from "react-dom";

export function Submit({ children, className = "btn", pendingText = "Un instant…" }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending}>{pending ? pendingText : children}</button>;
}
