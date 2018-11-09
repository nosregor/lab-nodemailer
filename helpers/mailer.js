const nodemailer = require('nodemailer');
const hbs = require('hbs');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const generateHtml = (filename, options = {}) => {
  const html = hbs.compile(fs.readFileSync((__dirname, `./views/mail/${filename}.hbs`), 'utf8'));
  return html(options);
};

exports.send = (options) => {
  console.log('====>', options.filename);
  const html = generateHtml(options.filename, options);
  const mailOptions = {
    from: 'Admin <no-reply@ironhack.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html,
  };
  return transporter.sendMail(mailOptions);
};
