const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "PAYBEE_SUPER_SECRET_KEY";
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["https://app.paybee.live", "https://api.paybee.live", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".paybee.live")) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true
}));
app.use(express.json());

/*
====================================
AUTH MIDDLEWARE
====================================
*/

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Try our local JWT first
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // If fails, try Supabase JWT if configured
      if (SUPABASE_JWT_SECRET) {
        decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
        // Map Supabase payload to our expected format if necessary
        if (decoded.sub && !decoded.id) decoded.id = decoded.sub;
        if (decoded.user_metadata?.role && !decoded.role) decoded.role = decoded.user_metadata.role.toUpperCase();
      } else {
        throw err;
      }
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

/*
====================================
AUTH ROUTES
====================================
*/

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
====================================
ADMIN ROUTES
====================================
*/

// Dashboard Stats
app.get("/api/admin/stats", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDeposits,
      totalPayouts,
      totalTrades,
      pendingDeposits,
      pendingPayouts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.count(),
      prisma.payout.count(),
      prisma.trade.count(),
      prisma.deposit.count({ where: { status: "pending" } }),
      prisma.payout.count({ where: { status: "pending" } }),
    ]);

    res.json({
      totalUsers,
      totalDeposits,
      totalPayouts,
      totalTrades,
      pendingDeposits,
      pendingPayouts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Management
app.get("/api/admin/users", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/users", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password || "user123", 10);
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        role: "USER",
        status: "ACTIVE",
        kycStatus: "pending",
        walletBalance: 0
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/users/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { status, kycStatus, walletBalance } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(kycStatus && { kycStatus }),
        ...(walletBalance !== undefined && { walletBalance: parseFloat(walletBalance) })
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit Management
app.get("/api/admin/deposits", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/deposits/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { status } = req.body;
    const deposit = await prisma.deposit.findUnique({ where: { id: req.params.id } });
    
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });

    // If approved, update user balance
    if (status === "approved" && deposit.status !== "approved") {
      await prisma.user.update({
        where: { id: deposit.userId },
        data: { walletBalance: { increment: deposit.amount } }
      });
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updatedDeposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payout Management
app.get("/api/admin/payouts", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/payouts/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { status } = req.body;
    const payout = await prisma.payout.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trade Monitoring
app.get("/api/admin/trades", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
====================================
USER ROUTES
====================================
*/

app.get("/api/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, fullName: true, role: true, status: true, walletBalance: true, kycStatus: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/deposits", authMiddleware, async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/deposits", authMiddleware, async (req, res) => {
  try {
    const { amount, network, txid, proofUrl } = req.body;
    const deposit = await prisma.deposit.create({
      data: {
        amount: parseFloat(amount),
        network,
        txid,
        proofUrl,
        userId: req.user.id,
        status: "pending"
      }
    });
    res.json(deposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/payouts", authMiddleware, async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/payouts", authMiddleware, async (req, res) => {
  try {
    const { amount, bankName, accountNumber, ifsc } = req.body;
    
    // Check balance
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.walletBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const payout = await prisma.payout.create({
      data: {
        amount: parseFloat(amount),
        bankName,
        accountNumber,
        ifsc,
        userId: req.user.id,
        status: "pending"
      }
    });

    // Deduct balance immediately (or on approval? usually deducted on request and returned on rejection)
    // For this app, let's deduct on request.
    await prisma.user.update({
      where: { id: req.user.id },
      data: { walletBalance: { decrement: parseFloat(amount) } }
    });

    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
====================================
INITIAL SETUP (SUPER ADMIN)
====================================
*/

app.post("/setup-super-admin", async (req, res) => {
  try {
    const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (count > 0) return res.status(400).json({ error: "Super Admin already exists" });

    const hashedPassword = await bcrypt.hash("super123", 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: "superadmin@paybee.com",
        password: hashedPassword,
        fullName: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    res.json({ message: "Super Admin created", id: superAdmin.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
====================================
CMS PUBLIC ROUTES
====================================
*/

app.get("/api/public/content/:slug", async (req, res) => {
  try {
    const content = await prisma.pageContent.findUnique({
      where: { slug: req.params.slug, isPublished: true }
    });
    if (!content) return res.status(404).json({ error: "Content not found" });
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/faqs", async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" }
    });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/settings", async (req, res) => {
  try {
    const settings = await prisma.globalSetting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
====================================
CMS ADMIN ROUTES
====================================
*/

app.put("/api/admin/content/:slug", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { pageTitle, metaDescription, htmlBody, structuredData, isPublished } = req.body;
    const content = await prisma.pageContent.upsert({
      where: { slug: req.params.slug },
      update: { pageTitle, metaDescription, htmlBody, structuredData, isPublished },
      create: { slug: req.params.slug, pageTitle, metaDescription, htmlBody, structuredData, isPublished }
    });
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/faqs", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { displayOrder: "asc" } });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/faqs", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const faq = await prisma.faq.create({ data: req.body });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/faqs/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const faq = await prisma.faq.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/faqs/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.id } });
    res.json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/settings", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const settings = req.body; // Expecting { key: value, ... }
    const operations = Object.entries(settings).map(([key, value]) => 
      prisma.globalSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    );
    await Promise.all(operations);
    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  const isProd = process.env.NODE_ENV === 'production';
  const displayUrl = isProd ? "https://api.paybee.live" : `http://localhost:${PORT}`;
  const envName = isProd ? "Production" : "Development";

  console.log("\n\x1b[32m ___________________________________________________\x1b[0m");
  console.log("\x1b[32m|                                                   |\x1b[0m");
  console.log("\x1b[32m| \x1b[1mPAYBEE CORE SYSTEMS\x1b[22m                               |\x1b[0m");
  console.log("\x1b[32m|___________________________________________________|\x1b[0m");
  console.log("\x1b[32m|                                                   |\x1b[0m");
  console.log(`\x1b[32m|  \x1b[36m⚡ Status:\x1b[0m Online                                |`);
  console.log(`\x1b[32m|  \x1b[35m🌍 Env:\x1b[0m    ${envName.padEnd(35)} \x1b[32m|\x1b[0m`);
  console.log(`\x1b[32m|  \x1b[33m🔗 URL:\x1b[0m    ${displayUrl.padEnd(35)} \x1b[32m|\x1b[0m`);
  console.log("\x1b[32m|___________________________________________________|\x1b[0m\n");
});