// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract MiniSocial {

    // 1. Définition de la structure d'un Post
    // Chaque message a un texte et une adresse d'auteur
    struct Post {
        string message;
        address author;
    }

    // 2. Tableau dynamique pour stocker tous les messages
    Post[] public posts;

    // 3. Fonction pour publier un message
    // msg.sender = adresse du portefeuille qui clique sur le bouton
    function publishPost(string memory _message) public {
        require(bytes(_message).length > 0, "Le message ne peut pas etre vide");

        Post memory newPost = Post({
            message: _message,
            author: msg.sender
        });

        posts.push(newPost);
    }

    // 4. Fonction pour lire un post par son numero (index)
    // "view" signifie qu'on lit seulement (c'est gratuit, zero gas !)
    function getPost(uint index) public view returns (string memory, address) {
        require(index < posts.length, "Index invalide");
        
        Post memory p = posts[index];
        return (p.message, p.author);
    }

    // 5. Fonction pour connaitre le nombre total de messages
    function getTotalPosts() public view returns (uint) {
        return posts.length;
    }
}