export function requireApprovedKyc(user) {
  if (!user) throw new Error("User not found");
  if (user.kycStatus !== "APPROVED") {
    const err = new Error("KYC approval required before trading");
    err.statusCode = 403;
    throw err;
  }
}
