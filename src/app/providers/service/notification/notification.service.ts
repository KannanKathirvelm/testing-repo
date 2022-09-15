import { Injectable } from '@angular/core';
import { NotificationListModel } from '@models/notification/notification';
import { NotificationProvider } from '@providers/apis/notification/notification';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public notificationListSubject: BehaviorSubject<NotificationListModel>;
  public onNotification: Observable<NotificationListModel>;

  constructor(private notificationProvider: NotificationProvider) {
    this.notificationListSubject = new BehaviorSubject<NotificationListModel>(null);
    this.onNotification = this.notificationListSubject.asObservable();
  }

  /**
   * @function fetchNotificationList
   * This Method is used to get the student notification list
   */
  public fetchNotificationList(context) {
    return this.notificationProvider.fetchNotificationList(context).then((response) => {
      this.notificationListSubject.next(response);
      return response;
    });
  }

  /**
   * @function resetNotification
   * This Method is used to reset notification
   */
  public resetNotification(notificationId) {
    return this.notificationProvider.resetNotification(notificationId);
  }

  /**
   * @function notificationList
   * This Method is used to get notification count
   */
  get notificationList() {
    return this.notificationListSubject ? this.notificationListSubject.value : null;
  }
}
