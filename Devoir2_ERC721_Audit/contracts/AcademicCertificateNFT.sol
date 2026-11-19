// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AcademicCertificateNFT
 * @notice Contrat conforme au standard ERC-721 pour la certification universitaire.
 * @dev Intègre AccessControl d'OpenZeppelin, ReentrancyGuard et vérification anti-doublon.
 */
contract AcademicCertificateNFT is ERC721URIStorage, AccessControl, ReentrancyGuard {

    // 1. Définition des Rôles 
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // 2. Structure interne des données du certificat
    struct Certificate {
        string studentName;
        string studentId;       // CNE
        string diplomaTitle;
        string issueDate;
        string grade;
        address recipient;
        bool revoked;
    }

    // Compteur de Token ID (NFT commence à 1)
    uint256 private _nextTokenId = 1;

    // Stockage : tokenId => Métadonnées internes
    mapping(uint256 => Certificate) private _certificates;

    // Règle de sécurité : studentId => déjà enregistré ? (Anti-doublon)
    mapping(string => bool) private _registeredStudents;

    // 3. Événements audités (Section 3.2)
    event CertificateMinted(
        uint256 indexed tokenId,
        string studentId,
        string studentName,
        string diplomaTitle
    );
    event CertificateRevoked(uint256 indexed tokenId);

    /**
     * @dev Le déployeur reçoit le rôle d'Admin suprême et de Minter par défaut.
     */
    constructor() ERC721("AcademicCertificateNFT", "ACERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Émet un certificat unique sous forme de NFT (ERC-721)
     * @dev Protégé par MINTER_ROLE et ReentrancyGuard
     */
    function mintCertificate(
        address to,
        string calldata studentName,
        string calldata studentId,
        string calldata diplomaTitle,
        string calldata issueDate,
        string calldata grade,
        string calldata uri
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        // Validation des entrées (Checklist d'audit)
        require(to != address(0), "Erreur: Adresse destinataire invalide");
        require(bytes(studentName).length > 0, "Erreur: Nom etudiant obligatoire");
        require(bytes(studentId).length > 0, "Erreur: CNE obligatoire");
        require(!_registeredStudents[studentId], "Erreur: Etudiant deja enregistre");

        uint256 tokenId = _nextTokenId++;

        // 1. Mint du NFT ERC-721 officiel vers le wallet de l'étudiant
        _safeMint(to, tokenId);

        // 2. Association du tokenURI (métadonnées JSON / IPFS)
        _setTokenURI(tokenId, uri);

        // 3. Stockage des métadonnées on-chain
        _certificates[tokenId] = Certificate({
            studentName: studentName,
            studentId: studentId,
            diplomaTitle: diplomaTitle,
            issueDate: issueDate,
            grade: grade,
            recipient: to,
            revoked: false
        });

        _registeredStudents[studentId] = true;

        emit CertificateMinted(tokenId, studentId, studentName, diplomaTitle);
        return tokenId;
    }

    /**
     * @notice Émission groupée de certificats (Batch Mint pour import Excel)
     */
    function batchMintCertificates(
        address[] calldata recipients,
        string[] calldata studentNames,
        string[] calldata studentIds,
        string[] calldata diplomaTitles,
        string[] calldata issueDates,
        string[] calldata grades,
        string[] calldata uris
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        uint256 count = studentNames.length;
        require(count > 0, "Erreur: Aucune donnee fournie");
        require(
            recipients.length == count &&
            studentIds.length == count &&
            diplomaTitles.length == count &&
            issueDates.length == count &&
            grades.length == count &&
            uris.length == count,
            "Erreur: Tailles de tableaux incoherentes"
        );

        for (uint256 i = 0; i < count; i++) {
            if (!_registeredStudents[studentIds[i]] && recipients[i] != address(0)) {
                uint256 tokenId = _nextTokenId++;

                _safeMint(recipients[i], tokenId);
                _setTokenURI(tokenId, uris[i]);

                _certificates[tokenId] = Certificate({
                    studentName: studentNames[i],
                    studentId: studentIds[i],
                    diplomaTitle: diplomaTitles[i],
                    issueDate: issueDates[i],
                    grade: grades[i],
                    recipient: recipients[i],
                    revoked: false
                });

                _registeredStudents[studentIds[i]] = true;
                emit CertificateMinted(tokenId, studentIds[i], studentNames[i], diplomaTitles[i]);
            }
        }
    }

    /**
     * @notice Révocation d'un certificat (réservé à l'administrateur DEFAULT_ADMIN_ROLE)
     */
    function revokeCertificate(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Erreur: Certificat inexistant");
        require(!_certificates[tokenId].revoked, "Erreur: Certificat deja revoque");

        _certificates[tokenId].revoked = true;
        emit CertificateRevoked(tokenId);
    }

    /**
     * @notice Consultation des données d'un certificat (Public & Gratuit)
     */
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_ownerOf(tokenId) != address(0), "Erreur: Certificat inexistant");
        return _certificates[tokenId];
    }

    /**
     * @notice Vérifie si un étudiant possède déjà un diplôme
     */
    function isStudentRegistered(string calldata studentId) external view returns (bool) {
        return _registeredStudents[studentId];
    }

    /**
     * @notice Retourne le nombre total de certificats émis
     */
    function getTotalCertificates() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // Résolution de conflit d'héritage standard entre ERC721URIStorage et AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}