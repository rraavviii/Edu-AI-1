const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false, 
  auth: {
    user: "eduai.communications@gmail.com",
    pass: "",
  },
});


async function sendMail(to, subject, text) {
  
  const info = await transporter.sendMail({
    from: 'eduai.communications@gmail.com', 
    to, 
    subject,
    text, 
  });


}

module.exports = {sendMail}

