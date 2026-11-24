export function Logo() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="5" />
      <text x="30" y="38" textAnchor="middle" fontFamily="Nunito Sans, sans-serif" fontWeight="800" fontSize="24" fill="currentColor">4</text>
    </svg>
  );
}

export function GearIcon({ category }: { category: string }) {
  if (category === "Chaussures")
    return <svg viewBox="0 0 60 60" aria-hidden="true"><path d="M8 40c0-6 2-14 6-18l10 6c6 3 14 4 22 6 4 1 6 3 6 6z" fill="currentColor"/><rect x="8" y="40" width="44" height="6" rx="3" fill="currentColor" opacity=".6"/></svg>;
  if (category === "Sacs")
    return <svg viewBox="0 0 60 60" aria-hidden="true"><rect x="8" y="22" width="44" height="24" rx="10" fill="currentColor"/><path d="M22 22c0-6 4-9 8-9s8 3 8 9" fill="none" stroke="currentColor" strokeWidth="4"/></svg>;
  if (category === "Balles")
    return <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="22" cy="34" r="11" fill="currentColor"/><circle cx="38" cy="34" r="11" fill="currentColor" opacity=".7"/><circle cx="30" cy="20" r="11" fill="currentColor" opacity=".45"/></svg>;
  return <svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="26" cy="25" rx="13" ry="15" fill="currentColor"/><rect x="33" y="35" width="6" height="16" rx="3" transform="rotate(-35 36 43)" fill="currentColor"/><circle cx="46" cy="15" r="5" fill="currentColor" opacity=".6"/></svg>;
}
