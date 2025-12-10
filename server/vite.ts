import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  console.log("Starting Vite server creation...");
  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });
  console.log("Vite server created successfully");

  // Vite middleware for handling imports/modules
  console.log("Adding Vite middlewares");
  app.use(vite.middlewares);
  
  // Add a middleware that skips API routes
  app.use((req, res, next) => {
    console.log("Vite app middleware - checking path:", req.path);
    // Skip if this is an API route - let Express route handlers deal with it
    if (req.path.startsWith("/api/")) {
      console.log("Skipping API route:", req.path);
      return next();
    }
    
    console.log("Rendering app for:", req.path);
    // For non-API routes, render the Vue/React app
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      
      vite.transformIndexHtml(url, template).then((page) => {
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }).catch((e) => {
        console.error("Vite transform error:", e);
        vite.ssrFixStacktrace(e as Error);
        res.status(500).send("Error loading app");
      });
    } catch (e) {
      console.error("Vite template error:", e);
      vite.ssrFixStacktrace(e as Error);
      res.status(500).send("Error loading app");
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
