const sgMail = require("@sendgrid/mail");
const FRONTEND_URL = process.env.FRONTEND_URL;
const FROM_EMAIL = process.env.SENDGRID_SENDER;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(toEmail, { userId, token }) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not configured (SENDGRID_API_KEY).");
  }

  const frontend = FRONTEND_URL.replace(/\/$/, "");

  const verifyUrl = `${frontend}/verify-email?token=${encodeURIComponent(
    token
  )}&id=${encodeURIComponent(userId)}`;

  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: "Verify your Raghav Poshhaak account",
    text: `Welcome to Raghav Poshhaak!\n\nPlease verify your email by clicking the link below:\n\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.5;">
        <h2>Welcome to Raghav Poshhaak</h2>
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;">
            Verify Email
          </a>
        </p>
        <p style="font-size:0.9rem;color:#555;">
          If the button doesn't work, copy and paste this link into your browser:
          <br/><a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="font-size:0.85rem;color:#777;">This link expires in 24 hours.</p>
      </div>
    `,
  };

  return sgMail.send(msg);
}

module.exports = sendVerificationEmail;
