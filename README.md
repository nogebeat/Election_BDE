# 🏛️🐝 Election BDE - Olympus VS The Bees

Plateforme de notation et d'analytics en temps réel pour la campagne BDE opposant la liste **Olympus** à la liste **The Bees**.

## Aperçu des Fonctionnalités ("Pro Max" Edition)

Ce projet a bénéficié d'une refonte complète de son architecture et de son design pour offrir une expérience premium et robuste :

### 1. UI/UX "Pro Max"
- **Esthétique Premium** : Utilisation intensive du *Glassmorphism*, de dégradés profonds (Or pour Olympus, Jaune Néon/Ambre pour The Bees) et de micro-animations interactives.
- **Split-Screen Layout** : Séparation visuelle claire et élégante entre les deux listes pour un duel immersif (Mode Sombre global et Mode Clair inversé).
- **Sélecteur de Jour** : Navigation par "Pills" permettant de voter ou consulter les scores de manière isolée pour chaque jour (J1 à J5) ou faire un Bilan Global.

### 2. Sécurité & Authentification
- **Passwordless OTP** : Connexion par code de vérification à 6 chiffres.
- **Filtre Strict** : Seules les adresses e-mail appartenant au domaine `@epitech.eu` sont autorisées.
- **Gestion des Rôles (RBAC)** : Attribue dynamiquement le statut `ADMIN` à *akhenaton.dandjinou@epitech.eu* (et `STUDENT` pour les autres).

### 3. Moteur de Vote Incorruptible
- **Un Vote par Jour Strict** : Verrouillage intraitable géré directement au sein de la base de données PostgreSQL via l'ORM Prisma (`@@unique([userId, day])`).
- **4 Critères** : Bouffe, Ambiance, Projets, et Respect (chacun noté sur 10 étoiles).

### 4. Admin Dashboard
- **Analytics en Temps Réel** : Suivi des KPIs vitaux (Total Votants, Participation du jour, Liste en tête de la semaine).
- **Data Visualisation (Recharts)** : 
  - *Radar Chart* : Comparatif des moyennes globales des deux listes sur les 4 critères.
  - *Line Chart* : Courbe de l'évolution de la hype et du score quotidien (J1 à J5).
- **Générateur de Synthèse** : Zones de texte stylisées pour permettre à l'Arbitre de rédiger le "Top du Jour" et le "Flop du Jour".

## Stack Technique
- **Frontend** : React, Vite, Tailwind CSS, Recharts, Lucide-React, Framer Motion.
- **Backend** : Node.js, Express, TypeScript (TSX), JWT.
- **Base de Données** : PostgreSQL, ORM Prisma.
- **Déploiement** : Docker & Docker Compose.

## Lancement Rapide (Docker Session)

1. **Se positionner à la racine du projet** :
   ```bash
   cd ~/Election_BDE/Election_BDE
   ```

2. **Démarrer les conteneurs en tâche de fond** :
   ```bash
   docker-compose up --build -d
   ```

3. **Synchroniser la base de données PostgreSQL** (Générer les tables depuis le schéma Prisma) :
   ```bash
   docker-compose exec backend npx prisma db push
   ```

### Adresses utiles
- **Frontend (Interface Votants & Admin)** : [http://localhost:8080](http://localhost:8080)
- **Backend (API de Vote)** : [http://localhost:3001](http://localhost:3001)
- **Base de données (PostgreSQL)** : Expostée sur `localhost:5434` (pour éviter les conflits d'environnement).

---
*Powered with ⚡ Code & Design Pro Max.*
