import { expect } from "chai";
import { network } from "hardhat";

describe("AcademicCertificateNFT - Tests de Sécurité & Audit (ERC-721)", function () {
  let ethers: any;
  let nftContract: any;
  let admin: any;
  let minter: any;
  let student: any;
  let attacker: any;

  const SAMPLE_URI = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/cert1.json";

  before(async function () {
    const connection = await network.create();
    ethers = connection.ethers;
  });

  beforeEach(async function () {
    [admin, minter, student, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AcademicCertificateNFT");
    nftContract = await Factory.deploy();
    await nftContract.waitForDeployment();

    // L'Admin donne le rôle MINTER_ROLE au compte de scolarité
    const MINTER_ROLE = await nftContract.MINTER_ROLE();
    await nftContract.grantRole(MINTER_ROLE, minter.address);
  });

  // TEST 1 : Vérification des rôles
  it("1. L'Admin et le Minter doivent posséder les bons rôles OpenZeppelin", async function () {
    const DEFAULT_ADMIN_ROLE = await nftContract.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await nftContract.MINTER_ROLE();

    expect(await nftContract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
    expect(await nftContract.hasRole(MINTER_ROLE, minter.address)).to.equal(true);
    expect(await nftContract.hasRole(MINTER_ROLE, attacker.address)).to.equal(false);
  });

  // TEST 2 : Mint Réussi
  it("2. Le compte Minter peut émettre un NFT ERC-721 valide pour l'étudiant", async function () {
    const tx = await nftContract.connect(minter).mintCertificate(
      student.address,
      "Amina Benali",
      "2023-INF-042",
      "Licence Informatique",
      "2026-06-15",
      "Mention Bien",
      SAMPLE_URI
    );
    await tx.wait();

    expect(await nftContract.ownerOf(1)).to.equal(student.address);
    expect(await nftContract.balanceOf(student.address)).to.equal(1);
    expect(await nftContract.tokenURI(1)).to.equal(SAMPLE_URI);

    const cert = await nftContract.getCertificate(1);
    expect(cert.studentName).to.equal("Amina Benali");
    expect(cert.studentId).to.equal("2023-INF-042");
    expect(cert.revoked).to.equal(false);
  });

  // TEST 3 : Sécurité Contrôle d'Accès (Rejeté avec Custom Error OpenZeppelin)
  it("3. Sécurité : Un compte sans MINTER_ROLE ne peut pas émettre de diplôme", async function () {
    await expect(
      nftContract.connect(attacker).mintCertificate(
        attacker.address,
        "Faux Diplôme",
        "PIRATE-999",
        "Master Sécurité",
        "2026-06-15",
        "Excellent",
        SAMPLE_URI
      )
    ).to.be.revertedWithCustomError(nftContract, "AccessControlUnauthorizedAccount");
  });

  // TEST 4 : Validation des Entrées
  it("4. Sécurité : Rejette l'adresse nulle et les champs obligatoires vides", async function () {
    await expect(
      nftContract.connect(minter).mintCertificate(
        ethers.ZeroAddress,
        "Amina Benali",
        "2023-INF-043",
        "Licence",
        "2026-06-15",
        "Bien",
        SAMPLE_URI
      )
    ).to.be.revertedWith("Erreur: Adresse destinataire invalide");

    await expect(
      nftContract.connect(minter).mintCertificate(
        student.address,
        "",
        "2023-INF-044",
        "Licence",
        "2026-06-15",
        "Bien",
        SAMPLE_URI
      )
    ).to.be.revertedWith("Erreur: Nom etudiant obligatoire");
  });

  // TEST 5 : Anti-Doublon
  it("5. Sécurité : Bloque formellement l'émission de deux diplômes avec le même CNE", async function () {
    await nftContract.connect(minter).mintCertificate(
      student.address,
      "Amina Benali",
      "2023-INF-042",
      "Licence Informatique",
      "2026-06-15",
      "Mention Bien",
      SAMPLE_URI
    );

    await expect(
      nftContract.connect(minter).mintCertificate(
        student.address,
        "Amina Benali (Copie)",
        "2023-INF-042",
        "Autre Diplôme",
        "2026-06-15",
        "Passable",
        SAMPLE_URI
      )
    ).to.be.revertedWith("Erreur: Etudiant deja enregistre");
  });

  // TEST 6 : Batch Mint
  it("6. L'émission groupée (Batch Mint) attribue correctement chaque NFT à son propriétaire", async function () {
    const recipients = [student.address, attacker.address];
    const names = ["Amina Benali", "Yassine Mansouri"];
    const ids = ["2023-INF-042", "2023-INF-089"];
    const diplomas = ["Licence", "Master"];
    const dates = ["2026-06-15", "2026-06-15"];
    const grades = ["Bien", "Très Bien"];
    const uris = ["ipfs://cert1", "ipfs://cert2"];

    await nftContract.connect(minter).batchMintCertificates(
      recipients,
      names,
      ids,
      diplomas,
      dates,
      grades,
      uris
    );

    expect(await nftContract.getTotalCertificates()).to.equal(2);
    expect(await nftContract.ownerOf(1)).to.equal(student.address);
    expect(await nftContract.ownerOf(2)).to.equal(attacker.address);
  });

  // TEST 7 : Révocation (Rejetée pour l'attaquant, réussie pour l'Admin)
  it("7. Seul l'ADMIN peut révoquer un diplôme, un pirate est rejeté", async function () {
    await nftContract.connect(minter).mintCertificate(
      student.address,
      "Amina Benali",
      "2023-INF-042",
      "Licence Informatique",
      "2026-06-15",
      "Mention Bien",
      SAMPLE_URI
    );

    // Le pirate essaie de révoquer : Rejeté avec l'erreur AccessControl
    await expect(
      nftContract.connect(attacker).revokeCertificate(1)
    ).to.be.revertedWithCustomError(nftContract, "AccessControlUnauthorizedAccount");

    // L'Admin révoque : Réussite !
    await nftContract.connect(admin).revokeCertificate(1);
    const cert = await nftContract.getCertificate(1);
    expect(cert.revoked).to.equal(true);
  });
});