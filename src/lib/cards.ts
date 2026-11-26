// Cartes à collectionner. Joueurs entièrement imaginaires (noms, classement, illustrations génériques) :
// aucun vrai joueur n'est représenté. Les identifiants internes (id) restent ceux d'origine pour ne pas
// casser les collections déjà ouvertes ; ils ne sont jamais affichés.

export type Rarity = "common" | "rare" | "epic" | "legend";
export const RARITY_LABEL: Record<Rarity, string> = { common: "Commune", rare: "Rare", epic: "Épique", legend: "Légendaire" };
// Probabilité de chaque rareté pour une carte de pack (sur 100).
export const ODDS: [Rarity, number][] = [["legend", 1.5], ["epic", 5.5], ["rare", 23], ["common", 70]];
export const PACK_SIZE = 3;
export const STREAK_BONUS_DAYS = 7;

export type CardDef = { id: string; name: string; country: string; flag: string; tour: "Messieurs" | "Dames"; rarity: Rarity; page: string; rank?: number };

// Classement imaginaire du circuit. Top 4 = légendaire, 5 à 10 = épique, 11 à 20 = rare, 21 à 30 = commune.
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
    [1, "coello", "Rafa Montenegro", "ES"], [1, "tapia", "Nico Ferraro", "AR"], [3, "galan", "Álvaro Quintana", "ES"],
    [3, "chingotto", "Bruno Castellani", "AR"], [5, "lebron", "Diego Robledo", "ES"], [6, "augsburger", "Tomás Ledesma", "AR"],
    [7, "stupaczuk", "Ivo Brizuela", "AR"], [8, "sanz", "Unai Larrea", "ES"], [9, "navarro", "Curro Villalba", "ES"],
    [10, "dinenno", "Gael Pellegrini", "AR"], [11, "yanguas", "Hugo Arriaga", "ES"], [12, "guerrero", "Marcos Ballester", "ES"],
    [13, "gonzalez", "Toni Escrivá", "ES"], [14, "tello", "Facu Medina", "AR"], [15, "nieto", "Pepe Carrasco", "ES"],
    [16, "arce", "Lauti Benítez", "AR"], [17, "alfonso", "Santi Olmedo", "AR"], [18, "leal", "Dani Cortés", "ES"],
    [19, "libaak", "Thiago Arrieta", "AR"], [20, "campagnolo", "Caio Ribeiro", "BR"], [21, "ealonso", "Pablo Sotomayor", "ES"],
    [22, "bergamini", "Rafael Lacerda", "BR"], [23, "goni", "Iker Zubiri", "ES"], [24, "bautista", "Óscar Peñalver", "ES"],
    [25, "garrido", "Rubén Montero", "ES"], [26, "jgarcia", "Adri Salcedo", "ES"], [27, "esbri", "Joan Ferrer", "ES"],
    [28, "jofre", "Karim Al Nasser", "AE"], [29, "cgutierrez", "Matías Quiroga", "AR"], [30, "jimenez", "Sergio Lozano", "ES"],
  ]),
  ...ranked("Dames", "Dames", [
    [1, "triay", "Lucía Mallol", "ES"], [1, "brea", "Camila Ríos", "AR"], [3, "bea", "Irene Solana", "ES"],
    [4, "ari", "Noa Aranda", "ES"], [5, "claudia", "Elena Prieto", "ES"], [6, "ustero", "Carla Ibarra", "ES"],
    [7, "paula", "Laia Puig", "ES"], [8, "calvo", "Inés Barrios", "ES"], [9, "jensen", "Julieta Ponce", "AR"],
    [10, "araujo", "Beatriz Sequeira", "PT"], [11, "ortega", "Ainhoa Echeverría", "ES"], [12, "icardo", "Rocío Navas", "ES"],
    [13, "aalonso", "Sara Montoya", "ES"], [14, "guinart", "Mireia Soler", "ES"], [15, "virseda", "Celia Aguado", "ES"],
    [16, "osoro", "Florencia Paz", "AR"], [17, "salazar", "Lorena Vidal", "ES"], [18, "caldera", "Alba Herrera", "ES"],
    [19, "goenaga", "Itziar Olano", "ES"], [20, "eugenio", "Marina Cuesta", "ES"], [21, "nrodriguez", "Nerea Gil", "ES"],
    [22, "dalpozzo", "Chiara Bellini", "IT"], [23, "iglesias", "Clara Benavente", "ES"], [24, "rufo", "Eva Moya", "ES"],
    [25, "fassio", "Agustina Luna", "AR"], [26, "velasco", "Paloma Reyes", "ES"], [27, "llaguno", "Silvia Cano", "ES"],
    [28, "castello", "Ana Bosch", "ES"], [29, "sainz", "Teresa Galindo", "ES"], [30, "mbarrera", "Olga Serrano", "ES"],
  ]),
  // Équipe de France (imaginaire) : cartes rares, pour qu'elles restent spéciales.
  ...extra("Messieurs", "Équipe de France", "rare", [["guichard", "Kévin Rouvier", "FR"], ["leygue", "Mathis Giraud", "FR"], ["tison", "Yanis Ferrand", "FR"], ["scatena", "Hugo Delmas", "FR"]]),
  ...extra("Dames", "Équipe de France", "rare", [["collombon", "Manon Peyrac", "FR"], ["godallier", "Chloé Vasseur", "FR"], ["touly", "Inès Morel", "FR"]]),
  ...extra("Messieurs", "Légendes", "epic", [["bela", "Rodrigo Albornoz", "AR"], ["sanyo", "Ezequiel Varela", "AR"], ["lima", "Thiago Moura", "BR"]]),
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
