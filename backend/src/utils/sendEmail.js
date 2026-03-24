import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.SMTP_HOST) {
      console.warn(
        "⚠️  Warning: SMTP_HOST is not defined in .env. Email sending will default to localhost and likely fail."
      );
    }
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587, // Default to 587
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async (from, to, subject, text = "", html) => {
  try {
    const info = await getTransporter().sendMail({
      from: from || process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });

    // console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Email failed:", err);

    // Helpful hint for the specific localhost IPv6 error
    if (
      (err.code === "ECONNREFUSED" || err.code === "ESOCKET") &&
      (!process.env.SMTP_HOST || process.env.SMTP_HOST === "localhost")
    ) {
      console.error(
        "\nXXX EMAIL CONFIG ERROR XXX\nYou are trying to connect to localhost (::1). Please set SMTP_HOST in your .env file (e.g. smtp.gmail.com)\n"
      );
    }
    throw err;
  }
};
