import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to simulate Vercel serverless function during local dev
const enkaProxyPlugin = () => ({
  name: 'enka-proxy',
  configureServer(server) {
    server.middlewares.use('/api/enka', async (req, res) => {
      // Parse the query parameter
      const url = new URL(req.url, `http://${req.headers.host}`);
      const uid = url.searchParams.get('uid');

      if (!uid) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'UID required' }));
      }

      try {
        const fetchReq = await fetch(`https://enka.network/api/uid/${uid}/`, {
          headers: { 'User-Agent': 'GenshinArtifactManager/1.0', 'Accept': 'application/json' }
        });
        const data = await fetchReq.text();
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = fetchReq.status;
        res.end(data);
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), enkaProxyPlugin()],
})
