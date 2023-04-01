const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, tutor, booking) {
    this.studentName = user.fullName;
    this.to = user.email;
    this.tutorName = tutor.fullName;
    this.tutorEmail = tutor.email;
    this.duration = booking.duration;
    this.description = booking.description;
    this.price = booking.price;
    this.time = booking.time;
    this.id = booking._id;
    this.courseName = booking.courseName;
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
      fullName: this.studentName,
      tutorName: this.tutorName,
      duration: this.duration,
      courseName: this.courseName,
      description: this.description,
      id: this.id,
      price: this.price,
      date: this.time,
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

  async confirmBooking() {
    await this.send('userBooking', 'Pisqre - Booking Successful');
  }

  async notifyTutor() {
    await this.send('tutorBooking', 'Pisqre - Booking Notification');
  }
};
