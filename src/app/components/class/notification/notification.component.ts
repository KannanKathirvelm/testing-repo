import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/constants/events-constants';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { NOTIFICATION_TYPE } from '@constants/helper-constants';
import { routerPathIdReplace } from '@constants/router-constants';
import { NotificationListModel } from '@models/notification/notification';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '@providers/service/loader.service';
import { NotificationService } from '@providers/service/notification/notification.service';
import { ToastService } from '@providers/service/toast.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  @Input() public classId: string;
  public notificationList: NotificationListModel;
  public scrollDepthTriggered: boolean;
  @Output() public closeNotification = new EventEmitter();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private loader: LoadingService,
    private toastService: ToastService,
    private translate: TranslateService,
    private parseService: ParseService,
    private classService: ClassService
  ) {
    this.scrollDepthTriggered = false;
  }
  @HostListener('scroll', ['$event'])
  public async onScroll(event) {
    const element = event.target;
    if (element.offsetHeight + Math.round(element.scrollTop) >= element.scrollHeight) {
      if (this.scrollDepthTriggered) {
        return;
      }
      this.scrollDepthTriggered = true;
      this.fetchNotificationList();
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.fetchNotificationListInCache();
  }

  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list
   */
  public fetchNotificationListInCache() {
    this.notificationList = this.notificationService.notificationList;
  }

  /**
   * @function onRedirect
   * This method is used to redirect to respective area
   */
  public onRedirect(notification) {
    if (
      notification.notificationType === NOTIFICATION_TYPE.STUDENT_GRADABLE_SUBMISSION ||
      notification.notificationType === NOTIFICATION_TYPE.STUDENT_SELF_REPORT
    ) {
      const jouneryURL = routerPathIdReplace('journey', this.classId);
      this.router.navigate([jouneryURL], { queryParams: { notificationId: notification.id } });
    }
    this.resetNotification(notification.id);
    this.closeNotification.emit();
    this.trackNotification(notification);
  }

  /**
   * @function trackNotification
   * This method is used to track the event when the notification is clicked
   */
  private trackNotification(notification) {
    const context = this.getNotificationContext(notification);
    this.parseService.trackEvent(EVENTS.CLICK_NOTIFICATION, context);
  }

  /**
   * @function getNotificationContext
   * This method is used to get the context for click notification event
   */
  private getNotificationContext(notification) {
    const classDetails = this.classService.class;
    return {
      notificationType: notification.notificationType,
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.courseId,
    };
  }

  /**
   * @function resetNotification
   * This method is used to reset notification
   */
  public resetNotification(notificationId) {
    this.notificationService.resetNotification(notificationId).then(() => {
      const limit = this.notificationList.notifications.length;
      const context = {
        classId: this.classId,
        limit
      };
      this.notificationService.fetchNotificationList(context).then((response) => {
        this.notificationList = response;
      });
    });
  }

  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list scrolls
   */
  public fetchNotificationList() {
    if (this.notificationList.moreItemsRemaining) {
      this.loader.displayLoader();
      const limit = this.notificationList.notifications.length;
      const context = {
        boundary: this.notificationList.boundary,
        limit,
        classId: this.classId
      };
      this.notificationService.fetchNotificationList(context).then((response) => {
        this.notificationList.boundary = response.boundary;
        this.notificationList.moreItemsRemaining = response.moreItemsRemaining;
        this.notificationList.notifications = this.notificationList.notifications.concat(response.notifications);
        this.loader.dismissLoader();
        this.scrollDepthTriggered = false;
      });
    } else {
      this.translate
        .get('NO_MORE_NOTIFICATION')
        .subscribe(value => {
          this.toastService.presentToast(value, null, null, true);
        });
      this.scrollDepthTriggered = true;
    }
  }
}
