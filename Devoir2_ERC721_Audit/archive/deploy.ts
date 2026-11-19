import { network } from "hardhat";

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploiement du contrat CertificateRegistry (Hardhat 3)...");

  // Connexion explicite au reseau selon la norme Hardhat 3
  const connection = await network.create();
  const { ethers } = connection;

  const [deployer] = await ethers.getSigners();
  console.log("Compte deployeur (Admin) :", deployer.address);

  // Deploiement du contrat
  const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
  const registry = await CertificateRegistryFactory.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("====================================================");
  console.log("✅ Contrat deploye avec succes a l'adresse :");
  console.log(contractAddress);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("Erreur lors du deploiement :", error);
  process.exitCode = 1;
});