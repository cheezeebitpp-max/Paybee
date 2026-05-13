const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "PAYBEE_SUPER_SECRET_KEY";
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["https://paybee.live", "https://api.paybee.live", "http://localhost:3000", "http://localhost:5173"];
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

app.post("/login", async (req, res) => {
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
app.get("/admin/stats", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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
app.get("/admin/users", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/admin/users", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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

app.patch("/admin/users/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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
app.get("/admin/deposits", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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

app.patch("/admin/deposits/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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
app.get("/admin/payouts", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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

app.patch("/admin/payouts/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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
app.get("/admin/trades", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
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

app.get("/user/me", authMiddleware, async (req, res) => {
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

app.get("/user/deposits", authMiddleware, async (req, res) => {
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

app.post("/user/deposits", authMiddleware, async (req, res) => {
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

app.get("/user/payouts", authMiddleware, async (req, res) => {
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

app.post("/user/payouts", authMiddleware, async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});