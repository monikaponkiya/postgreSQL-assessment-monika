import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as smtpTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  public async emailSender(
    email: string,
    subject: string,
    mailBody: any,
  ): Promise<nodemailer.SentMessageInfo> {
    try {
      const transport = nodemailer.createTransport(
        new smtpTransport({
          host: process.env.EMAIL_CONFIG_HOST,
          port: +process.env.EMAIL_CONFIG_PORT,
          auth: {
            user: process.env.EMAIL_CONFIG_USERNAME,
            pass: process.env.EMAIL_CONFIG_PASSWORD,
          },
        }),
      );

      const mailOption: Mail.Options = {
        from: process.env.EMAIL_CONFIG_USERNAME,
        to: email,
        subject,
        html: mailBody,
      };

      return await transport.sendMail(mailOption);
    } catch (e) {
      console.log('email sender func error ', e);
    }
  }
}
