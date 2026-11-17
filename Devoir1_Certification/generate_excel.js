import * as XLSX from "xlsx";

// Données conformes au modèle de la Section 4 du PDF
const etudiants = [
  {
    studentName: "Amina Benali",
    studentId: "2023-INF-042",
    diplomaTitle: "Licence Informatique",
    issueDate: "2026-06-15",
    recipientAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    grade: "Mention Bien",
  },
  {
    studentName: "Yassine Mansouri",
    studentId: "2023-INF-089",
    diplomaTitle: "Master CyberSecurite",
    issueDate: "2026-06-15",
    recipientAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    grade: "Mention Tres Bien",
  },
  {
    studentName: "Sara El Amrani",
    studentId: "2023-INF-104",
    diplomaTitle: "Licence Informatique",
    issueDate: "2026-06-15",
    recipientAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    grade: "Mention Bien",
  },
  {
    studentName: "Omar Idrissi",
    studentId: "2023-INF-115",
    diplomaTitle: "Master Intelligence Artificielle",
    issueDate: "2026-06-15",
    recipientAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    grade: "Mention Tres Bien",
  },
];

// Création du fichier Excel
const worksheet = XLSX.utils.json_to_sheet(etudiants);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Etudiants");

// Sauvegarde dans le fichier étudiants.xlsx
XLSX.writeFile(workbook, "étudiants.xlsx");

console.log("✅ Fichier 'étudiants.xlsx' généré avec succès avec 4 étudiants !");