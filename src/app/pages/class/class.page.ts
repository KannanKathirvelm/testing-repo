import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { WorkerService } from '@app/background-workers/services/worker.service';
import { TASK_RESULT_STATUS } from '@app/constants/download-constants';
import { OfflineApiService } from '@app/providers/service/offline/offline-api.service';
import { SyncService } from '@app/providers/service/sync.service';
import { CourseMapReportComponent } from '@components/class/reports/course-map-report/course-map-report.component';
import { MilestoneCourseReportComponent } from '@components/class/reports/milestone-course-report/milestone-course-report.component';
import { CLASS_ROUTES, routerPathIdReplace } from '@constants/router-constants';
import { ClassModel } from '@models/class/class';
import { ClassCompetencySummaryModel } from '@models/competency/competency';
import { NotificationListModel } from '@models/notification/notification';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { CourseService } from '@providers/service/course/course.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { NetworkService } from '@providers/service/network.service';
import { NotificationService } from '@providers/service/notification/notification.service';
import { UtilsService } from '@providers/service/utils.service';
import { getLimit, getPredefinedRouteFromUrl } from '@utils/global';
import { collapseAnimation } from 'angular-animations';
import 'rxjs/add/observable/interval';
import { AnonymousSubscription } from 'rxjs/Subscription';
@Component({
  selector: 'nav-class',
  templateUrl: './class.page.html',
  styleUrls: ['./class.page.scss'],
  animations: [collapseAnimation({ duration: 300, delay: 0 })],
})
export class ClassPage implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public classId: string;
  public activeRoute: string;
  public class: ClassModel;
  public isLoaded: boolean;
  public notifications: NotificationListModel;
  public isNotificationTimerStarts: boolean;
  public showNotification: boolean;
  public timerSubscription: any;
  public classNameUpdateSubscription: AnonymousSubscription;
  public routerSubscription: AnonymousSubscription;
  public competencyScore: ClassCompetencySummaryModel;
  public classScore: number;
  public classActivityScore: number;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public backgroundTaskSubscription: AnonymousSubscription;
  public updateCourseSubscription: AnonymousSubscription;
  public isAddCourse: boolean;

  @ViewChild('container', { static: false }) public content: ElementRef;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private classService: ClassService,
    private courseService: CourseService,
    private competencyService: CompetencyService,
    private classActivityService: ClassActivityService,
    private router: Router,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
    private syncService: SyncService,
    private workerService: WorkerService,
    private offlineApiService: OfflineApiService
  ) {
    this.isLoaded = false;
    this.isNotificationTimerStarts = false;
    this.showNotification = false;
    this.classId = this.activatedRoute.snapshot.params.id;
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const activeRoute = getPredefinedRouteFromUrl(event.urlAfterRedirects);
        if (activeRoute !== this.activeRoute) {
          this.activeRoute = activeRoute;
        }
        if (this.class) {
          this.loadClassPerformance();
        }
      }
    });
  }

  public ngOnInit(): void {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        if (this.isOnline && this.class) {
          this.syncClassActivities();
        } else {
          this.unsubscribeTimerSubscription();
        }
      });
    });
    this.subscribeUpdatedCourse();
  }

  public ionViewDidEnter() {
    this.initialLoadData();
  }

  public ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.unsubscribeTimerSubscription();
    this.classNameUpdateSubscription.unsubscribe();
    this.classService.clearState();
    this.courseService.clearState();
    this.networkSubscription.unsubscribe();
    this.updateCourseSubscription.unsubscribe();
    if (this.backgroundTaskSubscription) {
      this.backgroundTaskSubscription.unsubscribe();
    }
  }

  public ionViewWillLeave() {
    this.courseService.updateCourseSubject.next(null)
  }

  /**
   * @function unsubscribeTimerSubscription
   * This method is used to unsubsribe the timer
   */
  public unsubscribeTimerSubscription() {
    if (this.timerSubscription) {
      clearInterval(this.timerSubscription);
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function initialLoadData
   * This method is used to load the initial data sets
   */
  public initialLoadData() {
    this.fetchClassDetails();
    this.fetchClassMembers();
    this.subscribeToUpdateClassName();
  }

  /**
   * @function subscribeUpdatedCourse
   * This method is used to subsribe the updated course
   */
  public subscribeUpdatedCourse() {
    this.updateCourseSubscription = this.courseService.updatedCourse.subscribe((courseId) => {
      if (courseId) {
        this.initialLoadData();
        this.isAddCourse = true;
      }
    })
  }

  /**
   * @function redirectToJourney
   * This method is used to redirect to journey page
   */
  public redirectToJourney() {
    const classId = this.class.id;
    const journeyURL = routerPathIdReplace('journey', classId);
    this.router.navigate([journeyURL]);
  }

  /**
   * @function loadClassPerformance
   * This method is used to load the class performance
   */
  public loadClassPerformance() {
    switch (this.activeRoute) {
      case CLASS_ROUTES.CLASS_ACTIVITY:
        this.fetchCAPerformance();
        break;
      case CLASS_ROUTES.JOURNEY:
        this.fetchClassPerformance();
        break;
      case CLASS_ROUTES.COURSEMAP:
        this.fetchClassPerformance();
        break;
    }
  }

  /**
   * @function syncClassActivities
   * This method is used to sync class activities in the background task
   */
  private syncClassActivities() {
    const offlineSettings = this.offlineApiService.findClassOfflineSettings(this.classId);
    if (this.isOnline && offlineSettings && offlineSettings.settings.isOfflineAccessEnabled) {
      const backgroundClassTask = this.syncService.syncClassDataList(this.class, false);
      this.backgroundTaskSubscription = this.workerService.startTask(backgroundClassTask).subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundClassTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        }
      });
    }
  }

  /**
   * @function subscribeToUpdateClassName
   * This method is used to subscribe to update class name
   */
  public subscribeToUpdateClassName() {
    this.classNameUpdateSubscription = this.classService.classNameUpdated
      .subscribe((state) => {
        if (state) {
          this.classService.fetchClassByClassId(this.classId)
            .then((classDetails) => {
              this.class = classDetails;
            });
        }
      });
  }

  /**
   * @function onOpenMilestoneCourseReport
   * this Method is used to open milestone course report
   */
  public onOpenMilestoneCourseReport() {
    const context = {
      classDetail: this.class
    };
    if (this.class.isPremiumClass) {
      this.modalService.openModal(MilestoneCourseReportComponent, context, 'milestone-course-report');
    } else {
      this.modalService.openModal(CourseMapReportComponent, context, 'course-map-report');
    }
  }

  /**
   * @function fetchClassDetails
   * This method is used to fetch class Details
   */
  public fetchClassDetails() {
    this.classService.fetchClassByClassId(this.classId).then((classDetails) => {
      this.class = classDetails;
      this.fetchNotificationList();
      this.fetchCompetencyCompletionStats();
      this.loadClassPerformance();
      this.syncClassActivities();
      Promise.all([this.fetchCourse(), this.fetchSecondaryClasses()])
        .then(() => {
          this.isLoaded = true;
          if (this.isAddCourse) {
            this.redirectToJourney();
            this.isAddCourse = false;
          }
        });
    });
  }

  /**
   * @function fetchCAPerformance
   * This Method is used to fetch CA performance
   */
  public fetchCAPerformance() {
    const classId = this.classId;
    this.classActivityService.fetchCAPerformance(classId).then((performance) => {
      this.classActivityScore = performance ? performance[0].scoreInPercentage : null;
    });
  }

  /**
   * @function closeNotification
   * This method is used to close the notification
   */
  public closeNotification() {
    this.showNotification = false;
  }

  /**
   * @function openNotification
   * This method is used to open the notification container
   */
  public openNotification() {
    this.showNotification = !this.showNotification;
  }

  /**
   * @function fetchClassMembers
   * This method is used to fetch class members
   */
  public fetchClassMembers() {
    this.classService.fetchClassMembersByClassId(this.classId);
  }

  /**
   * @function fetchSecondaryClasses
   * This method is used to fetch secondary classes
   */
  public fetchSecondaryClasses() {
    const secondaryClasses = this.class.setting ? this.class.setting['secondary.classes'] : null;
    const classList = secondaryClasses?.list || [];
    if (classList.length) {
      return this.classService.fecthSecondaryClassesDetails(classList, this.classId);
    }
    return;
  }

  /**
   * @function fetchCourse
   * This method is used to fetch class course
   */
  public fetchCourse() {
    if (this.class.courseId) {
      return this.courseService.fetchCourseById(this.class.courseId);
    }
  }

  /**
   * @function fetchCompetencyCompletionStats
   * This Method is used to fetch competency completion stats
   */
  public fetchCompetencyCompletionStats() {
    if (this.class.isPremiumClass) {
      const subjectCode = this.class.preference?.subject || null;
      const params = {
        classId: this.classId,
        subjectCode
      }
      if (subjectCode) {
        this.competencyService.fetchCompetencyCompletionStats([params])
        .then((competencyScoreSummary) => {
          this.competencyScore = competencyScoreSummary ? competencyScoreSummary[0] : null;
        });
      }
    }
    return;
  }

  /**
   * @function fetchClassPerformance
   * This Method is used to fetch class performance
   */
  public fetchClassPerformance() {
    const classId = this.classId;
    const courseId = this.class.courseId;
    this.classService.fetchClassPerformance([{
      classId,
      courseId
    }]).then((classPerformance) => {
      const classScoreDetails = classPerformance ? classPerformance[0] : null;
      this.classScore = classScoreDetails && Object.keys(classScoreDetails).length ? classScoreDetails.score : null;
    });
  }

  /**
   * @function fetchNotificationList
   * This method is used to fetch notification list
   */
  public fetchNotificationList() {
    if (this.isOnline) {
      const contentHeight = this.content.nativeElement.clientHeight;
      const elementHeight = 48;
      const limit = getLimit(contentHeight, elementHeight);
      this.notificationService.fetchNotificationList({ classId: this.classId, limit }).then((response) => {
        if (JSON.stringify(response) !== JSON.stringify(this.notifications)) {
          this.notifications = response;
          if (!this.isNotificationTimerStarts) {
            this.subscribeToNotification();
          }
        }
      });
    }
  }

  /**
   * @function subscribeToNotification
   * This method is used to call api for every 2mins
   * (2 * 60 * 1000) => mins into ms conversion
   */
  private subscribeToNotification() {
    this.isNotificationTimerStarts = true;
    const intervalTime = 2 * 60 * 1000;
    this.timerSubscription = setInterval(() => {
      this.fetchNotificationList()
    }, intervalTime);
  }
}
