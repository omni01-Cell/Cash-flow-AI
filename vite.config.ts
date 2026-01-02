import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Chargement des variables d'environnement basées sur le mode (dev/prod)
  const env = loadEnv(mode, '.', '');
  
  return {
    // 1. Configuration du serveur de développement (npm run dev)
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true, // Autorise l'accès depuis n'importe quel hôte
    },

    // 2. Configuration du serveur de prévisualisation (utilisé par Render après le build)
    preview: {
      port: 4173,
      host: '0.0.0.0',
      allowedHosts: true, // RÉSOUT L'ERREUR : "This host is not allowed"
    },

    plugins: [react()],

    // Injection des variables d'environnement dans le code client
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        // Permet d'utiliser '@' pour référencer la racine du projet
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
