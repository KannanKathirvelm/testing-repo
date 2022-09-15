import { Injectable } from '@angular/core';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ClassActivityProvider } from '@providers/apis/class-activity/class-activity';
import { OfflineActivityProvider } from '@providers/apis/offline-activity/offline-activity';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { nullIfEmpty, toTimestamp } from '@utils/global';

@Injectable({
  providedIn: 'root'
})
export class ClassActivityService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classActivityProvider: ClassActivityProvider,
    private performanceService: PerformanceService,
    private offlineActivityProvider: OfflineActivityProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchScheduledActivity
   * Method to fetch scheduled class activity
   */
  public fetchScheduledActivityByContentType(context) {
    return new Promise((resolve, reject) => {
      this.classActivityProvider.fetchScheduledActivitiesByContentType(context).then((classActivities: Array<ClassContentModel>) => {
        const uniqueClassIds = classActivities.map((item) => item.classId).filter((item, index, array) => index === array.indexOf(item));
        uniqueClassIds.forEach((classId) => {
          if (classId) {
            const activitiesByClass = classActivities.filter((classActivity) => classActivity.classId === classId);
            this.performanceService.fetchClassActivitiesPerformanceSummary(classId, activitiesByClass, context.startDate, context.endDate);
          }
        });
        resolve(classActivities);
      }, reject);
    });
  }

  /**
   * @function getStudentsForQuestion
   * Method to get students for question
   */
  public getStudentsForQuestion(questionId, classId, collectionId, courseId) {
    return this.classActivityProvider.getStudentsForQuestion(questionId, classId, collectionId, courseId);
  }

  /**
   * @function readQuestion
   * Method to read question
   */
  public readQuestion(questionId) {
    return this.classActivityProvider.readQuestion(questionId);
  }

  /**
   * @function getMonthlyActivitiesCount
   * Method to get activites count
   */
  public getMonthlyActivitiesCount(classId, month, year) {
    return this.classActivityProvider.getMonthlyActivitiesCount(classId, month, year);
  }

  /**
   * @function getAnswerToGrade
   * Method to get answer to grade
   */
  public getAnswerToGrade(studentId, classId, courseId, collectionId, questionId, unitId, lessonId) {
    return this.classActivityProvider.getAnswerToGrade(studentId, classId, courseId, collectionId, questionId, unitId, lessonId);
  }

  /**
   * @function fetchUnScheduledActivityByContentType
   * Method to fetch unscheduled class activity
   */
  public fetchUnScheduledActivityByContentType(context) {
    return this.classActivityProvider.fetchUnScheduledActivitiesByContentType(context);
  }

  /**
   * @function fetchCAPerformance
   * Method to fetch class performance for CA
   */
  public fetchCAPerformance(classId) {
    return this.classActivityProvider.fetchCAPerformance(classId);
  }

  /**
   * Retrieve the student class activity list for a month
   * @param {string}classId
   * @param {string}startDate
   * @param {string}endDate
   * @return {ClassActivity[]}
   */
  public fetchMonthActivityList(classId, startDate, endDate?) {
    return this.classActivityProvider.fetchClassActivityList(classId, startDate, endDate);
  }

  /**
   * @function classActivityEnable
   * Method to class activity enable
   */
  public enableClassActivity(classId, contentId, activationDate) {
    return this.classActivityProvider.classActivityEnable(classId, contentId, activationDate);
  }

  /**
   * @function deleteClassActivity
   * Method to delete class activity
   */
  public deleteClassActivity(classId, contentId) {
    return this.classActivityProvider.deleteClassActivity(classId, contentId);
  }

  /**
   * @function fetchClassActivityUserList
   * Method to fetch class activity user list
   */
  public fetchClassActivityUserList(classId, contentId, storeOffline = false) {
    return this.classActivityProvider.fetchClassActivityUserList(classId, contentId, storeOffline);
  }

  /**
   * @function updateClassActivityUsers
   * Method to update class activity user list
   */
  public updateClassActivityUsers(classId, contentId, studentIds) {
    return this.classActivityProvider.updateClassActivityUsers(classId, contentId, studentIds);
  }

  /**
   * @function rescheduleActivity
   * Method to reschedule class activity
   */
  public rescheduleClassActivity(scheduleParams) {
    return this.classActivityProvider.rescheduleClassActivity(scheduleParams);
  }

  /**
   * @function updateClassActivityStatus
   * Method to change status to close class activity
   */
  public updateClassActivityStatus(classId, contentId) {
    return this.classActivityProvider.updateClassActivityStatus(classId, contentId);
  }

  /**
   * @function fetchOaSubmissions
   * This method is used to fetch fetch oa submissions
   */
  public fetchCaOaSubmissions(classId, dcaContentId, studentId, tasks, isDca, params?) {
    return this.offlineActivityProvider.fetchCaOaSubmissions(classId, dcaContentId, studentId, isDca, params).then(oaSubmitedData => {
      return this.normalizeTasks(oaSubmitedData, tasks);
    });
  }

  /**
   * @function normalizeTasks
   * This method is used to normalize the tasks
   */
  private normalizeTasks(content, tasks) {
    if (content && content.tasks.length) {
      tasks.map((task) => {
        const submittedTask = content.tasks.find((submission) => {
          return submission.taskId === task.id;
        });
        return task.oaTaskSubmissions = submittedTask;
      });
    }
    return content;
  }

  public setStudentRubricGrades(rubricGrade) {
    this.classActivityProvider.setStudentRubricGrades(rubricGrade);
  }

  public setStudentRubricGradesForDCA(model) {
    const contextModel = this.serializeStudentRubricGrades(model);
    Object.assign(contextModel, {
      activity_date: model.activityDate,
      additional_context: null,
      collection_type: model.collectionType,
      content_source: model.contentSource
    });
    this.setStudentRubricGrades(contextModel);
  }

  public serializeStudentRubricGrades(model) {
    const modelData = {
      event_name: model.eventName,
      rubric_id: model.id,
      title: nullIfEmpty(model.title),
      description: nullIfEmpty(model.description),
      student_id: nullIfEmpty(model.studentId),
      class_id: nullIfEmpty(model.classId),
      course_id: nullIfEmpty(model.courseId),
      unit_id: nullIfEmpty(model.unitId),
      lesson_id: nullIfEmpty(model.lessonId),
      collection_id: nullIfEmpty(model.collectionId),
      session_id: nullIfEmpty(model.sessionId),
      resource_id: nullIfEmpty(model.resourceId),
      student_score: model.studentScore ? model.studentScore : model.currentScore,
      max_score: model.maxScore ? model.maxScore : model.totalPoints,
      overall_comment: model.comment,
      created_at: toTimestamp(model.createdDate),
      updated_at: toTimestamp(model.updatedDate),
      category_score: model.categoriesScore.length ? model.categoriesScore.map((category) => this.serializedStudentGradeCategoryScore(category)) : null,
      taxonomy: this.serializeTaxonomy(model.standards),
      metadata: model.hasAudience ? { audience: model.audience } : null,
      tenant_root: model.tenantRoot,
      tenant: model.tenant,
      gut_codes: model.gutCodes,
      url: model.url,
      creator_id: model.creatorId,
      modifier_id: model.modifierId,
      original_creator_id: model.originalCreatorId,
      original_rubric_id: model.originalRubricId,
      parent_rubric_id: model.parentRubricId,
      publish_date: model.publishDate,
      rubric_created_at: model.rubricCreatedDate,
      rubric_updated_at: model.rubricUpdatedDate
    };
    if (model.baseResourceId) {
      Object.assign(modelData, {
        base_resource_id: model.baseResourceId
      });
    }
    return modelData;
  }


  /**
   * Serializes a student grade category score
   * @param {GradeCategoryScore} model
   * @returns {*} serialized category score
   */
  public serializedStudentGradeCategoryScore(model) {
    return {
      category_title: nullIfEmpty(model.title),
      level_obtained: nullIfEmpty(model.levelObtained),
      level_score: model.score ? Number(model.score) : 0,
      level_max_score: model.totalPoints ? Number(model.totalPoints) : 0,
      level_comment: nullIfEmpty(model.levelComment)
    };
  }

  public serializeTaxonomy(taxonomyData) {
    let taxonomyResult = null;
    if (taxonomyData && Array.isArray(taxonomyData) && taxonomyData.length > 0) {
      taxonomyResult = {};
      taxonomyData.forEach((taxonomy) => {
        const taxonomyKey = taxonomy.id;
        taxonomyResult[taxonomyKey] = {
          code: taxonomy.code,
          title: taxonomy.title,
          parent_title: taxonomy.hasOwnProperty('parentTitle') ? taxonomy.parentTitle : '',
          description: taxonomy.description,
          framework_code: taxonomy.frameworkCode
        }
      });
    }
    return taxonomyResult;
  }

  /**
   * @function updateMasteryAccural
   * This method is used to update mastery accural
   */
  public updateMasteryAccural(classId, contentId, params) {
    return this.classActivityProvider.updateMasteryAccural(classId, contentId, params);
  }

  /**
   * @function structureForMultiClassActivity
   * This method is used to get structure for multi class activity
   */
  public structureForMultiClassActivity(classActivities, secondaryClasses, classDetail) {
    const normalizeClassActivity = [];
    classActivities.forEach((classActivity) => {
      const activityClassData = secondaryClasses.find((item) => item.id === classActivity.classId) || classDetail;
      normalizeClassActivity.push({
        activationDate: classActivity.activationDate,
        classId: activityClassData.id,
        code: activityClassData.code,
        contentId: classActivity.contentId,
        contentType: classActivity.contentType,
        id: classActivity.id,
        isActive: classActivity.isActive,
        isDiagnostic: classActivity.isDiagnostic,
        taxonomy: classActivity.taxonomy,
        thumbnail: classActivity.thumbnail,
        thumbnailXS: classActivity.thumbnailXS,
        title: activityClassData.title,
        usersCount: classActivity.usersCount,
        isAssessment: classActivity.isAssessment,
        isCollection: classActivity.isCollection,
        isCompleted: classActivity.isCompleted,
        isExternalAssessment: classActivity.isExternalAssessment,
        isExternalCollection: classActivity.isExternalCollection,
        isMeeting: classActivity.isMeeting,
        isOfflineActivity: classActivity.isOfflineActivity,
        content: classActivity.collection
      });
    });
    return normalizeClassActivity;
  }

  /**
   * @function createMeetingActivity
   * This method is used to create meeting activity
   */
  public createMeetingActivity(params) {
    return this.classActivityProvider.createMeetingActivity(params);
  }
}
