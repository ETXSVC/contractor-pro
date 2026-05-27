import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, companyName, name } = req.body;
  if (!email || !password || !companyName) {
    return res.status(400).json({ error: "Email, password, and company name are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const displayName = name || email.split("@")[0];
    const result = await prisma.tenant.create({
      data: {
        name: companyName,
        users: {
          create: { email, password: hashed, name: displayName, role: "admin" }
        }
      },
      include: { users: true }
    });

    const user = result.users[0];
    const token = jwt.sign(
      { userId: user.id, tenantId: result.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email, tenantId: result.id } });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Email already registered" });
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await prisma.user.findFirst({ where: { email }, include: { tenant: true } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email, tenantId: user.tenantId } });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
