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
        - npx prisma migrate dev --name init_initial_models
    
    _ Lancement du deuxieme migration pour renomination des tables
        !- Column -> BoardColunm &
        !- champs order en position
        -> npx prisma migrate dev --name rename_colunm_to_boardcolunm_and_order_to_position

    _ Ajout configuration de prisma.ts -> config pour gestion des session de connexion pourque pour chaque requette l app n ouvre un instance de connexion a chaque et amenera a une erreur comme 'connexion sature'

     
## client
    _ installation de l env vite/ts dans client
        - npm create vite@latest . -- --template react-ts