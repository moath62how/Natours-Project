const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.Email;
    this.firstName = user.Name.split(' ')[0];
    this.url = url;
    this.from = `Moath Hussam ${process.env.EMAIL_FROM}`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const options = {
      wordwrap: 130,
    };

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html, options),
    };
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset Token (Valid for only 10 minutes)',
    );
  }
};

const sendEmail = async (options) => {
  const mailOptions = {
    from: 'Moath Hussam <hello@moath.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html
  };
};
