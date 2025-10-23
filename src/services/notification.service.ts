/**
 * Notification Service
 * Gestisce notifiche browser, badge, e suoni
 */

class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.initAudio();
    this.checkPermission();
  }

  /**
   * Inizializza audio per notifiche
   */
  private initAudio() {
    // Crea un beep sound semplice usando Web Audio API
    try {
      // Per ora usiamo un suono di sistema, poi si può sostituire con un file audio custom
      this.audio = new Audio();
      // Base64 encoded simple beep sound (440Hz, 200ms)
      const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZWQ==';
      this.audio.src = beepSound;
    } catch (error) {
      console.error('Failed to init audio:', error);
    }
  }

  /**
   * Verifica permessi notifiche browser
   */
  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Richiede permessi notifiche browser
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Mostra notifica browser
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    // Richiedi permesso se non ancora concesso
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'lucine-chatbot',
        ...options,
      });

      // Auto-close dopo 5 secondi
      setTimeout(() => notification.close(), 5000);

      // Focus finestra quando si clicca la notifica
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Suona notifica audio
   */
  playSound(): void {
    if (this.audio) {
      try {
        this.audio.currentTime = 0;
        this.audio.play().catch((error) => {
          console.warn('Failed to play notification sound:', error);
        });
      } catch (error) {
        console.error('Failed to play sound:', error);
      }
    }
  }

  /**
   * Notifica nuovo messaggio
   */
  async notifyNewMessage(chatId: string, userName: string, message: string): Promise<void> {
    await this.showNotification(`Nuovo messaggio da ${userName}`, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      tag: `chat-${chatId}`,
    });

    this.playSound();
  }

  /**
   * Notifica nuova chat assegnata
   */
  async notifyNewChat(chatId: string, userName: string): Promise<void> {
    await this.showNotification('Nuova chat assegnata', {
      body: `${userName} ha richiesto assistenza`,
      tag: `new-chat-${chatId}`,
    });

    this.playSound();
  }

  /**
   * Notifica chat trasferita
   */
  async notifyTransferredChat(chatId: string, userName: string, fromOperator: string): Promise<void> {
    await this.showNotification('Chat trasferita', {
      body: `${fromOperator} ti ha trasferito la chat con ${userName}`,
      tag: `transfer-${chatId}`,
    });

    this.playSound();
  }

  /**
   * Aggiorna badge count nel favicon (se supportato)
   */
  updateBadgeCount(count: number): void {
    // Prova a usare Badge API se disponibile (Chrome/Edge su mobile)
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    }

    // Aggiorna anche il titolo della pagina
    this.updatePageTitle(count);
  }

  /**
   * Aggiorna titolo pagina con count
   */
  private updatePageTitle(count: number): void {
    const baseTitle = 'Lucine Dashboard';
    if (count > 0) {
      document.title = `(${count}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }

  /**
   * Resetta tutti i badge
   */
  resetBadge(): void {
    this.updateBadgeCount(0);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
