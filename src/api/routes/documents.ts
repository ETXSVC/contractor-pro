import { Router, Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|dwg|docx|bimx|png|jpg|jpeg|xlsx|dxf)$/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const docs = await prisma.document.findMany({
    where: { tenantId: req.tenantId },
    orderBy: { createdAt: "desc" }
  });
  res.json(docs);
});

router.post("/", async (req: AuthRequest, res) => {
  const doc = await prisma.document.create({ data: { ...req.body, tenantId: req.tenantId! } });
  res.json(doc);
});

// Multipart upload — file + metadata fields in FormData
router.post("/upload", upload.single("file"), async (req: AuthRequest & Request, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "No file provided" });

  const { name, category, uploadedBy, fileType } = req.body;
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  const fileUrl = `/uploads/${file.filename}`;

  const doc = await prisma.document.create({
    data: {
      tenantId: req.tenantId!,
      name: name || file.originalname,
      category: category || "Blueprints",
      uploadedBy: uploadedBy || "Team Member",
      uploadedAt: "Today, Just Now",
      size: `${sizeMB} MB`,
      fileType: fileType || file.mimetype,
      fileUrl,
    }
  });

  res.json(doc);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const doc = await prisma.document.findFirst({
    where: { id: req.params.id, tenantId: req.tenantId }
  });
  if (doc?.fileUrl) {
    fs.unlink(path.join(process.cwd(), doc.fileUrl), () => {});
  }
  await prisma.document.deleteMany({ where: { id: req.params.id, tenantId: req.tenantId } });
  res.json({ success: true });
});

export default router;
