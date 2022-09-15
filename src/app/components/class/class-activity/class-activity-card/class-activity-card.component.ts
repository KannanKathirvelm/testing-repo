import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DiagnosticReportComponent } from '@app/components/diagnostic-report/diagnostic-report.component';
import { ClassActivityService } from '@app/providers/service/class-activity/class-activity.service';
import { DownloadService } from '@app/providers/service/download.service';
import { CaStudentsAggregatedReportComponent } from '@components/class/reports/ca-students-aggregated-report/ca-students-aggregated-report.component';
import { PortfolioCalendarComponent } from '@components/portfolio/portfolio-calendar/portfolio-calendar.component';
import { DOWNLOAD_STATE } from '@constants/download-constants';
import { AlertController, ModalController } from '@ionic/angular';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ClassMembersModel } from '@models/class/class';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';
import { CONTENT_TYPES } from '@constants/helper-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { EVENTS } from '@app/constants/events-constants';

@Component({
  selector: 'nav-class-activity-card',
  templateUrl: './class-activity-card.component.html',
  styleUrls: ['./class-activity-card.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})
export class ClassActivityCardComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activity: ClassContentModel;
  @Input() public activityIndex: number;
  @Input() public isCaAutoAssignToStudent: boolean;
  @Input() public isOnline: boolean;
  @Input() public offlineSynInProgress: boolean;
  @Input() public isCaBaselineWorkflow: boolean;
  @Output() public enableClassActivityEvent = new EventEmitter();
  @Output() public deleteClassActivityEvent = new EventEmitter();
  @Output() public studentListEvent = new EventEmitter();
  @Output() public rescheduleActivityEvent = new EventEmitter();
  @Output() public updateClassActivityStatusEvent = new EventEmitter();
  @Output() public reloadCAList = new EventEmitter();
  @Output() public updateMasteryAccuralEvent = new EventEmitter();
  @Output() public gradeItemEvent = new EventEmitter();
  @Output() public openVideoConferenceEvent = new EventEmitter();
  @Input() public courseId: string;
  public showNgxAvatar: boolean;
  public activityDescription: string;
  public isActivityPast: boolean;
  public isAddDataEnable: boolean;
  public hideOtherMenusList: boolean;
  public showMoreClasses: boolean;
  public isDownloaded: boolean;
  public isFutureActivity: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private modalService: ModalService,
    private reportService: ReportService,
    private translate: TranslateService,
    private classService: ClassService,
    private classActivityService: ClassActivityService,
    private downloadService: DownloadService,
    private parseService: ParseService
  ) { }

  // -------------------------------------------------------------------------
  // Lifecycle methods

  public ngOnInit() {
    this.hideOtherMenusList = true;
    this.activityDescription = this.activity.learningObjective
      ? this.activity.learningObjective
      : this.activity.standards && this.activity.standards.length
        ? this.activity.standards[0].title
        : ''
    this.checkIsActivityPast();
    this.checkIsAddDataEnable();
    this.setStudentListCountForMultiClass();
    this.checkDownloadStatus();
  }

  public ngOnChanges(changes: SimpleChanges) {
    const isOnline = changes.isOnline?.currentValue;
    if (!isOnline) {
      this.checkDownloadStatus();
    }
  }

  /**
   * @function checkDownloadStatus
   * This Method is used to check the download status
   */
  private async checkDownloadStatus() {
    const downloadState = await this.downloadService.checkDownloadStatus(this.activity.classId,
      this.activity.id,
      this.activity.contentId);
    this.isDownloaded = downloadState === DOWNLOAD_STATE.DOWNLOADED;
  }

  /**
   * @function setStudentListCountForMultiClass
   * This Method is used to set student list count for multi class
   */
  public setStudentListCountForMultiClass() {
    this.activity.activityClasses.map((activityClass) => {
      this.classService.fetchClassMembersByClassId(activityClass.classId).then((classMember: ClassMembersModel) => {
        activityClass.usersCount = classMember?.members?.length || 0;
      });
    });
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function checkIsActivityPast
   * This Method is used to get activity past
   */
  public checkIsActivityPast() {
    const activityDate = this.activity.endDate || this.activity.dcaAddedDate
    const currentDate = moment().format('YYYY-MM-DD');
    this.isActivityPast = moment(activityDate).isBefore(currentDate);
  }

  /**
   * @function checkIsAddDataEnable
   * This Method is used to get activity future
   */
  public checkIsAddDataEnable() {
    const endDate = this.activity.endDate;
    const addDate = this.activity.dcaAddedDate || endDate;
    const activityDate =
    this.activity.contentType === CONTENT_TYPES.OFFLINE_ACTIVITY
      ? this.activity.dcaAddedDate
      : this.activity.endDate || this.activity.dcaAddedDate;
    const currentDate = moment().format('YYYY-MM-DD');
    this.isFutureActivity = moment(activityDate).isAfter(currentDate);
    this.isAddDataEnable = moment(currentDate).isBetween(moment(addDate), moment(endDate), 'days', '[]');
  }

  /**
   * @function toggleEnableActivity
   * This Method is used to toggle enable activity
   */
  public toggleEnableActivity(event) {
    this.enableClassActivity();
  }

  /**
   * @function enableClassActivity
   * This Method is used to enable activity
   */
  public enableClassActivity() {
    if (!this.activity.isActive) {
      this.enableClassActivityEvent.emit();
    }
  }

  /**
   * @function deleteClassActivity
   * This Method is used to show alert for delete class activity
   */
  public async deleteClassActivity(activityClass, activityClassIndex) {
    const alert = await this.alertCtrl.create({
      cssClass: 'alert-delete-class-activity',
      header: this.translate.instant('ARE_YOU_SURE'),
      message: this.translate.instant('DELETE_ACTIVITY'),
      buttons: [{
        text: this.translate.instant('CANCEL'),
        role: 'cancel',
        cssClass: 'secondary'
      }, {
        text: this.translate.instant('DELETE'),
        handler: () => {
          this.deleteClassActivityEvent.emit({
            activityClassIndex,
            classId: activityClass.classId,
            id: activityClass.id
          });
        }
      }]
    });
    await alert.present();
    this.parseService.trackEvent(EVENTS.CLICK_CA_DAILY_VIEW_DELETE);

  }

  /**
   * @function assignToStudentAlert
   * This Method is used to show alert for confirm assign to student
   */
  public async assignToStudentAlert(activity) {
    const alert = await this.alertCtrl.create({
      cssClass: 'alert-delete-class-activity',
      header: this.translate.instant('AUTO_ASSIGN_ALERT_HEADER'),
      message: this.translate.instant('AUTO_ASSIGN_ALERT_DESCRIPTION'),
      buttons: [{
        text: this.translate.instant('NO'),
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          this.openAddDataPopup(activity);
        }
      }, {
        text: this.translate.instant('YES'),
        handler: () => {
          this.enableClassActivity();
          this.openAddDataPopup(activity);
        }
      }]
    });
    await alert.present();
  }

  /**
   * @function openStudentList
   * This Method is used to show student list
   */
  public openStudentList(activity) {
    this.studentListEvent.emit({ classId: activity.classId, activityId: activity.id });
    this.parseService.trackEvent(EVENTS.CLICK_CA_DAILY_VIEW_USER);
  }

  /**
   * @function resscheduleActivity
   * This Method is used to rescheule activity
   */
  public async rescheduleActivity(activity) {
    this.toggleMenuItems();
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PortfolioCalendarComponent,
      componentProps: {
        startDate: new Date(),
        activity,
        selectedDates: null,
        endDate: null
      }
    });
    modal.onDidDismiss().then((dismissContent) => {
      const content = dismissContent.data;
      if (content && content.filterStartDate && content.filterEndDate) {
        const scheduleParams = {
          classId: this.activity.classId,
          contentId: this.activity.contentId,
          contentType: this.activity.contentType,
          startDate: content.filterStartDate,
          endDate: content.filterEndDate,
          month: Number(moment(content.filterStartDate).format('MM')),
          year: Number(moment(content.filterStartDate).format('YYYY'))
        };
        this.rescheduleActivityEvent.emit(scheduleParams);
      }
    });
    await modal.present();
    this.parseService.trackEvent(EVENTS.CLICK_CA_RESCHEDULE);
  }

  /**
   * @function updateClassActivityStatus
   * This Method is used to update class activity status
   */
  public updateClassActivityStatus() {
    this.updateClassActivityStatusEvent.emit({
      activity: this.activity
    });
    this.parseService.trackEvent(EVENTS.CLICK_CA_MARK_AS_CLOSED);
  }

  /**
   * @function onOpenAggregateReport
   * This Method is used to open modal for aggregated report
   */
  public onOpenAggregateReport() {
    const context = {
      activity: this.activity,
      courseId: this.courseId,
      isCaBaselineWorkflow: this.isCaBaselineWorkflow
    }
    if (this.activity.isOfflineActivity) {
      this.reportService.showReport(context.activity);
    } else {
      if (this.activity.isDiagnostic) {
        this.modalService.openModal(DiagnosticReportComponent, context, 'diagnostic-report').then(() => {
          this.reloadCAList.emit();
        });
      } else {
        this.modalService.openModal(CaStudentsAggregatedReportComponent, context, 'students-aggregated-report').then(() => {
          this.reloadCAList.emit();
        });
      }
    }
  }

  /**
   * @function openAddData
   * This Method is used to open add data
   */
  public openAddData(event, activityClass) {
    this.parseService.trackEvent(EVENTS.ADD_DATA_CA);
    event.preventDefault();
    if (this.isOnline) {
      if (!this.activity.isActive && !this.isCaAutoAssignToStudent) {
        this.assignToStudentAlert(activityClass);
        return;
      }
      this.enableClassActivity();
      this.openAddDataPopup(activityClass);
    } else {
      this.openAddDataPopup(activityClass);
    }
  }

  /**
   * @function openAddDataPopup
   * This Method is used to open add data popup
   */
  public openAddDataPopup(activity) {
    this.parseService.trackEvent(EVENTS.CLICK_CA_DAILY_VIEW_ACTIVATE);
    this.reportService.openAddDataReport(activity).then(() => {
      this.reloadCAList.emit();
    });
  }

  /**
   * @function toggleMenuItems
   * This Method is used to toggle menu items
   */
  public toggleMenuItems() {
    this.hideOtherMenusList = !this.hideOtherMenusList;
  }

  /**
   * @function toggleShowMore
   * This Method is used to toggle show more secondary classes
   */
  public toggleShowMore() {
    this.showMoreClasses = !this.showMoreClasses;
  }

  /**
   * @function changeMasteryAccural
   * This Method is used to update mastery accural
   */
  public changeMasteryAccural(event) {
    const toggleValue = event.detail.checked;
    this.updateMasteryAccuralEvent.emit({
      classId: this.activity.classId,
      contentId: this.activity.id,
      toggleValue
    });
    this.parseService.trackEvent(EVENTS.CLICK_CA_DAILY_VIEW_MASTERY);
  }

  /**
   * @function onEnableOaGrading
   * This Method is used to enable oa grading
   */
  public onEnableOaGrading(activityClass) {
    if (this.activity.isCompleted) {
      this.gradeItemEvent.emit(activityClass);
    }
  }

  /**
   * @function enableVideoConference
   * This Method is used to enable video conference
   */
  public openVideoConference() {
    this.openVideoConferenceEvent.emit(this.activity);
  }

  /**
   * @function onClickStudentReport
   * This method used to call report function based on type
   */
  public onPreview() {
    this.showReport(true);
  }

  /**
   * @function showReport
   * This method used to call report function based on type
   */
  public showReport(isPreview?) {
    const context = {
      collectionId: this.activity.collection.id,
      collectionType: this.activity.contentType,
      contentId: this.activity.contentId,
      isPreview
    };
    this.reportService.showReport(context);
    this.parseService.trackEvent(EVENTS.CLICK_CA_PREVIEW);
  }

  /**
   * @function clickDownload
   * This method will trigger when user clicks on download button
   */
  public clickDownload() {
    this.activity.activityClasses.forEach((activityClass) => {
      this.classActivityService.fetchClassActivityUserList(activityClass.classId, activityClass.id, true);
    });
  }
}
