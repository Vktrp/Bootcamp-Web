Sneakershop — Monorepo (API + Frontend)
Application e-commerce de sneakers avec :
Authentification JWT (hash bcrypt)
Catalogue + variantes (couleur / taille)
Panier (local + synchro une fois connecté)
Favoris (localStorage)
Rôles utilisateur : customer, seller, admin
Backend : Node.js + Express + PostgreSQL (Supabase OK)
Frontend : React + Vite + TypeScript + Redux Toolkit
Sommaire
Structure
Prérequis
Installation rapide
Variables d’environnement
Démarrer en développement
Backend (API)
Stack & scripts
Endpoints principaux
Dépannage API
Frontend (Web)
Stack & scripts
Pages & flux
Dépannage Front
Base de données
Déploiement (pistes)
Annexes — cURL utiles
Licence
Structure
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js        # si utilisé
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js              # selon ton projet
│   │   │   ├── inventory.js             # selon ton projet
│   │   │   └── orders.js                # selon ton projet
│   │   └── index.js                     # point d’entrée Express
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── app/providers/AuthProvider.tsx
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── api.ts
    │   │   │   ├── slice.ts
    │   │   │   ├── LoginPage.tsx
    │   │   │   └── RegisterPage.tsx
    │   │   ├── cart/
    │   │   │   ├── slice.ts
    │   │   │   └── CartPage.tsx
    │   │   ├── favorites/
    │   │   │   └── slice.ts
    │   │   └── catalog/
    │   │       ├── ProductPage.tsx
    │   │       └── ...
    │   ├── lib/ (utils, sizes, supabase, etc.)
    │   ├── store.ts
    │   ├── main.tsx
    │   └── index.html
    ├── package.json
    └── .env
Prérequis
Node.js 18+ (recommandé : 20+)
PostgreSQL (ou Supabase) accessible via DATABASE_URL
npm (ou pnpm/yarn — adapte les commandes)
Installation rapide
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
Variables d’environnement
backend/.env
# Port de l'API
PORT=5050

# Chaîne de connexion Postgres (OK Supabase)
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>

# JWT
JWT_SECRET=change-me
JWT_EXPIRES=7d

# (optionnel) si le provider exige SSL
# PGSSLMODE=require
Le code gère les colonnes optionnelles et les variations de schéma usuelles (ex: first_name, last_name, address non obligatoires).
frontend/.env
VITE_API_URL=http://localhost:5050
Le front lit import.meta.env.VITE_API_URL (voir src/features/auth/api.ts).
Démarrer en développement
# 1) API
cd backend
npm run dev      # http://localhost:5050

# 2) Front
cd ../frontend
npm run dev      # http://localhost:5173
Backend (API)
Stack & scripts (API)
Express, pg, bcryptjs, jsonwebtoken, cors
Parsing JSON + CORS activés
backend/package.json (exemple) :
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
Endpoints principaux
GET /health → { ok: true }
POST /auth/register
body: { email, password, first_name?, last_name?, role? }
retour: { id }
POST /auth/login
body: { email, password }
retour: { token }
GET /auth/me
headers: Authorization: Bearer <token>
retour: { id, email, role, first_name?, last_name?, address? }
D’autres routes (produits, inventaire, commandes) existent selon le projet. Cf. backend/src/routes/*.js.
Dépannage API
400 Bad Request au login → vérifier app.use(express.json()) dans index.js
401 Unauthorized → mauvais hash en base (doit ressembler à $2a$10$...)
500 errorMissingColumn / 42703 → colonne manquante : adapter ta table ou vérifier les alias dans les requêtes
CORS → l’API doit exposer l’origine du front. CORS est activé côté server.
Frontend (Web)
Stack & scripts (Front)
React 18, Vite, TypeScript
React Router, Redux Toolkit, TanStack Query
localStorage pour panier et favoris offline
frontend/package.json (exemple) :
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
Pages & flux
Auth
LoginPage.tsx : signIn() → getMe() → setSession(user, token) → redirect
RegisterPage.tsx : signUp() → getMe() → setSession → redirect
AuthProvider.tsx : au mount, si token présent → getMe() → hydrate Redux
Catalogue
ProductPage.tsx : variantes (couleur/pointure), ajout panier, favoris
Panier
cart/slice.ts : items { sku, size, name, priceCents, image, qty }
CartPage.tsx : affichage + total
Favoris
favorites/slice.ts : IDs en localStorage + page de listing
Compte
AccountPage.tsx : affiche user de la session; sections spécifiques par rôle (customer/seller/admin)
Dépannage Front
401 sur /auth/me → Authorization: Bearer absent : vérifier getToken() et api.ts (param useAuth=true).
“Connexion au serveur impossible.” → API pas démarrée / VITE_API_URL incorrect / CORS.
Profil vide → AuthProvider n’a pas hydraté la session (ouvre l’onglet Réseau, regarde /auth/me).
Base de données
Schéma minimal recommandé :
create table if not exists users (
  id serial primary key,
  email varchar(255) unique not null,
  password_hash varchar(100) not null,
  role varchar(20) default 'customer',
  first_name varchar(80),
  last_name varchar(80),
  address text
);
Générer un hash bcrypt
node -e "console.log(require('bcryptjs').hashSync('Secret123!', 10))"
Copie ce hash dans users.password_hash.
Déploiement (pistes)
API (Render / Fly.io / Railway / Heroku)
Configurer DATABASE_URL, JWT_SECRET, PORT
Si besoin, PGSSLMODE=require
Frontend (Vercel / Netlify)
Définir VITE_API_URL vers l’API publique
npm run build puis déployer frontend/dist
Annexes — cURL utiles
# Health
curl -i http://localhost:5050/health

# Register
curl -i http://localhost:5050/auth/register \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com","password":"Secret123!","first_name":"Test","last_name":"User"}'

# Login
curl -i http://localhost:5050/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com","password":"Secret123!"}'

# Me (remplace TOKEN)
curl -i http://localhost:5050/auth/me \
  -H "authorization: Bearer TOKEN"
Licence
Projet d’apprentissage — usage interne.