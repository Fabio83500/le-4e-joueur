import type { Partner } from "@/lib/queries";
import { initials } from "@/lib/format";

export function PartnerBanner({ partner }: { partner: Partner | null }) {
  if (!partner) return null;
  const inner = (
    <>
      <div className="logo">{initials(partner.name)}</div>
      <div><small>Partenaire</small><b>{partner.name}</b><div className="sub">{partner.tagline}</div></div>
    </>
  );
  return partner.url
    ? <a className="partner" href={partner.url} target="_blank" rel="noopener sponsored">{inner}</a>
    : <div className="partner">{inner}</div>;
}
