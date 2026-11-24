# Le 4e Joueur

Web app pour les joueurs de padel du Var : groupes par niveau vérifié (TenUp), parties « il manque un 4e », et marketplace d'équipement d'occasion.

## Lancer en local

```bash
npm install
ADMIN_EMAIL=ton@email.fr npm run dev
```

Ouvre http://localhost:3000. Sans `DATABASE_URL`, une base Postgres intégrée est créée dans `.data/`.
Le compte créé avec l'e-mail `ADMIN_EMAIL` a accès à l'espace admin (validation des niveaux, partenaires).

## Mise en ligne

- Base : un Postgres (Supabase ou Neon, offre gratuite). Renseigner `DATABASE_URL`.
- Hébergement : Vercel. Variables `DATABASE_URL` et `ADMIN_EMAIL`.
- Les tables sont créées automatiquement au premier lancement.

## Où modifier quoi

- Secteurs, villes, tranches de classement, catégories, clubs : `src/lib/var.ts`
- Couleurs et styles : `src/app/globals.css`
- Schéma de la base : `src/db/schema.ts`
