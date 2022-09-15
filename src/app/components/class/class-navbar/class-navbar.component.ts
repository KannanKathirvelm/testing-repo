import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/constants/events-constants';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { routerPathIdReplace } from '@constants/router-constants';
import { ClassModel } from '@models/class/class';
import { ClassCompetencySummaryModel } from '@models/competency/competency';
import { NotificationService } from '@providers/service/notification/notification.service';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'class-navbar',
  templateUrl: './class-navbar.component.html',
  styleUrls: ['./class-navbar.component.scss'],
})
export class ClassNavbarComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public class: ClassModel;
  @Input() public activeRoute: string;
  @Input() public classScore: number;
  @Input() public classActivityScore: number;
  @Input() public isOnline: boolean;
  @Output() public openMilestoneCourseReport = new EventEmitter();
  @Input() public competencyScore: ClassCompetencySummaryModel;
  @Output() public openNotification = new EventEmitter();
  public isMilestoneActive: boolean;
  public isProficiencyActive: boolean;
  public isClassActivityActive: boolean;
  public isAtcActive: boolean;
  public isSettingsActive: boolean;
  public moreItemsRemaining: boolean;
  public notificationCount: number;
  public displayCount: number;
  public notificationSubscription: AnonymousSubscription;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private router: Router,
    private notificationService: NotificationService,
    private parseService: ParseService,
    private classService: ClassService) {
    this.displayCount = 10;
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.loadNotificationCount();
  }

  /**
   * @function loadNotificationCount
   * This Method is used to fetch notification count
   */
  public loadNotificationCount() {
    this.notificationSubscription = this.notificationService
      .onNotification.subscribe((notification) => {
        if (notification) {
          this.moreItemsRemaining = notification.moreItemsRemaining;
          this.notificationCount = notification
            .moreItemsRemaining
            ? this.displayCount
            : notification.notifications.length;
        }
      });
  }

  public ngOnDestroy() {
    this.notificationSubscription.unsubscribe();
  }

  /**
   * @function showNotification
   * This method is used to show Notification popover
   */
  public showNotification(event) {
    this.openNotification.emit();
    this.trackNotificationClick();
  }

  /**
   * @function trackNotificationClick
   * This method is used to track accessing the event when the notification is clicked
   */
  private trackNotificationClick() {
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_ACCESSING_NOTIFICATION, context);
  }

  /**
   * @function getEventContext
   * This method is used to get the access context for click notification event
   */
  private getEventContext() {
    const classDetails = this.classService.class;
    return {
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.courseId,
    };
  }

  /**
   * @function onOpenMilestoneCourseReport
   * This Method is used to open milestone course report
   */
  public onOpenMilestoneCourseReport(event) {
    event.stopPropagation();
    this.openMilestoneCourseReport.emit();
  }

  /**
   * @function redirectToClassActivities
   * This method is used to redirect to class activities
   */
  public redirectToClassActivities() {
    const classActivityURL = routerPathIdReplace('scheduledActivitiesWithFullPath', this.class.id);
    this.router.navigate([classActivityURL]);
  }

  /**
   * @function redirectToJourney
   * This method is used to redirect to journey
   */
  public redirectToJourney() {
    const classDetails = this.classService.class;
    const courseId = classDetails.courseId;
    if (!courseId && this.isOnline) {
      const addCourseURL = routerPathIdReplace('addCourse', classDetails.id);
      this.router.navigate([addCourseURL]);
    } else {
      const journeyURL = routerPathIdReplace('journey', classDetails.id);
      this.router.navigate([journeyURL]);
    }
  }

  /**
   * @function redirectToATC
   * This method is used to redirect atc
   */
  public redirectToATC() {
    const atcURL = routerPathIdReplace('atc', this.class.id);
    this.router.navigate([atcURL]);
  }

  /**
   * @function redirectToProficiency
   * This method is used to redirect to proficiency
   */
  public redirectToProficiency() {
    const proficiencyURL = routerPathIdReplace('classProficiency', this.class.id);
    this.router.navigate([proficiencyURL]);
  }

  /**
   * @function redirectToSettings
   * This method is used to redirect to settings
   */
  public redirectToSettings() {
    const context = this.getEventContext();
    const settingsURL = routerPathIdReplace('settings', this.class.id);
    this.parseService.trackEvent(EVENTS.CLICK_CLASS_SETTINGS,context);
    this.router.navigate([settingsURL]);
  }
}
