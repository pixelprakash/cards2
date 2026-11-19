import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, run the serverless functions in api/ locally (same files Vercel runs), and serve /researcher.
function localApi() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const [path] = (req.url || "").split("?");
        const m = path.match(/^\/api\/([a-z]+)$/);
        if (!m) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`);
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const raw = Buffer.concat(chunks).toString();
          // Like Vercel: a body that is not valid JSON makes reading req.body throw, which the handlers turn into a 400.
          const parsed = (() => { try { return (req.headers["content-type"] || "").includes("json") && raw ? JSON.parse(raw) : raw; } catch { return undefined; } })();
          Object.defineProperty(req, "body", { get() { if (parsed === undefined) throw new Error("Invalid JSON"); return parsed; }, configurable: true });
          res.status = (code) => ((res.statusCode = code), res);
          res.json = (obj) => (res.setHeader("content-type", "application/json"), res.end(JSON.stringify(obj)));
          await mod.default(req, res);
        } catch (err) {
          if (/Failed to load url/.test(String(err))) return next();
          res.statusCode = 500;
          res.end("API error");
        }
      });
      server.middlewares.use((req, _res, next) => {
        const [path, query = ""] = (req.url || "").split("?");
        if (path === "/researcher") req.url = `/researcher.html${query ? `?${query}` : ""}`;
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: "User-agent: *\nAllow: /\nDisallow: /researcher\nDisallow: /api/\n" });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
  build: { rollupOptions: { input: { main: "index.html", researcher: "researcher.html" } } },
});
