export interface EmailProvider { sendVerificationEmail(input: { email: string; verificationUrl: string }): Promise<void>; }

export const consoleEmailProvider: EmailProvider = {
  async sendVerificationEmail({ email, verificationUrl }) {
    if (process.env.NODE_ENV !== "production") console.info(`[email-verification] ${email}: ${verificationUrl}`);
  },
};
