import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationService {

  constructor(private localNotifications: LocalNotifications) { }

  /**
   * @function sendNotification
   * This method is used to send the notification
   */
  public async sendNotification(id, title, text) {
    await this.localNotifications.schedule({
      id,
      title,
      text,
      sticky: false,
      clock: false
    });

  }

  /**
   * @function updateNotificationProgress
   * This method is used to update the notification progress
   */
   public async updateNotificationProgress(id: number, progressValue: number, text: string) {
    await this.localNotifications.update({
      id,
      progressBar: { value: progressValue, enabled: false },
      text,
      sticky: true,
      clock: false,
    });
  }

  /**
   * @function cancelNotification
   * This method is used to cancel the notification
   */
   public async cancelNotification(id: number) {
    await this.localNotifications.cancel(id);
  }
}