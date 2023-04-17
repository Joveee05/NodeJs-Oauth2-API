const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.fullName = user.fullName;
    this.to = user.email;
    this.url = url;
    this.from = `Pisqre <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
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
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      fullName: this.fullName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Pisqre Community!');
  }

  async contactUs() {
    await this.send('contactUs', 'Thank You for Contacting Us!');
  }

  async tutorWelcome() {
    await this.send('tutorWelcome', 'Become a Tutor');
  }

  async tutorDocuments() {
    await this.send('tutorDocuments', 'Documents Received');
  }

  async tutorVerified() {
    await this.send('tutorVerified', 'Congratulations - You are now a Tutor');
  }

  async sendPasswordReset() {
    await this.send(
      'resetPassword',
      'Your Password Reset Token (valid for only 10 minutes)'
    );
  }
};
