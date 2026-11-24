import Link from "next/link";
import type { ListingCard } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { GearIcon } from "./Logo";

export function Items({ items }: { items: ListingCard[] }) {
  return (
    <div className="items">
      {items.map((a) => (
        <Link key={a.id} href={`/annonces/${a.id}`} className="item">
          <div className="ph">{a.image_id ? <img src={`/img/${a.image_id}`} alt="" loading="lazy" /> : <GearIcon category={a.category} />}</div>
          <div className="tx"><b>{a.title}</b><span className="price">{formatPrice(a.price)}</span><span className="sub">{a.city}</span></div>
        </Link>
      ))}
    </div>
  );
}
