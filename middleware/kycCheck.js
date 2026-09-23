const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const requireVerifiedKYC = async (req, res, next) => {
  const tokenUser = req.user;
  if (!tokenUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: tokenUser.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the user has KYC bypassed, allow all transactions/financial actions immediately
    if (user.kycBypassed) {
      return next();
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: "KYC_REQUIRED", 
        message: "You must complete email verification to perform transactions." 
      });
    }

    // Check KYC status
    if (user.kycStatus !== 'VERIFIED') {
      return res.status(403).json({ 
        error: "KYC_REQUIRED", 
        message: "You must complete KYC verification to perform transactions." 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { requireVerifiedKYC };
