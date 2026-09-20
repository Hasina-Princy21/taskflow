# taskflow

1- Initialiser le repo et la 

Crée un dossier taskflow/ avec deux sous-dossiers : client/ (frontend) et server/ (backend). Initialise un dépôt Git à la racine avec un .gitignore couvrant node_modules, .env, dist/.


2- 


3- Squelette backend Express + TypeScript
Dans server/, initialise un projet Node avec TypeScript, Express, ts-node-dev pour le hot reload. Crée un endpoint de santé GET /health qui répond { status: 'ok' } pour valider que tout tourne.
    _ Initilisation
        npm init -y
        
    _ Dépendances de production
        npm install express cors dotenv

    _ Dépendances de développement
        npm install -D typescript ts-node-dev @types/node @types/express @types/cors

    _ npx tsc --init
        {
            "compilerOptions": {
                "target": "ES2022",
                "module": "commonjs",
                "rootDir": "./src",
                "outDir": "./dist",
                "esModuleInterop": true,
                "forceConsistentCasingInFileNames": true,
                "strict": true,
                "skipLibCheck": true,
                "resolveJsonModule": true
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules", "dist"]
        }

    _ mkdir -p src/routes src/controllers src/middlewares src/config 'linux'
        mkdir src/routes, src/controllers, src/middlewares, src/config 'windows'

# configuration des fichiers app & server ts


    _ installation de prisma
        npm install -D prisma
        npm install @prisma/client

    !!! au cas ou il y a une erreur edgesOut

    C'est un bug connu du résolveur de dépendances npm (arborist), généralement causé par un cache npm corrompu ou un package-lock.json incohérent — ce n'est pas lié à Prisma spécifiquement.

    Solution : nettoyer et réinstaller
    powershell
    # 1. Nettoyer le cache npm
    npm cache clean --force

    # 2. Supprimer node_modules et le lockfile
    Remove-Item -Recurse -Force node_modules
    Remove-Item -Force package-lock.json

    # 3. Réinstaller toutes les dépendances existantes
    npm install

    # 4. Puis retenter l'installation de Prisma
    npm install -D prisma
    npm install @prisma/client

    --- si echoue
    npm install -D prisma --legacy-peer-deps
    npm install @prisma/client --legacy-peer-deps

    _ apres initilisation de prisma pour les agent ia
        npx prisma init
        -> a utiliser
            npx prisma orm init

    §!!!!!!!! SUPPRESSION DE TOUS LES FICHIERS DEPENDANT DE PRISMA-8 AVEC LES COMMANDES:
        - Remove-Item -Force prisma.config.ts
        - Get-ChildItem -Force
        - Remove-Item -Force prisma-8.md

# configuration du fichier prisma 
    _ Lancement du premier migration apres la configuration des tables dans schema.prisma

````prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  memberships   OrganizationMember[]
  assignedTasks Task[]               @relation("TaskAssignee")
  comments      Comment[]
}

model Organization {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  members  OrganizationMember[]
  projects Project[]
}

enum Role {
  OWNER
  MEMBER
}

model OrganizationMember {
  id             String       @id @default(uuid())
  role           Role
  user           User         @relation(fields: [userId], references: [id])
  userId         String
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  @@unique([userId, organizationId])
}

model Project {
  id             String       @id @default(uuid())
  name           String
  createdAt      DateTime     @default(now())
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  boardColumns BoardColumn[]
  labels  Label[]
}

model BoardColumn {
  id        String  @id @default(uuid())
  name      String
  position  Int
  project   Project @relation(fields: [projectId], references: [id])
  projectId String
  tasks Task[]
}

model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime?
  position    Int
  boardColumn      BoardColumn    @relation(fields: [boardColumnId], references: [id])
  boardColumnId    String
  assignee    User?     @relation("TaskAssignee", fields: [assigneeId], references: [id])
  assigneeId  String?
  labels   TaskLabel[]
  comments Comment[]
}

model Label {
  id        String  @id @default(uuid())
  name      String
  color     String
  project   Project @relation(fields: [projectId], references: [id])
  projectId String
  tasks TaskLabel[]
}

model TaskLabel {
  task    Task   @relation(fields: [taskId], references: [id])
  taskId  String
  label   Label  @relation(fields: [labelId], references: [id])
  labelId String
  @@id([taskId, labelId])
}

model Comment {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  task      Task     @relation(fields: [taskId], references: [id])
  taskId    String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
````

    _ migration pour la creation des tables
        - npx prisma migrate dev --name init_initial_models
    
    _ Lancement du deuxieme migration pour renomination des tables
        !- Column -> BoardColunm &
        !- champs order en position
        -> npx prisma migrate dev --name rename_colunm_to_boardcolunm_and_order_to_position

    _ Ajout configuration de prisma.ts -> config pour gestion des session de connexion pourque pour chaque requette l app n ouvre un instance de connexion a chaque et amenera a une erreur comme 'connexion sature'

     
## client
    _ installation de l env vite/ts dans client
        - npm create vite@latest . -- --template react-ts
    
    _ test utilisation server sur le client

    _ installations des dependances au sprint 1 (authentification, inscrption, JWV et refresh)
        - npm install bcrypt jsonwebtoken zod
        - npm install -D @types/bcrypt @types/jsonwebtoken

    _ structure client
        client/src/

    ├── api/              # Fonctions qui appellent le backend (fetch centralisé)
    ├── components/       # Composants réutilisables (Button, Input, Modal...)
    ├── pages/            # Une page = une route de l'application
    ├── context/          # Gestion d'état global (ex: utilisateur connecté)
    ├── hooks/            # Hooks personnalisés réutilisables
    ├── types/            # Interfaces/types TypeScript partagés
    ├── utils/            # Fonctions utilitaires génériques
    ├── App.tsx
    └── main.tsx 
