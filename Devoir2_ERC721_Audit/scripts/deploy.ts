import { network } from "hardhat";

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploiement du contrat AcademicCertificateNFT (ERC-721)...");

  const connection = await network.create();
  const { ethers } = connection;

  const [admin] = await ethers.getSigners();
  console.log("Admin & Minter initial :", admin.address);

  const Factory = await ethers.getContractFactory("AcademicCertificateNFT");
  const nftContract = await Factory.deploy();
  await nftContract.waitForDeployment();

  const contractAddress = await nftContract.getAddress();
  console.log("====================================================");
  console.log("✅ AcademicCertificateNFT deploye a l'adresse :");
  console.log(contractAddress);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("Erreur deploiement :", error);
  process.exitCode = 1;
});