import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const invoices = await prisma.invoice.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(invoices);
});

router.post("/", async (req: AuthRequest, res) => {
  const invoice = await prisma.invoice.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(invoice);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.invoice.updateMany({ where: { id: req.params.id, tenantId: req.tenantId }, data: req.body });
  res.json({ success: true });
});

export default router;
