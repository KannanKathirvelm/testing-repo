import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { WorkerService } from '@app/background-workers/services/worker.service';
import { CaAssignCalenderComponent } from '@app/components/class/class-activity/ca-assign-calender/ca-assign-calender.component';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { SYNC_STATUS_CODE, TASK_RESULT_STATUS } from '@app/constants/download-constants';
import { UploadSyncStatusModel } from '@app/models/offline/offline';
import { DatabaseService } from '@app/providers/service/database.service';
import { OfflineApiService } from '@app/providers/service/offline/offline-api.service';
import { SearchService } from '@app/providers/service/search/search.service';
import { SyncService } from '@app/providers/service/sync.service';
import { ToastService } from '@app/providers/service/toast.service';
import { AssignActivityComponent } from '@components/class/class-activity/assign-activity/assign-activity.component';
import { CaStudentListComponent } from '@components/class/class-activity/ca-student-list/ca-student-list.component';
import { CaVideoConferenceComponent } from '@components/class/class-activity/ca-video-conference/ca-video-conference.component';
import { GradingReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/grading-report.component';
import { AllowAccessComponent } from '@components/UI/allow-access/allow-access.component';
import { ASSESSMENT, CALENDAR_VIEW, COLLECTION, CONTENT_TYPES, MEETING_TOOLS, SIGNATURE_CONTENT_TYPES, STUDENTS } from '@constants/helper-constants';
import { ClassActivity, ClassContentModel } from '@models/class-activity/class-activity';
import { ClassMembersModel, ClassModel } from '@models/class/class';
import { CaStudentListModel } from '@models/profile/profile';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { LoadingService } from '@providers/service/loader.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { NetworkService } from '@providers/service/network.service';
import { OfflineActivityService } from '@providers/service/offline-activity/offline-activity.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import { VideoConferenceService } from '@providers/service/video-conference/video-conference.service';
import { formatimeToDateTime, getAllDatesInMonth, groupBy } from '@utils/global';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-scheduled-activities',
  templateUrl: './scheduled-activities.page.html',
  styleUrls: ['./scheduled-activities.page.scss'],
})
export class ScheduledActivitiesPage implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  public class: ClassModel;
  public contentTypes: Array<string>;
  public classContents: Array<ClassContentModel>;
  public isDailyView: boolean;
  public selectedView: string;
  public showCalendar: boolean;
  public highlightDates: Array<string>;
  public disabledDates: Array<Date>;
  public selectedStartDate: string;
  public selectedEndDate: string;
  public activeRoute: string;
  public courseId: string;
  public isClassActivityLoaded: boolean;
  public isListView: boolean;
  public secondaryClasses: Array<ClassModel>;
  public scheduledActivities: Array<{ key: string; value: Array<ClassContentModel> }>;
  public meetingClassContents: Array<ClassContentModel>;
  public isCaAutoAssignToStudent: boolean;
  public isCaBaselineWorkflow: boolean;
  public tenantSettings: TenantSettingsModel;
  public classDetailsSubscription: AnonymousSubscription;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public syncPercentage: number;
  public syncStatusCode = 0;
  public readonly STATUS_CHECK_INTERVAL = 1000;
  public showSyncProgress: boolean;
  public offlineSyncCompleted: boolean;
  public offlineSynInProgress: boolean;
  public backgroundTaskSubscription: AnonymousSubscription;
  public backgroundPerformanceTaskSubscription: AnonymousSubscription;
  public offlineUploadSubscription: AnonymousSubscription;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private classActivityService: ClassActivityService,
    private modalService: ModalService,
    private offlineActivityService: OfflineActivityService,
    private utilsService: UtilsService,
    private videoConferenceService: VideoConferenceService,
    private sessionService: SessionService,
    private loadingService: LoadingService,
    private lookupService: LookupService,
    private networkService: NetworkService,
    private zone: NgZone,
    private offlineApiService: OfflineApiService,
    private databaseService: DatabaseService,
    private syncService: SyncService,
    private workerService: WorkerService,
    private searchService: SearchService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    this.contentTypes = [
      CONTENT_TYPES.ASSESSMENT,
      CONTENT_TYPES.COLLECTION,
      CONTENT_TYPES.OFFLINE_ACTIVITY,
      CONTENT_TYPES.MEETING
    ];
    this.isDailyView = true;
    this.isListView = false;
    this.offlineSyncCompleted = false;
    this.showSyncProgress = false;
  }

  public ionViewDidEnter() {
    this.classDetailsSubscription = this.classService.fetchClassDetails
      .subscribe((classDetails) => {
        this.class = classDetails;
        this.courseId = this.class?.courseId;
        this.secondaryClasses = this.classService.secondaryClasses;
        this.fetchTenantSettings();
        if (this.isOnline) {
          this.videoConferenceService.authorizeMeetingTool();
          this.syncClassActivities();
        }
      });
  }

  public ngOnInit() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        if (this.isOnline) {
          this.fetchUploadSyncStatus();
        }
      });
    });
    this.offlineUploadSubscription = this.syncService.offlineUpload.subscribe((uploadId) => {
      if (uploadId) {
        this.fetchUploadSyncStatus();
      }
    });
  }

  public ngOnDestroy() {
    this.classDetailsSubscription.unsubscribe();
    this.networkSubscription.unsubscribe();
    if (this.backgroundTaskSubscription) {
      this.backgroundTaskSubscription.unsubscribe();
    }
    if (this.backgroundPerformanceTaskSubscription) {
      this.backgroundPerformanceTaskSubscription.unsubscribe();
    }
    if (this.offlineUploadSubscription) {
      this.offlineUploadSubscription.unsubscribe();
    }
  }

  /**
   * @function syncClassActivities
   * This method is used to sync class activities in the background task
   */
  private syncClassActivities() {
    if (this.class) {
      const offlineSettings = this.offlineApiService.findClassOfflineSettings(this.class.id);
      if (this.isOnline && offlineSettings && offlineSettings.settings.isOfflineAccessEnabled) {
        const backgroundClassTask = this.syncService.syncClassActivities(this.class);
        this.backgroundTaskSubscription = this.workerService.startTask(backgroundClassTask).subscribe((result) => {
          const completedJob = result.currentCompletedJob;
          if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
            const currentJob = backgroundClassTask.jobs.find((job) => job.id === completedJob.id);
            currentJob.callback(completedJob.result);
          } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
            // Start the sync task for CA performance.
            const backgroundCAPerformanceTask = this.syncService.syncClassActivitiesPerformance(this.class.id, completedJob.result);
            this.backgroundPerformanceTaskSubscription = this.workerService.startTask(backgroundCAPerformanceTask).subscribe((performanceTaskResult) => {
              const completedPerformanceJob = performanceTaskResult.currentCompletedJob;
              if (completedPerformanceJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
                const currentJob = backgroundCAPerformanceTask.jobs.find((job) => job.id === completedPerformanceJob.id);
                currentJob.callback(completedPerformanceJob.result);
              }
            });
          }
        });
      }
    }
  }

  /**
   * @function fetchUploadSyncStatus
   * This method is used to fetch sync status data
   */
  public fetchUploadSyncStatus() {
    this.databaseService.getDocument(DOCUMENT_KEYS.LAST_UPLOAD_ID).then((result) => {
      const syncInterval = setInterval(() => {
        this.offlineApiService.fetchUploadSyncStatus(result.value).then((syncStatusResult: UploadSyncStatusModel) => {
          this.showSyncProgress = true;
          this.offlineSynInProgress = true;
          this.syncPercentage = syncStatusResult.completedPercentage;
          this.syncStatusCode = syncStatusResult.syncStatusCode;
          if (this.syncPercentage === 100) {
            clearInterval(syncInterval);
            this.syncStatusCode = SYNC_STATUS_CODE.COMEPLETED;
            this.offlineSyncCompleted = true;
            this.offlineSynInProgress = false;
            this.reloadCAList();
            this.syncService.offlineUploadSubject.next(null);
            this.databaseService.deleteDocument(result._id, result._rev);
          } else if (this.syncStatusCode === SYNC_STATUS_CODE.ERROR) {
            this.offlineSyncCompleted = false;
            this.offlineSynInProgress = false;
            clearInterval(syncInterval);
          }
        });
      }, this.STATUS_CHECK_INTERVAL);
    });
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public async fetchTenantSettings() {
    this.tenantSettings = await this.lookupService.fetchTenantSettings();
    this.isCaAutoAssignToStudent = this.tenantSettings && this.tenantSettings['isCaAutoAssignToStudent'] || false;
    this.isCaBaselineWorkflow = this.tenantSettings && this.tenantSettings['caBaselineWorkflow'];
  }

  /**
   * @function toggleView
   * This method is used to toggle view
   */
  public toggleView() {
    this.isListView = !this.isListView;
  }

  /**
   * @function onToggleCalendar
   * This method is used to toggle calender
   */
  public onToggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  /**
   * @function onSelectView
   * This method is know which view to list class activities
   */
  public onSelectView(view) {
    this.selectedView = view;
  }

  /**
   * @function onSelectedCalenderDate
   * This method is used to select calender date
   */
  public onSelectedCalenderDate(event) {
    const startDate = event.startDate;
    const endDate = event.endDate;
    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate ? endDate : this.selectedStartDate;
    if (event.calenderView === CALENDAR_VIEW.MONTHLY) {
      this.fetchMonthActiviyList(event.startDate);
    } else {
      this.fetchScheduledActivity(startDate, endDate);
    }
  }

  /**
   * @function fetchScheduledActivity
   * This method is used to fetch scheduled activity
   */
  public fetchScheduledActivity(startDate, endDate) {
    this.isClassActivityLoaded = false;
    const context = {
      classId: this.class.id,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate ? endDate : startDate).format('YYYY-MM-DD'),
      contentType: this.contentTypes.join(','),
      secondaryClasses: this.secondaryClasses.map((item) => item.id).join(',')
    };
    this.classActivityService.fetchScheduledActivityByContentType(context).then((classContentsRes: Array<ClassContentModel>) => {
      this.classContents = classContentsRes;
      this.meetingClassContents = classContentsRes.filter((content) => content.contentType === CONTENT_TYPES.MEETING);
      const groupedClassActivities = groupBy(classContentsRes, 'contentId');
      const scheduledActivities = [];
      Object.keys(groupedClassActivities).map((key) => {
        const classActivity = classContentsRes.find((item) => item.contentId === key);
        if (classActivity) {
          const classActivityForMultiClass = this.classActivityService.structureForMultiClassActivity(groupedClassActivities[key], this.secondaryClasses, this.class);
          classActivity.activityClasses = classActivityForMultiClass;
          scheduledActivities.push(classActivity);
        }
      });
      const groupByDate = groupBy(scheduledActivities, 'dcaAddedDate');
      const activities = Object.keys(groupByDate).map(key => ({ key, value: groupByDate[key] }));
      activities.sort((a, b) => (new Date(b.key) as any) - (new Date(a.key) as any));
      this.scheduledActivities = activities;
      this.isClassActivityLoaded = true;
    });
  }

  /**
   * @function fetchMonthActiviyList
   * This method is used to fetch monthly activity list
   */
  public fetchMonthActiviyList(date) {
    const currentYear = moment(date).format('YYYY');
    const currentMonth = moment(date).format('MM');
    const startDate = moment(date).startOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    const endDate = moment(date).endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    return this.classActivityService.fetchMonthActivityList(this.class.id, startDate, endDate).then((activities: Array<ClassActivity>) => {
      const allDatesInMonth = getAllDatesInMonth(Number(currentYear), Number(currentMonth));
      const activityDateRange = [];
      activities.forEach((activity) => {
        let startRange = activity.addedDate || activity.dcaAddedDate;
        const endRange = activity.endDate;
        while (moment(startRange) <= moment(endRange)) {
          activityDateRange.push(startRange);
          startRange = moment(startRange).add(1, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
        }
      });
      const disabledDates = allDatesInMonth.filter((dateItem) => {
        const formatedDate = dateItem.format(CALENDAR_VIEW.DATE_FORMAT);
        return !activityDateRange.includes(formatedDate);
      });
      this.disabledDates = disabledDates.map((monthActivity) => {
        return new Date(monthActivity);
      });
      this.highlightDates = activityDateRange;
      return activities;
    });
  }

  /**
   * @function onEnableClassActivity
   * This method is used to enable class activity
   */
  public onEnableClassActivity(activityDateIndex, activityIndex) {
    const activity = this.scheduledActivities[activityDateIndex].value[activityIndex];
    activity.isActive = true;
    const activityClasses = activity.activityClasses;
    activityClasses.forEach((activityClass) => {
      this.postEnableClassActivity(activityClass, activity);
    });
  }

  /**
   * @function postEnableClassActivity
   * This Method is used to post enable activity
   */
  public postEnableClassActivity(activity, activityContent = null) {
    const activationDate = moment().format('YYYY-MM-DD');
    this.classActivityService.enableClassActivity(activity.classId, activity.id, activationDate).then(() => {
      activity.isActive = true;
      if (activityContent) {
        activityContent.isActive = true;
      }
    });
  }

  /**
   * @function onDeleteClassActivity
   * This method is used to delete class activity
   */
  public onDeleteClassActivity(context, activityDateIndex, classActivityIndex) {
    const activities = this.scheduledActivities[activityDateIndex].value;
    const activityClasses = activities[classActivityIndex].activityClasses;
    const isRemoveClass = activityClasses.length === 1;
    this.deleteClassActivity(context.classId, context.id);
    if (isRemoveClass) {
      activities.splice(classActivityIndex, 1);
    } else {
      activityClasses.splice(context.activityClassIndex, 1);
    }
  }

  /**
   * @function deleteMeetingActivity
   * This method is used to delete meeting activity
   */
  public deleteMeetingActivity(activityIndex) {
    const activity = this.meetingClassContents[activityIndex];
    this.deleteClassActivity(activity.classId, activity.id);
    this.meetingClassContents.splice(activityIndex, 1);
  }

  /**
   * @function deleteClassActivity
   * This method is used to delete class activity
   */
  public deleteClassActivity(classId, activityId) {
    this.classActivityService.deleteClassActivity(classId, activityId);
  }

  /**
   * @function onOpenStudentList
   * This method is used to open student list
   */
  public onOpenStudentList(params) {
    this.modalService.openModal(CaStudentListComponent, { classId: params.classId, contentId: params.activityId }, 'ca-student-list').then((context: Array<CaStudentListModel>) => {
      if (context) {
        const studentIds = context.map((item) => item.id);
        this.classActivityService.updateClassActivityUsers(params.classId, params.activityId, studentIds);
      }
    });
  }

  /**
   * @function onRescheduleActivity
   * This method is used to trigger reschedule class activity
   */
  public onRescheduleActivity(scheduleParams) {
    this.classActivityService.rescheduleClassActivity(scheduleParams).then(() => {
      this.fetchScheduledActivity(this.selectedStartDate, this.selectedEndDate);
      this.fetchMonthActiviyList(this.selectedStartDate);
    });
  }

  /**
   * @function updateClassActivityStatus
   * This method is used to update class activity
   */
  public onUpdateClassActivityStatus(event, activityDateIndex, activityIndex) {
    const activity = event.activity;
    this.classActivityService.updateClassActivityStatus(activity.classId, activity.id).then(() => {
      this.scheduledActivities[activityDateIndex].value[activityIndex].isCompleted = true;
      const isAutoAssign = this.getAutoAssignSetting();
      if (isAutoAssign && activity.contentType === COLLECTION) {
        this.loadingService.displayLoaderWithMessage(this.translate.instant('PLEASE_ASSIGN_ASSESSMENT'));
        this.autoAssignAssessment(activity);
      }
    });
  }

  /**
   * @function openAssignActivity
   * This method is used to open assign activity
   */
  public openAssignActivity(activeType = null) {
    if (this.isClassActivityLoaded) {
      const context = {
        activities: this.classContents,
        selectedContentType: activeType,
        isCaBaselineWorkflow: this.isCaBaselineWorkflow
      }
      this.modalService.openModal(AssignActivityComponent, context, 'ca-assign-activity').then(() => {
        this.reloadCAList();
      });
    }
  }

  /**
   * @function reloadCAList
   * This method is used to reload ca list
   */
  public reloadCAList() {
    this.syncClassActivities();
    this.fetchScheduledActivity(this.selectedStartDate, this.selectedEndDate);
    this.fetchMonthActiviyList(this.selectedStartDate);
  }

  /**
   * @function onRefresh
   * This method is used to refresh ca list
   */
  public async onRefresh(event) {
    await this.reloadCAList();
    event.target.complete();
  }

  /**
   * @function onUpdateMasteryAccural
   * This method is used to update mastery accural
   */
  public onUpdateMasteryAccural(context) {
    this.classActivityService.updateMasteryAccural(context.classId, context.contentId, { allow_mastery_accrual: context.toggleValue });
  }

  /**
   * @function gradeItem
   * This method is used to open grade Item
   */
  public gradeItem(activityClass) {
    this.offlineActivityService.readActivity(activityClass.contentId).then((oaGradingContent) => {
      const gradingItem = {
        classId: activityClass.classId,
        dcaContentId: activityClass.id,
        collection: oaGradingContent,
        content: oaGradingContent,
        contentType: activityClass.contentType,
        studentCount: activityClass.usersCount,
        activityDate: activityClass.activityDate,
        isAssessmentGrading: false,
        isDCAContext: true
      };
      this.modalService.openModal(GradingReportComponent, {
        oaGrading: gradingItem
      }, 'grading-report').then(() => {
        this.reloadCAList();
      });
    });
  }

  /**
   * @function enableVideoConference
   * This method is used to enable video conference
   */
  public async openVideoConference(activity) {
    const showAnimation = false;
    const meetingTool = await this.utilsService.preferredMeetingTool();
    const videoConferenceType = meetingTool === MEETING_TOOLS.zoom ? 'getZoomTokenFromSession' : 'getConferenceTokenFromSession';
    this.sessionService[videoConferenceType]().then((token) => {
      if (token) {
        this.modalService.openModal(CaVideoConferenceComponent, {
          activity
        }, 'video-conference', showAnimation)
          .then((videoConferenceTime: { startTime: string; endTime: string; }) => {
            if (videoConferenceTime) {
              if (activity.meetingUrl) {
                this.updateConferenceForClasses(activity, videoConferenceTime.startTime, videoConferenceTime.endTime);
              } else {
                this.createConferenceForClasses(activity, videoConferenceTime.startTime, videoConferenceTime.endTime);
              }
            }
          });
      } else {
        this.modalService.openModal(AllowAccessComponent,
          {}, 'allow-access', showAnimation).then((context: { isAllow: boolean }) => {
            if (context && context.isAllow) {
              this.loadingService.displayLoader();
              this.videoConferenceService.authorizeMeetingTool().then(() => {
                this.openVideoConference(activity);
              }).finally(() => {
                this.loadingService.dismissLoader()
              })
            }
          });
      }
    });
  }

  /**
   * @function createConferenceForClasses
   * This method is used to create conference for classes
   */
  public createConferenceForClasses(activity, startTime, endTime) {
    this.classService.fetchClassMembersByClassId(activity.classId).then((classMembers: ClassMembersModel) => {
      const students = classMembers.members;
      const studentsEmailIds = students.map((student) => student.email);
      if (studentsEmailIds && studentsEmailIds.length) {
        const activityClasses = activity.activityClasses && activity.activityClasses || [activity];
        activityClasses.map((activityClass) => {
          return new Promise((resolve, reject) => {
            activityClass.meetingStartTime = formatimeToDateTime(startTime);
            activityClass.meetingEndTime = formatimeToDateTime(endTime);
            return this.videoConferenceService.createVideoConferenceList(activityClass, studentsEmailIds).then((response) => {
              activity.meetingId = response.meeting_id;
              activity.meetingUrl = response.meeting_url;
              activity.meetingStartTime = response.meeting_starttime;
              activity.meetingEndTime = response.meeting_endtime;
              resolve();
            }, reject);
          });
        });
      }
    });
  }

  /**
   * @function updateConferenceForClasses
   * This method is used to update conference for classes
   */
  public updateConferenceForClasses(activity, startTime, endTime) {
    const updateParams = {
      meeting_id: activity.meetingId,
      meeting_url: activity.meetingUrl,
      meeting_endtime: formatimeToDateTime(endTime),
      meeting_starttime: formatimeToDateTime(startTime),
      meeting_timezone: activity.meetingTimezone
    };
    const activityClasses = activity.activityClasses && activity.activityClasses || [activity]
    const activityPromises = activityClasses.map(activityClass => {
      return new Promise((resolve, reject) => {
        activityClass.meetingStartTime = activity.meetingStartTime;
        activityClass.meetingEndTime = activity.meetingEndTime;
        activityClass.meetingTimezone = activity.meetingTimezone;
        activityClass.meetingId = activity.meetingId;
        return this.videoConferenceService.updateConference(activityClass.classId, activityClass.id, updateParams).then(() => {
          return this.videoConferenceService.updateConferenceCalenderEvent(activityClass).then(() => {
            resolve();
          }, reject);
        }, reject);
      });
    });
    Promise.all(activityPromises).then(() => {
      activity.meetingStartTime = updateParams.meeting_starttime;
      activity.meetingEndTime = updateParams.meeting_endtime;
    });
  }

  /**
   * @function enableMeetingActivity
   * This method is used to enable meeting activity
   */
  public enableMeetingActivity(activity) {
    this.postEnableClassActivity(activity);
  }

  /*
   * @function getAutoAssignSetting
   * Method is used to get auto assign setting
   */
  public getAutoAssignSetting() {
    const setting = this.class.setting;
    return setting && setting['ca.auto.assign.content'] || false;
  }

  /**
   * @function autoAssignAssessment
   * This method is used to auto assign the assessment
   */
  public async autoAssignAssessment(activity) {
    let assignActivity;
    let searchResult;
    const searchParams = {
      pageSize: 5
    }
    const params = {
      searchParams
    }
    if (this.courseId) {
      params.searchParams['taxonomies'] = activity.standards.map((standard) => {
        return standard.id;
      })
      searchResult = await this.searchService.searchAssessments(params);
    } else {
      const standardCode = activity.standards.map((standard) => {
        return standard.id;
      });
      searchParams['standard'] = standardCode.toString();
      searchParams['audience'] = STUDENTS;
      params['contentType'] = [ASSESSMENT, SIGNATURE_CONTENT_TYPES.ASSESSMENT];
      searchResult = await this.searchService.searchCapContents(params);
    }
    if (searchResult.collections && searchResult.collections.length) {
      assignActivity = searchResult.collections[0];
      this.openCalender(assignActivity);
    }
    this.loadingService.dismissLoader();
  }

  /**
   * @function openCalender
   * This method is used to open calender
   */
  public openCalender(activity) {
    const content = activity;
    const startDate = moment();
    this.modalService.openModal(CaAssignCalenderComponent, {
      startDate,
      content,
      selectedDates: null,
      endDate: null
    }, 'ca-assign-calender').then((context) => {
      if (context) {
        const addContext = {
          content,
          context
        }
        this.addActivity(addContext);
      }
    });
  }

  /**
   * @function addActivity
   * This Methods help to add acivity
   */
  public addActivity(event) {
    const classSetting = this.class.setting;
    const secondaryClasses = classSetting && classSetting['secondary.classes'] && classSetting['secondary.classes'].list || [];
    const classIds = [...[this.class.id], ...secondaryClasses];
    const promiseList = classIds.map((classId) => {
      return new Promise((resolve, reject) => {
        const addActivityParams = this.classActivityContext(event, classId);
        this.classActivityService.rescheduleClassActivity(addActivityParams).then((response) => {
          const classMembers = this.classService.classMembers;
          const studentList = classMembers && classMembers.members || [];
          const studentIds = studentList.map((student) => student.email);
          const activityId = response.headers.location;
          if (event.context.startTime && event.context.endTime) {
            const contextParams = {
              title: event.content.title,
              meetingStartTime: formatimeToDateTime(event.context.startTime),
              meetingEndTime: formatimeToDateTime(event.context.endTime),
              id: activityId,
              classId
            }
            this.videoConferenceService.createVideoConferenceList(contextParams, studentIds);
          }
          resolve();
        }, reject);
      });
    });
    Promise.all(promiseList).then(() => {
      const successMessage = this.translate.instant('ASSIGNED_SUCCESSFULLY')
      this.toastService.presentToast(successMessage, true);
      this.reloadCAList();
    });
  }

  /**
   * @function classActivityContext
   * methods to load class activity context
   */
  public classActivityContext(params, classId) {
    return {
      classId,
      contentId: params.content.id,
      contentType: params.content.format,
      startDate: params.context.startDate,
      endDate: params.context.endDate,
      month: Number(moment(params.context.startDate).format('MM')),
      year: Number(moment(params.context.endDate).format('YYYY'))
    }
  }
}
