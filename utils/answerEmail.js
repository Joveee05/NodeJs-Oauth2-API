const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, assignment) {
    this.tutorName = user.fullName;
    this.to = `${process.env.EMAIL_FROM}`;
    this.tutorEmail = user.email;
    this.amount = assignment.amount;
    this.id = assignment.pisqreId;
    this.courseName = assignment.courseName;
    this.from = `Pisqre API ${process.env.EMAIL_FROM}`;
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
      tutorName: this.tutorName,
      courseName: this.courseName,
      id: this.id,
      amount: this.amount,
      tutorEmail: this.tutorEmail,
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

  async verifyAssignment() {
    await this.send('admin', 'A New Assignment Requires Verification');
  }
};
