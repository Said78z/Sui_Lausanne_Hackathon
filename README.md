<p align="center">
  <img src="./assets/logo.png" alt="Hack’n’Sui Logo" width="400"/>
</p>

# ⚡ Hack’n’Sui  

## 🌍 Vision  
**Hack’n’Sui** est une plateforme Web3 pour **hackathons et événements** qui permet de distribuer automatiquement des **micro-grants** aux participants, de façon **transparente, fluide et sans frais** pour eux.  

- Authentification simple via **zkLogin** (Google/Apple).  
- Un **Passeport Soulbound NFT** sert d’identité digitale (non-transférable).  
- Chaque action (check-in, stand visité, vote) est prouvée par **attestations on-chain via QR codes**.  
- Un **pool de rewards** déposé par les sponsors est redistribué automatiquement selon des règles transparentes.  
- Les transactions sont **gasless** : le backend prend en charge les frais.  

---

## 🏗️ Architecture  

Frontend (Next.js + Tailwind + Framer Motion)

zkLogin (Google/Apple)

Profile (Passeport NFT + QR)

Admin dashboard (scanner, participants, distribution)

Backend (Fastify/TypeScript + Postgres)

/qr/issue : génère QR signé

/checkin : vérifie + inscrit participant

/mint_passport : mint soulbound NFT

Sponsoring des transactions (Gas Station)

Blockchain (Sui + Move contracts)

Passport (soulbound NFT)

Mission (meta + période + poids)

Attestation (preuve unique)

GrantPool (fonds déposés + distribution)

markdown
Copier le code

---

## 🚀 Installation & Lancement  

### 1. Pré-requis  
- [Node.js](https://nodejs.org) (>=18)  
- [pnpm](https://pnpm.io/)  
- [Sui CLI](https://docs.sui.io/)  
- Postgres (local ou Docker)  

### 2. Cloner le repo  

```bash
git clone https://github.com/<votre-org>/hacknsui.git
cd hacknsui
3. Contrats Move
bash
Copier le code
cd contracts
sui move build
sui move test
sui client publish --gas-budget 100000000
Notez le PACKAGE_ID et CONFIG_ID pour les utiliser dans .env.

4. Backend
bash
Copier le code
cd server
cp .env.example .env   # remplir avec vos clés
pnpm install
pnpm dev
5. Frontend
bash
Copier le code
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
