# TaskFlow : tests d'API

Guide pour tester l'API à la main avec Thunder Client ou Postman.

## Avant de commencer

- Serveur lancé (`npm run dev` dans `server/`) et PostgreSQL démarré (`docker compose up -d`)
- URL de base : `http://localhost:4000`
- Format des erreurs : toujours `{ "message": "..." }`
- Routes protégées : ajouter ce header

```
Authorization: Bearer <valeur du champ "token">
```

Attention : utiliser le champ `token` (access token, valable 15 minutes), **pas** `refreshToken`. Quand il expire, les routes protégées répondent `401` : refaire un login ou appeler `/api/auth/refresh`.

Pour tous les `POST` avec un body : header `Content-Type: application/json` (ajouté automatiquement par Thunder Client quand le body est en JSON).

## Sommaire

| # | Méthode | Route | Protection |
|---|---|---|---|
| 1 | GET | `/api/health` | Publique |
| 2 | POST | `/api/auth/register` | Publique |
| 3 | POST | `/api/auth/login` | Publique |
| 4 | POST | `/api/auth/refresh` | Publique |
| 5 | POST | `/api/auth/logout` | Publique |
| 6 | POST | `/api/organizations` | Token |
| 7 | POST | `/api/organizations/:organizationId/invitations` | Token + OWNER |
| 8 | GET | `/api/organizations/:organizationId/invitations` | Token + OWNER |
| 9 | POST | `/api/organizations/:organizationId/invitations/:invitationId/cancel` | Token + OWNER |
| 10 | GET | `/api/invitations/:token` | Publique |
| 11 | POST | `/api/invitations/:token/accept` | Token |

---

## 1. Health check

```
GET http://localhost:4000/api/health
```

Pas de body.

**200** : serveur et base OK
```json
{
  "status": "Ok",
  "database": "Connected",
  "timestamp": "2026-10-19T06:51:58.105Z"
}
```

**503** : base injoignable (arrêter Docker pour le provoquer)
```json
{
  "status": "Error",
  "database": "Disconnected",
  "timestamp": "2026-10-19T06:51:58.105Z"
}
```

---

## 2. Inscription

```
POST http://localhost:4000/api/auth/register
```

Body :
```json
{
  "name": "Hasina",
  "email": "hasina@gmail.com",
  "password": "motdepasse123"
}
```

Règles : `name` 3 caractères minimum, `email` valide (mis en minuscules et nettoyé automatiquement), `password` 6 caractères minimum.

**201** : compte créé (le `passwordHash` n'est jamais renvoyé)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "8c6bb6a7-3e69-4fc7-a636-2f4f928671b1",
    "email": "hasina@gmail.com",
    "name": "Hasina",
    "createdAt": "2026-10-19T06:51:58.105Z"
  }
}
```

**409** : email déjà utilisé (y compris avec une casse différente, ex. `Hasina@Gmail.com`)
```json
{ "message": "User with this email already exists" }
```

**400** : données invalides
```json
{
  "message": "Invalid input",
  "error": { "email": ["Invalid email address"] }
}
```

Cas à tester : email sans `@`, mot de passe de 3 caractères, champ manquant, email déjà pris en changeant la casse.

---

## 3. Connexion

```
POST http://localhost:4000/api/auth/login
```

Body (pas de `name` ici) :
```json
{
  "email": "hasina@gmail.com",
  "password": "motdepasse123"
}
```

**200**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "8c6bb6a7-3e69-4fc7-a636-2f4f928671b1",
    "email": "hasina@gmail.com",
    "name": "Hasina"
  }
}
```

**401** : email inconnu **ou** mauvais mot de passe (même réponse volontairement, pour ne pas révéler quels emails existent)
```json
{ "message": "Invalid credentials" }
```

**400** : body invalide (email mal formé, champ manquant)

**500** : si `JWT_SECRET` ou `JWT_REFRESH_SECRET` manque dans `server/.env` (voir les logs du serveur)

Conserver `token` et `refreshToken` pour les tests suivants.

---

## 4. Rafraîchir le token

```
POST http://localhost:4000/api/auth/refresh
```

Body :
```json
{
  "refreshToken": "<valeur du champ refreshToken reçu au login>"
}
```

**200** : nouvel access token
```json
{ "token": "eyJhbGciOi..." }
```

**400** : champ absent
```json
{ "message": "Refresh token is required" }
```

