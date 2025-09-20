# 👟 Sneakershop — Monorepo (API + Frontend)

Application e-commerce de sneakers

**Fonctionnalités principales :**
- Authentification JWT (bcrypt)
- Catalogue + variantes
- Panier (local + sync)
- Favoris
- Rôles : `customer` · `seller` · `admin`

**Stack technique :**
- **Backend** : Node.js + Express + PostgreSQL (OK Supabase)
- **Frontend** : React + Vite + TypeScript + Redux Toolkit

---

## 📑 Sommaire

- [Structure](#structure)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
- [Variables d’environnement](#variables-denvironnement)
- [Démarrer en développement](#démarrer-en-développement)
- [Backend (API)](#backend-api)
- [Frontend (Web)](#frontend-web)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)
- [Annexes — cURL](#annexes--curl)
- [Licence](#licence)

---

## 📁 Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── inventory.js
│   │   │   └── orders.js
│   │   └── index.js
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
    │   ├── lib/
    │   ├── store.ts
    │   ├── main.tsx
    │   └── index.html
    ├── package.json
    └── .env
```

---

## ⚡ Prérequis

- **Node.js** 18+ (recommandé : 20+)
- **PostgreSQL** (ou Supabase) accessible via `DATABASE_URL`
- **npm / pnpm / yarn** (adapte les commandes)

---

## 🚀 Installation rapide

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🔑 Variables d’environnement

### backend/.env

```env
PORT=5050
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
JWT_SECRET=change-me
JWT_EXPIRES=7d
# PGSSLMODE=require   # (optionnel, si provider exige SSL)
```

> Le code gère des colonnes optionnelles et variations de schéma (ex: first_name, last_name, address non obligatoires).

### frontend/.env

```env
VITE_API_URL=http://localhost:5050
```

Le front lit `import.meta.env.VITE_API_URL` (voir `src/features/auth/api.ts`).

---

## 🏃 Démarrer en développement

```bash
# 1) API
cd backend
npm run dev      # http://localhost:5050

# 2) Front
cd ../frontend
npm run dev      # http://localhost:5173
```

---

## 🛠️ Backend (API)

**Stack :** express, pg, bcryptjs, jsonwebtoken, cors  
Parsing JSON + CORS activés.

**Exemple de scripts :**

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

### Endpoints principaux

| Méthode | Route              | Description                                      |
| ------- | ------------------ | ------------------------------------------------ |
| GET     | `/health`          | Vérifie la santé de l’API                        |
| POST    | `/auth/register`   | Inscription utilisateur                          |
| POST    | `/auth/login`      | Connexion utilisateur                            |
| GET     | `/auth/me`         | Infos utilisateur connecté                       |

**Exemples de body / headers :**

- **POST /auth/register**  
  `{ email, password, first_name?, last_name?, role? } → { id }`
- **POST /auth/login**  
  `{ email, password } → { token }`
- **GET /auth/me**  
  `Authorization: Bearer <token> → { id, email, role, ... }`

> D’autres routes (produits, inventaire, commandes) selon le projet (`backend/src/routes/*.js`).

### Dépannage API

- **400 “Bad Request” au login** → vérifier `app.use(express.json())` dans `index.js`.
- **401 “Unauthorized”** → mauvais hash bcrypt en base (doit ressembler à `$2a$10$...`).
- **500 errorMissingColumn / 42703** → colonne manquante : adapter la table ou les alias dans les requêtes.
- **CORS** → l’API doit autoriser l’origine du front (CORS est activé côté serveur).

---

## 🌐 Frontend (Web)

**Stack :** React 18, Vite, TypeScript, React Router, Redux Toolkit, TanStack Query  
Panier et favoris persistés en `localStorage`.

**Exemple de scripts :**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Pages & flux

- **Auth**
  - `LoginPage.tsx` : signIn() → getMe() → setSession(user, token) → redirect
  - `RegisterPage.tsx` : signUp() → getMe() → setSession → redirect
  - `AuthProvider.tsx` : au mount, si token présent → getMe() → hydrate Redux
- **Catalogue**
  - `ProductPage.tsx` : variantes (couleur / pointure), ajout panier, favoris
- **Panier**
  - `cart/slice.ts` : items `{ sku, size, name, priceCents, image, qty }`
  - `CartPage.tsx` : affichage + total
- **Favoris**
  - `favorites/slice.ts` : IDs en localStorage + page de listing
- **Compte**
  - `AccountPage.tsx` : affiche l’utilisateur de la session; sections spécifiques par rôle

### Dépannage Front

- **401 sur /auth/me** → Authorization: Bearer absent : vérifier `getToken()` et `api.ts` (param `useAuth=true`).
- **“Connexion au serveur impossible.”** → API non démarrée / VITE_API_URL incorrecte / CORS.
- **Profil vide** → AuthProvider n’a pas hydraté la session (inspecter l’onglet Réseau, requête `/auth/me`).

---

## 🗄️ Base de données

**Schéma minimal recommandé :**

```sql
create table if not exists users (
  id serial primary key,
  email varchar(255) unique not null,
  password_hash varchar(100) not null,
  role varchar(20) default 'customer',
  first_name varchar(80),
  last_name varchar(80),
  address text
);
```

**Générer un hash bcrypt :**

```bash
node -e "console.log(require('bcryptjs').hashSync('Secret123!', 10))"
```

Copie le hash dans `users.password_hash`.

---

## 🚢 Déploiement

### API (Render / Fly.io / Railway / Heroku)

- Configurer `DATABASE_URL`, `JWT_SECRET`, `PORT` (+ `PGSSLMODE=require` si nécessaire).

### Frontend (Vercel / Netlify)

- Définir `VITE_API_URL` vers l’API publique, puis :

```bash
npm run build
# déployer frontend/dist
```

---

## 🧪 Annexes — cURL

```bash
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
```

---

## 📄 Licence

Projet d’apprentissage — usage interne.