/**
 * Safe MongoDB connection diagnostics — never prints the password.
 * Usage: node scripts/mongo-diagnose.js
 */
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");

const uri = (process.env.MONGODB_URI || "").trim();

if (!uri) {
  console.error("MONGODB_URI is not set in .env");
  process.exit(1);
}

function parseUriSafe(raw) {
  const match = raw.match(/^mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) {
    return { valid: false, error: "URI format invalid — paste the full string from Atlas → Connect → Drivers" };
  }
  const [, srv, username, password, host, dbPath] = match;
  const database = (dbPath || "").replace(/^\//, "") || "(default)";
  return {
    valid: true,
    type: srv ? "mongodb+srv" : "mongodb",
    username: decodeURIComponent(username),
    host,
    database,
    passwordLength: decodeURIComponent(password).length,
  };
}

const parsed = parseUriSafe(uri);
console.log("--- MongoDB diagnose ---");
if (!parsed.valid) {
  console.error(parsed.error);
  process.exit(1);
}

console.log(`Type:      ${parsed.type}`);
console.log(`Username:  ${parsed.username}`);
console.log(`Host:      ${parsed.host}`);
console.log(`Database:  ${parsed.database}`);
console.log(`Password:  ${parsed.passwordLength} characters (hidden)`);
console.log("Connecting...");

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log(`SUCCESS — connected to "${mongoose.connection.db.databaseName}"`);
    return mongoose.disconnect();
  })
  .catch((err) => {
    if (err.code === 8000 || err.codeName === "AtlasError") {
      console.error("\nFAILED: Authentication rejected by Atlas (bad username or password).");
      console.error("\nFix in MongoDB Atlas:");
      console.error("  1. Database Access → find user:", parsed.username);
      console.error("  2. Edit → Edit Password → Autogenerate → COPY password");
      console.error("  3. Connect → Drivers → copy FULL connection string");
      console.error("  4. Replace the entire MONGODB_URI line in .env");
      console.error("  5. Restart: npm run dev");
    } else if (err.code === "ENOTFOUND") {
      console.error("\nFAILED: Host not found —", parsed.host);
      console.error("Copy the hostname from Atlas → Connect → Drivers.");
    } else {
      console.error("\nFAILED:", err.message);
    }
    process.exit(1);
  });