**401** : refresh token invalide, expiré, ou **access token envoyé par erreur** (clés de signature différentes)
```json
{ "message": "Invalid or expired refresh token" }
```

---

## 5. Déconnexion

```
POST http://localhost:4000/api/auth/logout
```

Pas de body.

**200**
```json
{ "message": "Logged out successfully" }
```

Le serveur ne révoque rien : c'est le client qui doit supprimer ses tokens. L'access token reste techniquement valable jusqu'à son expiration (15 minutes).

---

## 6. Créer une organisation

```
POST http://localhost:4000/api/organizations
Authorization: Bearer <token>
```

Body :
```json
{
  "name": "Ma première organisation"
}
```

**201** : l'organisation **et** le membership OWNER sont créés dans la même transaction
```json
{
  "message": "Organization created successfully",
  "organization": {
    "id": "915d966a-cfc9-44be-95f4-628900030550",
    "name": "Ma première organisation",
    "createdAt": "2026-10-19T07:00:00.000Z"
  },
  "membership": {
    "id": "c5711783-7b47-40d3-9005-0e718089b35c",
    "role": "OWNER",
    "userId": "8c6bb6a7-3e69-4fc7-a636-2f4f928671b1",
    "organizationId": "915d966a-cfc9-44be-95f4-628900030550"
  }
}
```

Conserver `organization.id` pour les tests suivants.

**400** : nom absent, vide ou composé uniquement d'espaces
```json
{ "message": "Invalid organization name" }
```

**401** : pas de header `Authorization`
```json
{ "message": "Authentication required" }
```

**401** : token invalide ou expiré
```json
{ "message": "Invalid or expired token" }
```

Vérification : dans Prisma Studio, les tables `Organization` et `OrganizationMember` contiennent chacune une nouvelle ligne.

---

## 7. Inviter un membre

```
POST http://localhost:4000/api/organizations/<organizationId>/invitations
Authorization: Bearer <token d'un OWNER>
```

