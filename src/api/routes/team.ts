import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const members = await prisma.teamMember.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(members);
});

router.post("/", async (req: AuthRequest, res) => {
  const member = await prisma.teamMember.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(member);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.teamMember.updateMany({ where: { id: req.params.id, tenantId: req.tenantId }, data: req.body });
  res.json({ success: true });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.teamMember.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
  res.json({ success: true });
});

export default router;
