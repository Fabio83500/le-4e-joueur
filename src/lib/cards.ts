// Cartes à collectionner. Joueurs pros : nom et pays uniquement, illustrations génériques.
// ⚠️ Avant un lancement public : obtenir une licence ou remplacer cette liste (droit à l'image).

export type Rarity = "common" | "rare" | "epic" | "legend";
export const RARITY_LABEL: Record<Rarity, string> = { common: "Commune", rare: "Rare", epic: "Épique", legend: "Légendaire" };
// Probabilité de chaque rareté pour une carte de pack (sur 100).
export const ODDS: [Rarity, number][] = [["legend", 1.5], ["epic", 5.5], ["rare", 23], ["common", 70]];
export const PACK_SIZE = 3;
export const STREAK_BONUS_DAYS = 7;

export type CardDef = { id: string; name: string; country: string; flag: string; tour: "Messieurs" | "Dames"; rarity: Rarity; page: string; rank?: number };

// Classement FIP du 23/11/2026. Top 4 = légendaire, 5 à 10 = épique, 11 à 20 = rare, 21 à 30 = commune.
export const RANKING_DATE = "23/11/2026";
const C: Record<string, [string, string]> = {
  ES: ["Espagne", "🇪🇸"], AR: ["Argentine", "🇦🇷"], FR: ["France", "🇫🇷"], IT: ["Italie", "🇮🇹"],
  PT: ["Portugal", "🇵🇹"], BR: ["Brésil", "🇧🇷"], AE: ["Émirats arabes unis", "🇦🇪"],
};
const rarityOf = (rank: number): Rarity => (rank <= 4 ? "legend" : rank <= 10 ? "epic" : rank <= 20 ? "rare" : "common");
const ranked = (tour: CardDef["tour"], page: string, rows: [number, string, string, string][]): CardDef[] =>
  rows.map(([rank, id, name, cc]) => ({ id, name, country: C[cc]![0], flag: C[cc]![1], tour, rarity: rarityOf(rank), page, rank }));
const extra = (tour: CardDef["tour"], page: string, rarity: Rarity, rows: [string, string, string, number?][]): CardDef[] =>
  rows.map(([id, name, cc, rank]) => ({ id, name, country: C[cc]![0], flag: C[cc]![1], tour, rarity, page, rank }));

export const CARDS: CardDef[] = [
  ...ranked("Messieurs", "Messieurs", [
    [1, "coello", "Arturo Coello", "ES"], [1, "tapia", "Agustín Tapia", "AR"], [3, "galan", "Alejandro Galán", "ES"],
    [3, "chingotto", "Federico Chingotto", "AR"], [5, "lebron", "Juan Lebrón", "ES"], [6, "augsburger", "Leo Augsburger", "AR"],
    [7, "stupaczuk", "Franco Stupaczuk", "AR"], [8, "sanz", "Jon Sanz", "ES"], [9, "navarro", "Paquito Navarro", "ES"],
    [10, "dinenno", "Martín Di Nenno", "AR"], [11, "yanguas", "Mike Yanguas", "ES"], [12, "guerrero", "Fran Guerrero", "ES"],
    [13, "gonzalez", "Momo González", "ES"], [14, "tello", "Juan Tello", "AR"], [15, "nieto", "Coki Nieto", "ES"],
    [16, "arce", "Maxi Arce", "AR"], [17, "alfonso", "Gonzalo Alfonso", "AR"], [18, "leal", "Javi Leal", "ES"],
    [19, "libaak", "Valentino Libaak", "AR"], [20, "campagnolo", "Lucas Campagnolo", "BR"], [21, "ealonso", "Eduardo Alonso", "ES"],
    [22, "bergamini", "Lucas Bergamini", "BR"], [23, "goni", "Aimar Goñi", "ES"], [24, "bautista", "Jairo Bautista", "ES"],
    [25, "garrido", "Javi Garrido", "ES"], [26, "jgarcia", "Javi García", "ES"], [27, "esbri", "Juanlu Esbrí", "ES"],
    [28, "jofre", "Iñigo Jofre", "AE"], [29, "cgutierrez", "Carlos Gutiérrez", "AR"], [30, "jimenez", "José Jiménez", "ES"],
  ]),
  ...ranked("Dames", "Dames", [
    [1, "triay", "Gemma Triay", "ES"], [1, "brea", "Delfina Brea", "AR"], [3, "bea", "Bea González", "ES"],
    [4, "ari", "Ari Sánchez", "ES"], [5, "claudia", "Claudia Fernández", "ES"], [6, "ustero", "Andrea Ustero", "ES"],
    [7, "paula", "Paula Josemaría", "ES"], [8, "calvo", "Martina Calvo", "ES"], [9, "jensen", "Claudia Jensen", "AR"],
    [10, "araujo", "Sofía Araújo", "PT"], [11, "ortega", "Marta Ortega", "ES"], [12, "icardo", "Tamara Icardo", "ES"],
    [13, "aalonso", "Alejandra Alonso", "ES"], [14, "guinart", "Marina Guinart", "ES"], [15, "virseda", "Verónica Virseda", "ES"],
    [16, "osoro", "Aranzazu Osoro", "AR"], [17, "salazar", "Alejandra Salazar", "ES"], [18, "caldera", "Bea Caldera", "ES"],
    [19, "goenaga", "Carmen Goenaga", "ES"], [20, "eugenio", "Raquel Eugenio", "ES"], [21, "nrodriguez", "Nuria Rodríguez", "ES"],
    [22, "dalpozzo", "Giulia Dal Pozzo", "IT"], [23, "iglesias", "Victoria Iglesias", "ES"], [24, "rufo", "Lorena Rufo", "ES"],
    [25, "fassio", "Martina Fassio", "AR"], [26, "velasco", "Jimena Velasco", "ES"], [27, "llaguno", "Patricia Llaguno", "ES"],
    [28, "castello", "Jessica Castelló", "ES"], [29, "sainz", "Lucía Sainz", "ES"], [30, "mbarrera", "Marta Barrera", "ES"],
  ]),
  // Les Français sont hors du top 30 : cartes rares, pour qu'ils restent spéciaux.
  ...extra("Messieurs", "Équipe de France", "rare", [["guichard", "Dylan Guichard", "FR", 79], ["leygue", "Thomas Leygue", "FR"], ["tison", "Benjamin Tison", "FR"], ["scatena", "Jérémy Scatena", "FR"]]),
  ...extra("Dames", "Équipe de France", "rare", [["collombon", "Alix Collombon", "FR", 42], ["godallier", "Léa Godallier", "FR", 50], ["touly", "Carla Touly", "FR", 96]]),
  ...extra("Messieurs", "Légendes", "epic", [["bela", "Fernando Belasteguín", "AR"], ["sanyo", "Sanyo Gutiérrez", "AR"], ["lima", "Pablo Lima", "BR"]]),
];

export const PAGES = ["Messieurs", "Dames", "Équipe de France", "Légendes"];

export function getCard(id: string) { return CARDS.find((x) => x.id === id) ?? null; }

export function drawCard(rand = Math.random, minRarity?: Rarity): CardDef {
  let roll = rand() * 100, rarity: Rarity = "common";
  for (const [r, p] of ODDS) { if (roll < p) { rarity = r; break; } roll -= p; }
  if (minRarity === "epic" && (rarity === "common" || rarity === "rare")) rarity = "epic";
  const pool = CARDS.filter((x) => x.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)]!;
}
