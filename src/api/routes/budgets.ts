import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const codes = await prisma.budgetCostCode.findMany({ where: { tenantId: req.tenantId }, orderBy: { code: "asc" } });
  res.json(codes);
});

router.post("/", async (req: AuthRequest, res) => {
  const code = await prisma.budgetCostCode.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(code);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.budgetCostCode.updateMany({ where: { id: req.params.id, tenantId: req.tenantId }, data: req.body });
  res.json({ success: true });
});

export default router;
