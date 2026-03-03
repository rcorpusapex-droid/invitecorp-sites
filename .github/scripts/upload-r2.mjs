import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const bucket = process.env.R2_BUCKET || "invitecorp-sites";
const root = "sites";

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }

    const key = full.replace(/\\/g, "/");
    execSync(`wrangler r2 object put ${bucket}/${key} --file ${JSON.stringify(full)}`, {
      stdio: "inherit",
    });
  }
}

if (!fs.existsSync(root)) process.exit(0);
walk(root);
console.log("✅ Upload completo");