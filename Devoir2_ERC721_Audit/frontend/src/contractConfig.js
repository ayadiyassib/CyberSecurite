export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function mintCertificate(address to, string studentName, string studentId, string diplomaTitle, string issueDate, string grade, string uri) external returns (uint256)",
  "function batchMintCertificates(address[] recipients, string[] studentNames, string[] studentIds, string[] diplomaTitles, string[] issueDates, string[] grades, string[] uris) external",
  "function getCertificate(uint256 tokenId) external view returns (tuple(string studentName, string studentId, string diplomaTitle, string issueDate, string grade, address recipient, bool revoked))",
  "function revokeCertificate(uint256 tokenId) external",
  "function getTotalCertificates() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function MINTER_ROLE() external view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)"
];