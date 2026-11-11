# Rapport Technique - Atelier 3 : Smart Contract & DApp Web3 "Mini Réseau Social"

**Auteur :** Yaasin Ayadi  
**Matière :** Cybersécurité & Blockchain  
**Enseignante :** Pr. Ikram BEN ABDEL OUAHAB  
**Année :** 2026/2027  

---

## 1. Introduction & Objectif
L'objectif de cet atelier est de concevoir, déployer et interagir avec une **Application Décentralisée (DApp)** complète basée sur la blockchain Ethereum (réseau de test public Sepolia). Ce projet réunit les trois piliers du Web3 :
1. **Un Smart Contract (`MiniSocial.sol`)** : assurant l'immuabilité et l'intégrité des messages.
2. **Un Wallet utilisateur (MetaMask)** : gérant l'identité et les signatures cryptographiques (`msg.sender`).
3. **Une Interface Web Frontend (`index.html`)** : permettant l'interaction utilisateur via la bibliothèque `Web3.js`.

---

## 2. Architecture du Smart Contract (`MiniSocial.sol`)
Rédigé en Solidity (`^0.8.26`), le contrat repose sur les éléments fondamentaux suivants :
- **Structure `Post`** : encapsule le message textuel (`string message`) et l'adresse publique de son auteur (`address author`).
- **Tableau dynamique `posts[]`** : registre public chronologique de l'ensemble des publications.
- **Fonction `publishPost(string _message)`** : crée un nouveau message en assignant automatiquement `msg.sender` comme auteur, puis l'ajoute au registre (génère une transaction payée en gas).
- **Fonction `getPost(uint index)` [view]** : lecture gratuite et décentralisée d'un post spécifique via son index.
- **Fonction `getTotalPosts()` [view]** : consultation gratuite du volume total de publications enregistrées.

---

## 3. Architecture de la DApp Web3 (`index.html`)
L'interface utilisateur a été développée en HTML5/JavaScript et utilise **Web3.js** pour communiquer avec le nœud Ethereum :
- **Authentification décentralisée** : Détection et connexion automatique à MetaMask via `window.ethereum.request({ method: 'eth_requestAccounts' })`.
- **Lecture asynchrone** : Récupération du compteur de posts via `getTotalPosts().call()`, puis itération sur `getPost(i).call()` pour générer dynamiquement le fil d'actualité.
- **Émission de transactions** : Formulaire permettant la rédaction d'un post et déclenchement d'une transaction signée via `contract.methods.publishPost(...).send({ from: userAccount })`.

---

## 4. Environnement & Outils Utilisés
- **Remix IDE** : Environnement de compilation et premier déploiement.
- **MetaMask** : Portefeuille d'adresses et gestionnaire de clés privées.
- **Réseau de test** : Ethereum Sepolia Testnet (Chain ID : `11155111`).
- **Adresse du Contrat Déployé** : `0x3c48972E9c855a1be2e6f42a5a04eb92408b53D7`.

---

## 5. Protocole Expérimental & Résultats

### Phase 1 : Tests sur Remix IDE
1. **Déploiement initial** : Déployé par le **Compte 1** (`0x0662910dF0Ed70795712FA0287C436CCf2b44712`).
2. **Publication Multi-Comptes** :
   - Message 1 (`"Bienvenue sur MiniSocial !"`) publié par le Compte 1.
   - Message 2 (`"Deuxieme message par un autre utilisateur"`) publié par le **Compte 2** (`0x937B4af9B2996090C2F7c402467b3D635DD4E00D`).
3. **Vérification** :
   - Appel de `getTotalPosts()` validant la présence de `2` messages.
   - Appel de `getPost(0)` et `getPost(1)` confirmant l'association exacte entre chaque message et son auteur respectif.

---

### Phase 2 : Tests en Direct sur la DApp Web3
1. **Connexion Web3** : Connexion réussie du navigateur au portefeuille MetaMask sur le réseau Sepolia.
2. **Signature et Envoi** : Rédaction d'un nouveau message (`"Bonjour et Bienvenue"`), ouverture de la pop-up MetaMask et validation de la signature cryptographique.
3. **Mise à jour en direct** : Après validation du bloc par les validateurs Ethereum Sepolia, le fil d'actualité est rafraîchi dynamiquement pour afficher l'ensemble des 4 messages enregistrés dans le contrat.

---

## 6. Conclusion
Cet atelier a permis d'appréhender le cycle de développement complet d'une application Web3 : de l'implémentation du contrat intelligent en Solidity, à la gestion du gas et des signatures sur un testnet public, jusqu'à la conception d'un client web décentralisé interagissant en temps réel avec la blockchain.