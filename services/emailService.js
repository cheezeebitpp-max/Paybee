const nodemailer = require("nodemailer");

// Initialize SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

/**
 * Base HTML wrapper with a clean, minimalistic design featuring the PayBee logo.
 * @param {string} title
 * @param {string} bodyContent
 * @returns {string} Fully styled HTML email body
 */
function getBaseHtml(title, bodyContent) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #fafafa;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 32px;
      background-color: #ffffff;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .header {
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 20px;
      margin-bottom: 24px;
      text-align: left;
    }
    .content {
      line-height: 1.6;
      font-size: 16px;
      color: #333333;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
      font-size: 12px;
      color: #888888;
      text-align: left;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      color: #111111;
    }
    p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .details-table td {
      padding: 10px 0;
      border-bottom: 1px dashed #eaeaea;
      font-size: 14px;
    }
    .details-table td.label {
      font-weight: 500;
      color: #666666;
      width: 35%;
    }
    .details-table td.value {
      color: #111111;
      text-align: right;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://app.paybee.live/logo.png" alt="PayBee" style="height: 40px; margin-bottom: 20px;" />
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} PayBee. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generic helper to send emails defensively
 */
async function sendMailHelper(to, subject, htmlContent, replyTo = null) {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
    console.warn(`[EmailService] SMTP credentials not set. Simulated sending "${subject}" to ${to}`);
    return;
  }
  
  const mailOptions = {
    from: `"PayBee Notification" <${process.env.BREVO_SMTP_USER}>`,
    to,
    subject,
    html: htmlContent,
    ...(replyTo ? { replyTo } : {}),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Sends a minimal "Application Received" email to the user.
 */
async function sendWaitlistConfirmation(userEmail, firstName) {
  const title = "Application Received";
  const bodyContent = `
    <h1>Application Received</h1>
    <p>Hello ${firstName},</p>
    <p>Thank you for your interest in PayBee. We have successfully received your waitlist application.</p>
    <p>Our platform is currently invite-only. Our administrative team will review your application and contact you as soon as a spot becomes available.</p>
    <p>Best regards,<br/>The PayBee Team</p>
  `;
  const htmlContent = getBaseHtml(title, bodyContent);
  return sendMailHelper(userEmail, "PayBee: Waitlist Application Received", htmlContent);
}

/**
 * Sends an alert to the Admin email that a new waitlist application was submitted.
 */
async function sendAdminWaitlistAlert(userEmail, firstName, lastName) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[EmailService] ADMIN_EMAIL env variable is not set. Skipping admin waitlist alert.");
    return;
  }

  const title = "New Waitlist Application";
  const bodyContent = `
    <h1>New Waitlist Application</h1>
    <p>A new applicant has requested access to the platform:</p>
    <table class="details-table">
      <tr>
        <td class="label">Name</td>
        <td class="value">${firstName} ${lastName}</td>
      </tr>
      <tr>
        <td class="label">Email</td>
        <td class="value">${userEmail}</td>
      </tr>
    </table>
  `;
  const htmlContent = getBaseHtml(title, bodyContent);
  return sendMailHelper(adminEmail, `Admin Alert: New Waitlist Signup - ${firstName} ${lastName}`, htmlContent);
}

/**
 * Sends an alert to the Admin that a user has initialized a new deposit.
 */
async function sendAdminDepositAlert(userEmail, amount, network) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[EmailService] ADMIN_EMAIL env variable is not set. Skipping admin deposit alert.");
    return;
  }

  const title = "New Deposit Initialized";
  const bodyContent = `
    <h1>New Deposit Initialized</h1>
    <p>A user has initiated a new deposit on the platform and is holding for proof submission:</p>
    <table class="details-table">
      <tr>
        <td class="label">User Email</td>
        <td class="value">${userEmail}</td>
      </tr>
      <tr>
        <td class="label">Amount</td>
        <td class="value">${amount}</td>
      </tr>
      <tr>
        <td class="label">Network</td>
        <td class="value">${network}</td>
      </tr>
    </table>
  `;
  const htmlContent = getBaseHtml(title, bodyContent);
  return sendMailHelper(adminEmail, `Admin Alert: Deposit Initialized - ${amount} on ${network}`, htmlContent);
}

/**
 * Sends an alert to the Admin that a user has requested a payout.
 */
