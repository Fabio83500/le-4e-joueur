// Secteurs du Var, villes et niveaux. Les tranches de classement sont modifiables ici.

export type SectorId = "toulon" | "hyeres" | "est" | "centre";

export const SECTORS: { id: SectorId; name: string; cities: string[] }[] = [
  {
    id: "toulon",
    name: "Toulon et ouest Var",
    cities: [
      "Toulon", "La Seyne-sur-Mer", "Six-Fours-les-Plages", "Sanary-sur-Mer", "Bandol",
      "Ollioules", "La Valette-du-Var", "La Garde", "Le Pradet", "La Crau",
      "Solliès-Pont", "Le Castellet", "Saint-Cyr-sur-Mer", "Le Beausset", "Carqueiranne",
    ],
  },
  {
    id: "hyeres",
    name: "Hyères et golfe de Saint-Tropez",
    cities: [
      "Hyères", "La Londe-les-Maures", "Bormes-les-Mimosas", "Le Lavandou", "Cogolin",
      "Grimaud", "Sainte-Maxime", "Saint-Tropez", "Ramatuelle", "Cavalaire-sur-Mer",
      "La Garde-Freinet",
    ],
  },
  {
    id: "est",
    name: "Fréjus, Saint-Raphaël et est Var",
    cities: [
      "Fréjus", "Saint-Raphaël", "Puget-sur-Argens", "Roquebrune-sur-Argens",
      "Le Muy", "Les Arcs", "Fayence",
    ],
  },
  {
    id: "centre",
    name: "Centre et nord Var",
    cities: [
      "Draguignan", "Brignoles", "Le Luc", "Vidauban", "Lorgues", "Saint-Maximin-la-Sainte-Baume",
      "Nans-les-Pins", "Carnoules", "Cuers", "Pignans",
    ],
  },
];

export const ALL_CITIES = SECTORS.flatMap((s) => s.cities).sort((a, b) => a.localeCompare(b, "fr"));

export function sectorOfCity(city: string): SectorId | null {
  return SECTORS.find((s) => s.cities.includes(city))?.id ?? null;
}

export function sectorName(id: string) {
  return SECTORS.find((s) => s.id === id)?.name ?? "Tout le Var";
}

export type LevelId = "debutant" | "inter" | "confirme" | "competiteur";

// Classement FFT : plus le nombre est petit, meilleur est le joueur.
export const LEVELS: { id: LevelId; name: string; range: string; test: (rank: number | null) => boolean }[] = [
  { id: "competiteur", name: "Compétiteurs", range: "Top 3 000", test: (r) => r !== null && r <= 3000 },
  { id: "confirme", name: "Confirmés", range: "Classement 3 001 à 10 000", test: (r) => r !== null && r > 3000 && r <= 10000 },
  { id: "inter", name: "Intermédiaires", range: "Classement 10 001 à 30 000", test: (r) => r !== null && r > 10000 && r <= 30000 },
  { id: "debutant", name: "Débutants et non classés", range: "Non classé ou au-delà de 30 000", test: () => true },
];

export function levelOf(rank: number | null): LevelId {
  return LEVELS.find((l) => l.test(rank))!.id;
}

export type Group = { id: string; level: LevelId; sector: SectorId | "var"; name: string; range: string; zone: string };

// Les compétiteurs sont peu nombreux : un seul groupe pour tout le Var.
export const GROUPS: Group[] = LEVELS.flatMap((l): Group[] =>
  l.id === "competiteur"
    ? [{ id: "competiteur-var", level: l.id, sector: "var" as const, name: l.name, range: l.range, zone: "Tout le Var" }]
    : SECTORS.map((s) => ({ id: `${l.id}-${s.id}`, level: l.id, sector: s.id, name: l.name, range: l.range, zone: s.name })),
);

export function groupFor(rank: number | null, sector: SectorId): string {
  const level = levelOf(rank);
  return level === "competiteur" ? "competiteur-var" : `${level}-${sector}`;
}

export function getGroup(id: string) {
  return GROUPS.find((g) => g.id === id) ?? null;
}

export const CATEGORIES = ["Raquettes", "Chaussures", "Sacs", "Balles", "Vêtements", "Accessoires"];
export const CONDITIONS = ["Neuf", "Comme neuf", "Très bon état", "Bon état", "Usé"];

export const CLUBS_SEED: { name: string; city: string; sector: SectorId; courts: string }[] = [
  { name: "Tennis Club Toulonnais (TCT)", city: "La Valette-du-Var", sector: "toulon", courts: "14 extérieurs" },
  { name: "Padel Saint Charles", city: "La Garde", sector: "toulon", courts: "7 extérieurs" },
  { name: "Padel Arena", city: "La Crau", sector: "toulon", courts: "7 couverts" },
  { name: "Smash Padel", city: "Le Castellet", sector: "toulon", courts: "7 couverts" },
  { name: "TMO Padel", city: "Ollioules", sector: "toulon", courts: "3 extérieurs" },
  { name: "Garden Padel", city: "Six-Fours-les-Plages", sector: "toulon", courts: "3 extérieurs" },
  { name: "Tennis Padel Club La Seyne", city: "La Seyne-sur-Mer", sector: "toulon", courts: "3 extérieurs" },
  { name: "Tennis Club de Solliès-Pont", city: "Solliès-Pont", sector: "toulon", courts: "3 extérieurs" },
  { name: "Tennis Club de Bandol", city: "Bandol", sector: "toulon", courts: "7 à 9 extérieurs" },
  { name: "Tennis Padel Club de Nans-les-Pins", city: "Nans-les-Pins", sector: "centre", courts: "" },
  { name: "Le Court, Padel Indoor", city: "Hyères", sector: "hyeres", courts: "2 couverts" },
  { name: "My Center Cogolin", city: "Cogolin", sector: "hyeres", courts: "4 extérieurs" },
  { name: "Tennis & Padel Ramatuelle", city: "Ramatuelle", sector: "hyeres", courts: "4 extérieurs" },
  { name: "Tennis & Padel La Romarine", city: "Ramatuelle", sector: "hyeres", courts: "1" },
  { name: "Ultimate Provence", city: "La Garde-Freinet", sector: "hyeres", courts: "2 extérieurs" },
  { name: "Pad&Ball", city: "Fréjus", sector: "est", courts: "5 couverts" },
  { name: "Tennis Pádel Galliéni", city: "Fréjus", sector: "est", courts: "3" },
  { name: "South Padel Park", city: "Puget-sur-Argens", sector: "est", courts: "6 dont 3 couverts" },
  { name: "Tennis Padel Club Pugetois", city: "Puget-sur-Argens", sector: "est", courts: "2 extérieurs" },
  { name: "Ultra Cap Esterel", city: "Saint-Raphaël", sector: "est", courts: "7 extérieurs" },
  { name: "Padel Au Five", city: "Saint-Raphaël", sector: "est", courts: "2 extérieurs" },
  { name: "Tennis Padel Club Agay", city: "Saint-Raphaël", sector: "est", courts: "2" },
  { name: "Saint-Raphaël Country Club", city: "Saint-Raphaël", sector: "est", courts: "" },
  { name: "Padel de la Bergerie", city: "Roquebrune-sur-Argens", sector: "est", courts: "3 extérieurs" },
  { name: "TC Roquebrune Les Issambres", city: "Roquebrune-sur-Argens", sector: "est", courts: "3 extérieurs" },
  { name: "Tennis Club Dracénois", city: "Draguignan", sector: "centre", courts: "8" },
];
