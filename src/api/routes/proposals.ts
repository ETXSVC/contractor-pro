import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const proposals = await prisma.proposal.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(proposals);
});

router.post("/", async (req: AuthRequest, res) => {
  const proposal = await prisma.proposal.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(proposal);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.proposal.updateMany({ where: { id: req.params.id, tenantId: req.tenantId }, data: req.body });
  res.json({ success: true });
});

export default router;
