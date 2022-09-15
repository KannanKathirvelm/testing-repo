import { Injectable } from '@angular/core';
import { OfflineActivityProvider } from '@providers/apis/offline-activity/offline-activity';
import { ProfileService } from '@providers/service/profile/profile.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineActivityService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private offlineActivityProvider: OfflineActivityProvider,
    private profileService: ProfileService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function readActivity
   * This method is used to read activity
   */
  public readActivity(activityId) {
    return this.offlineActivityProvider.readActivity(activityId);
  }

  /**
   * @function getGradingStudentList
   * This method is used to get grading student list
   */
  public getGradingStudentList(requestParams, hasMembers = false) {
    return this.offlineActivityProvider.getGradingStudentList(requestParams).then((studentsList) => {
      return hasMembers ? studentsList :  this.profileService.fetchUserProfile(studentsList);
    });
  }

  /**
   * @function fetchCaOaSubmissions
   * This method is used to fetch ca oa submissions
   */
  public fetchCaOaSubmissions(classId, dcaContentId, studentId, isDca = true, params?) {
    return this.offlineActivityProvider.fetchCaOaSubmissions(classId, dcaContentId, studentId, isDca, params);
  }

  /**
   * @function parseStudentTaskSubmission
   * This method is used to parse student task submission
   */
  public parseStudentTaskSubmission(tasksSubmission, tasks) {
    const activityTasks = [];
    tasks.map((task) => {
      const newTask = this.createNewObjectForTask(task);
      const studentTaskSubmissions = tasksSubmission.find((item) => item.taskId === task.id);
      if (studentTaskSubmissions) {
        const activityTaskSubmissions = studentTaskSubmissions.submissions;
        const taskSubmissionText = activityTaskSubmissions.find((item) => item.submissionType === 'free-form-text');
        Object.assign(newTask, {
          studentTaskSubmissions: activityTaskSubmissions,
          submissionText: taskSubmissionText ? taskSubmissionText.submissionInfo : null
        });
      };
      activityTasks.push(newTask);
    });
    return activityTasks;
  }

  /**
   * @function createNewObjectForTask
   * This method is used to create object for task
   */
  public createNewObjectForTask(task) {
    return {
      title: task.title,
      oaId: task.oaId,
      id: task.id,
      description: task.description,
      submissionCount: task.submissionCount,
      oaTaskSubmissions: task.oaTaskSubmissions.length > 0
        ? this.oaTaskSubmissionsContent(task)
        : []
    }
  }

  /**
   * @function oaTaskSubmissionsContent
   * This method is used to oa task submission content
   */
  private oaTaskSubmissionsContent(task) {
    return task.oaTaskSubmissions.map((item) => {
      return {
        id: item.id,
        taskSubmissionSubType: item.taskSubmissionSubType,
        taskSubmissionType: item.taskSubmissionType,
        oaTaskId: item.oaTaskId
      }
    });
  }
}
