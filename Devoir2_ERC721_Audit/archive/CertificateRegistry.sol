// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract CertificateRegistry {

    // 1. Structure exacte demandée par le sujet
    struct Certificate {
        string studentName;
        string studentId;       // Identifiant unique (ex: CNE)
        string diplomaTitle;    // Intitulé du diplôme
        string issueDate;       // Date d'émission (format ISO YYYY-MM-DD)
        string grade;           // Mention (ex: Mention Bien)
        address recipient;      // Adresse wallet de l'étudiant (optionnel)
        bool revoked;           // Statut de validité
    }

    // Propriétaire du contrat (l'université / admin)
    address public owner;

    // Compteur pour les identifiants uniques de certificats (commence à 1)
    uint256 public nextCertId = 1;

    // Stockage : certId => Certificate
    mapping(uint256 => Certificate) public certificates;

    // Exigence anti-doublon : studentId => bool
    mapping(string => bool) public registeredStudents;

    // Événements demandés
    event CertificateMinted(
        uint256 indexed certId,
        string studentId,
        string studentName,
        string diplomaTitle
    );
    event CertificateRevoked(uint256 indexed certId);

    // Modificateur pour réserver les actions à l'université
    modifier onlyOwner() {
        require(msg.sender == owner, "Erreur: Seul l'administrateur peut effectuer cette action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // 2. Émission unitaire d'un certificat
    function mintCertificate(
        address to,
        string calldata studentName,
        string calldata studentId,
        string calldata diplomaTitle,
        string calldata issueDate,
        string calldata grade
    ) external onlyOwner returns (uint256 certId) {
        // Exigence minimale de robustesse : Empêcher le double enregistrement
        require(!registeredStudents[studentId], "Erreur: Cet etudiant possede deja un certificat");
        require(bytes(studentName).length > 0, "Le nom ne peut pas etre vide");
        require(bytes(studentId).length > 0, "Le studentId ne peut pas etre vide");

        certId = nextCertId++;

        // Écriture directe en storage
        Certificate storage c = certificates[certId];
        c.studentName = studentName;
        c.studentId = studentId;
        c.diplomaTitle = diplomaTitle;
        c.issueDate = issueDate;
        c.grade = grade;
        c.recipient = to;
        c.revoked = false;

        registeredStudents[studentId] = true;

        emit CertificateMinted(certId, studentId, studentName, diplomaTitle);
        return certId;
    }

    // 3. Émission groupée (Batch Mint) pour l'import Excel
    function batchMint(
        address[] calldata recipients,
        string[] calldata studentNames,
        string[] calldata studentIds,
        string[] calldata diplomaTitles,
        string[] calldata issueDates,
        string[] calldata grades
    ) external onlyOwner {
        uint256 count = studentNames.length;
        require(count > 0, "Aucune donnee fournie");
        require(
            recipients.length == count &&
            studentIds.length == count &&
            diplomaTitles.length == count &&
            issueDates.length == count &&
            grades.length == count,
            "Erreur: Tailles de tableaux incoherentes"
        );

        for (uint256 i = 0; i < count; i++) {
            if (!registeredStudents[studentIds[i]]) {
                uint256 currentId = nextCertId++;
                Certificate storage c = certificates[currentId];
                c.studentName = studentNames[i];
                c.studentId = studentIds[i];
                c.diplomaTitle = diplomaTitles[i];
                c.issueDate = issueDates[i];
                c.grade = grades[i];
                c.recipient = recipients[i];
                c.revoked = false;

                registeredStudents[studentIds[i]] = true;
                emit CertificateMinted(currentId, studentIds[i], studentNames[i], diplomaTitles[i]);
            }
        }
    }

    // 4. Consultation publique d'un certificat (view)
    function getCertificate(uint256 certId) external view returns (Certificate memory) {
        require(certId > 0 && certId < nextCertId, "Erreur: Certificat inexistant");
        return certificates[certId];
    }

    // 5. Révocation d'un certificat (optionnel mais requis dans le sujet)
    function revoke(uint256 certId) external onlyOwner {
        require(certId > 0 && certId < nextCertId, "Erreur: Certificat inexistant");
        require(!certificates[certId].revoked, "Erreur: Certificat deja revoque");

        certificates[certId].revoked = true;
        emit CertificateRevoked(certId);
    }

    // Fonction utilitaire pour connaître le nombre total émis
    function getTotalCertificates() external view returns (uint256) {
        return nextCertId - 1;
    }
}