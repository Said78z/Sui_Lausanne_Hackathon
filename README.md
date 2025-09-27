🌊 Vision

LémanFlow (LMF) est une plateforme Web3 pour hackathons et événements qui distribue automatiquement des micro-grants aux participants, de façon transparente, fluide et sans frais pour eux.

Authentification simple via zkLogin (Google/Apple).

Un Passeport Soulbound NFT sert d’identité digitale (non-transférable).

Chaque action (check-in, stand visité, vote) est prouvée par attestations on-chain via QR codes.

Un pool de rewards déposé par les sponsors est redistribué automatiquement selon les règles définies.

Les transactions sont gasless : le backend prend en charge les frais.

🏗️ Architecture
Frontend (Next.js + Tailwind + Framer Motion)
  - zkLogin (Google/Apple)
  - Profile (Passeport NFT + QR)
  - Admin dashboard (scanner, participants, distribution)

Backend (Fastify/TypeScript + Postgres)
  - /qr/issue : génère QR signé
  - /checkin : vérifie + inscrit participant
  - /mint_passport : mint soulbound NFT
  - Sponsoring des transactions (Gas Station)

Blockchain (Sui + Move contracts)
  - Passport (soulbound NFT)
  - Mission (meta + période + poids)
  - Attestation (preuve unique)
  - GrantPool (fonds déposés + distribution)

🚀 Installation & Lancement
1. Pré-requis

Node.js
 (>=18)

pnpm

Sui CLI

Postgres (local ou Docker)

2. Cloner le repo
git clone https://github.com/<votre-org>/lemanflow.git
cd lemanflow

3. Contrats Move
cd contracts
sui move build
sui move test
sui client publish --gas-budget 100000000


Notez le PACKAGE_ID et CONFIG_ID pour les utiliser dans .env.

4. Backend
cd server
cp .env.example .env   # remplir avec vos clés
pnpm install
pnpm dev

5. Frontend
cd app
cp .env.example .env.local   # remplir avec PACKAGE_ID, BACKEND_URL
pnpm install
pnpm dev


Accédez à l’app : http://localhost:3000

📲 Démo du flow utilisateur

Login avec zkLogin → un Passeport NFT est minté.

Affiche ton QR code perso dans ton profil.

L’organisateur scanne ton QR à l’entrée.

Le backend vérifie ownership on-chain et enregistre le check-in.

Tu accumules des attestations en visitant les stands.

À la fin, l’organisateur déclenche la distribution des grants (si activée).

🔐 Sécurité

Passeport = soulbound (non transférable).

QR codes = signés par le backend avec expiration pour éviter le replay.

Transactions = sponsorisées (gasless UX).

Capabilities Move : seul l’organisateur peut créer missions / distribuer.

🛣️ Roadmap

V1 (Hackathon PoC) : Check-in + QR + passeport soulbound.

V2 : Pool de grants + distribution auto.

V3 : Badges rares, gamification.

V4 : Sponsors multiples + votes on-chain + analytics.

👥 Équipe

Saïd Kaci — Coordination, DevOps, QA

Riad — Frontend & UX

Gobi — Backend & Infra

Mehdi — Smart Contracts Move

💡 Pitch rapide :

“LémanFlow transforme les hackathons : plus besoin d’Excel ni de feuilles de présence.
Chaque action est prouvée on-chain, les sponsors voient leur impact,
et les participants reçoivent automatiquement leurs micro-grants, sans jamais payer de frais.”
