# Rapport Technique - Atelier 3 : Smart Contract "Mini Réseau Social"

**Auteur :** Yaasin Ayadi  
**Matière :** Cybersécurité & Blockchain  
**Enseignante :** Pr. Ikram BEN ABDEL OUAHAB  
**Année :** 2026/2027  

---

## 1. Introduction & Objectif
L'objectif de cet atelier est de concevoir, déployer et tester un Smart Contract décentralisé nommé **MiniSocial** sur la blockchain Ethereum (réseau de test Sepolia). Ce contrat permet aux utilisateurs de publier des messages immuables et garantit l'authenticité de l'auteur grâce aux clés cryptographiques de MetaMask (`msg.sender`).

## 2. Architecture du Smart Contract (MiniSocial.sol)
Le contrat est rédigé en Solidity (^0.8.26) et s'articule autour des éléments suivants :
- **Structure `Post`** : encapsule le contenu textuel (`string message`) et l'adresse publique de l'émetteur (`address author`).
- **Tableau dynamique `posts`** : stocke la liste chronologique de tous les messages.
- **Fonction `publishPost(string _message)`** : crée un nouveau `Post` en associant automatiquement `msg.sender` comme auteur, puis l'ajoute au tableau (nécessite une transaction et du gas).
- **Fonction `getPost(uint index)` [view]** : permet de consulter gratuitement le message et l'auteur d'un post donné.
- **Fonction `getTotalPosts()` [view]** : retourne le nombre total de messages enregistrés.

## 3. Environnement et Outils Utilisés
- **Remix IDE** : environnement de développement et de compilation Solidity.
- **MetaMask** : extension de gestion de portefeuille Web3.
- **Réseau de test** : Ethereum Sepolia Testnet.
- **Adresse du contrat déployé** : `0x3c48972E9c855a1be2e6f42a5a04eb92408b53D7`.

## 4. Protocole Expérimental et Résultats des Tests

### Test 1 : Déploiement et Publication par le Compte 1
- **Compte émetteur :** `0x0662910df0ed70795712fa0287c436ccf2b44712`
- **Action :** Appel de `publishPost("Bienvenue sur MiniSocial !")`.
- **Résultat :** Transaction validée avec succès sur le bloc Sepolia.

### Test 2 : Publication par un Second Compte (Multi-utilisateurs)
- **Compte émetteur :** `0x937b4af9b2996090c2f7c402467b3d635dd4e00d` (créé et approvisionné avec 0.02 SepoliaETH).
- **Action :** Appel de `publishPost("Deuxieme message par un autre utilisateur")`.
- **Résultat :** Transaction confirmée, prouvant le fonctionnement multi-utilisateurs.

### Test 3 : Vérification de la Persistance et Intégrité des Données
- L'appel de `getTotalPosts()` renvoie `2`.
- L'appel de `getPost(0)` restitue le message initial avec l'adresse du Compte 1.
- L'appel de `getPost(1)` restitue le second message avec l'adresse du Compte 2.

## 5. Conclusion
L'atelier a permis de valider le cycle de vie complet d'un Smart Contract Ethereum : de l'écriture en Solidity jusqu'à la consultation décentralisée en passant par la gestion des signatures transactionnelles avec MetaMask.