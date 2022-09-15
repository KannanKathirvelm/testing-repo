import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DiagnosticReportComponent } from '@app/components/diagnostic-report/diagnostic-report.component';
import { DOWNLOAD_STATE } from '@app/constants/download-constants';
import { EVENTS } from '@app/constants/events-constants';
import { ClassActivityService } from '@app/providers/service/class-activity/class-activity.service';
import { DownloadService } from '@app/providers/service/download.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { CaStudentsAggregatedReportComponent } from '@components/class/reports/ca-students-aggregated-report/ca-students-aggregated-report.component';
import { PortfolioCalendarComponent } from '@components/portfolio/portfolio-calendar/portfolio-calendar.component';
import { AlertController, ModalController } from '@ionic/angular';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ClassModel } from '@models/class/class';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';

@Component({
  selector: 'class-activity-list-item',
  templateUrl: './class-activity-list-item.component.html',
  styleUrls: ['./class-activity-list-item.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})
export class ClassActivityListItemComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  public expandActivity: boolean;
  public class: ClassModel;
  public isActivityPast: boolean;
  public isAddDataEnable: boolean;
  public hideOtherMenusList: boolean;
  public isFutureActivity: boolean;
  public isDownloaded: boolean;
  public isThumbnailError: boolean;
  public isDiagnostic: boolean;
  @Input() public activity: ClassContentModel;
  @Input() public activityIndex: number;
  @Input() public courseId: string;
  @Input() public isCaAutoAssignToStudent: boolean;
  @Input() public isOnline: boolean;
  @Input() public offlineSynInProgress: boolean;
  @Input() public isCaBaselineWorkflow: boolean;
  @Output() public studentListEvent = new EventEmitter();
  @Output() public enableClassActivityEvent = new EventEmitter();
  @Output() public updateClassActivityStatusEvent = new EventEmitter();
  @Output() public deleteClassActivityEvent = new EventEmitter();
  @Output() public rescheduleActivityEvent = new EventEmitter();
  @Output() public updateMasteryAccuralEvent = new EventEmitter();
  @Output() public reloadCAList = new EventEmitter();
  @Output() public gradeItemEvent = new EventEmitter();
  @Output() public openVideoConferenceEvent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private modalService: ModalService,
    private reportService: ReportService,
    private translate: TranslateService,
    private classActivityService: ClassActivityService,
    private downloadService: DownloadService,
    private parseService: ParseService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.expandActivity = false;
    this.hideOtherMenusList = true;
    this.class = this.classService.class;
    this.checkIsActivityPast();
    this.checkIsAddDataEnable();
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
   * @function checkIsActivityPast
   * This Method is used to get activity past
   */
  public checkIsActivityPast() {
    const activityDate = this.activity.dcaAddedDate || this.activity.endDate;
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
    const currentDate = moment().format('YYYY-MM-DD');
    const activityDate = endDate || addDate;
    this.isFutureActivity = moment(activityDate).isAfter(currentDate);
    this.isAddDataEnable = moment(currentDate).isBetween(moment(addDate), moment(endDate), 'days', '[]');
  }

  /**
   * @function onExpandActivity
   * This method is used to toggle the answers
   */
  public onExpandActivity() {
    this.expandActivity = !this.expandActivity;
  }

  /**
   * @function openStudentList
   * This Method is used to show student list
   */
  public openStudentList(activity) {
    this.parseService.trackEvent(EVENTS.CLICK_CA_DAILY_VIEW_USER);
    if (this.isOnline) {
      this.studentListEvent.emit({ classId: activity.classId, activityId: activity.id });
    }
  }

  /**
   * @function onOpenAggregateReport
   * This Method is used to open modal for aggregated report
   */
  public onOpenAggregateReport(event) {
    if (event) {
      event.stopPropagation();
    }
    this.parseService.trackEvent(EVENTS.VIEW_REPORT_CA);
    const context = {
      activity: this.activity,
      courseId: this.courseId,
      isCaBaselineWorkflow: this.isCaBaselineWorkflow
    }
    if (this.activity.isDiagnostic) {
      this.modalService.openModal(DiagnosticReportComponent, context, 'diagnostic-report').then(() => {
        this.reloadCAList.emit();
      });
    } else {
      this.modalService.openModal(CaStudentsAggregatedReportComponent, context, 'students-aggregated-report');
    }
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
  }

  /**
   * @function toggleEnableActivity
   * This Method is used to toggle enable activity
   */
  public toggleEnableActivity(event) {
    this.parseService.trackEvent(EVENTS.CLICK_CA_DAILY_VIEW_ACTIVATE);
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
   * @function openAddData
   * This Method is used to open add data
   */
  public openAddData(event, activity) {
    event.preventDefault();
    if (this.isOnline) {
      if (!this.activity.isActive && !this.isCaAutoAssignToStudent) {
        this.assignToStudentAlert(activity);
        return;
      }
      this.enableClassActivity();
      this.openAddDataPopup(activity);
    } else {
      this.openAddDataPopup(activity);
    }
  }

  /**
   * @function openAddDataPopup
   * This Method is used to open add data popup
   */
  public openAddDataPopup(activity) {
    this.reportService.openAddDataReport(activity).then(() => {
      this.reloadCAList.emit();
    });
  }

  /**
   * @function updateClassActivityStatus
   * This Method is used to update class activity status
   */
  public updateClassActivityStatus() {
    this.updateClassActivityStatusEvent.emit({
      activity: this.activity
    });
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
   * @function resscheduleActivity
   * This Method is used to rescheule activity
   */
  public async rescheduleActivity() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PortfolioCalendarComponent,
      componentProps: {
        startDate: new Date(),
        selectedDates: null,
        endDate: null
      }
    });
    this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_DATERANGE_SUBMIT);
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
    this.parseService.trackEvent(EVENTS.RESCHEDULE_ACTIVITY_CA);
  }

  /**
   * @function changeMasteryAccural
   * This Method is used to change mastery accural
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
   * @function toggleMenuItems
   * This Method is used to toggle menu items
   */
  public toggleMenuItems() {
    this.hideOtherMenusList = !this.hideOtherMenusList;
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
   * @function clickDownload
   * This method will trigger when user clicks on download button
   */
  public clickDownload() {
    this.activity.activityClasses.forEach((activityClass) => {
      this.classActivityService.fetchClassActivityUserList(activityClass.classId, activityClass.id, true);
    });
  }

  /**
   * @function onImgError
   * This method is used to set the image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
