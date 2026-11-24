// Cartes à collectionner. Joueurs pros : nom et pays uniquement, illustrations génériques.
// ⚠️ Avant un lancement public : obtenir une licence ou remplacer cette liste (droit à l'image).

export type Rarity = "common" | "rare" | "epic" | "legend";
export const RARITY_LABEL: Record<Rarity, string> = { common: "Commune", rare: "Rare", epic: "Épique", legend: "Légendaire" };
// Probabilité de chaque rareté pour une carte de pack (sur 100).
export const ODDS: [Rarity, number][] = [["legend", 2], ["epic", 8], ["rare", 25], ["common", 65]];
export const PACK_SIZE = 3;
export const STREAK_BONUS_DAYS = 7;

export type CardDef = { id: string; name: string; country: string; flag: string; tour: "Messieurs" | "Dames"; rarity: Rarity; page: string };

const ES = ["Espagne", "🇪🇸"], AR = ["Argentine", "🇦🇷"], FR = ["France", "🇫🇷"], IT = ["Italie", "🇮🇹"], PT = ["Portugal", "🇵🇹"];
const c = (id: string, name: string, [country, flag]: string[], tour: CardDef["tour"], rarity: Rarity, page: string): CardDef =>
  ({ id, name, country: country!, flag: flag!, tour, rarity, page });

export const CARDS: CardDef[] = [
  // Messieurs
  c("coello", "Arturo Coello", ES, "Messieurs", "legend", "Stars du circuit"),
  c("tapia", "Agustín Tapia", AR, "Messieurs", "legend", "Stars du circuit"),
  c("galan", "Alejandro Galán", ES, "Messieurs", "epic", "Stars du circuit"),
  c("chingotto", "Federico Chingotto", AR, "Messieurs", "epic", "Stars du circuit"),
  c("lebron", "Juan Lebrón", ES, "Messieurs", "epic", "Stars du circuit"),
  c("dinenno", "Martín Di Nenno", AR, "Messieurs", "rare", "Messieurs"),
  c("stupaczuk", "Franco Stupaczuk", AR, "Messieurs", "rare", "Messieurs"),
  c("navarro", "Paquito Navarro", ES, "Messieurs", "rare", "Messieurs"),
  c("yanguas", "Mike Yanguas", ES, "Messieurs", "rare", "Messieurs"),
  c("augsburger", "Leo Augsburger", AR, "Messieurs", "rare", "Messieurs"),
  c("bela", "Fernando Belasteguín", AR, "Messieurs", "epic", "Légendes"),
  c("gonzalez", "Momo González", ES, "Messieurs", "common", "Messieurs"),
  c("garrido", "Javi Garrido", ES, "Messieurs", "common", "Messieurs"),
  c("nieto", "Coki Nieto", ES, "Messieurs", "common", "Messieurs"),
  c("sanz", "Jon Sanz", ES, "Messieurs", "common", "Messieurs"),
  c("tello", "Juan Tello", AR, "Messieurs", "common", "Messieurs"),
  c("sanyo", "Sanyo Gutiérrez", AR, "Messieurs", "rare", "Légendes"),
  c("lima", "Pablo Lima", ["Brésil", "🇧🇷"], "Messieurs", "rare", "Légendes"),
  // Dames
  c("ari", "Ari Sánchez", ES, "Dames", "legend", "Stars du circuit"),
  c("paula", "Paula Josemaría", ES, "Dames", "legend", "Stars du circuit"),
  c("triay", "Gemma Triay", ES, "Dames", "epic", "Stars du circuit"),
  c("brea", "Delfina Brea", AR, "Dames", "epic", "Stars du circuit"),
  c("bea", "Bea González", ES, "Dames", "rare", "Dames"),
  c("claudia", "Claudia Fernández", ES, "Dames", "rare", "Dames"),
  c("ortega", "Marta Ortega", ES, "Dames", "rare", "Dames"),
  c("araujo", "Sofía Araújo", PT, "Dames", "rare", "Dames"),
  c("salazar", "Alejandra Salazar", ES, "Dames", "rare", "Légendes"),
  c("ustero", "Andrea Ustero", ES, "Dames", "common", "Dames"),
  c("icardo", "Tamara Icardo", ES, "Dames", "common", "Dames"),
  c("osoro", "Aranzazu Osoro", ES, "Dames", "common", "Dames"),
  // France
  c("tison", "Benjamin Tison", FR, "Messieurs", "rare", "Équipe de France"),
  c("leygue", "Thomas Leygue", FR, "Messieurs", "common", "Équipe de France"),
  c("guichard", "Dylan Guichard", FR, "Messieurs", "common", "Équipe de France"),
  c("scatena", "Jérémy Scatena", FR, "Messieurs", "common", "Équipe de France"),
  c("collombon", "Alix Collombon", FR, "Dames", "rare", "Équipe de France"),
  c("godallier", "Léa Godallier", FR, "Dames", "common", "Équipe de France"),
];

export const PAGES = ["Stars du circuit", "Messieurs", "Dames", "Équipe de France", "Légendes"];

export function getCard(id: string) { return CARDS.find((x) => x.id === id) ?? null; }

export function drawCard(rand = Math.random, minRarity?: Rarity): CardDef {
  let roll = rand() * 100, rarity: Rarity = "common";
  for (const [r, p] of ODDS) { if (roll < p) { rarity = r; break; } roll -= p; }
  if (minRarity === "epic" && (rarity === "common" || rarity === "rare")) rarity = "epic";
  const pool = CARDS.filter((x) => x.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)]!;
}
