# Système de Certification Académique sur Blockchain (Devoir 1)

Ce projet implémente une solution décentralisée complète permettant à une université d'émettre des diplômes infalsifiables sur la blockchain Ethereum et au public de vérifier instantanément leur authenticité.

---

## 📌 Architecture du Projet

```text
Devoir1_Certification/
├── contracts/
│   └── CertificateRegistry.sol     # Smart Contract Solidity (Mint, Batch, Révocation, Anti-doublons)
├── test/
│   └── CertificateRegistry.test.ts # Tests unitaires automatisés (6/6 tests réussis)
├── scripts/
│   └── deploy.ts                   # Script de déploiement Hardhat 3
├── frontend/                       # Interface Web3 (React + Vite + SheetJS + ethers.js)
│   ├── src/
│   │   ├── contractConfig.js       # Configuration (Adresse & ABI)
│   │   ├── App.jsx                 # Application (Zone Admin & Zone Publique)
│   │   └── App.css                 # Design et mise en page
├── étudiants.xlsx                  # Fichier Excel d'exemple pour l'import en lot
├── hardhat.config.ts               # Configuration Hardhat (viaIR activé)
└── README.md
```

---

## ⚙️ Prérequis et Installation

- **Node.js** : version 22.x ou supérieure (`nvm use 22`)
- **MetaMask** : extension configurée sur le réseau `Hardhat Local` (`http://127.0.0.1:8545`, Chain ID `31337`).

### 1. Installation des dépendances

```bash
# Dépendances Hardhat (à la racine du dossier Devoir1_Certification)
npm install

# Dépendances Frontend
cd frontend
npm install
cd ..
```

---

## 🧪 Tests Unitaires Automatisés

Le Smart Contract valide toutes les exigences de sécurité (accès réservé à l'administrateur, blocage des doublons de CNE/studentId, intégrité du batch mint et révocation).

Lancer la suite de tests :

```bash
npx hardhat test
```

**Résultat attendu :**
```text
  CertificateRegistry - Tests Unitaires
    ✔ 1. Doit definir l'universite comme proprietaire (owner)
    ✔ 2. L'universite peut emettre un certificat unitaire
    ✔ 3. Un compte non autorise (pirate) ne peut pas emettre (Securite)
    ✔ 4. Empeche le double enregistrement du meme studentId (Anti-doublon)
    ✔ 5. L'emission groupee (Batch Mint) fonctionne pour plusieurs etudiants
    ✔ 6. La revocation d'un certificat invalide fonctionne

  6 passing (434ms)
```

---

## 🚀 Déploiement du Smart Contract

### Étape 1 : Démarrer le nœud local Hardhat (Terminal 1)

```bash
npx hardhat node
```

### Étape 2 : Déployer le contrat (Terminal 2)

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

- **Adresse du contrat déployé :** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Compte Administrateur (Université) :** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

---

## 💻 Démarrage du Frontend (React + Vite)

Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

L'application est accessible sur : `http://localhost:5173/`.

---

## 📸 Démonstration & Résultats des Tests

### 1. Émission Unitaire d'un Certificat (Zone Administration)
Création d'un premier certificat pour Amina Benali avec signature de la transaction via MetaMask et confirmation on-chain :

![Émission Unitaire](../images/image11.png)

### 2. Importation Massive Excel (.xlsx) et Batch Mint (SheetJS)
Chargement du fichier `étudiants.xlsx`, prévisualisation des étudiants avec sélection par cases à cocher et exécution d'un `batchMint` en une seule transaction atomique :

![Import Excel & Batch Mint](../images/image12.png)

### 3. Consultation et Vérification Publique d'un Diplôme (Zone Publique)
Recherche par identifiant (#1) et restitution immédiate des métadonnées du certificat avec certification du statut d'authenticité :

![Vérification Publique](../images/image13.png)