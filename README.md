# React + Fastify Skeleton

## Prérequis

- Docker
- Node.js
- PNPM (npm install -g pnpm)

## Structure du projet

- `backend`: Dossier pour le serveur Fastify
- `frontend`: Dossier pour le serveur React
- `shared`: Dossier pour les fichiers partagés entre le backend et le frontend, il contient les types, les interfaces, les fonctions utiles, etc.

## Installation

1. Cloner le repository

2. Créer un fichier `.env` dans le dossier `backend` et `frontend` avec les variables d'environnement nécessaires.

3. Lancer les conteneurs Docker avec la commande suivante. Ils permettent de lancer:

- Un serveur MySQL: http://localhost:8080: Gérer la base de données
- Un serveur PHPMyAdmin: http://localhost:8080: Gérer la base de données
- Un serveur Mailhog: http://localhost:8025 / smtp://mailhog:1025: Envoyer des emails
- Un serveur Minio: http://localhost:9000: Stockage de fichiers
- Un serveur Loki: http://localhost:3100: Logger
- Un serveur Grafana: http://localhost:3001: Consulter les logs

```bash
docker-compose up -d
```

4. Installer les dépendances avec la commande suivante.

```bash
pnpm install
```

5. Créez la base de données avec la commande suivante:

```bash
cd backend
pnpm run prisma:generate
pnpm run prisma:migrate # Si des changements sont apportés à la base de données
pnpm run prisma:seed
```

6. Lancer le serveur Fastify avec la commande suivante.

```bash
pnpm dev
```

6. Lancer le serveur React avec la commande suivante.

```bash
pnpm dev
```