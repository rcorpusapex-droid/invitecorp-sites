import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BUCKET = process.env.R2_BUCKET;
const ROOT = "sites";

if (!BUCKET) {
  console.error("❌ Falta R2_BUCKET en env.");
  process.exit(1);
}

const IGNORE_DIRS = new Set(["node_modules", ".git", ".wrangler"]);
const IGNORE_FILES = new Set([".wranglerignore", ".DS_Store"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);

    // Ignorar carpetas pesadas / internas
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name) || e.name.startsWith(".")) continue;
      walk(full);
      continue;
    }

    // Ignorar archivos ocultos y algunos problemáticos
    if (e.name.startsWith(".") || IGNORE_FILES.has(e.name)) continue;

    const key = full.split(path.sep).join("/"); // sites/xxx/index.html

    console.log("⬆️ Subiendo:", key);
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