import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { prisma } from '../server.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.from = null;
  }

  /**
   * Initialize email transporter with settings from database or env
   */
  async initialize() {
    try {
      // Try to get settings from database first
      const settings = await this.getSettingsFromDatabase();

      const smtpHost = settings?.smtpHost || config.email.smtp.host;
      const smtpPort = settings?.smtpPort || config.email.smtp.port;
      const smtpUser = settings?.smtpUser || config.email.smtp.user;
      const smtpPass = settings?.smtpPass || config.email.smtp.pass;
      this.from = settings?.emailFrom || config.email.from;

      if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn('⚠️  SMTP credentials not configured');
        this.initialized = false;
        return false;
      }

      // Create nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Email service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Email service:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Get email settings from database
   */
  async getSettingsFromDatabase() {
    try {
      const smtpHost = await prisma.systemSettings.findUnique({
        where: { key: 'smtpHost' },
      });
      const smtpPort = await prisma.systemSettings.findUnique({
        where: { key: 'smtpPort' },
      });
      const smtpUser = await prisma.systemSettings.findUnique({
        where: { key: 'smtpUser' },
      });
      const smtpPass = await prisma.systemSettings.findUnique({
        where: { key: 'smtpPassword' },
      });
      const emailFrom = await prisma.systemSettings.findUnique({
        where: { key: 'emailFrom' },
      });

      return {
        smtpHost: smtpHost?.value,
        smtpPort: smtpPort?.value ? parseInt(smtpPort.value) : null,
        smtpUser: smtpUser?.value,
        smtpPass: smtpPass?.value,
        emailFrom: emailFrom?.value,
      };
    } catch (error) {
      console.error('Failed to get email settings from database:', error);
      return null;
    }
  }

  /**
   * Check if email service is initialized and ready
   */
  isReady() {
    return this.initialized && this.transporter !== null;
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text content
   * @param {string} options.html - HTML content (optional)
   * @returns {Promise<Object>} Send result
   */
  async sendEmail({ to, subject, text, html }) {
    if (!this.isReady()) {
      await this.initialize();
      if (!this.isReady()) {
        throw new Error('Email service not initialized. Please configure SMTP credentials.');
      }
    }

    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        text,
        ...(html && { html }),
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`📧 Email sent: ${result.messageId}`);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send notification email to operator
   * @param {string} operatorId - Operator ID
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   */
  async sendOperatorNotification(operatorId, subject, message) {
    try {
      const operator = await prisma.operator.findUnique({
        where: { id: operatorId },
        select: {
          email: true,
          name: true,
          notificationPreferences: true,
        },
      });

      if (!operator?.email) {
        console.log(`No email for operator ${operatorId}`);
        return { success: false, reason: 'no_email' };
      }

      // Check notification preferences
      const prefs = operator.notificationPreferences;
      if (prefs && typeof prefs === 'object' && prefs.email === false) {
        console.log(`Email notifications disabled for operator ${operatorId}`);
        return { success: false, reason: 'notifications_disabled' };
      }

      const html = `
        <h2>Ciao ${operator.name},</h2>
        <p>${message}</p>
        <br>
        <p><em>Lucine di Natale - Dashboard Operatore</em></p>
      `;

      return await this.sendEmail({
        to: operator.email,
        subject,
        text: message,
        html,
      });
    } catch (error) {
      console.error('Failed to send operator notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send ticket notification
   * @param {string} email - Recipient email
   * @param {Object} ticket - Ticket data
   */
  async sendTicketNotification(email, ticket) {
    const subject = `Nuovo Ticket: ${ticket.subject}`;
    const text = `
Ciao,

Hai ricevuto un nuovo ticket:

Oggetto: ${ticket.subject}
Priorità: ${ticket.priority}
Stato: ${ticket.status}

Descrizione:
${ticket.description}

Accedi alla dashboard per gestire il ticket.

---
Lucine di Natale
    `;

    const html = `
      <h2>Nuovo Ticket Ricevuto</h2>
      <p><strong>Oggetto:</strong> ${ticket.subject}</p>
      <p><strong>Priorità:</strong> <span style="color: ${
        ticket.priority === 'URGENT' ? '#dc2626' : ticket.priority === 'HIGH' ? '#f59e0b' : '#059669'
      }">${ticket.priority}</span></p>
      <p><strong>Stato:</strong> ${ticket.status}</p>
      <hr>
      <h3>Descrizione:</h3>
      <p>${ticket.description.replace(/\n/g, '<br>')}</p>
      <br>
      <p><em>Accedi alla dashboard per gestire il ticket.</em></p>
    `;

    return await this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Test email connection
   * @returns {Promise<boolean>} Connection test result
   */
  async testConnection() {
    try {
      await this.initialize();
      return this.isReady();
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
