import { AfterViewInit, Component, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { WorkerService } from '@app/background-workers/services/worker.service';
import { DOWNLOAD_STATE, TASK_RESULT_STATUS } from '@app/constants/download-constants';
import { EVENTS } from '@app/constants/events-constants';
import { NetworkService } from '@app/providers/service/network.service';
import { OfflineApiService } from '@app/providers/service/offline/offline-api.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { SyncService } from '@app/providers/service/sync.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { NavParams } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { ProfileModel } from '@models/profile/profile';
import { ModalService } from '@providers/service/modal/modal.service';
import { StudentService } from '@providers/service/student/student.service';
import { slideInUpAnimation } from 'angular-animations';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'journey-student-list',
  templateUrl: './journey-student-list.component.html',
  styleUrls: ['./journey-student-list.component.scss'],
  animations: [slideInUpAnimation()],
})
export class JourneyStudentListComponent implements OnInit, OnDestroy, AfterViewInit {
  // -------------------------------------------------------------------------
  // Properties

  public classMembers: Array<ProfileModel>;
  public classDetail: ClassModel;
  public courseId: string;
  public fwCode: string;
  public showNgxAvatar: string;
  public showClassMembers: boolean;
  public showItemsToGrade: boolean;
  public selectedStudentId: string;
  public isThumbnailError: boolean;
  public progressStatus: number;
  public isOnline: boolean;
  public showOfflineDownloadButton = true;
  public downloadState: number;
  public networkSubscription: AnonymousSubscription;
  public syncContents: Array<string>;
  public currentClassMembersIndex: number;
  public isCache: boolean;
  public backgroundStudentLocationSubscription: AnonymousSubscription;
  public backgroundUnitsPerformance: AnonymousSubscription;
  public backgroundMilstonePerformance: AnonymousSubscription;
  public backgroundStudentMilestoneContent: AnonymousSubscription;

