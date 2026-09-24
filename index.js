const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { requireVerifiedKYC } = require("./middleware/kycCheck");
const {
  sendWaitlistConfirmation,
  sendAdminWaitlistAlert,
  sendAdminDepositAlert,
  sendAdminPayoutAlert,
  sendContactInquiryAlert,
  sendContactConfirmationUser
} = require("./services/emailService");

dotenv.config();

let prisma;
try {
  prisma = new PrismaClient();
  console.log("Prisma client initialized successfully");
} catch (error) {
  console.error("Prisma client failed to initialize:", error);
  throw error;
}
const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "PAYBEE_SUPER_SECRET_KEY";
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Aggressive CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://app.paybee.live',
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter(Boolean);
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Instantly return 200 OK for ALL preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

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
UTILITIES
====================================
*/

async function verifyDepositHash(hashKey, network, expectedAmount) {
  // PHASE 1 PLACEHOLDER
  // Integrate with TronGrid / Etherscan to check the hashKey matches the expectedAmount and is confirmed.
  console.log(`Verifying ${hashKey} on ${network} for amount ${expectedAmount}...`);
  return { isValid: true, confirmedAmount: expectedAmount };
}

/*
====================================
AUTH ROUTES
====================================
*/

/*
====================================
CONTACT FORM API (BREVO SMTP)
====================================
*/
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Full name, email address, and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const department = subject || "support";

    // 1. Send alert to Admin via Brevo
    await sendContactInquiryAlert({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      department,
      message: String(message).trim(),
    });

    // 2. Send acknowledgment to user asynchronously
    sendContactConfirmationUser(String(email).trim().toLowerCase(), String(name).trim())
      .catch(err => console.error("[ContactEmail] Failed to send user confirmation:", err));

    return res.status(200).json({
      success: true,
      message: "Thank you for contacting us. Your message has been sent successfully."
    });
  } catch (error) {
    console.error("[ContactAPI] Error handling contact form:", error);
    return res.status(500).json({
      error: "Unable to send your message right now. Please try again or email support@paybee.live directly."
    });
  }
});

app.post("/api/waitlist", async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "First name, last name, and email are required." });
    }

    // Check if email already exists in waitlist
    const existingWaitlist = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingWaitlist) {
      return res.status(400).json({ error: "This email is already on the waitlist." });
    }

    // Check if email already exists as a registered user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: "This email is already registered as a user." });
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null
      }
    });

    // Send emails asynchronously and catch errors to prevent blocking the response
    sendWaitlistConfirmation(waitlistEntry.email, waitlistEntry.firstName)
      .catch(err => console.error("[WaitlistEmail] Failed to send confirmation:", err));

    sendAdminWaitlistAlert(waitlistEntry.email, waitlistEntry.firstName, waitlistEntry.lastName)
      .catch(err => console.error("[WaitlistEmail] Failed to send admin alert:", err));

    res.status(201).json({ message: "Successfully joined waitlist", data: waitlistEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

    if (user.isTwoFactorEnabled) {
      return res.json({ requires2FA: true, userId: user.id });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message    });
  }
});

app.post("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) return res.status(400).json({ error: "Invalid token" });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    res.json({ message: "Email successfully verified." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login/2fa", async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not configured" });
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1 // allows 30 seconds before or after
    });
    
    if (!verified) {
      return res.status(401).json({ error: "Invalid 2FA token" });
    }
    
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token: jwtToken, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/2fa/generate", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.isTwoFactorEnabled) {
      return res.status(400).json({ error: "2FA is already enabled" });
    }
    const secret = speakeasy.generateSecret({ name: `Paybee (${user.email})` });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 }
    });
    
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qrCode: qrCodeDataUrl, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/2fa/verify", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.isTwoFactorEnabled) {
      return res.status(400).json({ error: "2FA is already enabled" });
    }
    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: "No 2FA secret found. Please generate one first." });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });
    if (verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isTwoFactorEnabled: true }
      });
      res.json({ message: "2FA successfully enabled" });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
====================================
ADMIN ROUTES
====================================
*/

