import { Injectable } from '@angular/core';
import { NOTIFICATION_TYPE, TEACHER_NOTIFICATION_TYPES } from '@constants/helper-constants';
import { NotificationListModel, NotificationModel } from '@models/notification/notification';
import { HttpService } from '@providers/apis/http';

@Injectable({
  providedIn: 'root'
})

export class NotificationProvider {

  // -------------------------------------------------------------------------
  // Properties

  private notificationNamespace = 'api/notifications/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getStudentNotificationList
   * Method to get student notification list
   */

  public fetchNotificationList(context) {
    const endpoint = `${this.notificationNamespace}/teacher`;
    const paramsData = {
      classId: context.classId,
      limit: context.limit,
      boundary: context.boundary
    };
    return this.httpService.get<NotificationListModel>(endpoint, paramsData).then((response) => {
      const notificationList: NotificationListModel = {
        boundary: response.data.boundary,
        moreItemsRemaining: response.data.moreItemsRemaining,
        notifications: this.normalizeNotification(response.data.notifications)
      };
      return notificationList;
    });
  }

  /**
   * Normalize notification
   * @param {notificationList} payload
   * @return {notificationList}
   */
  private normalizeNotification(payload): Array<NotificationModel> {
    const notificationPayload = payload.map((item) => {
      const notifictionTitleKey = TEACHER_NOTIFICATION_TYPES.find((notifiocationItem) =>
        notifiocationItem.type === item.notificationType);
      const notification: NotificationModel = {
        ctxCaId: item.ctxCaId,
        ctxClassCode: item.ctxClassCode,
        ctxClassId: item.ctxClassId,
        ctxCollectionId: item.ctxCollectionId,
        ctxCourseId: item.ctxCourseId,
        ctxLessonId: item.ctxLessonId,
        ctxPathId: item.ctxPathId || 0,
        ctxPathType: item.ctxPathType || null,
        ctxSource: item.ctxSource,
        ctxTxCode: item.ctxTxCode,
        ctxTxCodeType: item.ctxTxCodeType,
        ctxUnitId: item.ctxUnitId,
        currentItemId: item.currentItemId,
        currentItemTitle: item.currentItemTitle,
        currentItemType: item.currentItemType,
        id: item.id,
        milestoneId: item.milestoneId,
        notifictionTitleKey: notifictionTitleKey ? notifictionTitleKey.translationKey : null,
        notificationType: item.notificationType,
        occurrence: item.occurrence,
        updatedAt: item.updatedAt
      };
      return notification;
    });
    return notificationPayload.filter((notificationData) =>
      notificationData.notificationType === NOTIFICATION_TYPE.STUDENT_GRADABLE_SUBMISSION ||
      notificationData.notificationType === NOTIFICATION_TYPE.STUDENT_SELF_REPORT ||
      notificationData.notificationType === NOTIFICATION_TYPE.CFU_FAILED_TWICE_TEACHER_NOTIFICATION);
  }

  /**
   * @function resetNotification
   * Method to reset notification
   */

  public resetNotification(notificationId: string) {
    const endpoint = `${this.notificationNamespace}/teacher/${notificationId}`;
    return this.httpService.delete(endpoint);
  }
}