Body (seul l'email est envoyé : le rôle est fixé à `MEMBER` côté serveur) :
```json
{
  "email": "collegue@gmail.com"
}
```

**201**
```json
{
  "message": "Invitation created successfully",
  "invitationLink": "http://localhost:5173/invitations/<token de 64 caractères>"
}
```

| Cas | Statut |
|---|---|
| OWNER invite un email nouveau | `201` avec le lien |
| Même email invité une 2e fois | `201` avec un **nouveau token** ; toujours une seule ligne en base |
| La personne est déjà membre | `409` `User is already a member of this organization` |
| Email invalide ou body vide | `400` `Invalid input` |
| Appelant `MEMBER` (pas OWNER) | `403` |
| Appelant non membre, ou organisation inexistante | `404` |
| Pas de token | `401` |

Le lien est renvoyé dans la réponse uniquement parce que l'envoi d'email est simulé dans le MVP.

---

## 8. Lister les invitations en attente

```
GET http://localhost:4000/api/organizations/<organizationId>/invitations
Authorization: Bearer <token d'un OWNER>
```

Pas de body.

**200** : uniquement les invitations `PENDING`, **sans le token**
```json
{
  "invitations": [
    {
      "id": "…",
      "email": "collegue@gmail.com",
      "role": "MEMBER",
      "expiresAt": "2026-10-27T09:00:00.000Z",
      "createdAt": "2026-10-20T09:00:00.000Z"
    }
  ]
}
```

Une invitation expirée mais jamais acceptée reste `PENDING` en base : elle apparaît donc encore dans la liste.

Accès réservé à l'OWNER : `403` pour un `MEMBER`, `404` pour un non-membre.

---

## 9. Annuler une invitation

```
POST http://localhost:4000/api/organizations/<organizationId>/invitations/<invitationId>/cancel
Authorization: Bearer <token d'un OWNER>
```

Pas de body. L'`invitationId` est l'`id` renvoyé par la liste (section 8), pas le token.

| Cas | Statut |
|---|---|
| Invitation `PENDING` de cette organisation | `200` `Invitation canceled successfully` |
| Invitation déjà acceptée, annulée... | `409` `Only pending invitations can be canceled` |
| Invitation inexistante **ou appartenant à une autre organisation** | `404` `Invitation not found` |
| Appelant `MEMBER` | `403` |

Le statut passe à `CANCELLED` (la ligne n'est pas supprimée). Après annulation, `GET /api/invitations/<token>` renvoie `410`, et ré-inviter le même email (section 7) est possible : la ligne est remise à neuf.

### Test de sécurité (IDOR)

1. Créer deux organisations A et B, inviter un email dans B et noter l'`id` de l'invitation
2. Avec l'OWNER de A, appeler `cancel` avec l'`organizationId` de **A** et l'`invitationId` de **B**
3. Attendu : `404`, et l'invitation de B toujours `PENDING` dans Prisma Studio

---

## 10. Consulter une invitation (publique)

```
GET http://localhost:4000/api/invitations/<token>
```

Pas de header ni de body : la page d'invitation du frontend s'en sert avant que la personne soit connectée.

**200**
```json
{
  "organizationName": "Ma première organisation",
  "email": "collegue@gmail.com",
  "hasAccount": false
}
```

`hasAccount` indique si un compte existe déjà pour cet email (connexion) ou non (inscription). Le token et l'id de l'invitation ne sont pas renvoyés.

| Cas | Statut |
|---|---|
| Token valide, invitation `PENDING` et non expirée | `200` |
| Token inconnu | `404` |
| Invitation acceptée, annulée **ou expirée** | `410` `This invitation is no longer valid` |

Pour tester l'expiration : mettre `expiresAt` dans le passé dans Prisma Studio, puis refaire l'appel.

---

## 11. Accepter une invitation

```
POST http://localhost:4000/api/invitations/<token>/accept
Authorization: Bearer <token de la personne invitée>
```

Pas de body.

**200** : l'utilisateur rejoint l'organisation (réponse avec l'`organizationId`)

| Cas | Statut |
|---|---|
| Compte dont l'email correspond à l'invitation | `200` |
| Compte dont l'email est **différent** de celui invité | `403` |
| Même invitation acceptée une 2e fois | `410` `This invitation is no longer valid` |
| Invitation annulée ou expirée | `410` |
| Token inconnu | `404` |
| Pas de token d'authentification | `401` |

L'acceptation crée la ligne `OrganizationMember` (rôle `MEMBER`) et passe l'invitation à `ACCEPTED` dans **une seule transaction**. Vérifier les deux dans Prisma Studio.

### Parcours complet : personne sans compte

1. L'OWNER invite `marie@x.com` (section 7) et récupère le lien
2. `GET /api/invitations/<token>` : `hasAccount: false`
3. `register` avec un **autre** email, puis `login`, puis `accept` : `403`
4. `register` avec `marie@x.com`, puis `login`, puis `accept` : `200`

L'invitation est liée à une adresse précise : le lien seul ne suffit pas, l'email du compte doit correspondre.

---

## Scénarios de test des rôles

Le contrôle d'accès par organisation (`requireRole`) se teste avec deux comptes.

### Préparation

1. `register` + `login` du compte A, puis création d'une organisation : A est OWNER
2. `register` + `login` du compte B (B n'est membre de rien)

### Les trois cas

| Cas | Qui appelle | Résultat attendu |
|---|---|---|
| OWNER | Token de A sur l'organisation de A | `200` : accès autorisé |
| Non-membre | Token de B sur l'organisation de A | `404` `Organization not found or access denied` |
| Membre sans droits | Token de B, après ajout de B comme `MEMBER` | `403` `You are not allowed to perform this action` |

Pour le troisième cas, ajouter à la main dans Prisma Studio (table `OrganizationMember`) une ligne : `userId` = id de B, `organizationId` = id de l'organisation de A, `role` = `MEMBER`.

Un id d'organisation inventé donne aussi `404` : le serveur ne distingue pas « n'existe pas » de « tu n'y as pas accès ».

Ces tests s'appliquent à toutes les routes réservées à l'OWNER (sections 7, 8 et 9).

---

## Erreurs fréquentes lors des tests

| Symptôme | Cause probable |
|---|---|
| `401` sur une route protégée alors que tu es connecté | Access token expiré (15 min) : refaire un login ou un refresh |
| `401 Invalid or expired refresh token` | Tu as envoyé le `token` à la place du `refreshToken` |
| `404` sur une route qui doit exister | Mauvaise méthode (GET au lieu de POST), ou chemin sans le préfixe `/api` |
| `404` avec le bon chemin sur une route d'organisation | Tu as mis l'id de l'**utilisateur** au lieu de l'id de l'**organisation** |
| `500` au login | Variables `JWT_SECRET` / `JWT_REFRESH_SECRET` manquantes ; serveur à redémarrer après modification du `.env` |
| `Failed to fetch` ou connexion refusée | Serveur arrêté, ou mauvais port |