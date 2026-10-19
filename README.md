# TaskFlow

Plateforme collaborative de gestion de projets (type mini Trello / Linear), multi-organisations.
Projet d'apprentissage full-stack mené comme en entreprise : cahier des charges, sprints, revues de code.

## Sommaire

1. [Stack technique](#1-stack-technique)
2. [Avancement](#2-avancement)
3. [Structure du dépôt](#3-structure-du-dépôt)
4. [Installation et lancement](#4-installation-et-lancement)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Base de données](#6-base-de-données)
7. [API](#7-api)
8. [Authentification et autorisations](#8-authentification-et-autorisations)
9. [Décisions techniques](#9-décisions-techniques)
10. [Conventions](#10-conventions)
11. [Problèmes rencontrés et solutions](#11-problèmes-rencontrés-et-solutions)
12. [Commandes utiles](#12-commandes-utiles)
13. [Dette technique et suite](#13-dette-technique-et-suite)

---

## 1. Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React (Vite) + TypeScript |
| Backend | Node.js + Express 5 + TypeScript (CommonJS) |
| Base de données | PostgreSQL 16 (Docker) |
| ORM | Prisma **6.x** |
| Validation | zod |
| Auth | bcrypt + JWT (access token + refresh token) |
| Dev | tsx (hot reload), Docker Compose, Adminer |

Versions volontairement figées : TypeScript 5.x (pas 7), Prisma 6.x (pas 8, encore en release candidate). Voir [Décisions techniques](#9-décisions-techniques).

---

## 2. Avancement

| Sprint | Contenu | Statut |
|---|---|---|
| Sprint 0 | Setup repo, Docker, Express + TS, Prisma, schéma initial, squelette React, healthcheck | ✅ Terminé |
| Sprint 1 | Authentification : register, login, middleware, refresh, logout | ✅ Terminé |
| Sprint 2 | Organisations, invitations, rôles | 🔄 En cours |
| Sprint 3 | Projets + Kanban (colonnes, tâches) | ⏳ |
| Sprint 4 | Commentaires, labels, recherche et filtres | ⏳ |
| Sprint 5 | Dashboard, tests, polish, dockerisation finale | ⏳ |

### Détail du Sprint 2

- ✅ Création d'organisation (transaction `Organization` + `OrganizationMember` OWNER)
- ✅ Middleware `requireRole` (404 non-membre / 403 rôle insuffisant), testé
- ✅ Modèle `Invitation` migré (token unique, expiration, contrainte email + organisation)
- ⏳ Endpoint d'invitation `POST /api/organizations/:organizationId/invitations`
- ⏳ Acceptation d'invitation
- ⏳ Liste des organisations de l'utilisateur connecté

---

## 3. Structure du dépôt

```
taskflow/
├── docker-compose.yml        # PostgreSQL + Adminer
├── .env                      # Variables Docker (non commité)
├── client/                   # Frontend React + Vite
│   └── src/
│       ├── api/              # Appels au backend (fetch centralisé)
│       ├── components/       # Composants réutilisables
│       ├── pages/            # Une page = une route
│       ├── context/          # État global (utilisateur connecté)
│       ├── hooks/            # Hooks personnalisés
│       ├── types/            # Types TypeScript partagés
│       ├── utils/            # Fonctions utilitaires
│       ├── App.tsx
│       └── main.tsx
└── server/                   # Backend Express
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    ├── src/
    │   ├── config/prisma.ts          # Client Prisma (singleton)
    │   ├── controllers/              # Logique métier
    │   │   ├── authController.ts
    │   │   └── organizationController.ts
    │   ├── middlewares/
    │   │   ├── auth.ts               # authenticate
    │   │   └── requireRole.ts        # contrôle du rôle dans une organisation
    │   ├── routes/                   # Une route par domaine métier
    │   │   ├── auth.ts
    │   │   └── organization.ts
    │   ├── types/express.d.ts        # Extension du type Request (userId)
    │   ├── app.ts                    # Configuration Express
    │   └── server.ts                 # Point d'entrée
    ├── .env                          # Variables backend (non commité)
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

Règle d'organisation : **un fichier de routes par domaine métier** (pas par endpoint), et la logique séparée des routes (`routes/` dit quelles URLs existent, `controllers/` dit ce qu'elles font).

---

## 4. Installation et lancement

### Prérequis

- Node.js 22+
- Docker et Docker Compose
- Git

### 1. Base de données

À la racine, créer un fichier `.env` pour Docker (voir [section 5](#5-variables-denvironnement)), puis :

```bash
docker compose up -d
docker ps
```

Services exposés :

| Service | URL | Remarque |
|---|---|---|
| PostgreSQL | `localhost:5433` | Port 5433 côté hôte pour éviter un conflit avec un Postgres local sur 5432 |
| Adminer | `http://localhost:8080` | Serveur : `postgres` |

### 2. Backend

```bash
cd server
npm install --legacy-peer-deps
cp .env.example .env        # puis renseigner les valeurs
npx prisma migrate dev
npm run dev
```

Vérification : `GET http://localhost:4000/api/health` doit répondre `database: "Connected"`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Application sur `http://localhost:5173`.

### Scripts du backend

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur avec rechargement à chaud (`tsx watch`) |
| `npm run build` | Compilation TypeScript vers `dist/` |
| `npm start` | Lancement du build compilé |

---

## 5. Variables d'environnement

Ne jamais commiter un `.env`. Seul `.env.example` (clés sans valeurs) est versionné.

### `server/.env`

| Variable | Rôle |
|---|---|
| `PORT` | Port du serveur (4000) |
| `NODE_ENV` | `development` ou `production` |
| `DATABASE_URL` | URL de connexion PostgreSQL (`postgresql://user:password@localhost:5433/db?schema=public`) |
| `JWT_SECRET` | Clé de signature des access tokens |
| `JWT_REFRESH_SECRET` | Clé de signature des refresh tokens (**différente** de la précédente) |
| `CLIENT_URL` | URL du frontend, utilisée pour construire les liens d'invitation |

Générer une clé secrète (à lancer une fois par clé) :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### `.env` racine (Docker Compose)

`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` : doivent correspondre exactement aux identifiants de `DATABASE_URL`.

Le fichier `.env` est lu **au démarrage uniquement** : après toute modification, redémarrer le serveur.

---

## 6. Base de données

### Modèles

| Modèle | Rôle |
|---|---|
| `User` | Compte utilisateur (email unique, `passwordHash`) |
| `Organization` | Espace de travail |
| `OrganizationMember` | Lien utilisateur / organisation avec un `Role` (`OWNER`, `MEMBER`) ; unique sur `(userId, organizationId)` |
| `Project` | Projet rattaché à une organisation |
| `BoardColumn` | Colonne du Kanban (champ `position`) |
| `Task` | Tâche (assignation optionnelle via la relation nommée `TaskAssignee`) |
| `Label` / `TaskLabel` | Labels et table de jointure many-to-many |
| `Comment` | Commentaire sur une tâche |
| `Invitation` | Invitation par email (voir ci-dessous) |

### Modèle `Invitation`

| Champ | Détail |
|---|---|
| `email` | Adresse invitée (normalisée en minuscules) |
| `token` | Chaîne aléatoire, `@unique` |
| `status` | Enum `InvitationStatus` : `PENDING` (défaut), `ACCEPTED`, `CANCELLED` |
| `expiresAt` | Date limite de validité (7 jours prévus) |
| `role` | Rôle attribué à l'arrivée |
| `invitedBy` | Utilisateur qui a invité |

Contrainte `@@unique([email, organizationId])` : une seule ligne par couple email + organisation. Une ré-invitation **réutilise** la ligne existante (`upsert` : nouveau token, nouvelle expiration, statut remis à `PENDING`). Conséquence assumée : on ne garde pas l'historique des invitations passées.

### Historique des migrations

| Migration | Objet |
|---|---|
| `init_models` | Création des 9 modèles initiaux |
| `rename_column_to_boardcolunm_and_order_to_position` | `Column` renommé `BoardColumn` (mot réservé SQL) et `order` renommé `position` (mot réservé SQL) |
| `add_invitation` | Modèle `Invitation` et enum `InvitationStatus` |

Remarque : les clés étrangères sont en `ON DELETE RESTRICT` (défaut Prisma). Supprimer une organisation ou un utilisateur tant qu'il reste des invitations liées sera refusé : à traiter (cascade ou suppression explicite) quand la suppression sera implémentée.

### Client Prisma (singleton)

`src/config/prisma.ts` exporte **une seule instance** de `PrismaClient`, stockée sur `globalThis` hors production. Sans cela, le rechargement à chaud recrée un client à chaque sauvegarde et finit par saturer les connexions. Toujours importer `{ prisma }` depuis ce fichier, jamais `new PrismaClient()` ailleurs.

---

## 7. API

Toutes les routes sont préfixées par `/api`. Format d'erreur unique : `{ "message": "..." }`.

| Méthode | Route | Protection | Description |
|---|---|---|---|
| GET | `/api/health` | Publique | État du serveur et de la connexion à la base (200 ou 503) |
| POST | `/api/auth/register` | Publique | Inscription (201, 409 si email déjà pris) |
| POST | `/api/auth/login` | Publique | Connexion, renvoie `token` et `refreshToken` |
| POST | `/api/auth/refresh` | Publique | Nouveau `token` à partir d'un `refreshToken` valide |
| POST | `/api/auth/logout` | Publique | Déconnexion (voir [décisions](#9-décisions-techniques)) |
| POST | `/api/organizations` | `authenticate` | Crée une organisation dont l'appelant devient OWNER |
| POST | `/api/organizations/:organizationId/invitations` | `authenticate` + OWNER | **À venir** |

### Validation

- `register` : `name` (3 caractères min.), `email` (format valide, `trim` + `toLowerCase`), `password` (6 caractères min.)
- `login` : même normalisation de l'email, mot de passe en simple chaîne
- Les erreurs de validation renvoient `400` avec les erreurs par champ (`flatten().fieldErrors`)

---

## 8. Authentification et autorisations

### Tokens

| Token | Durée | Clé | Usage |
|---|---|---|---|
| Access token | 15 minutes | `JWT_SECRET` | Envoyé à chaque requête protégée : `Authorization: Bearer <token>` |
| Refresh token | 7 jours | `JWT_REFRESH_SECRET` | Uniquement pour obtenir un nouvel access token via `/api/auth/refresh` |

Deux clés distinctes : un token signé pour un usage ne peut pas être utilisé pour l'autre. Le payload ne contient que `userId`, jamais de donnée sensible (un JWT est signé, pas chiffré).

### Middlewares

**`authenticate`** : répond à « qui es-tu ? ». Vérifie le header `Authorization`, valide le token, attache `req.userId`, puis appelle `next()`. Sinon `401`.

**`requireRole(['OWNER'])`** : répond à « as-tu le droit dans *cette* organisation ? ». Lit `:organizationId` dans l'URL, cherche la ligne `OrganizationMember` correspondante :

| Situation | Réponse |
|---|---|
| Pas membre de l'organisation | `404` (on ne révèle pas l'existence de l'organisation) |
| Membre avec un rôle non autorisé | `403` |
| Membre avec un rôle autorisé | `next()` |

Usage : `router.post('/:organizationId/invitations', authenticate, requireRole(['OWNER']), handler)`.

Le type `Request` est étendu dans `src/types/express.d.ts` pour déclarer `userId?: string`.

---

## 9. Décisions techniques

| Décision | Raison |
|---|---|
| Multi-organisations dès le MVP | Norme des SaaS B2B ; très difficile à ajouter après coup sur une base en production |
| Temps réel et facturation reportés en V2 | Rester concentré sur le cœur métier |
| Prisma 6 (pas 8) | Prisma 8 introduit un workflow entièrement différent (contrats, nouvelles commandes de migration) et est encore en release candidate ; outillage et documentation de la 6.x bien plus stables |
| TypeScript 5.x (pas 7) | `ts-node` n'est pas compatible avec TypeScript 7 ; l'écosystème n'a pas encore suivi |
| `tsx` à la place de `ts-node-dev` | Plus rapide, maintenu, standard actuel pour le hot reload |
| CommonJS (pas de `"type": "module"`) | Cohérent avec `tsconfig` (`"module": "commonjs"`) ; migration ESM possible plus tard |
| Préfixe `/api` sur toutes les routes | Sépare clairement l'API du reste, permet le versionnement et simplifie le routage en déploiement |
| UUID plutôt qu'entiers auto-incrémentés | Identifiants non énumérables, important en multi-organisations |
| Transaction à la création d'organisation | Atomicité : l'organisation et son OWNER sont créés ensemble ou pas du tout (sinon organisation orpheline) |
| Même réponse `401 Invalid credentials` pour email inconnu et mauvais mot de passe | Empêche l'énumération de comptes |
| Email normalisé (`trim` + `toLowerCase`) partout | Évite les doublons de casse et les échecs de connexion |
| `select` sans `passwordHash` à la création d'un utilisateur | Le hash ne sort jamais dans une réponse |
| Logout côté client uniquement | Un JWT ne peut pas être annulé côté serveur sans liste de révocation ; l'access token expire en 15 minutes. Liste noire en base envisageable en V2 |
| Une seule ligne `Invitation` par email + organisation | Évite les invitations simultanées multiples ; réutilisation par `upsert` |
| Rôle fixé à `MEMBER` côté serveur lors d'une invitation | Un seul OWNER par organisation dans le MVP ; le body ne contient que l'email |
| Token d'invitation : `randomBytes(32)`, jamais `Math.random()` | `Math.random()` est prévisible |

---

## 10. Conventions

### Commits (Conventional Commits)

Format : `type(scope): description courte`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Configuration, dépendances, maintenance |
| `docs` | Documentation |
| `refactor` | Réécriture sans changement de comportement |
| `test` | Tests |

Exemples : `chore(server): setup Express, TypeScript and Prisma with PostgreSQL`, `feat(auth): add role-based access middleware`.

Commits **atomiques** : une idée cohérente par commit. Le nom du sprint n'apparaît pas dans le message.

### Branches

- `main` : toujours stable
- Une branche par sprint (`sprint1`, `sprint2`...), mergée dans `main` par Pull Request (merge commit), puis la suivante est créée depuis un `main` à jour
- Un modèle `develop` / `production` ne deviendra utile qu'avec un vrai déploiement

### Code

- Format d'erreur unique : `{ message: "..." }`, en anglais
- Codes HTTP : `200` / `201` succès, `400` validation, `401` authentification, `403` rôle insuffisant, `404` introuvable ou accès caché, `409` conflit, `500` erreur serveur (message générique, détail dans les logs uniquement)
- Ne jamais renvoyer `error.message` brut au client
- Nommage : dossiers par rôle (`controllers/authController.ts`), champs de relation Prisma en camelCase minuscule
- Un schéma zod se définit **hors** de la fonction (pas recréé à chaque requête)
- Importer le client Prisma uniquement depuis `config/prisma.ts`

---

## 11. Problèmes rencontrés et solutions

| Symptôme | Cause | Solution |
|---|---|---|
| `mkdir -p` échoue sous PowerShell | Syntaxe bash | `mkdir dossier1, dossier2` (PowerShell) |
| `Cannot read properties of undefined (reading 'fileExists')` au lancement | TypeScript 7 incompatible avec `ts-node` | TypeScript 5.x + `tsx` |
| `npm install` : `Cannot read properties of null (reading 'edgesOut')` | Bug du résolveur npm (arborist) | `npm install --legacy-peer-deps` ; en dernier recours supprimer `node_modules` et `package-lock.json` |
| `prisma init` ne crée pas `schema.prisma`, dossiers `.claude`, `.cursor`... | Comportement de Prisma 8 | Retour à Prisma 6 ; supprimer `prisma.config.ts`, `.agents`, `.claude`, `.cursor`, `.devin`, `prisma-8.md` |
| Erreur `datasource property url is no longer supported` dans VS Code | Faux positif de l'extension Prisma (language server de la v7) | Ignorer ; seule la sortie du terminal fait foi |
| `P1000 Authentication failed ... (not available)` | Un Postgres Windows natif occupait déjà le port 5432 | Exposer le conteneur sur `5433:5432` et adapter `DATABASE_URL` ; vérifier avec `netstat -ano \| findstr :5432` |
| Identifiants Postgres ignorés après modification | Le volume garde les identifiants du premier démarrage | `docker compose down -v` (supprime les données) puis `up -d` |
| Prisma Studio vide, une seule table | Le schéma ne contenait pas encore les modèles | Ajouter les modèles puis `npx prisma migrate dev` |
| `Property 'userId' does not exist on type 'Request'` | Le type Express ne connaît pas `userId` | Fichier `src/types/express.d.ts` (module augmentation) |
| `Type 'string \| string[]' is not assignable to type 'string'` sur `req.params` | Typage d'Express 5 | `if (typeof organizationId !== "string") return ...` |
| `jsonwebtoken has no exported member named 'jwt'` | Mauvais import | `import jwt from "jsonwebtoken"` (export par défaut, sans accolades) |
| Login : `500` avec `secretOrPrivateKey must have a value` | `JWT_SECRET` / `JWT_REFRESH_SECRET` absents du `.env` | Ajouter les clés et **redémarrer** le serveur |
| `bcrypt.compare` toujours « valide » | `await` manquant (une Promise est toujours truthy) | `const ok = await bcrypt.compare(...)` puis `if (!ok)` |
| `useEffect` exécuté deux fois en développement | `StrictMode` monte, démonte, remonte volontairement | Normal en dev uniquement, absent en production |
| `fetch` : `Failed to fetch` non attrapé | Serveur injoignable : la Promise est rejetée | `try/catch` autour du `fetch`, en plus du test sur `response.ok` |

---

## 12. Commandes utiles

### Prisma (à lancer depuis `server/`)

| Commande | Usage |
|---|---|
| `npx prisma migrate dev --name <nom>` | Crée et applique une migration (développement) |
| `npx prisma migrate deploy` | Applique les migrations existantes (production) |
| `npx prisma migrate reset` | Recrée la base vide et rejoue toutes les migrations |
| `npx prisma migrate status` | État des migrations |
| `npx prisma validate` | Valide le schéma sans toucher à la base |
| `npx prisma format` | Réaligne `schema.prisma` |
| `npx prisma generate` | Régénère le client TypeScript |
| `npx prisma studio` | Interface de consultation sur `localhost:5555` |
| `npx prisma db push` | Synchronise le schéma sans créer de migration (à éviter hors prototypage) |

Après chaque migration, relire le `migration.sql` généré. Attention : renommer un modèle ou un champ est interprété comme suppression + création (perte de données sur une base remplie).

### Docker

```bash
docker compose up -d        # démarrer
docker compose stop         # arrêter sans supprimer
docker compose down         # supprimer les conteneurs (garde le volume)
docker compose down -v      # supprime aussi le volume (données perdues)
docker logs postgres_db     # logs de PostgreSQL
```

### Tester l'API

Thunder Client (VS Code) ou Postman. Header des routes protégées : `Authorization: Bearer <valeur du champ "token">` (**pas** le `refreshToken`).

---

## 13. Dette technique et suite

### À faire dans le Sprint 2

1. Controller et route d'invitation : validation zod de l'email, vérification que la personne n'est pas déjà membre (chercher le `User` par email, puis `OrganizationMember`), token, expiration à 7 jours, `upsert`, lien `${CLIENT_URL}/invitations/<token>`
2. Acceptation d'invitation : gérer les deux cas (compte existant ou à créer), vérifier statut et expiration
3. Liste des organisations de l'utilisateur
4. Mettre à jour le cahier des charges (section 6 : modèle `Invitation`)

### Dette technique connue

- **Envoi d'email simulé** : le lien d'invitation est renvoyé dans la réponse de l'API. À remplacer par un vrai envoi avant toute mise en production
- **Validation des variables d'environnement au démarrage** (fail fast) : le serveur démarre aujourd'hui même si `JWT_SECRET` manque, et ne plante qu'à la première connexion. Prévoir un `src/config/env.ts` validé avec zod
- **Pas de révocation de refresh token** : logout purement côté client
- **Stockage du refresh token côté client** : cookie `httpOnly` à mettre en place avec le frontend
- **Formulaires de login/register** : pas encore d'interface, tests faits via Thunder Client
- **Indicateur de chargement** (loading / success / error) à prévoir dès les formulaires
- **Tests automatisés** (Vitest/Jest + Supertest) à ajouter ; `app.ts` est séparé de `server.ts` pour permettre de tester sans démarrer de serveur
- **Clés JWT** : toute clé apparue en clair hors d'un `.env` doit être régénérée avant la production