import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkerService } from '@app/background-workers/services/worker.service';
import { TASK_RESULT_STATUS } from '@app/constants/download-constants';
import { OfflineClassSettingsModel } from '@app/models/offline/offline';
import { OfflineApiService } from '@app/providers/service/offline/offline-api.service';
import { SyncService } from '@app/providers/service/sync.service';
import { ClassesModel, ClassModel } from '@models/class/class';
import { ClassService } from '@providers/service/class/class.service';
import { AnonymousSubscription } from 'rxjs-compat/Subscription';
@Component({
  selector: 'app-offline-settings',
  templateUrl: './offline-settings.page.html',
  styleUrls: ['./offline-settings.page.scss'],
})
export class OfflineSettingsPage implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  public classList: Array<ClassModel>;
  public isLoading: boolean;
  public backgroundTaskSubscription: AnonymousSubscription;
  public competencyReportTaskSubscription: AnonymousSubscription;
  public taxonomyCategoriesSubscription: AnonymousSubscription;
  public studentSubjectSubscription: AnonymousSubscription;
  public backgroundCourseMapContentsSubscription: AnonymousSubscription;
  public backgroundMilestonesTaskSubscription: AnonymousSubscription;
  public backgroundMilestoneLessonsSubscription: AnonymousSubscription;
  public backgroundUnit0ListSubscription: AnonymousSubscription;
  public backgroundMilestonePerformanceSubscription: AnonymousSubscription;
  public backgroundUnitsPerformanceSubscription: AnonymousSubscription;
  public backgroundClassPerformanceSubscription: AnonymousSubscription;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private offlineApiService: OfflineApiService,
    private syncService: SyncService,
    private workerService: WorkerService
  ) {}

  // -------------------------------------------------------------------------
  // lifecycle methods

  public ngOnInit() {
    this.fetchClasses();
  }

  public ngOnDestroy() {
    if (this.backgroundTaskSubscription) {
      this.backgroundTaskSubscription.unsubscribe();
    }
    if (this.competencyReportTaskSubscription) {
      this.competencyReportTaskSubscription.unsubscribe();
    }
    if (this.taxonomyCategoriesSubscription) {
      this.taxonomyCategoriesSubscription.unsubscribe();
    }
    if (this.studentSubjectSubscription) {
      this.studentSubjectSubscription.unsubscribe();
    }
    if (this.backgroundCourseMapContentsSubscription) {
      this.backgroundCourseMapContentsSubscription.unsubscribe();
    }
    if (this.backgroundMilestonesTaskSubscription) {
      this.backgroundMilestonesTaskSubscription.unsubscribe();
    }
    if (this.backgroundMilestoneLessonsSubscription) {
      this.backgroundMilestoneLessonsSubscription.unsubscribe();
    }
    if (this.backgroundUnit0ListSubscription) {
      this.backgroundUnit0ListSubscription.unsubscribe();
    }
    if (this.backgroundMilestonePerformanceSubscription) {
      this.backgroundMilestonePerformanceSubscription.unsubscribe();
    }
    if (this.backgroundUnitsPerformanceSubscription) {
      this.backgroundUnitsPerformanceSubscription.unsubscribe();
    }
    if (this.backgroundClassPerformanceSubscription) {
      this.backgroundClassPerformanceSubscription.unsubscribe();
    }
  }

  /**
   * @function fetchClasses
   * This method is used to fetch the class list
   */
  private fetchClasses() {
    this.isLoading = true;
    Promise.all([this.classService.fetchActiveClasses(), this.offlineApiService.fetchOfflineClassesSettings()]).then(
      (result) => {
        const classList = result[0] as ClassesModel;
        const classesSettings = result[1] as Array<OfflineClassSettingsModel>;
        const activeClasses = classList?.activeClasses;
        this.classList = this.updateClassSettings(activeClasses, classesSettings);
        this.isLoading = false;
      }
    );
  }

  /**
   * @function toggleCheckBox
   * This method is used to toggle the checkbox and start the sync service
   */
  public toggleCheckBox(classDetails) {
    const isChecked = !classDetails.isOfflineAccessEnabled;
    classDetails.isOfflineAccessEnabled = isChecked;
    if (isChecked) {
      this.syncClassDetails(classDetails);
      this.syncCompetencyReportDetails(classDetails);
      this.syncTaxonomyCategoriesList(classDetails);
      this.syncCourseMapContents(classDetails);
      this.syncUnitsPerformance(classDetails);
      this.syncClassPerformance(classDetails);
      this.syncUnit0Lists(classDetails);
      if (classDetails.milestoneViewApplicable) {
        this.syncMilestoneContents(classDetails);
        this.syncMilestonePerformance(classDetails);
      }
    }
    this.offlineApiService.updateClassSettings({
      classId: classDetails.id,
      checked: isChecked,
    });
  }

  /**
   * @function syncClassDetails
   * This method is used to sync the class settings in the background task
   */
  private syncClassDetails(classDetails) {
    // Start the sync task for class data list.
    const backgroundClassTask = this.syncService.syncClassDataList(classDetails, true);
    this.backgroundTaskSubscription = this.workerService.startTask(backgroundClassTask).subscribe((result) => {
      classDetails.syncDetails = result;
      classDetails.syncDetails.isDownloadCompleted = classDetails.syncDetails.progress.progressPercent === 100;
      const completedJob = result.currentCompletedJob;
      if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
        const currentJob = backgroundClassTask.jobs.find((job) => job.id === completedJob.id);
        currentJob.callback(completedJob.result);
      } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
        // Start the sync task for CA performance.
        const backgroundCAPerformanceTask = this.syncService.syncClassActivitiesPerformance(
          classDetails.id,
          completedJob.result
        );
        this.workerService.startTask(backgroundCAPerformanceTask).subscribe((performanceTaskResult) => {
          const completedPerformanceJob = performanceTaskResult.currentCompletedJob;
          if (completedPerformanceJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
            const currentJob = backgroundCAPerformanceTask.jobs.find((job) => job.id === completedPerformanceJob.id);
            currentJob.callback(completedPerformanceJob.result);
          }
        });
      }
    });
  }

  /**
   * @function syncCompetencyReportDetails
   * This method is used to sync the competency report in the background task
   */
  private syncCompetencyReportDetails(classDetails) {
    // Start the sync task for competency report.
    const backgroundCompetencyTask = this.syncService.syncCompetencyReport(classDetails);
    this.competencyReportTaskSubscription = this.workerService
      .startTask(backgroundCompetencyTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundCompetencyTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncTaxonomyCategoriesList
   * This method is used to sync the taxonomy categories list in the background task
   */
  private syncTaxonomyCategoriesList(classDetails) {
    // Start the sync task for taxonomy  categories.
    const backgroundCategoriesListTask = this.syncService.syncTaxonomyCategories(classDetails);
    this.taxonomyCategoriesSubscription = this.workerService
      .startTask(backgroundCategoriesListTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundCategoriesListTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
          // Start the sync task for proficiency student subject.
          const backgroundStudentSubjectTask = this.syncService.syncProficiencyStudentSubjectJob(
            classDetails,
            completedJob.result.subject_classifications
          );
          this.studentSubjectSubscription = this.workerService
            .startTask(backgroundStudentSubjectTask)
            .subscribe((performanceTaskResult) => {
              const completedStudentSubjectJob = performanceTaskResult.currentCompletedJob;
              if (completedStudentSubjectJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
                const currentJob = backgroundStudentSubjectTask.jobs.find(
                  (job) => job.id === completedStudentSubjectJob.id
                );
                currentJob.callback(completedStudentSubjectJob.result);
              }
            });
        }
      });
  }

  /**
   * @function updateClassSettings
   * This method is used to update the class settings
   */
  private updateClassSettings(activeClasses, classesSettings) {
    return activeClasses.map((activeClass) => {
      const classId = activeClass.id;
      const classSetting = classesSettings.find((classSettings) => {
        return classSettings.classId === classId;
      });
      activeClass.isOfflineAccessEnabled = classSetting ? classSetting.settings.isOfflineAccessEnabled : false;
      return activeClass;
    });
  }

  /**
   * @function syncCourseMapContents
   * This method is used to sync the course map contents in the background task
   */
  private syncCourseMapContents(classDetails) {
    // Start the sync task for course map content.
    const backgroundCourseMapContentsTask = this.syncService.syncCourseMapContentData(classDetails);
    this.backgroundCourseMapContentsSubscription = this.workerService
      .startTask(backgroundCourseMapContentsTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundCourseMapContentsTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncUnitsPerformance
   * This method is used to sync the units performance in the background task
   */
  private syncUnitsPerformance(classDetails) {
    // Start the sync task for units performance.
    const backgroundUnitsPerformanceTask = this.syncService.syncUnitsPerformance(classDetails);
    this.backgroundUnitsPerformanceSubscription = this.workerService
      .startTask(backgroundUnitsPerformanceTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundUnitsPerformanceTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncMilestoneContents
   * This method is used to sync the milestone contents in the background task
   */
  private syncMilestoneContents(classDetails) {
    const backgroundMilestonesTask = this.syncService.syncMilestoneList(classDetails);
    this.backgroundMilestonesTaskSubscription = this.workerService
      .startTask(backgroundMilestonesTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundMilestonesTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
          const milestones = completedJob.result ? completedJob.result.milestones : [];
          const currentMilestone = milestones.length
            ? milestones.find((item) => item.grade_id === classDetails.gradeCurrent)
            : null;
          let currentMilestoneId = currentMilestone && currentMilestone.milestone_id;
          if (!currentMilestone && milestones && milestones.length) {
            currentMilestoneId = milestones[0].milestone_id;
          }
          if (!currentMilestoneId) {
            return;
          }
          // Start the sync task for milestone lessons.
          const backgroundMilestoneLessonsTask = this.syncService.syncMilestoneLessons(
            classDetails,
            currentMilestoneId
          );
          this.backgroundMilestoneLessonsSubscription = this.workerService
            .startTask(backgroundMilestoneLessonsTask)
            .subscribe((performanceTaskResult) => {
              const completedStudentSubjectJob = performanceTaskResult.currentCompletedJob;
              if (completedStudentSubjectJob && performanceTaskResult.taskStatus === TASK_RESULT_STATUS.RUNNING) {
                const currentJob = backgroundMilestoneLessonsTask.jobs.find(
                  (job) => job.id === completedStudentSubjectJob.id
                );
                currentJob.callback(completedStudentSubjectJob.result);
              }
            });
        }
      });
  }

  /**
   * @function syncMilestonePerformance
   * This method is used to sync the milestone performace in the background task
   */
  private syncMilestonePerformance(classDetails) {
    // Start the sync task for milestone performance.
    const backgroundMilestonePerformanceTask = this.syncService.syncMilestonePerformance(classDetails);
    this.backgroundMilestonePerformanceSubscription = this.workerService
      .startTask(backgroundMilestonePerformanceTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundMilestonePerformanceTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncUnit0Lists
   * This method is used to sync the unit0 list in the background task
   */
  private syncUnit0Lists(classDetails) {
    // Start the sync task for unit 0 list.
    const backgroundUnit0ListTask = this.syncService.syncUnit0List(classDetails);
    this.backgroundUnit0ListSubscription = this.workerService.startTask(backgroundUnit0ListTask).subscribe((result) => {
      const completedJob = result.currentCompletedJob;
      if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
        const currentJob = backgroundUnit0ListTask.jobs.find((job) => job.id === completedJob.id);
        currentJob.callback(completedJob.result);
      }
    });
  }

  /**
   * @function syncClassPerformance
   * This method is used to sync the class performance background task
   */
  private syncClassPerformance(classDetails) {
    // Start the sync task for class performance.
    const backgrounClassPerformanceTask = this.syncService.syncClassPerformance(classDetails);
    this.backgroundClassPerformanceSubscription = this.workerService
      .startTask(backgrounClassPerformanceTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgrounClassPerformanceTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        }
      });
  }
}