// Wallets Management
app.get("/api/admin/wallets", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const wallets = await prisma.adminWallet.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/wallets", authMiddleware, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const { network, address, qrCodeUrl } = req.body;
    const wallet = await prisma.adminWallet.create({
      data: { network, address, qrCodeUrl }
    });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/wallets/:id", authMiddleware, requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res) => {
  try {
    const { isActive } = req.body;
    const wallet = await prisma.adminWallet.update({
      where: { id: req.params.id },
      data: { isActive }
    });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/wallets/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    await prisma.adminWallet.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Wallet deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin KYC Management
app.patch("/api/admin/users/:id/kyc", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { status } = req.body; // VERIFIED, REJECTED
    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid KYC status" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycStatus: status }
    });

    await prisma.notification.create({
      data: {
        userId: updatedUser.id,
        title: "KYC Review Update",
        message: `Your KYC has been ${status}.`,
        type: status === "VERIFIED" ? "SUCCESS" : "ERROR"
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/users/:id/bypass-kyc", authMiddleware, requireRole(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const { kycBypassed } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycBypassed }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/users/:id/kyc-bypass", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycBypassed: true }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/admin/users/create", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: role || "USER",
        createdById: req.user.id
      }
    });
    res.json({ message: "User created successfully", user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/users", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, fullName: true, role: true, isTwoFactorEnabled: true, walletBalance: true, createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
      prisma.deposit.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.payout.count({ where: { status: "PENDING" } }),
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

app.patch("/api/admin/deposits/:id/verify", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { status } = req.body; // expected: "VERIFIED" or "FAILED"
    const deposit = await prisma.deposit.findUnique({ where: { id: req.params.id } });
    
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });
    if (deposit.status === "VERIFIED") return res.status(400).json({ error: "Already verified" });

    let finalStatus = status;

    // Optional: Trigger automated check if moving to VERIFIED
    if (status === "VERIFIED" && deposit.hashKey) {
      const verificationResult = await verifyDepositHash(deposit.hashKey, deposit.network, deposit.amount);
      if (!verificationResult.isValid) {
        return res.status(400).json({ error: "Blockchain verification failed." });
      }
    }

    if (finalStatus === "VERIFIED") {
      await prisma.user.update({
        where: { id: deposit.userId },
        data: { walletBalance: { increment: deposit.amount } }
      });
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id: req.params.id },
      data: { status: finalStatus }
    });

    await prisma.notification.create({
      data: {
        userId: deposit.userId,
        title: "Deposit Update",
        message: `Your Deposit of ${deposit.amount} USDT has been ${finalStatus}.`,
        type: finalStatus === "VERIFIED" ? "SUCCESS" : "ERROR"
      }
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
      include: { 
        user: { select: { fullName: true } },
        bankDetails: true 
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/payouts/:id", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const { status, utrNumber } = req.body; // Expecting PENDING, INITIATED, PROCESSED, COMPLETED, REJECTED
    
    const payout = await prisma.payout.findUnique({ where: { id: req.params.id } });
    if (!payout) return res.status(404).json({ error: "Payout not found" });

    // Validate states
    if (status === "COMPLETED" && !utrNumber) {
      return res.status(400).json({ error: "UTR number is required to complete payout" });
    }

    if (status === "REJECTED" && payout.status !== "REJECTED") {
      // Refund balance
      await prisma.user.update({
        where: { id: payout.userId },
        data: { walletBalance: { increment: payout.amount } }
      });
    }

    const updatedPayout = await prisma.payout.update({
      where: { id: req.params.id },
      data: { 
        status,
        ...(utrNumber && { utrNumber })
      }
    });

    await prisma.notification.create({
      data: {
        userId: payout.userId,
        title: "Payout Update",
        message: `Your Payout of ${payout.amount} USDT has been ${status}.`,
        type: status === "COMPLETED" ? "SUCCESS" : status === "REJECTED" ? "ERROR" : "INFO"
      }
    });

    res.json(updatedPayout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trade Monitoring
app.get("/api/admin/trades", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      include: { user: true },
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

// KYC Submission
app.post("/api/user/kyc/submit", authMiddleware, async (req, res) => {
  try {
    const { aadhaarNumber, aadhaarDocUrl, selfieUrl } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        aadhaarNumber,
        aadhaarDocUrl,
        selfieUrl,
        kycStatus: "SUBMITTED"
      }
    });

    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
    await Promise.all(admins.map(admin => prisma.notification.create({
      data: {
        userId: admin.id,
        title: "New KYC Submission",
        message: `New KYC Submission pending review from ${user.email}.`,
        type: "WARNING"
      }
    })));

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/wallets", authMiddleware, async (req, res) => {
  try {
    const wallets = await prisma.adminWallet.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        status: true, 
        walletBalance: true, 
        kycStatus: true, 
        kycBypassed: true,
        emailVerified: true,
        phone: true,
        address: true,
        profilePicture: true,
        createdAt: true 
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { phone, address, profilePicture } = req.body;
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        walletBalance: true,
        kycStatus: true,
        kycBypassed: true,
        phone: true,
        address: true,
        profilePicture: true,
        createdAt: true
      }
    });
    res.json(updatedUser);
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

app.post("/api/user/deposits/init", authMiddleware, requireVerifiedKYC, async (req, res) => {
  try {
    const { amount, network, walletAddress } = req.body;
    
    // Fetch active admin wallet for the requested network
    const activeWallet = await prisma.adminWallet.findFirst({
      where: { network, isActive: true }
    });

    if (!activeWallet && !walletAddress) {
      return res.status(400).json({ error: "No active wallet found for the selected network." });
    }

    const finalWalletAddress = walletAddress || (activeWallet ? activeWallet.address : "");

    const deposit = await prisma.deposit.create({
      data: {
        amount: parseFloat(amount),
        network,
        walletAddress: finalWalletAddress,
        userId: req.user.id,
        status: "HOLDING"
      }
    });

    // Send admin deposit alert asynchronously
    (async () => {
      try {
        let userEmail = req.user.email;
        if (!userEmail) {
          const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
          userEmail = dbUser?.email;
        }
        await sendAdminDepositAlert(userEmail || "unknown@paybee.live", amount, network);
      } catch (err) {
        console.error("[DepositEmail] Failed to send admin deposit alert:", err);
      }
    })();

    res.json({ deposit, paymentDetails: { address: finalWalletAddress, network, amount, qrCodeUrl: activeWallet ? activeWallet.qrCodeUrl : "" } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/deposits/:id/submit", authMiddleware, requireVerifiedKYC, async (req, res) => {
  try {
    const { hashKey, proofUrl } = req.body;
    const depositId = req.params.id;

    const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
    if (!deposit || deposit.userId !== req.user.id) {
      return res.status(404).json({ error: "Deposit not found" });
    }
    if (deposit.status !== "HOLDING") {
      return res.status(400).json({ error: "Deposit is not in holding state" });
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id: depositId },
      data: {
        hashKey,
        proofUrl,
        status: "PENDING_VERIFICATION"
      }
    });

    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
    await Promise.all(admins.map(admin => prisma.notification.create({
      data: {
        userId: admin.id,
        title: "New Deposit Submission",
        message: `New Deposit request requires review.`,
        type: "WARNING"
      }
    })));

    res.json(updatedDeposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/user/deposits/:id", authMiddleware, async (req, res) => {
  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id: req.params.id }
    });

    if (!deposit || deposit.userId !== req.user.id) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    if (deposit.status !== "HOLDING") {
      return res.status(400).json({ error: "Cannot delete a deposit that is already submitted or verified." });
    }

    await prisma.deposit.delete({
      where: { id: deposit.id }
    });

    res.json({ message: "Deposit discarded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/user/deposits/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id: req.params.id }
    });

    if (!deposit || deposit.userId !== req.user.id) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    if (deposit.status !== "HOLDING") {
      return res.status(400).json({ error: "Cannot cancel a deposit that is not in holding state." });
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id: deposit.id },
      data: { status: "CANCELLED" }
    });

    res.json(updatedDeposit);
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
    const { amount, bankDetailsId } = req.body;

    if (!bankDetailsId) {
      return res.status(400).json({ error: "bankDetailsId is required" });
    }

    // Check KYC status on the database user (including bypass flag)
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || (user.kycStatus !== 'VERIFIED' && !user.kycBypassed)) {
      return res.status(403).json({ error: "You must complete identity verification before initiating a payout." });
    }

    // Verify ownership of the bank account
    const bankDetail = await prisma.bankDetail.findUnique({ where: { id: bankDetailsId } });
    if (!bankDetail || bankDetail.userId !== req.user.id) {
      return res.status(403).json({ error: "Invalid or unauthorized bank details" });
    }
    
    // Check balance
    if (user.walletBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const payout = await prisma.payout.create({
      data: {
        amount: parseFloat(amount),
        bankDetailsId,
        userId: req.user.id,
        status: "PENDING"
      }
    });

    // Deduct balance immediately
    await prisma.user.update({
      where: { id: req.user.id },
      data: { walletBalance: { decrement: parseFloat(amount) } }
    });

    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
    await Promise.all(admins.map(admin => prisma.notification.create({
      data: {
        userId: admin.id,
        title: "New Payout Request",
        message: `New Payout request requires review.`,
        type: "WARNING"
      }
    })));

    // Send admin payout alert email asynchronously
    sendAdminPayoutAlert(user.email, amount, "Bank Transfer", bankDetail)
      .catch(err => console.error("[PayoutEmail] Failed to send admin payout alert:", err));

    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/bank-details", authMiddleware, async (req, res) => {
  try {
    const { bankName, accountNumber, ifsc, accountName } = req.body;
    
    // Fetch user for default accountName if not provided
    const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    const finalAccountName = accountName || (dbUser ? dbUser.fullName : "Unknown User") || "Unknown User";

    const bankDetail = await prisma.bankDetail.create({
      data: {
        bankName,
        accountNumber,
        ifscCode: ifsc || "",
        accountName: finalAccountName,
        userId: req.user.id
      }
    });
    res.json(bankDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/bank-details", authMiddleware, async (req, res) => {
  try {
    const bankDetails = await prisma.bankDetail.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/user/bank-details/:id", authMiddleware, async (req, res) => {
  try {
    const { bankName, accountNumber, ifsc, accountName } = req.body;
    
    // SECURITY GATE (KYC)
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!dbUser || (dbUser.kycStatus !== 'VERIFIED' && !dbUser.kycBypassed)) {
      return res.status(403).json({
        error: "You must complete identity verification before editing financial details."
      });
    }

    // Prepare update data
    const updateData = {};
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (ifsc !== undefined) updateData.ifscCode = ifsc;
    if (accountName !== undefined) updateData.accountName = accountName;

    // OWNERSHIP CHECK & UPDATE
    const updatedBankDetail = await prisma.bankDetail.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      data: updateData
    });

    if (updatedBankDetail.count === 0) {
      return res.status(404).json({ error: "Bank account not found or not owned by user." });
    }

    // Retrieve and return the updated record
    const updatedRecord = await prisma.bankDetail.findUnique({
      where: { id: req.params.id }
    });

    res.json(updatedRecord);
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
DASHBOARD & NOTIFICATIONS
====================================
*/

app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true }
    });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/user/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const pendingDepositsCount = await prisma.deposit.count({ where: { userId: req.user.id, status: { in: ["HOLDING", "PENDING_VERIFICATION"] } } });
    const pendingPayoutsCount = await prisma.payout.count({ where: { userId: req.user.id, status: { in: ["PENDING", "INITIATED"] } } });
    
    // Quick history - recent 5 txs combined
    const deposits = await prisma.deposit.findMany({ where: { userId: req.user.id }, take: 5, orderBy: { createdAt: "desc" } });
    const payouts = await prisma.payout.findMany({ where: { userId: req.user.id }, take: 5, orderBy: { createdAt: "desc" } });
    
    res.json({
      totalBalance: user.walletBalance,
      pendingDepositsCount,
      pendingPayoutsCount,
      recentTransactions: [...deposits, ...payouts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/dashboard/stats", authMiddleware, requireRole(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  try {
    // total system liquidity across users
    const users = await prisma.user.findMany({ select: { walletBalance: true } });
    const totalSystemLiquidity = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);
    
    const pendingKycCount = await prisma.user.count({ where: { kycStatus: "SUBMITTED" } });
    const pendingDepositsCount = await prisma.deposit.count({ where: { status: "PENDING_VERIFICATION" } });
    const totalActiveUsers = await prisma.user.count({ where: { status: "ACTIVE" } });
    
    res.json({
      totalSystemLiquidity,
      pendingKycCount,
      pendingDepositsCount,
      totalActiveUsers
    });
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