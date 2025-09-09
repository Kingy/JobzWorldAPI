import nodemailer from "nodemailer";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // For now, use SMTP configuration - can be switched to SES later
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });

  static async sendVerificationEmail(
    email: string,
    userId: number
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?userId=${userId}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Jobzworld!</h2>
        <p>Thank you for creating your account. Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          If you didn't create an account with Jobzworld, please ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: "Verify your Jobzworld account",
      html: htmlContent,
    });
  }

  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>We received a request to reset your Jobzworld account password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If the button doesn't work, copy and paste this link:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: "Reset your Jobzworld password",
      html: htmlContent,
    });
  }

  static async sendJobMatchNotification(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Job Match!</h2>
        <p>Hi ${candidateName},</p>
        <p>Great news! We found a job opportunity that matches your profile:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${jobTitle}</h3>
          <p style="margin: 0; color: #6b7280;"><strong>Company:</strong> ${companyName}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #10b981; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Opportunity
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Log in to your Jobzworld dashboard to learn more about this opportunity and express your interest.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: candidateEmail,
      subject: `New job match: ${jobTitle} at ${companyName}`,
      html: htmlContent,
    });
  }

  static async sendApplicationNotification(
    employerEmail: string,
    candidateName: string,
    jobTitle: string
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Application Received</h2>
        <p>You have received a new application for your job posting:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${jobTitle}</h3>
          <p style="margin: 0; color: #6b7280;"><strong>Candidate:</strong> ${candidateName}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/employer/applications" 
             style="background-color: #8b5cf6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Log in to your employer dashboard to review the candidate's profile and video responses.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: employerEmail,
      subject: `New application for ${jobTitle}`,
      html: htmlContent,
    });
  }

  private static async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }
}
