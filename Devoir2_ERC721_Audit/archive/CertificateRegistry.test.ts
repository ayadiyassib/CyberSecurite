import { expect } from "chai";
import { network } from "hardhat";

describe("CertificateRegistry - Tests Unitaires", function () {
  let ethers: any;
  let registry: any;
  let owner: any;
  let student: any;
  let attacker: any;

  // Avant les tests, on initialise la connexion réseau Hardhat 3
  before(async function () {
    const connection = await network.create();
    ethers = connection.ethers;
  });

  // Avant chaque test, on déploie un contrat tout neuf
  beforeEach(async function () {
    [owner, student, attacker] = await ethers.getSigners();
    const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
    registry = await CertificateRegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  it("1. Doit definir l'universite comme proprietaire (owner)", async function () {
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("2. L'universite peut emettre un certificat unitaire", async function () {
    const tx = await registry.mintCertificate(
      student.address,
      "Amina Benali",
      "2023-INF-042",
      "Licence Informatique",
      "2026-06-15",
      "Mention Bien"
    );
    await tx.wait();

    expect(await registry.getTotalCertificates()).to.equal(1);

    const cert = await registry.getCertificate(1);
    expect(cert.studentName).to.equal("Amina Benali");
    expect(cert.studentId).to.equal("2023-INF-042");
    expect(cert.diplomaTitle).to.equal("Licence Informatique");
    expect(cert.grade).to.equal("Mention Bien");
    expect(cert.revoked).to.equal(false);
  });

  it("3. Un compte non autorise (pirate) ne peut pas emettre (Securite)", async function () {
    await expect(
      registry.connect(attacker).mintCertificate(
        attacker.address,
        "Faux Diplome",
        "PIRATE-001",
        "Master Cyber",
        "2026-06-15",
        "Excellent"
      )
    ).to.be.revertedWith("Erreur: Seul l'administrateur peut effectuer cette action");
  });

  it("4. Empeche le double enregistrement du meme studentId (Anti-doublon)", async function () {
    await registry.mintCertificate(
      student.address,
      "Amina Benali",
      "2023-INF-042",
      "Licence Informatique",
      "2026-06-15",
      "Mention Bien"
    );

    await expect(
      registry.mintCertificate(
        student.address,
        "Amina Benali (Copie)",
        "2023-INF-042",
        "Autre Diplome",
        "2026-06-15",
        "Passable"
      )
    ).to.be.revertedWith("Erreur: Cet etudiant possede deja un certificat");
  });

  it("5. L'emission groupee (Batch Mint) fonctionne pour plusieurs etudiants", async function () {
    const recipients = [student.address, attacker.address];
    const names = ["Etudiant Un", "Etudiant Deux"];
    const ids = ["ID-001", "ID-002"];
    const diplomas = ["Licence", "Master"];
    const dates = ["2026-06-15", "2026-06-15"];
    const grades = ["Bien", "Tres Bien"];

    await registry.batchMint(recipients, names, ids, diplomas, dates, grades);

    expect(await registry.getTotalCertificates()).to.equal(2);
    const cert1 = await registry.getCertificate(1);
    const cert2 = await registry.getCertificate(2);
    expect(cert1.studentName).to.equal("Etudiant Un");
    expect(cert2.studentName).to.equal("Etudiant Deux");
  });

// L'exemple : Un étudiant diplômé a triché à ses examens. L'université décide d'invalider son diplôme.
  it("6. La revocation d'un certificat invalide fonctionne", async function () {
    await registry.mintCertificate(
      student.address,
      "Amina Benali",
      "2023-INF-042",
      "Licence Informatique",
      "2026-06-15",
      "Mention Bien"
    );

    await registry.revoke(1);

    const cert = await registry.getCertificate(1);
    expect(cert.revoked).to.equal(true);
  });
});