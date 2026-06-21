import nodemailer from "nodemailer";

function isTrue(value) {
  return String(value || "").toLowerCase() === "true";
}

export async function sendWelcomePasswordEmail({ to, customerNumber, temporaryPassword }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP not configured. Temporary password:", temporaryPassword);
    return { sent: false, devPassword: temporaryPassword };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: isTrue(process.env.SMTP_SECURE || "true"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const subject = "Your GATECEP Trader Login Details";

  const text = `Welcome to GATECEP Trader.

Customer Number: ${customerNumber}
Username: ${to}
Temporary Password: ${temporaryPassword}

Please change your password after first login.
`;

  const html = `
  <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
    <h2>Welcome to GATECEP Trader</h2>
    <p>Your trading profile has been created.</p>
    <p><b>Customer Number:</b> ${customerNumber}</p>
    <p><b>Username:</b> ${to}</p>
    <p><b>Temporary Password:</b> <span style="font-size:18px">${temporaryPassword}</span></p>
    <p>Please change your password after first login.</p>
  </div>`;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });

  return { sent: true, messageId: info.messageId };
}
