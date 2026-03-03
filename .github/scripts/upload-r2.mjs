import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BUCKET = process.env.R2_BUCKET;
const ROOT = "sites";

if (!BUCKET) {
  console.error("❌ Falta R2_BUCKET en env.");
  process.exit(1);
}

const IGNORE_BASENAMES = new Set([".wranglerignore", ".DS_Store", "Thumbs.db"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      walk(full);
      continue;
    }

    const base = path.basename(full);
    if (base.startsWith(".") || IGNORE_BASENAMES.has(base)) continue; // 👈 clave

    const key = full.split(path.sep).join("/"); // sites/...
    console.log("⬆️  Subiendo:", key);

    execSync(
      `wrangler r2 object put ${BUCKET}/${key} --file ${JSON.stringify(full)} --remote`,
      { stdio: "inherit" }
    );
  }
}

if (!fs.existsSync(ROOT)) {
  console.log("⚠️ No existe la carpeta 'sites/'. Nada que subir.");
  process.exit(0);
}

walk(ROOT);
console.log("✅ Listo, subida terminada.");