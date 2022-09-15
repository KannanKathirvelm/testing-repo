import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import {
  CONTENT_TYPES,
  DEFAULT_IMAGES,
  SETTINGS
} from '@constants/helper-constants';
import {
  CAPerformanceModel,
  CAStudentList,
  ClassActivity,
  ClassContentModel,
  Collection
} from '@models/class-activity/class-activity';
import { HttpService } from '@providers/apis/http';
import { TaxonomyProvider } from '@providers/apis/taxonomy/taxonomy';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import { getDefaultImage, getDefaultImageXS, sortBy } from '@utils/global';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ClassActivityProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v2';
  private namespaceV2 = 'api/nucleus-insights/v2';
  private reportsNamespace = 'api/reports/v1/ca/classes';

  // -------------------------------------------------------------------------
  // API Path

  public getScheduledActivitiesAPIPath(classId) {
    return `${this.namespace}/classes/${classId}/contents/scheduled`
  }

  public getCAPerformanceAPIPath(classId) {
    return `${this.namespaceV2}/dca/class/${classId}/performance`;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private taxonomyProvider: TaxonomyProvider,
    private databaseService: DatabaseService,
    private utilsService: UtilsService,
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public fetchRubricQuestionsItems(params) {
    const endpoint = `${this.namespaceV2}/dca/rubrics/questions`;
    return this.httpService.get(endpoint, params).then((result) => {
      return this.normalizeRubricQuestionItems(result.data.gradeItems);
    });
  }

  public normalizeRubricQuestionItems(payload) {
    return payload.map((item) => {
      const questionItem = {
        activityDate: item.activityDate,
        baseResourceId: item.baseResourceId,
        collectionId: item.collectionId,
        collectionTitle: item.collectionTitle,
        collectionType: item.collectionType,
        dcaContentId: item.dca_content_id,
        resourceId: item.resourceId,
        studentCount: item.studentCount,
        title: item.title,
        subQuestionId: item.baseResourceId ? item.resourceId : null
      }
      return questionItem;
    });
  }

  /**
   * @function getMonthlyActivitiesCount
   * This method is used to fetch CA activity count
   */
  public getMonthlyActivitiesCount(classId, month, year) {
    const endpoint = `${this.reportsNamespace}/${classId}/activities`;
    const params = {
      month,
      year
    };
    return this.httpService.get<{ scheduled: number, unscheduled: number }>(endpoint, params).then((result) => {
      return result.data;
    });
  }

  /**
   * @function getStudentsForQuestion
   * This method is used to fetch Rubric items
   */
  public getStudentsForQuestion(
    questionId,
    classId,
    collectionId,
    courseId
  ) {
    const endpoint = `api/nucleus-insights/v2/rubrics/questions/${questionId}/students`;
    const params = {
      collectionId,
      classId,
      courseId
    };
    return this.httpService.get<Array<string>>(endpoint, params).then((result) => {
      return result.data;
    });
  }

  /**
   * @function getAnswerToGrade
   * This method is used to fetch Rubric items
   */
  public getAnswerToGrade(studentId, classId, courseId, collectionId, questionId, unitId, lessonId) {
    const endpoint = `api/nucleus-insights/v2/rubrics/questions/${questionId}/students/${studentId}/answers`;
    const params = {
      classId,
      courseId,
      collectionId,
      unitId,
      lessonId
    };
    return this.httpService.get<Array<string>>(endpoint, params).then((result) => {
      return result.data;
    });
  }

  public getAnswerByQuestionId(questionId, userId) {
    const endpoint = `${this.namespace}/questions/${questionId}`;
    return this.httpService.get<Array<any>>(endpoint, {}).then((result) => {
      return result.data;
    });
  }

  /**
   * @function readQuestion
   * This method is used to fetch Rubric items
   */
  public readQuestion(questionId) {
    const endpoint = `${this.namespace}/questions/${questionId}`;
    return this.httpService.get<Array<string>>(endpoint, {}).then((result) => {
      return this.normalizeRubricQuestion(result.data);
    });
  }

  public normalizeRubricQuestion(payload) {
    const question = {
      answer: payload.answer,
      collectionId: payload.collection_id,
      contentSubFormat: payload.content_subformat,
      description: payload.description,
      id: payload.id,
      lessonId: payload.lesson_id,
      maxScore: payload.max_score,
      rubric: payload.rubric ? this.normalizeQuestionRubric(payload.rubric) : null,
      title: payload.title,
      thumbnail: payload.thumbnail
    }
    return question;
  }

  public normalizeQuestionRubric(payload) {
    const rubric = {
      categories: payload.categories && payload.categories.length ?
        this.normalizeQRubricCategory(payload.categories) : [],
      collectionId: payload.collection_id,
      contentId: payload.content_id,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      description: payload.description,
      grader: payload.grader,
      id: payload.id,
      increment: payload.increment,
      isRemote: payload.is_remote,
      isRubric: payload.is_rubric,
      maxScore: payload.max_score ? payload.max_score : this.getMaxScore(payload.categories),
      scoring: payload.scoring,
      tenant: payload.tenant,
      thumbnail: payload.thumbnail,
      taxonomy: payload.taxonomy,
      title: payload.title,
      url: payload.url,
      parentRubricId: payload.parent_rubric_id,
      originalRubricId: payload.original_rubric_id,
      originalCreatorId: payload.original_creator_id,
      modifierId: payload.modifier_id
    };
    return rubric;
  }

  public getMaxScore(categories) {
    let maxScore = 0;
    categories.map((category) => {
      const levelScore = category.levels.map((level) => level.level_score);
      if (levelScore.length) {
        maxScore = maxScore + Math.max(0, ...levelScore);
      }
    });
    return maxScore;
  }

  public normalizeQRubricCategory(payload) {
    return payload.map((item) => {
      const category = {
        title: item.category_title,
        feedbackGuidance: item.feedback_guidance,
        levels: this.normalizeQRubricLevels(item.levels),
        level: item.level,
        requiredFeedback: item.required_feedback,
        scoring: item.scoring,
        allowsLevels: item.level,
        allowsScoring: item.scoring
      };
      return category;
    });
  }

  public normalizeQRubricLevels(payload) {
    payload = payload.sort((a, b) => a.level_score - b.level_score);
    return payload.map((item) => {
      const level = {
        name: item.level_name,
        score: item.level_score
      };
      return level;
    });
  }

  /**
   * @function fetchScheduledActivityByContentType
   * This method is used to fetch the scheduled activites by content type
   */
  public fetchScheduledActivitiesByContentType(context) {
    const isOnline = this.utilsService.isNetworkOnline();
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getScheduledActivitiesAPIPath(context.classId);
        const params = {
          content_type: context.contentType,
          secondaryclasses: context.secondaryClasses || null,
          start_date: context.startDate,
          end_date: context.endDate
        };
        return this.httpService.get<ClassContentModel>(endpoint, params).then((result) => {
          const normalizeClassContents = this.normalizeClassAllContents(result.data.class_contents);
          resolve(normalizeClassContents);
        }, reject);
      } else {
        const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENTS, {
          classId: context.classId
        });
        this.databaseService.getDocument(databaseKey).then((result) => {
          const classActivities = this.filterDataBasedOnDates(result.value, context);
          resolve(classActivities);
        }, reject);
      }
    });
  }

  /**
   * @function filterDataBasedOnDates
   * This method is used to filter based on activity dates
   */
  public filterDataBasedOnDates(activities, context) {
    return activities.filter((activity) => {
      const startDate = moment(context.startDate, 'YYYY-MM-DD');
      const activityEnd = moment(activity.endDate, 'YYYY-MM-DD');
      return startDate.isBetween(startDate, activityEnd, undefined, '[]') && (activity.addedDate || activity.dcaAddedDate) <= context.endDate;
    })
  }

  /**
   * @function fetchUnScheduledActivitiesByContentType
   * This method is used to fetch the unscheduled activites by content type
   */
  public fetchUnScheduledActivitiesByContentType(context) {
    const endpoint = `${this.namespace}/classes/${context.classId}/contents/all/unscheduled`;
    const params = {
      content_type: context.contentType,
      secondaryclasses: context.secondaryClasses,
      for_month: context.month,
      for_year: context.year
    };
    return this.httpService.get<ClassContentModel>(endpoint, params).then((result) => {
      return this.normalizeClassAllContents(result.data.class_contents);
    });
  }

  /**
   * @function fetchCAPerformance
   * Fetch Performance of Class Activities
   */
  public fetchCAPerformance(classId) {
    const isOnline = this.utilsService.isNetworkOnline();
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_PERFORMANCE, {
      classId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getCAPerformanceAPIPath(classId);
        this.httpService.get<Array<CAPerformanceModel>>(endpoint).then((res) => {
          const normalizeCaPerformanceData = this.normalizeCAPerformance(res.data);
          resolve(normalizeCaPerformanceData);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function storeCAPerformance
   * This method is used to store the CA performance
   */
  public storeCAPerformance(classId, payload) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_PERFORMANCE, {
      classId
    });
    const normalizeCaPerformanceData = this.normalizeCAPerformance(payload);
    this.databaseService.upsertDocument(databaseKey, normalizeCaPerformanceData);
  }

  /**
   * @function fetchClassActivityList
   * This method is used to fetch the class activity list
   */
  public fetchClassActivityList(classId, startDate, endDate) {
    const isOnline = this.utilsService.isNetworkOnline();
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getScheduledActivitiesAPIPath(classId);
        const param = {
          content_type: 'collection,assessment,offline-activity',
          start_date: startDate,
          end_date: endDate
        };
        this.httpService.get(endpoint, param).then((res) => {
          const normalizeClassContents = this.normalizeClassActivityContents(res.data.class_contents, classId);
          resolve(normalizeClassContents);
        }, reject);
      } else {
        const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENTS, {
          classId
        });
        this.databaseService.getDocument(databaseKey).then((result) => {
          const classContentByCalenderType = this.filterDataBasedOnDates(result.value, { startDate, endDate });
          resolve(classContentByCalenderType);
        }, reject);
      }
    });
  }

  /**
   * @function storeClassActivties
   * This method is used to store class activities
   */
  public storeClassActivties(classId, payload) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENTS, {
      classId
    });
    const normalizeClassContents = this.normalizeClassAllContents(payload.class_contents);
    this.databaseService.upsertDocument(databaseKey, normalizeClassContents);
  }

  /**
   * @function normalizeClassActivityContents
   * This method is used to normalize the class activity contents
   */
  public normalizeClassActivityContents(payload, classId) {
    return payload.map((item) => {
      return this.normalizeClassActivity(item, classId);
    });
  }

  /**
   * @function classActivityEnable
   * This method is used to class activity enable
   */
  public classActivityEnable(classId, contentId, activationDate) {
    const endpoint = `${this.namespace}/classes/${classId}/contents/${contentId}/enable`;
    const param = {
      activation_date: activationDate
    };
    return this.httpService.put(endpoint, param);
  }

  /**
   * @function deleteClassActivity
   * This method is used to delete class activity
   */
  public deleteClassActivity(classId, contentId) {
    const endpoint = `${this.namespace}/classes/${classId}/contents/${contentId}`;
    return this.httpService.delete(endpoint);
  }

  /**
   * @function fetchClassActivityUserList
   * This method is used to get class activity user list
   */
  public fetchClassActivityUserList(classId, contentId, storeOffline = false): Promise<Array<CAStudentList>> {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_USERS, {
      classId,
      contentId
    });
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/classes/${classId}/contents/${contentId}/users`;
        this.httpService.get<Array<CAStudentList>>(endpoint).then((response) => {
          const normalizedCAUsers = this.normalizeClassActivityUsers(response.data.users);
          if (storeOffline) {
            this.databaseService.upsertDocument(databaseKey, normalizedCAUsers);
          }
          resolve(normalizedCAUsers);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value)
        }, reject);
      }
    });
  }

  /**
   * @function updateClassActivityUsers
   * This method is used to update class activity user list
   */
  public updateClassActivityUsers(classId, contentId, studentIds) {
    const endpoint = `${this.namespace}/classes/${classId}/contents/${contentId}/users`;
    const params = { users: studentIds };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function rescheduleClassActivity
   * This method is used to reschedule class activity
   */
  public rescheduleClassActivity(scheduleParams) {
    const endpoint = `${this.namespace}/classes/${scheduleParams.classId}/contents/schedule`;
    const params = {
      class_id: scheduleParams.classId,
      content_id: scheduleParams.contentId,
      content_type: scheduleParams.contentType,
      dca_added_date: scheduleParams.startDate,
      end_date: scheduleParams.endDate,
      for_month: scheduleParams.month,
      for_year: scheduleParams.year
    };
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function updateClassActivityStatus
   * This method is used to update class activity status to closed
   */
  public updateClassActivityStatus(classId, contentId) {
    const endpoint = `${this.namespace}/classes/${classId}/contents/${contentId}/complete`;
    return this.httpService.put(endpoint, {});
  }

  // -------------------------------------------------------------------------
  // normalizers

  private normalizeClassActivityUsers(payload): Array<CAStudentList> {
    const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
    const normalizedPayload = payload.map((item) => {
      const user = {
        email: item.email,
        firstName: item.first_name,
        id: item.id,
        isActive: item.is_active,
        lastName: item.last_name,
        rosterGlobalUserid: item.roster_global_userid,
        username: `${item.last_name} ${item.first_name}`,
        thumbnail: item.thumbnail ? `${basePath}${item.thumbnail}` : null,
      };
      return user;
    });
    return sortBy(normalizedPayload, 'username');
  }

  /**
   * @function normalizeClassAllContents
   * This method is used to normalize all contents from class
   */
  public normalizeClassAllContents(payload): Array<ClassContentModel> {
    return payload.map((item) => {
      return this.normalizeClassContent(item);
    });
  }

  public submitOAGrade(oaRubric) {
    const endpoint = `api/nucleus-insights/v2/rubrics/grades/collections`;
    return this.httpService.post(endpoint, oaRubric);
  }

  public setStudentRubricGrades(rubricGradeParams) {
    const endpoint = `api/nucleus-insights/v2/rubrics/grades`;
    return this.httpService.post(endpoint, rubricGradeParams);
  }

  /**
   * Normalize class CA performance
   */
  private normalizeCAPerformance(payload): Array<CAPerformanceModel> {
    return payload.usageData.map((caPerformance) => {
      const performanceModel: CAPerformanceModel = {
        classId: caPerformance.classId,
        completedCount: caPerformance.completedCount,
        scoreInPercentage: caPerformance.scoreInPercentage
      };
      return performanceModel;
    });
  }

  /**
   * @function normalizeClassContent
   * This method is used to normalize single class content
   */
  private normalizeClassContent(payload): ClassContentModel {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const videoConferenceEnable = this.sessionService.userSession.tenant
      ? this.sessionService.userSession.tenant.settings && this.sessionService.userSession.tenant.settings.enable_cls_video_conf_setup === SETTINGS.ON
      : false;
    const classContent: ClassContentModel = {
      activationDate: payload.activation_date,
      allowMasteryAccrual: payload.allow_mastery_accrual,
      classId: payload.class_id,
      contentId: payload.content_id,
      contentType: payload.content_type,
      collection: this.normalizeClassActivityCollection(payload, cdnUrl),
      createdAt: payload.created_at,
      dcaAddedDate: payload.dca_added_date || payload.activation_date,
      endDate: payload.end_date,
      forMonth: payload.for_month,
      forYear: payload.for_year,
      id: payload.id,
      isCompleted: payload.is_completed,
      isDiagnostic: payload.isDiagnostic,
      meetingEndTime: payload.meeting_endtime,
      meetingId: payload.meeting_id,
      meetingStartTime: payload.meeting_starttime,
      meetingTimezone: payload.meeting_timezone,
      meetingUrl: payload.meeting_url,
      taskCount: payload.task_count || 0,
      taxonomy: payload.taxonomy,
      title: payload.title,
      url: payload.url,
      usersCount: payload.users_count || 0,
      learningObjective: payload.learning_objective ? payload.learning_objective : null,
      resourceCount: payload.resource_count || 0,
      questionCount: payload.question_count || 0,
      ownerId: payload.owner_id ? payload.owner_id : null,
      thumbnail: payload.thumbnail
        ? `${cdnUrl}${payload.thumbnail}`
        : getDefaultImage(payload.content_type),
      thumbnailXS: payload.thumbnail
        ? `${cdnUrl}${payload.thumbnail}`
        : getDefaultImageXS(payload.content_type),
      showMastery: payload.content_type !== CONTENT_TYPES.COLLECTION && payload.content_type !== CONTENT_TYPES.COLLECTION_EXTERNAL,
      isActive: payload.activation_date ? true : false,
      videoConferenceEnable,
      isCollection: payload.content_type === CONTENT_TYPES.COLLECTION,
      isAssessment: payload.content_type === CONTENT_TYPES.ASSESSMENT,
      isExternalAssessment: payload.content_type === CONTENT_TYPES.ASSESSMENT_EXTERNAL,
      isExternalCollection: payload.content_type === CONTENT_TYPES.COLLECTION_EXTERNAL,
      isOfflineActivity: payload.content_type === CONTENT_TYPES.OFFLINE_ACTIVITY,
      isMeeting: payload.content_type === CONTENT_TYPES.MEETING,
      standards: payload.taxonomy ? this.taxonomyProvider.normalizeTaxonomy(payload.taxonomy) : null
    };
    return classContent;
  }

  /**
   * this method is used to normalize the class activity
   * @function normalizeClassActivity
   */
  private normalizeClassActivity(payload, classId): ClassActivity {
    const path = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const activity: ClassActivity = {
      id: payload.id,
      classId: payload.class_id || classId,
      addedDate: payload.dca_added_date,
      activationDate: payload.activation_date,
      endDate: payload.end_date,
      collection: this.normalizeClassActivityCollection(payload, path),
      forYear: payload.for_year,
      contentId: payload.content_id,
      contentType: payload.content_type,
      forMonth: payload.for_month,
      isCompleted: payload.is_completed,
      questionCount: payload.question_count || 0,
      resourceCount: payload.resource_count || 0,
      taskCount: payload.task_count || 0,
      meeting_endtime: payload.meeting_endtime,
      meeting_starttime: payload.meeting_starttime,
      meeting_timezone: payload.meeting_timezone,
      meeting_url: payload.meeting_url,
      url: payload.url,
      title: payload.title,
      usersCount: payload.users_count,
      thumbnail: payload.thumbnail ? path + payload.thumbnail : null,
      allowMasteryAccrual: payload.allow_mastery_accrual
    };
    return activity;
  }

  /**
   * @function normalizeClassActivityCollection
   * This method is used to normalize class activity collection
   */
  private normalizeClassActivityCollection(payload, basePath): Collection {
    const contentType = payload.content_type;
    if (contentType === CONTENT_TYPES.ASSESSMENT) {
      const assessmentModel = {
        id: payload.content_id,
        title: payload.title,
        url: payload.url,
        description: payload.learning_objective,
        resourceCount: payload.resource_count || 0,
        questionCount: payload.question_count || 0,
        oeQuestionCount: payload.oe_question_count || 0,
        collectionType: payload.content_type,
        format: payload.content_type,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: DEFAULT_IMAGES.ASSESSMENT,
        taskCount: payload.task_count
      };
      return assessmentModel;
    }
    if (contentType === CONTENT_TYPES.COLLECTION) {
      const collectionModel = {
        id: payload.content_id,
        title: payload.title,
        url: payload.url,
        resourceCount: payload.resource_count,
        questionCount: payload.question_count,
        collectionType: payload.content_type,
        format: payload.content_type,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: DEFAULT_IMAGES.COLLECTION
      };
      return collectionModel;
    }
    if (contentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      const offlineActivity = {
        id: payload.content_id,
        title: payload.title,
        collectionType: payload.content_type,
        url: payload.url,
        format: payload.content_type,
        taskCount: payload.task_count || 0,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: DEFAULT_IMAGES.OFFLINE_ACTIVITY
      };
      return offlineActivity;
    }
    if (contentType === CONTENT_TYPES.ASSESSMENT_EXTERNAL || contentType === CONTENT_TYPES.COLLECTION_EXTERNAL) {
      const externalCollectionModel = {
        id: payload.content_id,
        title: payload.title,
        collectionType: payload.content_type,
        url: payload.url,
        format: payload.content_type,
        thumbnailUrl: payload.thumbnail ?
          basePath + payload.thumbnail : null,
        defaultImg: contentType === CONTENT_TYPES.ASSESSMENT_EXTERNAL ? DEFAULT_IMAGES.ASSESSMENT
          : DEFAULT_IMAGES.COLLECTION
      };
      return externalCollectionModel;
    }
  }

  /**
   * @function updateMasteryAccural
   * This method is used to update mastery accural
   */
  public updateMasteryAccural(classId, contentId, params) {
    const endpoint = `${this.namespace}/classes/${classId}/contents/${contentId}/mastery-accrual`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function createMeetingActivity
   * This method is used to create meeting actvity
   */
  public createMeetingActivity(params) {
    const endpoint = `${this.namespace}/classes/${params.class_id}/schedule/meeting`;
    return this.httpService.post(endpoint, params);
  }
}
