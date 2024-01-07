import * as nodemailer from "nodemailer";
import * as nodemailerMailgun from "nodemailer-mailgun-transport";
import * as dotenv from "dotenv";
import { MailgunConfig } from "../@types";
dotenv.config();
class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(config: MailgunConfig) {
    const auth: nodemailerMailgun.Options = {
      auth: {
        api_key: config.apiKey,
        domain: config.domain,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    this.transporter = nodemailer.createTransport(nodemailerMailgun(auth));
  }

  sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `Brints Estate <${process.env["MAILGUN_EMAIL"]}>`,
      to,
      subject,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}

const mailgunConfig: MailgunConfig = {
  apiKey: process.env["MAILGUN_API_KEY"] as string,
  domain: process.env["MAILGUN_DOMAIN"] as string,
};

export const emailService = new EmailService(mailgunConfig);

// @Injectable()
// export class EmailService {
//   private readonly transporter: nodemailer.Transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport(
//       nodemailerMailgun({
//         auth: {
//           api_key: process.env.MAILGUN_API_KEY,
//           domain: process.env.MAILGUN_DOMAIN,
//         },
//       })
//     );
//   }

//   sendEmail(to: string, subject: string, html: string) {
//     const mailOptions = {
//       from: "Brints Estate <no-reply@brints.live>",
//       to,
//       subject,
//       html,
//     };

//     return this.transporter.sendMail(mailOptions);
//   }
// }
