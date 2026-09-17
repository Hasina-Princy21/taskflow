# Cahier des Charges — TaskFlow
*Plateforme collaborative de gestion de projets (multi-organisations)*

Version 1.0 — Rédigé par le TL, validé par le développeur

---

## 1. Contexte & Objectifs

### Contexte
De nombreuses équipes ont besoin d'un outil simple pour organiser leur travail sous forme de tableaux Kanban (colonnes/tâches), au sein d'espaces de travail isolés par organisation, sur le modèle de Trello ou Linear.

### Objectifs du projet
- Réaliser une application full-stack complète avec une architecture proche de ce qui existe en entreprise (multi-tenant, auth sécurisée, API REST typée)
- Monter en compétence sur : PostgreSQL/Prisma, authentification JWT, architecture multi-organisations, React + TypeScript
- Produire un projet démontrable en entretien technique

### Objectifs non fonctionnels
- Code maintenable et testé
- API documentée
- Déployable via Docker

---

## 2. Personas

| Persona | Description | Besoins principaux |
|---|---|---|
| **Owner** | Créateur de l'organisation, admin | Inviter des membres, créer des projets, tout gérer |
| **Member** | Collaborateur invité | Voir les projets, gérer ses tâches, commenter |

*(Un rôle "Invité en lecture seule" est envisageable en V2)*

---

## 3. Périmètre fonctionnel

### ✅ Inclus dans le MVP (V1)
- Authentification (inscription, connexion, déconnexion, refresh token)
- Création d'une organisation (workspace)
- Invitation de membres par email dans une organisation
- Gestion des rôles : Owner / Member
- Création de projets au sein d'une organisation
- Tableau Kanban par projet : colonnes personnalisables (ex: À faire / En cours / Terminé)
- Tâches : création, édition, suppression, assignation, description, date d'échéance, labels
- Commentaires sur les tâches
- Recherche et filtres (par assigné, label, statut)
- Dashboard simple : nombre de tâches par statut / par membre
- Mises à jour classiques (rechargement / refetch), **pas de temps réel en V1**

### 🔜 Reporté en V2 (hors scope actuel)
- Temps réel (WebSockets / Socket.io) sur le tableau Kanban
- Facturation / plans payants (Stripe)
- Pièces jointes sur les tâches
- Notifications (email / in-app)
- Journal d'activité (audit log)
- Rôles personnalisés avancés

---

## 4. User Stories (MVP)

**Épic — Authentification**
- En tant qu'utilisateur, je veux créer un compte pour accéder à l'application
- En tant qu'utilisateur, je veux me connecter et rester connecté via un refresh token
- En tant qu'utilisateur, je veux me déconnecter en sécurité (invalidation du token)

**Épic — Organisations**
- En tant qu'utilisateur, je veux créer une organisation dont je deviens Owner
- En tant qu'Owner, je veux inviter un membre par email
- En tant que Member invité, je veux rejoindre l'organisation via un lien d'invitation
- En tant qu'Owner, je veux retirer un membre de mon organisation

**Épic — Projets & Kanban**
- En tant que membre, je veux créer un projet dans mon organisation
- En tant que membre, je veux créer/renommer/supprimer des colonnes dans un tableau
- En tant que membre, je veux créer une tâche et la déplacer d'une colonne à l'autre
- En tant que membre, je veux assigner une tâche à un membre de l'organisation
- En tant que membre, je veux ajouter des labels et une date d'échéance à une tâche

**Épic — Collaboration**
- En tant que membre, je veux commenter une tâche
- En tant que membre, je veux filtrer les tâches par assigné, label ou statut
- En tant que membre, je veux voir un dashboard résumant l'avancement du projet

---

## 5. Contraintes techniques

| Élément | Choix |
|---|---|
| Frontend | React (Vite) + TypeScript + React Query |
| Backend | Node.js + Express + TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access token courte durée + refresh token) |
| Tests | Vitest/Jest + Supertest |
| Conteneurisation | Docker + docker-compose (Postgres + API) |
| Gestion de version | Git + convention de commits (Conventional Commits recommandé) |

---

## 6. Modèle de données (aperçu)

```
User
 ├── id, email, passwordHash, name, createdAt

Organization
 ├── id, name, createdAt

OrganizationMember (table de jointure)
 ├── userId, organizationId, role (OWNER | MEMBER)

Project
 ├── id, organizationId, name, createdAt

Column
 ├── id, projectId, name, order

Task
 ├── id, columnId, title, description, dueDate, assigneeId, order

Label
 ├── id, projectId, name, color

TaskLabel (table de jointure)
 ├── taskId, labelId

Comment
 ├── id, taskId, authorId, content, createdAt
```

*(Le schéma Prisma détaillé sera rédigé au Sprint 0)*

---

## 7. Découpage en sprints (indicatif)

| Sprint | Contenu |
|---|---|
| **Sprint 0** | Setup repo, docker-compose, squelette Express/React, schéma Prisma initial |
| **Sprint 1** | Authentification complète (inscription, connexion, JWT, refresh) |
| **Sprint 2** | Organisations, invitations, rôles |
| **Sprint 3** | Projets + tableau Kanban (colonnes + tâches, drag & drop) |
| **Sprint 4** | Commentaires, labels, recherche/filtres |
| **Sprint 5** | Dashboard, tests, polish UI, dockerisation finale |

*(Durée par sprint à ajuster selon ta disponibilité — voir section 9)*

---

## 8. Critères d'acceptation / Definition of Done

Une fonctionnalité est considérée "terminée" quand :
- [ ] Le code compile sans erreur/warning TypeScript
- [ ] Les endpoints concernés sont testés (au moins les cas nominaux + un cas d'erreur)
- [ ] L'interface est responsive (mobile/desktop)
- [ ] Aucune donnée sensible n'est exposée dans les réponses API (ex: passwordHash)
- [ ] La fonctionnalité a été testée manuellement de bout en bout
- [ ] Le code est commité avec un message clair (Conventional Commits)

---

## 9. Planning indicatif

*À compléter ensemble selon ta disponibilité hebdomadaire (nombre d'heures/semaine) — le TL ajustera le découpage des sprints en conséquence.*

---

## 10. Prochaines étapes

1. Valider ce document (le modifier si besoin)
2. Sprint 0 : mise en place de l'environnement de développement
3. Rédaction du schéma Prisma détaillé
