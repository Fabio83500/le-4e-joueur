import Link from "next/link";
export default function NotFound() {
  return (<><h1>Page introuvable</h1><p className="sub">Cette page n'existe pas ou a été supprimée.</p><Link className="btn" href="/">Retour à l'accueil</Link></>);
}
