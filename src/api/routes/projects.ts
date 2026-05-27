import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(projects);
});

router.post("/", async (req: AuthRequest, res) => {
  const project = await prisma.project.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(project);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const project = await prisma.project.updateMany({
    where: { id: req.params.id, tenantId: req.tenantId },
    data: req.body
  });
  res.json(project);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.project.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
  res.json({ success: true });
});

export default router;