  @Output() public toggleEvent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private navParams: NavParams,
    private studentService: StudentService,
    private zone: NgZone,
    private utilsService: UtilsService,
    private networkService: NetworkService,
    private syncService: SyncService,
    private workerService: WorkerService,
    private offlineApiService: OfflineApiService,
    private parseService: ParseService
  ) {
    this.showClassMembers = false;
    this.classDetail = this.navParams.get('classDetail');
    this.courseId = this.navParams.get('courseId');
    this.fwCode = this.navParams.get('fwCode');
    this.classMembers = this.navParams.get('classMembers');
    this.syncContents = [];
    this.currentClassMembersIndex = 0;
    this.progressStatus = 0;
    this.downloadState = DOWNLOAD_STATE.INTIAL;
  }

  public ngOnInit() {
    this.checkStudentContentCached();
    const offlineSettings = this.offlineApiService.findClassOfflineSettings(this.classDetail.id);
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        if (this.isOnline && offlineSettings.settings.isOfflineAccessEnabled && this.isCache) {
          this.downloadStudentContent();
        }
      });
    });
  }

  public ngAfterViewInit() {
    const activeStudentId = this.navParams.get('activeStudentId');
    if (activeStudentId) {
      const activeStudent = this.classMembers.find((item) => item.id === activeStudentId);
      if (activeStudent) {
        this.openStudentMilestone(activeStudent);
      }
    }
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
    if (this.backgroundUnitsPerformance) {
      this.backgroundUnitsPerformance.unsubscribe();
    }
    if (this.backgroundStudentLocationSubscription) {
      this.backgroundStudentLocationSubscription.unsubscribe();
    }
    if (this.backgroundMilstonePerformance) {
      this.backgroundMilstonePerformance.unsubscribe();
    }
    if (this.backgroundStudentMilestoneContent) {
      this.backgroundStudentMilestoneContent.unsubscribe();
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function openStudentMilestone
   * This method is used to open student milestone
   */
  public openStudentMilestone(user) {
    this.studentService.setSelectedStudent(user);
    this.selectedStudentId = user.id;
    const context = {
      classDetail: this.classDetail,
      courseId: this.courseId,
      fwCode: this.fwCode,
      user,
    };
    const className = this.showItemsToGrade ? 'student-and-grade-milestone-modal' : 'student-milestone-modal';
    this.closeModal({ context, className });
    this.parseService.trackEvent(EVENTS.CLICK_LJ_SELECT_STUDENT);
  }

  /**
   * @function onToggleView
   * This method is used to toggle view of class members
   */
  public onToggleView() {
    this.showClassMembers = !this.showClassMembers;
    this.closeModal();
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal(context?) {
    this.modalService.dismissModal(context);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }

  /**
   * @function checkStudentContentCached
   * This method is used to check the  student content is cached or not
   */
  public async checkStudentContentCached() {
    const classId = this.classDetail.id;
    const courseId = this.classDetail.courseId;
    const userUid = this.classMembers[0].id;
    const fwCode = this.classDetail.preference?.framework || null;
    const isMileStone = this.classDetail.milestoneViewApplicable;
    this.showOfflineDownloadButton = (isMileStone && fwCode) || (!isMileStone && fwCode);
    this.isCache =
      isMileStone && fwCode
        ? // the sync task used to cehck the milestone content cached or not
          await this.syncService.checkMilestoneContentCached(courseId, fwCode, userUid)
        : // the sync task used to cehck the units content cached or not
          await this.syncService.checkUnitContentCached(classId, courseId, userUid);
    this.downloadState = this.isCache ? DOWNLOAD_STATE.DOWNLOADED : DOWNLOAD_STATE.INTIAL;
  }

  /**
   * @function downloadStudentContent
   * This method is used to download the student content
   */
  public downloadStudentContent() {
    const id = this.classDetail.id;
    const courseId = this.classDetail.courseId;
    const fwCode = this.classDetail.preference?.framework || null;
    if (this.classMembers.length) {
      const classMembersList = this.classMembers.map((classMembersDetails) => {
        const userUid = classMembersDetails.id;
        return {
          id,
          courseId,
          userUid,
          fwCode,
        };
      });
      const isMileStone = this.classDetail.milestoneViewApplicable;
      if (isMileStone) {
        this.syncStudentMilestoneContent(classMembersList);
      } else {
        this.syncStudentCourseMapContent(classMembersList);
      }
    }
  }

  /**
   * @function syncStudentCourseMapContent
   * This method is used to sync student course map Data in the background task
   */
  private syncStudentCourseMapContent(classMembersList) {
    this.downloadState = DOWNLOAD_STATE.IN_PROGRESS;
    if (this.syncContents.length === classMembersList.length) {
      this.downloadState = DOWNLOAD_STATE.DOWNLOADED;
    }
    const roundOffProgressStatus = (this.syncContents.length / classMembersList.length) * 100;
    this.progressStatus = Math.round(roundOffProgressStatus);
    if (this.currentClassMembersIndex < classMembersList.length) {
      // Start the sync task for untis performance.
      const backgroundUnitsPerformance = this.syncService.syncUnitsPerformance(
        classMembersList[this.currentClassMembersIndex]
      );
      this.backgroundUnitsPerformance = this.workerService.startTask(backgroundUnitsPerformance).subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundUnitsPerformance.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
          // Start the sync task for student current location.
          const backgroundStudentLocationTask = this.syncService.syncStudentCurrentLocation(
            classMembersList[this.currentClassMembersIndex]
          );
          this.backgroundStudentLocationSubscription = this.workerService
            .startTask(backgroundStudentLocationTask)
            .subscribe((performanceTaskResult) => {
              const completedStudentLocationJob = performanceTaskResult.currentCompletedJob;
              if (completedStudentLocationJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
                const currentJob = backgroundStudentLocationTask.jobs.find(
                  (job) => job.id === completedStudentLocationJob.id
                );
                currentJob.callback(completedStudentLocationJob.result);
              }
            });
          this.syncContents.push(classMembersList[this.currentClassMembersIndex].studentId);
          this.currentClassMembersIndex++;
          this.syncStudentCourseMapContent(classMembersList);
        }
      });
    }
  }

  /**
   * @function syncStudentMilestoneContent
   * This method is used to sync users milestone performance data in the background task
   */
  private syncStudentMilestoneContent(classMembersList) {
    this.downloadState = DOWNLOAD_STATE.IN_PROGRESS;
    if (this.syncContents.length === classMembersList.length) {
      this.downloadState = DOWNLOAD_STATE.DOWNLOADED;
    }
    const roundOffProgressStatus = (this.syncContents.length / classMembersList.length) * 100;
    this.progressStatus = Math.round(roundOffProgressStatus);
    if (this.currentClassMembersIndex < classMembersList.length) {
      // Start the sync task for student current location.
      const backgroundStudentLocationTask = this.syncService.syncStudentCurrentLocation(
        classMembersList[this.currentClassMembersIndex]
      );
      this.backgroundStudentLocationSubscription = this.workerService
        .startTask(backgroundStudentLocationTask)
        .subscribe((performanceTaskResult) => {
          const completedStudentLocationJob = performanceTaskResult.currentCompletedJob;
          if (completedStudentLocationJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
            const currentJob = backgroundStudentLocationTask.jobs.find(
              (job) => job.id === completedStudentLocationJob.id
            );
            currentJob.callback(completedStudentLocationJob.result);
          }
        });
      // Start the sync task for milestones list.
      const backgroundStudentMilestoneContent = this.syncService.syncMilestoneList(
        classMembersList[this.currentClassMembersIndex]
      );
      this.backgroundStudentMilestoneContent = this.workerService
        .startTask(backgroundStudentMilestoneContent)
        .subscribe((result) => {
          const completedJob = result.currentCompletedJob;
          if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
            const currentJob = backgroundStudentMilestoneContent.jobs.find((job) => job.id === completedJob.id);
            currentJob.callback(completedJob.result);
          } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
            // Start the sync task for milestone performance.
            const backgroundMilstonePerformance = this.syncService.syncMilestonePerformance(
              classMembersList[this.currentClassMembersIndex]
            );
            this.backgroundMilstonePerformance = this.workerService
              .startTask(backgroundMilstonePerformance)
              .subscribe((performanceTaskResult) => {
                const completedStudentSubjectJob = performanceTaskResult.currentCompletedJob;
                if (completedStudentSubjectJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
                  const currentJob = backgroundMilstonePerformance.jobs.find(
                    (job) => job.id === completedStudentSubjectJob.id
                  );
                  currentJob.callback(completedStudentSubjectJob.result);
                }
              });
            this.syncContents.push(classMembersList[this.currentClassMembersIndex].studentId);
            this.currentClassMembersIndex++;
            this.syncStudentMilestoneContent(classMembersList);
          }
        });
    }
  }
}
