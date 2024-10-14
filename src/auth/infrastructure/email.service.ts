import { Injectable } from '@nestjs/common';

const nodemailer = require('nodemailer');
@Injectable()
export class EmailService {
  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        secure: true,
        port: 465,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      const info = await transporter.sendMail({
        from: 'test <rabota-trassa@mail.ru>',
        to: email,
        subject,
        html: message,
      });
      return !!info;
    } catch (e) {
      return e;
    }
  }
}