async function sendAdminPayoutAlert(userEmail, amount, network, bankDetails) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[EmailService] ADMIN_EMAIL env variable is not set. Skipping admin payout alert.");
    return;
  }

  const title = "New Payout Request";
  const bodyContent = `
    <h1>New Payout Request</h1>
    <p>A user has submitted a payout request that requires manual review:</p>
    <table class="details-table">
      <tr>
        <td class="label">User Email</td>
        <td class="value">${userEmail}</td>
      </tr>
      <tr>
        <td class="label">Amount</td>
        <td class="value">${amount}</td>
      </tr>
      <tr>
        <td class="label">Network / Method</td>
        <td class="value">${network}</td>
      </tr>
      <tr>
        <td class="label">Account Name</td>
        <td class="value">${bankDetails?.accountName || "N/A"}</td>
      </tr>
      <tr>
        <td class="label">Bank Name</td>
        <td class="value">${bankDetails?.bankName || "N/A"}</td>
      </tr>
      <tr>
        <td class="label">Account Number</td>
        <td class="value">${bankDetails?.accountNumber || "N/A"}</td>
      </tr>
      <tr>
        <td class="label">IFSC Code</td>
        <td class="value">${bankDetails?.ifscCode || bankDetails?.ifscCodeCode || "N/A"}</td>
      </tr>
    </table>
  `;
  const htmlContent = getBaseHtml(title, bodyContent);
  return sendMailHelper(adminEmail, `Admin Alert: Payout Request - ${amount}`, htmlContent);
}


/**
 * Sends a notification to Admin/Support when a user submits the Contact Us form.
 */
async function sendContactInquiryAlert({ name, email, department, message }) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@paybee.live";

  const departmentLabels = {
    support: "General Support",
    accounts: "New Account Application",
    business: "Business & OTC",
    legal: "Compliance & Legal",
    press: "Press & Media",
  };
  const deptDisplay = departmentLabels[department] || department || "General Support";

  const title = `New Contact Inquiry - ${deptDisplay}`;
  const sanitizedMessage = String(message)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  const bodyContent = `
    <h1>New Contact Us Inquiry</h1>
    <p>A new inquiry was submitted from the PayBee landing page:</p>
    <table class="details-table">
      <tr>
        <td class="label">Sender Name</td>
        <td class="value"><strong>${name}</strong></td>
      </tr>
      <tr>
        <td class="label">Email Address</td>
        <td class="value"><a href="mailto:${email}">${email}</a></td>
      </tr>
      <tr>
        <td class="label">Department</td>
        <td class="value"><strong>${deptDisplay}</strong></td>
      </tr>
      <tr>
        <td class="label">Submitted At</td>
        <td class="value">${new Date().toUTCString()}</td>
      </tr>
    </table>
    <div style="margin-top: 24px; padding: 18px; background-color: #f7f9fa; border-left: 4px solid #2E7D32; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #2E7D32; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message Content:</p>
      <div style="font-size: 15px; color: #1a1a1a; line-height: 1.6;">${sanitizedMessage}</div>
    </div>
    <p style="margin-top: 24px; font-size: 13px; color: #777;">
      <em>Note: You can reply directly to this email to respond to ${name} (${email}).</em>
    </p>
  `;
  const htmlContent = getBaseHtml(title, bodyContent);
  return sendMailHelper(
    adminEmail,
    `[PayBee Contact] [${deptDisplay}] Message from ${name}`,
    htmlContent,
    email
  );
}

/**
 * Sends an automated confirmation receipt to the user who contacted support.
 */
async function sendContactConfirmationUser(userEmail, name) {
  const title = "We Received Your Message - PayBee";
  const bodyContent = `
    <h1>Thank you for contacting PayBee</h1>
    <p>Hello ${name},</p>
    <p>We have successfully received your inquiry. Our team has been notified and will review your message shortly.</p>
    <p>Most inquiries are addressed within <strong>2 hours</strong> during operational windows. If you need immediate assistance regarding an active trade, our 24/7 live chat is also available directly within the platform.</p>
    <br/>
    <p>Best regards,<br/><strong>The PayBee Team</strong><br/><a href="https://paybee.live">https://paybee.live</a></p>
  `;
  const htmlContent = getBaseHtml(title, bodyContent);
  return sendMailHelper(userEmail, "PayBee: We received your message", htmlContent);
}

module.exports = {
  sendWaitlistConfirmation,
  sendAdminWaitlistAlert,
  sendAdminDepositAlert,
  sendAdminPayoutAlert,
  sendContactInquiryAlert,
  sendContactConfirmationUser,
};
