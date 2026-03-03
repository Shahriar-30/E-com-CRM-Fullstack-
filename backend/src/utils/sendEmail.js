import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: "alsiphat30@gmail.com",
    pass: "wpckijqqksovczpf",
  },
});

export const sendEmail = async (from, to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email failed:", err);
    throw err;
  }
};

sendEmail("alsiphat30@gmail.com", "alsiphat8@gmail.com", "subjecls", "lsdfh");
