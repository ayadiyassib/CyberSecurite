// Adresse officielle issue du déploiement Hardhat
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ABI officiel du contrat CertificateRegistry
export const CONTRACT_ABI = [
  "function mintCertificate(address to, string studentName, string studentId, string diplomaTitle, string issueDate, string grade) external returns (uint256)",
  "function batchMint(address[] recipients, string[] studentNames, string[] studentIds, string[] diplomaTitles, string[] issueDates, string[] grades) external",
  "function getCertificate(uint256 certId) external view returns (tuple(string studentName, string studentId, string diplomaTitle, string issueDate, string grade, address recipient, bool revoked))",
  "function revoke(uint256 certId) external",
  "function getTotalCertificates() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event CertificateMinted(uint256 indexed certId, string studentId, string studentName, string diplomaTitle)",
  "event CertificateRevoked(uint256 indexed certId)"
];