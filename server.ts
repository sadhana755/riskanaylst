import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("cyber_risk.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    criticality TEXT NOT NULL,
    owner TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER,
    threat TEXT NOT NULL,
    vulnerability TEXT NOT NULL,
    likelihood INTEGER NOT NULL,
    impact INTEGER NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    mitigation_strategy TEXT,
    status TEXT DEFAULT 'Open',
    FOREIGN KEY (asset_id) REFERENCES assets(id)
  );
`);

// Seed data if empty
const assetCount = db.prepare("SELECT COUNT(*) as count FROM assets").get() as { count: number };
if (assetCount.count === 0) {
  const insertAsset = db.prepare("INSERT INTO assets (name, type, criticality, owner) VALUES (?, ?, ?, ?)");
  insertAsset.run("Main Web Server", "Server", "High", "IT Dept");
  insertAsset.run("Customer Database", "Database", "Critical", "Data Team");
  insertAsset.run("Corporate Network", "Network", "Network", "Network Admin");
  insertAsset.run("HR Application", "Application", "Medium", "HR Dept");
  insertAsset.run("John Doe (Admin)", "Employee", "High", "Security Team");

  const insertRisk = db.prepare("INSERT INTO risks (asset_id, threat, vulnerability, likelihood, impact, risk_score, risk_level, mitigation_strategy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  // Risk Score = Likelihood * Impact
  // 1-4: Low, 5-9: Medium, 10-16: High, 17-25: Critical
  insertRisk.run(1, "DDoS Attack", "Lack of Rate Limiting", 4, 4, 16, "High", "Implement Cloudflare WAF and rate limiting.");
  insertRisk.run(2, "SQL Injection", "Unsanitized Input", 3, 5, 15, "High", "Use parameterized queries and regular pentesting.");
  insertRisk.run(5, "Phishing", "Lack of MFA", 5, 4, 20, "Critical", "Enforce hardware-based MFA and security awareness training.");
  insertRisk.run(3, "Unauthorized Access", "Weak Password Policy", 3, 3, 9, "Medium", "Enforce strong password complexity and rotation.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/assets", (req, res) => {
    const assets = db.prepare("SELECT * FROM assets").all();
    res.json(assets);
  });

  app.post("/api/assets", (req, res) => {
    const { name, type, criticality, owner } = req.body;
    const info = db.prepare("INSERT INTO assets (name, type, criticality, owner) VALUES (?, ?, ?, ?)").run(name, type, criticality, owner);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/risks", (req, res) => {
    const risks = db.prepare(`
      SELECT r.*, a.name as asset_name 
      FROM risks r 
      JOIN assets a ON r.asset_id = a.id
      ORDER BY r.risk_score DESC
    `).all();
    res.json(risks);
  });

  app.post("/api/risks", (req, res) => {
    const { asset_id, threat, vulnerability, likelihood, impact, mitigation_strategy } = req.body;
    const score = likelihood * impact;
    let level = "Low";
    if (score >= 17) level = "Critical";
    else if (score >= 10) level = "High";
    else if (score >= 5) level = "Medium";

    const info = db.prepare(`
      INSERT INTO risks (asset_id, threat, vulnerability, likelihood, impact, risk_score, risk_level, mitigation_strategy) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(asset_id, threat, vulnerability, likelihood, impact, score, level, mitigation_strategy);
    res.json({ id: info.lastInsertRowid, risk_score: score, risk_level: level });
  });

  app.delete("/api/risks/:id", (req, res) => {
    db.prepare("DELETE FROM risks WHERE id = ?").run(req.params.id);
    res.sendStatus(204);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
