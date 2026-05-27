import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(tasks);
});

router.post("/", async (req: AuthRequest, res) => {
  const task = await prisma.task.create({ data: { ...req.body, tenantId: req.tenantId! } });
  // bump project tasksCount
  await prisma.project.updateMany({ where: { id: req.body.projectId, tenantId: req.tenantId }, data: { tasksCount: { increment: 1 } } });
  res.json(task);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  await prisma.task.updateMany({ where: { id: req.params.id, tenantId: req.tenantId }, data: req.body });
  res.json({ success: true });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.task.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
  res.json({ success: true });
});

export default router;
