import { Component, Input, OnInit } from '@angular/core';
import { ATTEMPTED_STATUS, PLAYER_EVENT_SOURCE } from '@app/constants/helper-constants';
import { OaGradeItemModel, SubmissionsModel } from '@app/models/offline-activity/offline-activity';
import { PortfolioActivityAttempt } from '@app/models/portfolio/portfolio';
import { RubricModel } from '@app/models/rubric/rubric';
import { OfflineActivityProvider } from '@app/providers/apis/offline-activity/offline-activity';
import { PortfolioProvider } from '@app/providers/apis/portfolio/portfolio';
import { ModalController } from '@ionic/angular';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'student-offline-activity-report',
  templateUrl: './student-offline-activity-report.component.html',
  styleUrls: ['./student-offline-activity-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})
export class StudentOfflineActivityReportComponent implements OnInit {
  @Input() public context: { activityId: string, contentId: string, classId: string, isPreview: boolean, studentId: string };
  public offlineActivity: OaGradeItemModel;
  public oaSubmissions: SubmissionsModel;
  public isTeacherGraded = false;
  public contentType: string;
  public performance: { taskCount: number, timespent: number, completedTask: number, score: number };
  public attemptList: Array<PortfolioActivityAttempt>;
  public hideAttemptList: boolean;
  public currentAttemptDate: string;

  constructor(
    private modalCtrl: ModalController,
    private offlineActivityProvider: OfflineActivityProvider,
    private portfolioProvider: PortfolioProvider
  ) {
    this.hideAttemptList = true;
  }

  public ngOnInit() {
    this.offlineActivityProvider.readActivity(this.context.activityId).then((offlineActivityResponse) => {
      this.offlineActivity = offlineActivityResponse;
      this.portfolioProvider.fetchAllAttemptsByItem(this.context.activityId, this.context.studentId).then((attemptResponse) => {
        const attemptedList = attemptResponse.usageData.filter((attemptItem) => attemptItem.status === ATTEMPTED_STATUS.COMPLETE);
        this.attemptList = attemptedList;
        const attempt = this.attemptList.length ? this.attemptList[0] : null;
        if (attempt) {
          this.fetchOaPerformance(attempt);
        }
      });
    });
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function fetchOaPerformance
   * This method is used to get performance of offline activity
   */
  public fetchOaPerformance(attempt) {
    this.currentAttemptDate = attempt.createdDate;
    let dataParam = null;
    if (attempt.contentSource === PLAYER_EVENT_SOURCE.COURSE_MAP) {
      dataParam = {
        courseId: attempt.courseId,
        lessonId: attempt.lessonId,
        unitId: attempt.unitId
      };
    }
    const contentId = attempt.dcaContentId || attempt.id;
    const studentRubric: RubricModel = this.offlineActivity.studentRubric;
    const teacherRubric: RubricModel = this.offlineActivity.teacherRubric;
    this.offlineActivityProvider.fetchOaSubmissions(attempt.classId, contentId, this.context.studentId, dataParam).then((oaSubmissionsResponse) => {
      this.oaSubmissions = oaSubmissionsResponse;
      if (this.oaSubmissions && this.oaSubmissions.tasks.length) {
        this.oaSubmissions.tasks.map((taskSubmission) => {
          const task = this.offlineActivity.tasks.find(taskItem => taskItem.id === taskSubmission.taskId);
          task.submissions = taskSubmission.submissions;
        });
      }
      const studentRubricGrades = this.oaSubmissions.oaRubrics ? this.oaSubmissions.oaRubrics.studentGrades : null;
      const teacherRubricGrades = this.oaSubmissions.oaRubrics ? this.oaSubmissions.oaRubrics.teacherGrades : null;
      this.isTeacherGraded = this.oaSubmissions.oaRubrics ? !!this.oaSubmissions.oaRubrics.teacherGrades : false;
      if (studentRubricGrades && studentRubric) {
        studentRubric.studentScore = studentRubricGrades.scoreInPercentage;
      }
      if (teacherRubricGrades && teacherRubric) {
        teacherRubric.studentScore = teacherRubricGrades.scoreInPercentage;
      }
      const completedTask = this.offlineActivity.tasks.filter((task) => task.submissions ? true : false);

      this.performance = {
        taskCount: this.offlineActivity.tasks.length,
        completedTask: completedTask.length ? completedTask.length : 0,
        score: attempt.score,
        timespent: studentRubricGrades.timeSpent
      };
    });
  }

  /**
   * @function toggleAttemptList
   * This method is used to display or hide attempt list based on click
   */
  public toggleAttemptList() {
    if (this.attemptList.length > 1) {
      this.hideAttemptList = !this.hideAttemptList;
    }
  }

  /**
   * @function toggleAttemptList
   * This method is used to render report based on attempt
   */
  public reportRenderBasedOnDate(attempt) {
    this.hideAttemptList = true;
    this.fetchOaPerformance(attempt);
  }
}
