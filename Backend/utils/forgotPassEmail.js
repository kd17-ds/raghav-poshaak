const sgMail = require("@sendgrid/mail");
const FRONTEND_URL = process.env.FRONTEND_URL;
const FROM_EMAIL = process.env.SENDGRID_SENDER;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function forgotPassEmail(toEmail, { userId, token }) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not configured (SENDGRID_API_KEY).");
  }

  const frontend = FRONTEND_URL.replace(/\/$/, "");

  const resetUrl = `${frontend}/resetPassword?token=${encodeURIComponent(
    token
  )}&id=${encodeURIComponent(userId)}`;

  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: "Reset Your Raghav Poshaak Account Password",

    text: `
You requested to reset your password.

Click the link below to create a new password:
${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, please ignore this email.
`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Password Reset Request</h2>

        <p>You requested to reset your <strong>Raghav Poshhaak</strong> account password.</p>

        <p>Click the button below to reset your password:</p>

        <p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:12px 20px;background:#111827;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
        </p>

        <p style="font-size:0.9rem;color:#555;">
          If the button doesn’t work, copy and paste this link into your browser:
          <br />
          <a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a>
        </p>

        <p style="font-size:0.85rem;color:#777;">
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p style="font-size:0.85rem;color:#777;">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  };

  return sgMail.send(msg);
}

module.exports = forgotPassEmail;
