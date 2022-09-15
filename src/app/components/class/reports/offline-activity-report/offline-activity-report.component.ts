import { Component, Input, OnInit } from '@angular/core';
import { CONTENT_TYPES, ROLES } from '@constants/helper-constants';
import { ModalController } from '@ionic/angular';
import { CAStudentList } from '@models/class-activity/class-activity';
import { OaGradeItemModel, OAStudentModelForReport, OAStudentPerformanceForReport, TaskModel } from '@models/offline-activity/offline-activity';
import { OaStudentRubricModel } from '@models/rubric/rubric';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { OfflineActivityService } from '@providers/service/offline-activity/offline-activity.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { RubricService } from '@providers/service/rubric/rubric.service';
import { collapseAnimation } from 'angular-animations';
import axios from 'axios';

@Component({
  selector: 'app-offline-activity-report',
  templateUrl: './offline-activity-report.component.html',
  styleUrls: ['./offline-activity-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})
export class OfflineActivityReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public context: { activityId: string, contentId: string, classId: string, isPreview: boolean, isStudent: boolean };
  public studentList: Array<OAStudentModelForReport>;
  public activeStudent: OAStudentModelForReport;
  public hideStudentList: boolean;
  public isThumbnailError: boolean;
  public offlineActivity: OaGradeItemModel;
  public activityTasks: Array<TaskModel>;
  public teacherRubric: OaStudentRubricModel;
  public studentRubric: OaStudentRubricModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalCtrl: ModalController,
    private offlineActivityService: OfflineActivityService,
    private classActivityService: ClassActivityService,
    public performanceService: PerformanceService,
    private rubricService: RubricService
  ) {
    this.studentList = [];
    this.hideStudentList = true;
  }

  // -------------------------------------------------------------------------
  // Life cylce methods

  public ngOnInit() {
    return axios.all<{}>([
      this.context.isPreview ? null : this.classActivityService.fetchClassActivityUserList(this.context.classId, this.context.contentId),
      this.offlineActivityService.readActivity(this.context.activityId)
    ]).then(axios.spread((studentList: Array<CAStudentList>, offlineActivityResponse: any) => {
      this.offlineActivity = offlineActivityResponse;
      if (!this.context.isPreview) {
        const oaPerformanceContext = {
          collectionType: CONTENT_TYPES.OFFLINE_ACTIVITY,
          dcaContentIds: [this.context.contentId]
        };
        this.performanceService.fetchCaPerformanceByContentType(this.context.classId, oaPerformanceContext).then((performanceResponse: any) => {
          studentList.map((student) => {
            const newStudent = this.parseStudent(student);
            const studentPerformance = performanceResponse.find((performance) => performance.userId === newStudent.id);
            if (studentPerformance) {
              newStudent.performance.score = studentPerformance.collectionPerformanceSummary.score;
              newStudent.performance.timespent = studentPerformance.collectionPerformanceSummary.timeSpent;
            }
            this.studentList.push(newStudent);
          });
          this.activeStudent = this.studentList[0];
          this.fetchOaPerformance();
        });
      } else {
        this.activityTasks = offlineActivityResponse.tasks;
        const studentRubric = this.offlineActivity.studentRubric;
        const teacherRubric = this.offlineActivity.teacherRubric;
        this.teacherRubric = this.rubricService.parseRubric(ROLES.TEACHER, teacherRubric, null);
        this.studentRubric = this.rubricService.parseRubric(ROLES.STUDENT, studentRubric, null);
      }
    }));
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function parseStudent
   * This method is used to parse student
   */
  public parseStudent(student) {
    const newStudent = new OAStudentModelForReport();
    newStudent.email = student.email;
    newStudent.firstName = student.firstName;
    newStudent.id = student.id;
    newStudent.isActive = student.isActive;
    newStudent.lastName = student.lastName;
    newStudent.username = student.username;
    newStudent.thumbnail = newStudent.thumbnail;
    newStudent.performance = new OAStudentPerformanceForReport();
    return newStudent;
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
  public fetchOaPerformance() {
    const classId = this.context.classId;
    const contentId = this.context.contentId;
    const studentRubric = this.offlineActivity.studentRubric;
    const teacherRubric = this.offlineActivity.teacherRubric;
    this.offlineActivityService.fetchCaOaSubmissions(classId, contentId, this.activeStudent.id).then((submission) => {
      const oaTask = this.offlineActivity.tasks
      const taskSubmissions = submission.tasks;
      const oaRubrics = submission.oaRubrics;
      const studentGrades = oaRubrics ? oaRubrics.studentGrades : null;
      const teacherGrades = oaRubrics ? oaRubrics.teacherGrades : null;
      this.activityTasks = this.offlineActivityService.parseStudentTaskSubmission(taskSubmissions, oaTask);
      this.teacherRubric = this.rubricService.parseRubric(ROLES.TEACHER, teacherRubric, teacherGrades);
      this.studentRubric = this.rubricService.parseRubric(ROLES.STUDENT, studentRubric, studentGrades);
      taskSubmissions.map((taskSubmission) => {
        const task = this.offlineActivity.tasks.find(taskItem => taskItem.id === taskSubmission.taskId);
        task.submissions = taskSubmission.submissions;
      });
      const completedTask = this.offlineActivity.tasks.filter((task) => task.submissions ? true : false);
      const activeStudentPerformance = this.activeStudent.performance;
      activeStudentPerformance.taskCount = this.offlineActivity.tasks.length;
      activeStudentPerformance.completedTask = completedTask.length ? completedTask.length : 0;
    });
  }

  /**
   * @function toggleAttemptList
   * This method is used to display or hide attempt list based on click
   */
  public toggleStudentList() {
    if (this.studentList.length > 1) {
      this.hideStudentList = !this.hideStudentList;
    }
  }

  /**
   * @function renderNextStudentPerformance
   * This method is used to render next student performance
   */
  public renderStudentPerformance(studentIndex) {
    this.hideStudentList = true;
    this.activeStudent = this.studentList[studentIndex];
    this.fetchOaPerformance();
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
