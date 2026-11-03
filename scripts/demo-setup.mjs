import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
const command = process.argv[2] || "seed";
const origin = process.env.DEMO_ORIGIN || "http://localhost:5173";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw new Error(
    "This helper only operates on local demo environments. Hosted seeding uses the authenticated deployment workflow.",
  );
if (!fs.existsSync(".demo-accounts.json")) {
  const accounts = [
    ["consignor@vintedge.demo", "Camille · consignor"],
    ["buyer@vintedge.demo", "Alex · buyer"],
    ["editor@vintedge.demo", "Morgan · editor"],
  ].map(([email, name]) => ({
    email,
    name,
    password: crypto.randomBytes(18).toString("base64url"),
  }));
  fs.writeFileSync(
    ".demo-accounts.json",
    JSON.stringify({ accounts }, null, 2),
    { mode: 0o600 },
  );
}
if (!fs.existsSync(".dev.vars"))
  fs.writeFileSync(
    ".dev.vars",
    "SETUP_SECRET=" + crypto.randomBytes(32).toString("hex") + "\n",
    { mode: 0o600 },
  );
if (command === "prepare") {
  console.log(
    "Generated local secrets and demo credentials. Start the app, then run npm run demo:seed.",
  );
  process.exit(0);
}
if (command === "reset") {
  if (!process.argv.includes("--confirm-local-demo-reset"))
    throw new Error(
      "Reset needs --confirm-local-demo-reset. It removes only this checkout’s local demo data; stop the preview first.",
    );
  const state = ".wrangler/state";
  if (fs.existsSync(state)) {
    const backup = `.wrangler/demo-backup-${Date.now()}`;
    fs.renameSync(state, backup);
    console.log(
      "Local database and objects moved to a recoverable backup:",
      backup,
    );
  }
  for (const file of fs
    .readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const r = spawnSync(
      process.execPath,
      [
        "--import",
        "./scripts/sites-env.mjs",
        "./node_modules/wrangler/bin/wrangler.js",
        "d1",
        "execute",
        "DB",
        "--local",
        "--config",
        "dist/server/wrangler.json",
        "--persist-to",
        ".wrangler/state",
        "--file",
        "drizzle/" + file,
      ],
      { stdio: "inherit" },
    );
    if (r.status !== 0) process.exit(r.status || 1);
  }
  console.log(
    "Restart the preview, then run npm run demo:seed. Hosted data was not touched.",
  );
  process.exit(0);
}
const secret = fs
  .readFileSync(".dev.vars", "utf8")
  .split("\n")
  .find((s) => s.startsWith("SETUP_SECRET="))
  ?.slice(13)
  .trim();
const r = await fetch(origin + "/api/setup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-setup-secret": secret || "",
  },
  body: fs.readFileSync(".demo-accounts.json", "utf8"),
});
const data = await r.json();
if (r.status === 409) {
  console.log("Demo environment is already seeded. Existing data preserved.");
} else if (!r.ok) {
  throw new Error(data.error || `Seed failed (${r.status})`);
} else
  console.log(
    "Seeded 18 items, six garment models, and three separate accounts. Credentials are in .demo-accounts.json.",
  );
