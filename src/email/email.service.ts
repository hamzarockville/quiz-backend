import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP host
      port: 587, // SMTP port (e.g., 587 for TLS)
      secure: false, // Use TLS
      auth: {
        user: 'hamzahayat1888@gmail.com', // Replace with your email
        pass: 'yqcb wuah ygid ddvi', // Replace with your email password
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: '"Quiz App" <your-email@example.com>', // Sender
        to,
        subject,
        text,
        html, // Optional HTML content
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw new Error('Failed to send email');
    }
  }
}
