import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const records = await prisma.timeRecord.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(records);
});

router.post("/", async (req: AuthRequest, res) => {
  const record = await prisma.timeRecord.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(record);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.timeRecord.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
  res.json({ success: true });
});

export default router;
