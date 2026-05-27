import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const orders = await prisma.changeOrder.findMany({ where: { tenantId: req.tenantId }, orderBy: { createdAt: "desc" } });
  res.json(orders);
});

router.post("/", async (req: AuthRequest, res) => {
  const order = await prisma.changeOrder.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(order);
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const { status } = req.body;
  await prisma.changeOrder.updateMany({ where: { id: req.params.id, tenantId: req.tenantId }, data: { status } });

  // If approving, sync project spent and cost code
  if (status === "Approved") {
    const order = await prisma.changeOrder.findFirst({ where: { id: req.params.id, tenantId: req.tenantId } });
    if (order) {
      await prisma.project.updateMany({
        where: { id: order.projectId, tenantId: req.tenantId },
        data: { spent: { increment: order.amount }, progress: { increment: 5 } }
      });
    }
  }

  res.json({ success: true });
});

export default router;
