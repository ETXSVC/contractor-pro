import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// 1. API Endpoint: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// 2. API Endpoint: Construction Cost Estimator
app.post("/api/estimate", (req, res) => {
  const { projectName, projectType, sqft, budgetConstraint, location } = req.body;

  if (!projectName || !projectType || !sqft) {
    return res.status(400).json({ error: "Missing required parameters (projectName, projectType, sqft)" });
  }

  const baseCost = Number(sqft) * (projectType === "Renovation" ? 150 : projectType === "Commercial Construction" ? 350 : 220);
  const estBudget = budgetConstraint ? Math.min(Number(budgetConstraint), baseCost) : baseCost;

  const result = {
    estimatedTotalBudget: estBudget,
    breakdown: [
      { item: "Materials & Equipment", percentage: 40, cost: Math.floor(estBudget * 0.4) },
      { item: "Labor & Contracting", percentage: 35, cost: Math.floor(estBudget * 0.35) },
      { item: "Permits, Licensing & Architectural Fees", percentage: 12, cost: Math.floor(estBudget * 0.12) },
      { item: "Overhead & Logistics", percentage: 8, cost: Math.floor(estBudget * 0.08) },
      { item: "Contingency Fund (5%)", percentage: 5, cost: Math.floor(estBudget * 0.05) }
    ],
    materials: [
      { name: "Structural Timber & Lumber pack", quantity: "Bulk", estimatedUnitCost: Math.floor(estBudget * 0.12) },
      { name: "Premium Flooring & Tile", quantity: "Sqft matching", estimatedUnitCost: Math.floor(estBudget * 0.08) },
      { name: "Electrical Copper Wiring, Panels & Fixtures suite", quantity: "Package", estimatedUnitCost: Math.floor(estBudget * 0.06) },
      { name: "HVAC Unit, Ducting & Smart Ventilation package", quantity: "1 System", estimatedUnitCost: Math.floor(estBudget * 0.09) },
      { name: "Drywall, Compound & Premium Base Coatings", quantity: "Bulk loads", estimatedUnitCost: Math.floor(estBudget * 0.05) }
    ],
    milestones: [
      { phase: "Planning & Permits Approval", durationWeeks: 3, deliverables: ["Secure building permits", "Register blueprints with local authorities"] },
      { phase: "Demolition & Site prep", durationWeeks: 2, deliverables: ["Clear existing plumbing/partitions", "Disposal and grading"] },
      { phase: "Rough-In MEP & Structural Framing", durationWeeks: 4, deliverables: ["Install partitions", "Run conduits and piping"] },
      { phase: "Drywalling, Sheeting & Boarding", durationWeeks: 2, deliverables: ["Tape and sand drywall", "Install acoustic insulation"] },
      { phase: "High-End Finishes, Trims & Final Inspection", durationWeeks: 3, deliverables: ["Tile installation", "Install smart light fixtures", "Pass occupancy audit"] }
    ],
    aiTips: [
      `Consider batch-purchasing custom fixtures from local fabricators to save up to 12% on luxury markup near the ${location || "construction site"}.`,
      "Perform rough inspections early in week 5 to ensure subsequent tasks are not delayed by schedule backlogs.",
      "Keep high reserves for Contingency, especially when doing premium renovations in highly regulated microstructures."
    ]
  };

  res.json({ success: true, data: result });
});

// 3. Vite development server setup / Production Static serving integration
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite development server loaded as Express middleware.");
    } catch (err) {
      console.error("Vite server loader failed:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Express serving built static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Contractor Pro server listening on port ${PORT}`);
  });
}

bootstrap();
