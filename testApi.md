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
| 7 | POST | `/api/organizations/:organizationId/invitations` | Token + OWNER (**à venir**) |

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

## 7. Inviter un membre (à venir)

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

Réponses attendues une fois l'endpoint écrit :

| Cas | Statut |
|---|---|
| OWNER invite un email nouveau | `201` avec le lien `CLIENT_URL/invitations/<token>` |
| Même invitation renvoyée une 2e fois | `201` avec un **nouveau token** ; une seule ligne en base |
| La personne est déjà membre | `409` |
| Email invalide | `400` |
| Appelant `MEMBER` (pas OWNER) | `403` |
| Appelant non membre, ou organisation inexistante | `404` |
| Pas de token | `401` |

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

Ces tests nécessitent une route protégée par `requireRole(['OWNER'])`, comme l'endpoint d'invitation.

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