/**
 * Next.js `output: "standalone"` não empacota `.next/static` nem `public`.
 * Sem esta cópia, em produção os pedidos a `/_next/static/*` falham e o Tailwind/CSS não carrega.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standaloneMarker = path.join(root, ".next", "standalone", "server.js");

if (!fs.existsSync(standaloneMarker)) {
  console.warn("copy-standalone-assets: ignorado (sem bundle standalone — ex.: build incompleto)");
  process.exit(0);
}

const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(root, ".next", "standalone", ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(root, ".next", "standalone", "public");

if (!fs.existsSync(staticSrc)) {
  console.error("copy-standalone-assets: falta .next/static — rode o build completo antes.");
  process.exit(1);
}

fs.mkdirSync(path.dirname(staticDest), { recursive: true });
fs.rmSync(staticDest, { recursive: true, force: true });
fs.cpSync(staticSrc, staticDest, { recursive: true });

fs.rmSync(publicDest, { recursive: true, force: true });
fs.cpSync(publicSrc, publicDest, { recursive: true });

console.log("copy-standalone-assets: .next/static e public copiados para .next/standalone/");
