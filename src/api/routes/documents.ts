import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const docs = await prisma.document.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(docs);
});

router.post("/", async (req: AuthRequest, res) => {
  const doc = await prisma.document.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(doc);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.document.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
  res.json({ success: true });
});

export default router;
