import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupIpfsMiddleware = (middlewares) => {
  middlewares.use((req, res, next) => {
    if (req.url && req.url.startsWith('/ipfs/')) {
      const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
      const filePath = path.join(__dirname, 'public', decodedUrl);

      // Si le fichier existe physiquement sur le disque, on laisse le serveur statique le servir
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return next();
      }

      // Si c'est un fichier .json demandé sur /ipfs/, on génère dynamiquement des métadonnées ERC-721 conformes
      if (decodedUrl.endsWith('.json')) {
        const parts = decodedUrl.split('/');
        const filename = parts[parts.length - 1];
        const studentId = filename.replace('.json', '');
        const metadata = {
          name: `Diplôme Universitaire - ${studentId}`,
          description: `Certificat officiel délivré par l'Université Officielle pour le matricule ${studentId}.`,
          image: '/ipfs/diplome-officiel.svg',
          external_url: 'http://localhost:5173',
          attributes: [
            { trait_type: 'CNE / Matricule', value: studentId },
            { trait_type: 'Statut', value: 'Authentique & Valide' },
            { trait_type: 'Réseau', value: 'IPFS Local (Dev)' }
          ]
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(metadata, null, 2));
        return;
      }
    }
    next();
  });
};

const localIpfsPlugin = () => ({
  name: 'local-ipfs-plugin',
  configureServer(server) {
    setupIpfsMiddleware(server.middlewares);
  },
  configurePreviewServer(server) {
    setupIpfsMiddleware(server.middlewares);
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localIpfsPlugin()],
});
