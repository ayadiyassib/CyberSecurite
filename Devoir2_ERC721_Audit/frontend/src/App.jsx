import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import * as XLSX from "xlsx";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import "./App.css";

const iconPaths = {
  certificate: (
    <>
      <path d="M7 3.75h7.5L19 8.25v12A1.75 1.75 0 0 1 17.25 22h-10A1.75 1.75 0 0 1 5.5 20.25V5.5A1.75 1.75 0 0 1 7.25 3.75Z" />
      <path d="M14 4v5h5M8.5 13h7M8.5 16.5h7M10 22l2-2 2 2" />
    </>
  ),
  wallet: (
    <>
      <rect x="3.5" y="6" width="17" height="14.5" rx="2.5" />
      <path d="M3.5 9h17M16 14h.01M6 6l1-2h10l1 2" />
    </>
  ),
  building: (
    <>
      <path d="m3 9 9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20h17M2 22h20" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  send: (
    <>
      <path d="m21 3-7.2 18-3.8-7-7-3.8L21 3Z" />
      <path d="M10 14 21 3" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4.5 4.5L19 7" />
    </>
  ),
  x: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
};

function Icon({ name, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

// Résolution locale des URIs IPFS (sans service externe)
const resolveIpfsUri = (uri) => {
  if (!uri) return "#";
  if (uri.startsWith("ipfs://")) {
    return "/" + uri.replace("ipfs://", "ipfs/");
  }
  return uri;
};

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isMinter, setIsMinter] = useState(null);
  const [activeTab, setActiveTab] = useState("admin"); // 'admin' ou 'public'
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  // Formulaire unitaire
  const [singleForm, setSingleForm] = useState({
    studentName: "",
    studentId: "",
    diplomaTitle: "",
    issueDate: new Date().toISOString().split("T")[0],
    grade: "Mention Bien",
    recipientAddress: "",
  });

  // Import Excel
  const [excelData, setExcelData] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  // Consultation publique
  const [searchId, setSearchId] = useState("");
  const [certificateResult, setCertificateResult] = useState(null);

  // 1. Connexion au Wallet (MetaMask)
  const connectWallet = async () => {
    try {
      setErrorMessage("");
      if (!window.ethereum) {
        alert("Veuillez installer MetaMask !");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const certContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const minterHash = await certContract.MINTER_ROLE();
      const hasMinter = await certContract.hasRole(minterHash, userAddress);

      setAccount(userAddress);
      setContract(certContract);
      setIsMinter(hasMinter);
      setStatusMessage("Wallet connecté avec succès !");
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur de connexion wallet : " + (err.reason || err.message));
    }
  };

  // 2. Émission d'un certificat unitaire
  const handleSingleMint = async (e) => {
    e.preventDefault();
    if (!contract) return alert("Veuillez connecter votre wallet !");
    if (!isMinter) {
      setErrorMessage(" ACCÈS REFUSÉ (Sécurité) : Votre compte est connecté en tant que simple Visiteur. Le rôle MINTER_ROLE est obligatoire pour émettre un diplôme sur la blockchain.");
      setStatusMessage("");
      return;
    }
    if (!e.currentTarget.reportValidity()) return;

    setStatusMessage("Émission du certificat en cours...");
    setErrorMessage("");
    setTxHash("");

    try {
      const recipient = singleForm.recipientAddress.trim() || account;
      const tx = await contract.mintCertificate(
        recipient,
        singleForm.studentName,
        singleForm.studentId,
        singleForm.diplomaTitle,
        singleForm.issueDate,
        singleForm.grade,
        `ipfs://QmCertificates/${singleForm.studentId}.json`
      );
      setStatusMessage("Transaction envoyée. En attente de validation...");
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setStatusMessage("Certificat émis avec succès sur la blockchain.");
      
      // Reset formulaire
      setSingleForm({
        studentName: "",
        studentId: "",
        diplomaTitle: "",
        issueDate: new Date().toISOString().split("T")[0],
        grade: "Mention Bien",
        recipientAddress: "",
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur lors de l'émission : " + (err.reason || err.message));
      setStatusMessage("");
    }
  };

  // 3. Upload et Parsing du fichier Excel (SheetJS)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setErrorMessage("Le fichier Excel est vide.");
          return;
        }

        setExcelData(data);
        // Tout sélectionner par défaut
        setSelectedIndices(new Set(data.map((_, idx) => idx)));
        setStatusMessage(`Fichier chargé : ${data.length} étudiant(s) détecté(s).`);
        setErrorMessage("");
      } catch (err) {
        setErrorMessage("Erreur de lecture Excel : " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Gestion des cases à cocher du tableau Excel
  const toggleSelectRow = (index) => {
    const updated = new Set(selectedIndices);
    if (updated.has(index)) updated.delete(index);
    else updated.add(index);
    setSelectedIndices(updated);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === excelData.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(excelData.map((_, idx) => idx)));
    }
  };

  // 4. Émission Groupée (Batch Mint)
  const handleBatchMint = async () => {
    if (!contract) return alert("Veuillez connecter votre wallet !");
    if (!isMinter) {
      setErrorMessage(" ACCÈS REFUSÉ (Sécurité) : Votre compte est connecté en tant que simple Visiteur. Le rôle MINTER_ROLE est obligatoire pour émettre un diplôme sur la blockchain.");
      setStatusMessage("");
      return;
    }
    if (selectedIndices.size === 0) return alert("Veuillez sélectionner au moins un étudiant.");

    setStatusMessage("Émission groupée (Batch Mint) en cours...");
    setErrorMessage("");
    setTxHash("");

    try {
      const selectedStudents = excelData.filter((_, idx) => selectedIndices.has(idx));

      const recipients = [];
      const names = [];
      const ids = [];
      const diplomas = [];
      const dates = [];
      const grades = [];
      const uris = [];

      selectedStudents.forEach((st) => {
        recipients.push(st.recipientAddress || account);
        names.push(st.studentName || "");
        ids.push(st.studentId || "");
        diplomas.push(st.diplomaTitle || "");
        dates.push(st.issueDate || "");
        grades.push(st.grade || "");
        uris.push(`ipfs://QmBatch/${st.studentId}.json`);
      });

      const tx = await contract.batchMintCertificates(recipients, names, ids, diplomas, dates, grades, uris);
      setStatusMessage("Transaction Batch envoyée. En cours de confirmation...");
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setStatusMessage(`${selectedStudents.length} certificats émis en une seule transaction.`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Erreur Batch Mint : " + (err.reason || err.message));
      setStatusMessage("");
    }
  };

  // 5. Consultation publique par ID
  const handleSearchCertificate = async (e) => {
    e.preventDefault();
    if (!searchId || isNaN(searchId)) return alert("Veuillez entrer un ID valide (ex: 1)");
    setErrorMessage("");
    setStatusMessage("Recherche sur la Blockchain...");

    try {
      const provider = window.ethereum
        ? new ethers.BrowserProvider(window.ethereum)
        : new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const tokenId = BigInt(searchId);
      const [cert, tokenUri, owner] = await Promise.all([
        readContract.getCertificate(tokenId),
        readContract.tokenURI(tokenId),
        readContract.ownerOf(tokenId),
      ]);

      // Lecture et téléchargement des métadonnées JSON standard (ERC-721)
      let metadata = null;
      try {
        const metaUrl = resolveIpfsUri(tokenUri);
        const metaRes = await fetch(metaUrl);
        if (metaRes.ok) {
          metadata = await metaRes.json();
        }
      } catch (e) {
        console.warn("Impossible de charger les métadonnées IPFS :", e);
      }

      setCertificateResult({
        id: tokenId.toString(),
        studentName: cert.studentName,
        studentId: cert.studentId,
        diplomaTitle: cert.diplomaTitle,
        issueDate: cert.issueDate,
        grade: cert.grade,
        recipient: cert.recipient,
        revoked: cert.revoked,
        tokenUri,
        owner,
        metadata,
      });
      setStatusMessage("");
    } catch (err) {
      console.error(err);
      setCertificateResult(null);
      setErrorMessage("Certificat introuvable ou inexistant sur la Blockchain.");
      setStatusMessage("");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="certificate" />
          </div>
          <div className="brand-copy">
            <p className="eyebrow">PORTAIL UNIVERSITAIRE</p>
            <h1>Certification académique</h1>
            <p className="brand-description">Émission et vérification sécurisées sur la blockchain</p>
          </div>
        </div>
        <div className="wallet-box">
          {account ? (
            <span className="account-badge">
              Connecté : {account.substring(0, 6)}...{account.substring(account.length - 4)}
              {" — "}{isMinter ? "MINTER_ROLE" : "Visiteur"}
            </span>
          ) : (
            <button className="btn-primary" onClick={connectWallet}>
              <Icon name="wallet" />
              Connecter un wallet
            </button>
          )}
        </div>
      </header>

      {/* Barre d'onglets */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => setActiveTab("admin")}
        >
          <Icon name="building" />
          <span>Administration</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "public" ? "active" : ""}`}
          onClick={() => setActiveTab("public")}
        >
          <Icon name="search" />
          <span>Vérification publique</span>
        </button>
      </div>

      {/* Notifications */}
      {statusMessage && <div className="alert alert-success">{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {txHash && (
        <div className="alert alert-info">
          Tx Hash : <code>{txHash}</code>
        </div>
      )}

      {/* ======================================================= */}
      {/* ZONE ADMINISTRATEUR */}
      {/* ======================================================= */}
      {activeTab === "admin" && (
        <div className="tab-content">
          {/* Section 1 : Formulaire unitaire */}
          <section className="card">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Émettre un certificat</h2>
                <p>Renseignez les informations du diplômé.</p>
              </div>
            </div>
            <form onSubmit={handleSingleMint} className="form-grid" noValidate>
              <div className="form-group">
                <label>Nom complet de l'étudiant :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amina Benali"
                  value={singleForm.studentName}
                  onChange={(e) => setSingleForm({ ...singleForm, studentName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Identifiant CNE (studentId) :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2023-INF-042"
                  value={singleForm.studentId}
                  onChange={(e) => setSingleForm({ ...singleForm, studentId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Intitulé du Diplôme :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Licence Informatique"
                  value={singleForm.diplomaTitle}
                  onChange={(e) => setSingleForm({ ...singleForm, diplomaTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Date d'émission :</label>
                <input
                  type="date"
                  required
                  value={singleForm.issueDate}
                  onChange={(e) => setSingleForm({ ...singleForm, issueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mention :</label>
                <select
                  value={singleForm.grade}
                  onChange={(e) => setSingleForm({ ...singleForm, grade: e.target.value })}
                >
                  <option value="Passable">Passable</option>
                  <option value="Assez Bien">Assez Bien</option>
                  <option value="Mention Bien">Mention Bien</option>
                  <option value="Mention Très Bien">Mention Très Bien</option>
                </select>
              </div>

              <div className="form-group">
                <label>Adresse Wallet Destinataire (optionnel) :</label>
                <input
                  type="text"
                  placeholder="0x... (laisser vide pour mettre votre adresse)"
                  value={singleForm.recipientAddress}
                  onChange={(e) => setSingleForm({ ...singleForm, recipientAddress: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary full-width">
                <Icon name="send" />
                Émettre le Certificat
              </button>
            </form>
          </section>

          {/* Section 2 : Import Excel */}
          <section className="card">
            <div className="section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>Importation en lot</h2>
                <p>Importez un fichier Excel ou CSV pour préparer plusieurs certificats.</p>
              </div>
            </div>
            <div className="upload-box">
              <div className="upload-icon"><Icon name="upload" /></div>
              <div className="upload-copy">
                <strong>Importer une liste d’étudiants</strong>
                <p className="hint">Formats acceptés : .xlsx et .csv</p>
              </div>
              <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} />
            </div>

            {excelData.length > 0 && (
              <div className="table-wrapper">
                <h3>Aperçu des étudiants <span>({selectedIndices.size}/{excelData.length} sélectionnés)</span></h3>
                <div className="table-scroll">
                  <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedIndices.size === excelData.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Nom</th>
                      <th>CNE / ID</th>
                      <th>Diplôme</th>
                      <th>Date</th>
                      <th>Mention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, idx) => (
                      <tr key={idx} className={selectedIndices.has(idx) ? "selected-row" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIndices.has(idx)}
                            onChange={() => toggleSelectRow(idx)}
                          />
                        </td>
                        <td>{row.studentName}</td>
                        <td>{row.studentId}</td>
                        <td>{row.diplomaTitle}</td>
                        <td>{row.issueDate}</td>
                        <td>{row.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>

                <button onClick={handleBatchMint} className="btn-success full-width mt-10">
                  <Icon name="send" />
                  Émettre les {selectedIndices.size} certificats sélectionnés
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================= */}
      {/* ZONE PUBLIQUE */}
      {/* ======================================================= */}
      {activeTab === "public" && (
        <div className="tab-content">
          <section className="card">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Vérifier un diplôme</h2>
                <p>Consultez le registre pour confirmer l’authenticité d’un certificat.</p>
              </div>
            </div>
            <form onSubmit={handleSearchCertificate} className="search-form">
              <input
                type="number"
                min="1"
                placeholder="Entrez l'identifiant du certificat (ex: 1)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                <Icon name="search" />
                Vérifier sur la Blockchain
              </button>
            </form>

            {certificateResult && (
              <div className="diploma-card">
                <div className="diploma-header">
                  <h3>UNIVERSITÉ OFFICIELLE</h3>
                  <span className={`status-badge ${certificateResult.revoked ? "revoked" : "valid"}`}>
                    <Icon name={certificateResult.revoked ? "x" : "check"} />
                    {certificateResult.revoked ? "RÉVOQUÉ" : "AUTHENTIQUE & VALIDE"}
                  </span>
                </div>
                <div className="diploma-body">
                  <p>Certificat Officiel <strong>#{certificateResult.id}</strong></p>
                  <p className="student-name">{certificateResult.studentName}</p>
                  <p className="diploma-title">{certificateResult.diplomaTitle}</p>
                  <p><span className="account-badge">Token ID : #{certificateResult.id}</span></p>
                  <div className="alert alert-info">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong>Lien Métadonnées (IPFS)</strong>
                      <a
                        href={resolveIpfsUri(certificateResult.tokenUri)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          textDecoration: "none"
                        }}
                      >
                        Consulter JSON ↗
                      </a>
                    </div>
                    <code>
                      <a
                        href={resolveIpfsUri(certificateResult.tokenUri)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "inherit", textDecoration: "underline" }}
                        title="Ouvrir le fichier JSON standard ERC-721"
                      >
                        {certificateResult.tokenUri}
                      </a>
                    </code>
                  </div>

                  {certificateResult.metadata?.image && (
                    <div style={{ textAlign: "center", margin: "16px 0" }}>
                      <img
                        src={resolveIpfsUri(certificateResult.metadata.image)}
                        alt="Diplôme Officiel"
                        style={{
                          maxWidth: "320px",
                          width: "100%",
                          borderRadius: "10px",
                          border: "1px solid #d9dfeb",
                          boxShadow: "0 6px 12px -2px rgba(15, 23, 42, 0.08)"
                        }}
                      />
                    </div>
                  )}
                  <p className="recipient-text">
                    Détenteur actuel du NFT (ownerOf) : <code>{certificateResult.owner}</code>
                  </p>
                  <p>CNE / Matricule : <strong>{certificateResult.studentId}</strong></p>
                  <p>Mention : <strong>{certificateResult.grade}</strong></p>
                  <p>Délivré le : <strong>{certificateResult.issueDate}</strong></p>
                  <p className="recipient-text">
                    Bénéficiaire initial : <code>{certificateResult.recipient}</code>
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;