/**
 * Background Jobs Service
 * Handles periodic tasks and cleanup jobs
 */

import { prisma } from '../server.js';
import { twilioService } from './twilio.service.js';

class BackgroundJobsService {
  constructor() {
    this.intervals = [];
  }

  /**
   * Start all background jobs
   */
  start() {
    console.log('🔄 Starting background jobs...');

    // Initialize Twilio service
    this.initializeTwilio();

    // Clean up old closed sessions (every hour)
    this.intervals.push(
      setInterval(() => this.cleanupOldSessions(), 60 * 60 * 1000)
    );

    // Update operator last seen (every 5 minutes)
    this.intervals.push(
      setInterval(() => this.updateOperatorStatus(), 5 * 60 * 1000)
    );

    console.log('✅ Background jobs started');
  }

  /**
   * Stop all background jobs
   */
  stop() {
    console.log('⏹️  Stopping background jobs...');
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    console.log('✅ Background jobs stopped');
  }

  /**
   * Initialize Twilio service on startup
   */
  async initializeTwilio() {
    try {
      await twilioService.initialize();
      if (twilioService.isReady()) {
        console.log('✅ Twilio WhatsApp ready');
      } else {
        console.log('⚠️  Twilio WhatsApp not configured');
      }
    } catch (error) {
      console.error('Failed to initialize Twilio:', error);
    }
  }

  /**
   * Clean up old closed chat sessions
   */
  async cleanupOldSessions() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await prisma.chatSession.updateMany({
        where: {
          status: 'CLOSED',
          closedAt: {
            lt: thirtyDaysAgo,
          },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (result.count > 0) {
        console.log(`🧹 Soft deleted ${result.count} old chat sessions`);
      }
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }

  /**
   * Update operator status based on activity
   */
  async updateOperatorStatus() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Mark operators as offline if no activity in last 30 minutes
      const result = await prisma.operator.updateMany({
        where: {
          isOnline: true,
          lastSeenAt: {
            lt: thirtyMinutesAgo,
          },
        },
        data: {
          isOnline: false,
          isAvailable: false,
        },
      });

      if (result.count > 0) {
        console.log(`🔴 Marked ${result.count} operators as offline (inactive >30min)`);
      }
    } catch (error) {
      console.error('Failed to update operator status:', error);
    }
  }
}

// Export singleton instance
export default new BackgroundJobsService();
