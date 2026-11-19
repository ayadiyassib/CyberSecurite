# 🛡️ Rapport d'Audit de Sécurité : Smart Contract AcademicCertificateNFT

**Projet :** Système de Certification Académique sur Blockchain (Devoir 2)  
**Date de l'audit :** Novembre 2026  
**Auditeur :** Yaasin Ayadi  
**Statut global :** ✅ **APPROUVÉ POUR DÉPLOIEMENT (Sécurisé)**

---

## 1. Périmètre de l'Audit (Scope)

L'audit a porté sur le contrat principal développé sous **Solidity 0.8.26** avec la bibliothèque standard **OpenZeppelin Contracts v5** :

* **Fichier audité :** `contracts/AcademicCertificateNFT.sol`
* **Héritages standards :** `ERC721URIStorage`, `AccessControl`, `ReentrancyGuard`
* **Fonctions auditées :**
  - `mintCertificate(...)` : Émission unitaire d'un NFT de diplôme.
  - `batchMintCertificates(...)` : Émission groupée de NFT depuis un import.
  - `revokeCertificate(...)` : Révocation officielle d'un diplôme invalide.
  - `getCertificate(...)` : Consultation publique des métadonnées on-chain.
  - `isStudentRegistered(...)` : Contrôle anti-doublon d'étudiant.

---

## 2. Vulnérabilités Recherchées & Analyse des Risques

Conformément aux standards de sécurité Web3 (SWC Registry & Checklists ConsenSys Diligence) :

| Identifiant SWC | Vulnérabilité Recherchée | Niveau de Risque Initial | Statut Après Audit |
| :--- | :--- | :--- | :--- |
| **SWC-105 / 106** | Défaut de Contrôle d'Accès (Access Control) | 🔴 Critique | 🟢 **Corrigé & Validé (OK)** |
| **SWC-107** | Attaque de Réentrance (Reentrancy) | 🔴 Critique | 🟢 **Protégé (ReentrancyGuard)** |
| **SWC-101** | Dépassement d'Entier (Overflow/Underflow) | 🟠 Majeur | 🟢 **Protégé (Solidity 0.8.x)** |
| **Logique Métier** | Double émission d'un même CNE (Double Mint) | 🔴 Critique | 🟢 **Bloqué par mapping d'état** |
| **Logique Métier** | Injection d'entrées vides ou adresse nulle `0x0` | 🟡 Moyen | 🟢 **Validé par `require` stricts** |
| **Déni de Service** | Épuisement du Gas lors du Batch Mint (DoS) | 🟡 Faible | 🔵 **Mitigé (Lots recommandés 5-15)** |

---

## 3. Checklist de Sécurité Détaillée

### A. Contrôle d'Accès (Access Control)
- **Constat :** L'utilisation d'OpenZeppelin `AccessControl` remplace avantageusement le simple `onlyOwner`.
- **Rôles définis :**
  - `DEFAULT_ADMIN_ROLE` : Attribué au Doyen/Président pour la gestion suprême et la révocation (`revokeCertificate`).
  - `MINTER_ROLE` : Attribué au service de scolarité pour l'émission des diplômes (`mintCertificate` et `batchMintCertificates`).
- **Résultat :** Toute tentative d'appel non autorisé est interceptée avec la custom error `AccessControlUnauthorizedAccount`.

### B. Protection Anti-Réentrance (Reentrancy)
- **Constat :** Les fonctions de mint appellent `_safeMint`, qui invoque le hook `onERC721Received` sur les contrats destinataires.
- **Protection :** Ajout du modificateur `nonReentrant` d'OpenZeppelin et respect strict du pattern **Checks-Effects-Interactions (CEI)** : les variables d'état internes sont modifiées avant toute émission externe.

### C. Intégrité des Données & Règle Anti-Doublon
- **Constat :** Un étudiant ne doit pas pouvoir obtenir deux certificats avec le même identifiant CNE.
- **Protection :** Le mapping `_registeredStudents[studentId]` verrouille l'identifiant dès le premier mint. Toute tentative ultérieure lève une exception immédiate.

---

## 4. Résultats des Tests Automatisés (Hardhat / Mocha)

La suite de tests unitaires dédiée à l'audit (`test/AcademicCertificateNFT.test.ts`) a été exécutée :

```text
  AcademicCertificateNFT - Tests de Sécurité & Audit (ERC-721)
    ✔ 1. L'Admin et le Minter doivent posséder les bons rôles OpenZeppelin
    ✔ 2. Le compte Minter peut émettre un NFT ERC-721 valide pour l'étudiant
    ✔ 3. Sécurité : Un compte sans MINTER_ROLE ne peut pas émettre de diplôme
    ✔ 4. Sécurité : Rejette l'adresse nulle et les champs obligatoires vides
    ✔ 5. Sécurité : Bloque formellement l'émission de deux diplômes avec le même CNE
    ✔ 6. L'émission groupée (Batch Mint) attribue correctement chaque NFT à son propriétaire
    ✔ 7. Seul l'ADMIN peut révoquer un diplôme, un pirate est rejeté

  7 passing (514ms)