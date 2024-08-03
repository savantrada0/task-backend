const nodemailer = require("nodemailer");

const sendEmail = (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Savan Trada",
      address: process.env.USER,
    },
    to,
    subject,
    text,
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
    } catch (e) {
      console.log(e);
    }
  };

  sendMail(transporter, mailOptions);
};

module.exports = sendEmail;
