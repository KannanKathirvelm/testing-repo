import { Injectable } from '@angular/core';
import { SYNC_EVENTS } from '@app/constants/events-constants';
import { aggregateCAPerformanceScore, aggregateCAPerformanceTimeSpent, convertScoreInPercentage, groupUserActivities } from '@app/utils/performance';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import { MasteredStatsModel, PerformancesModel, StreakStatsModel, StudentClassReportModel, StudentDatewiseDataModel, StudentDatewiseTimespentModel, StudentOverallCompetenciesModel, SuggestionStatsModel } from '@app/models/class-progress/class-progress';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  ATTEMP_STATUS,
  COLLECTION,
  COLLECTION_EXTERNAL,
  COLLECTION_SUB_FORMAT_TYPES,
  CONTENT_TYPES,
  GUT
} from '@constants/helper-constants';
import { environment } from '@environment/environment';
import {
  CAStudentAnswerObj,
  CAStudentPerformance, CAStudentPerformanceUsage
} from '@models/class-activity/class-activity';
import {
  CAPerformanceModel,
  CollectionPerformanceContentModel,
  CollectionSessionModel,
  CourseMapPerformanceContentModel,
  EvidenceModel,
  MilestonePerformanceContentModel,
  PerformanceModel
} from '@models/performance/performance';
import { PortfolioPerformanceSummaryModel } from '@models/portfolio/portfolio';
import { ProfileModel } from '@models/profile/profile';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import { calculateAverageScore, generateUUID, groupByTwoColumns } from '@utils/global';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class PerformanceProvider {

  // -------------------------------------------------------------------------
  // Properties

  private performanceNamespace = 'api/nucleus-insights/v2';
  private portfolioNamespace = 'api/ds/users/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // API Path

  public getClassPerformanceAPIPath() {
    return `${this.performanceNamespace}/classes/performance`;
  }

  public getCAContentPerformanceSummaryAPIPath(classId) {
    return `${this.performanceNamespace}/class/${classId}/content/activity`;
  }

  public getCAPerformanceSummaryAPIPath(classId) {
    return `${this.performanceNamespace}/class/${classId}/activity`;
  }

  public getMilestonePerformanceAPIPath(classId, courseId) {
    return `${this.performanceNamespace}/class/${classId}/course/${courseId}/milestone/performance`;
  }

  public getMilestoneLessonPerformanceAPIPath(classId, courseId, milestoneId) {
    return `${this.performanceNamespace}/class/${classId}/course/${courseId}/milestone/${milestoneId}/performance`;
  }

  public getUnitsPerformanceAPIPath(classId, courseId) {
    return `${this.performanceNamespace}/class/${classId}/course/${courseId}/performance`;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchClassPerformance
   * fetch class performance
   */
  public fetchClassPerformance(classCourseIds) {
    return new Promise((resolve, reject) => {
      const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASSES_PERFORMANCE, {});
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = this.getClassPerformanceAPIPath();
        const param = JSON.stringify({
          classes: classCourseIds
        });
        this.httpService.post<PerformanceModel>(endpoint, param).then((res) => {
          const response = res.data;
          const classPerformanceSummary = this.normalizeClassPerformanceUsageData(response.usageData);
          this.databaseService.upsertDocument(DOCUMENT_KEYS.CLASSES_PERFORMANCE, classPerformanceSummary);
          resolve(classPerformanceSummary);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  public normalizeClassPerformanceUsageData(payload) {
    return payload.map((item) => {
      return this.normalizeClassPerformanceSummary(item);
    });
  }

  /**
   * @function fetchUserSessionIds
   * This Method is used to get list of session ids
   */
  public fetchUserSessionIds(contentType, assessmentId, context, openSession = false) {
    const endpoint = `${this.performanceNamespace}/${contentType}/${assessmentId}/sessions`;
    const userId = this.sessionService.userSession.user_id;
    const paramsData = {
      userUid: userId,
      classGooruId: context.classId,
      courseGooruId: context.courseId,
      unitGooruId: context.unitId,
      lessonGooruId: context.lessonId,
      openSession
    };
    return this.httpService.get(endpoint, paramsData).then((response) => {
      return response.data.content.map((item) => {
        const session: CollectionSessionModel = {
          eventTime: item.eventTime,
          sequence: Number(item.sequence),
          sessionId: item.sessionId
        };
        return session;
      });
    });
  }

  /**
   * @function normalizeClassPerformanceSummary
   * normalize class performance summary
   */
  private normalizeClassPerformanceSummary(payload): PerformanceModel {
    return {
      id: payload.classId,
      classId: payload.classId,
      timeSpent: payload.timeSpent,
      score: payload.scoreInPercentage,
      sessionId: payload.lastSessionId,
      totalCompleted: payload.completedCount,
      total:
        payload.totalCount ||
        payload.completedCount
    };
  }

  /**
   * @function fetchCAPerformance
   * Fetch Performance of Class Activities
   */
  public fetchCAPerformance(classIds) {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.performanceNamespace}/dca/classes/performance`;
        const param = JSON.stringify({
          classIds
        });
        this.httpService.post<Array<CAPerformanceModel>>(endpoint, param).then((res) => {
          const normalizeCaPerformance = this.normalizeCAPerformance(res.data);
          this.databaseService.upsertDocument(DOCUMENT_KEYS.CLASSES_DCA_PERFORMANCE, normalizeCaPerformance);
          resolve(normalizeCaPerformance);
        }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.CLASSES_DCA_PERFORMANCE).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeCAPerformance
   * Normalize CA performance
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
   * @function fetchUnitsPerformance
   * Fetch performance of units
   */
  public fetchUnitsPerformance(classId: string, courseId: string, studentList: Array<ProfileModel> = [], studentId: null) {
    const isOnline = this.utilsService.isNetworkOnline();
    const documentKeys = studentId != null ? DOCUMENT_KEYS.STUDENT_UNITS_PERFORMANCE : DOCUMENT_KEYS.UNITS_PERFORMANCE;
    const dataBaseKey = this.databaseService.documentKeyParser(documentKeys, {
      classId,
      courseId,
      studentId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getUnitsPerformanceAPIPath(classId, courseId)
        const params = {
          collectionType: CONTENT_TYPES.ASSESSMENT
        };
        if (studentId) {
          Object.assign(params, {
            userUid: studentId
          });
        }
        this.httpService.get<Array<CourseMapPerformanceContentModel>>(endpoint, params).then((response) => {
          const normalizePerformance = this.normalizePerformance(response.data.content, CONTENT_TYPES.UNIT, studentList);
          this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
          resolve(normalizePerformance);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }


  /**
   * @function fetchMilestonesCollectionPerformance
   * Fetch performance of collection
   */
  public fetchMilestonesCollectionPerformance(classId, courseId, unitId, lessonId, contentType, studentList: Array<ProfileModel> = [], contentId) {
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}/${contentType}/${contentId}/performance`;
    return this.httpService.get<Array<CollectionPerformanceContentModel>>(endpoint).then((response) => {
      const performance = this.normalizeMilestoneCollectionPerformance(response.data.content, studentList);
      return performance;
    });
  }

  /**
   * @function normalizeMilestoneCollectionPerformance
   * normalize the performance of collection level
   */
  private normalizeMilestoneCollectionPerformance(payload, studentList?): Array<CollectionPerformanceContentModel> {
    const resultSet = [];
    const content = payload || [];
    if (content && content.length) {
      content.forEach((contentData) => {
        const usageData = contentData.usageData;
        if (usageData && usageData.length) {
          usageData.forEach((data) => {
            let isCorrect = false;
            const isSkipped = data.answerObject?.length === 0 || data.answerObject === null;
            if (data.answerObject) {
              const correctAnswer = data.answerObject.find((answer) => {
                return answer.status === ATTEMP_STATUS.CORRECT;
              });
              isCorrect = !!correctAnswer;
            }
            const contentPerformance = {
              performance: {
                reaction: data.reaction,
                timespent: data.timeSpent,
                scoreInPercentage: data.score,
                totalCount: data.totalCount,
                resourceType: data.resourceType,
                isQuestion: data.resourceType === COLLECTION_SUB_FORMAT_TYPES.QUESTION,
                isResource: data.resourceType === COLLECTION_SUB_FORMAT_TYPES.RESOURCE,
                contenId: data.gooruOId,
                isCorrect,
                isSkipped
              },
              contenId: data.gooruOId,
              userUid: contentData.userUid
            };
            if (studentList && studentList.length) {
              const studentDetail = studentList.find(
                (student) => student.id === contentData.userUid
              );
              Object.assign(contentPerformance, {
                user: studentDetail
              });
            }
            resultSet.push(contentPerformance);
          });
        }
      });
    }
    return resultSet;
  }

  /**
   * @function fetchUnitLessonPerformance
   * Fetch Performance of units
   */
  public fetchUnitLessonPerformance(classId: string, courseId: string, unitId: string, isTeacherView: boolean, studentList: Array<ProfileModel> = [], studentId: string = null) {
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/unit/${unitId}/performance`;
    const param = {
      collectionType: CONTENT_TYPES.ASSESSMENT
    };
    if (!isTeacherView) {
      Object.assign(param, {
        userUid: studentId
      });
    }
    return this.httpService.get<Array<CourseMapPerformanceContentModel>>(endpoint, param).then((response) => {
      return this.normalizePerformance(response.data.content, CONTENT_TYPES.LESSON, studentList);
    });
  }

  /**
   * @function fetchUnitCollectionPerformance
   * Fetch Performance of unit collection
   */
  public fetchUnitCollectionPerformance(classId: string, courseId: string, unitId: string, lessonId: string, contentType: string, isTeacherView: boolean, studentList: Array<ProfileModel> = [], userId: string = null) {
    const endpoint = `${this.performanceNamespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}/performance`;
    const params = {
      collectionType: contentType
    };
    if (userId) {
      Object.assign(params, {
        userUid: userId
      });
    }
    return this.httpService.get<Array<CourseMapPerformanceContentModel>>(endpoint, params).then((response) => {
      return this.normalizePerformance(response.data.content, contentType, studentList);
    });
  }

  /**
   * @function fetchMilestonePerformance
   * Fetch Performance of milestone
   */
  public fetchMilestonePerformance(classId: string, courseId: string, fwCode: string, studentList: Array<ProfileModel> = [], studentId = null) {
    const isOnline = this.utilsService.isNetworkOnline();
    const documentKeys = studentId != null ? DOCUMENT_KEYS.STUDENT_MILESTONE_PERFORMANCE : DOCUMENT_KEYS.MILESTONE_PERFORMANCE;
    const dataBaseKey = this.databaseService.documentKeyParser(documentKeys, {
      classId,
      courseId,
      fwCode,
      studentId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getMilestonePerformanceAPIPath(classId, courseId);
        const params = {
          collectionType: CONTENT_TYPES.ASSESSMENT,
          fwCode
        };
        if (studentId) {
          Object.assign(params, {
            userUid: studentId
          });
        }
        this.httpService.get<Array<MilestonePerformanceContentModel>>(endpoint, params).then((response) => {
          const normalizePerformance = this.normalizePerformance(response.data.content, CONTENT_TYPES.MILESTONE, studentList);
          resolve(normalizePerformance);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function fetchMilestoneLessonPerformance
   * Fetch Performance of milestone lessons
   */
  public fetchMilestoneLessonPerformance(classId: string, courseId: string, fwCode: string, milestoneId: string, studentList: Array<ProfileModel> = [], studentId: string = null, contentType?) {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.MILESTONE_LESSON_PERFORMANCE, {
      classId,
      courseId,
      fwCode,
      milestoneId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getMilestoneLessonPerformanceAPIPath(classId, courseId, milestoneId);
        const params = {
          collectionType: contentType ? contentType : CONTENT_TYPES.ASSESSMENT,
          fwCode: fwCode || GUT
        };
        if (studentId) {
          Object.assign(params, {
            userUid: studentId
          });
        }
        this.httpService.get<Array<MilestonePerformanceContentModel>>(endpoint, params).then((response) => {
          const normalizePerformance = this.normalizePerformance(response.data.content, CONTENT_TYPES.LESSON, studentList);
          resolve(normalizePerformance);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizePerformance
   * normalize the performance of unit/lesson/collection level
   */
  private normalizePerformance(payload, type, studentList?): Array<MilestonePerformanceContentModel> {
    const resultSet = [];
    const content = payload || [];
    if (content && content.length) {
      content.forEach((contentData) => {
        const usageData = contentData.usageData;
        const idKey = `${type}Id`;
        if (usageData && usageData.length) {
          usageData.forEach((data) => {
            const contentPerformance = {
              performance: {
                attemptStatus: data.attemptStatus,
                attempts: data.attempts,
                completedCount: data.completedCount,
                gradingStatus: data.gradingStatus,
                reaction: data.reaction,
                timespent: data.timeSpent,
                scoreInPercentage: data.scoreInPercentage,
                totalCount: data.totalCount,
                [idKey]: data[idKey] || contentData[idKey]
              },
              [idKey]: data[idKey] || contentData[idKey],
              collectionId: data[idKey] || contentData[idKey],
              userUid: contentData.userUid
            };
            if (studentList && studentList.length) {
              const studentDetail = studentList.find(
                (student) => student.id === contentData.userUid
              );
              Object.assign(contentPerformance, {
                user: studentDetail
              });
            }
            resultSet.push(contentPerformance);
          });
        }
      });
    }
    return resultSet;
  }


  /**
   * @function fetchClassActivitiesPerformanceSummary
   * Fetch Performance of class activities summary
   */
  public fetchClassActivitiesPerformanceSummary(classId, params) {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = this.getCAPerformanceSummaryAPIPath(classId);
        this.httpService.post(endpoint, params).then((response) => {
          const normalizeAllActivityPerformanceSummary = this.normalizeAllActivityPerformanceSummary(response.data);
          resolve(normalizeAllActivityPerformanceSummary);
        }, reject);
      } else {
        this.fetchOfflineCAPerformanceSummary(classId, params).then((response) => {
          const normalizeAllActivityPerformanceSummary = this.normalizeAllActivityPerformanceSummary(response);
          resolve(normalizeAllActivityPerformanceSummary);
        });
      }
    });
  }

  /**
   * @function fetchOfflineCAPerformanceSummary
   * This method used to fetch offline CA performance summary
   */
  public fetchOfflineCAPerformanceSummary(classId, params) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENTS, {
      classId,
    });
    const performanceDatabaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENT_PERFORMANCE, {
      classId,
      contentType: params.collectionType
    });
    return Promise.all([
      this.databaseService.getDocument(databaseKey).catch((e) => e),
      this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS).catch((e) => e),
      this.databaseService.getDocument(performanceDatabaseKey).catch((e) => e)
    ]).then((result) => {
      const classActivities = result[0].value || [];
      const offlineEventsPerformances = result[1].value?.data || [];
      const onlinePerformances = result[2].value;
      const studentLevelEvents = groupByTwoColumns(offlineEventsPerformances, 'payload', 'student_id');
      const transformedOfflineEvents = this.transformOfflineEventsToActivityPayload(studentLevelEvents, true);
      const transformedOnlinePerformances = this.findActivitiesPerformance(onlinePerformances, params);
      const activities = classActivities.filter((classActivity) => {
        return params.collectionIds.includes(classActivity.contentId) && this.checkActivityIsBetween(classActivity.activationDate || classActivity.dcaAddedDate, params.startDate, params.endDate);
      });
      const studentAllPerformances = transformedOfflineEvents.concat(transformedOnlinePerformances);
      const groupedUserActivities = groupUserActivities(studentAllPerformances, 'userId');
      const activitiesPerformance = [];
      activities.forEach((classActivity) => {
        const activityClassId = classActivity.classId;
        const contentId = classActivity.contentId;
        const dcaContentId = classActivity.id;
        const collectionType = classActivity.contentType;
        Object.keys(groupedUserActivities).forEach((studentId) => {
          const studentPerformances = groupedUserActivities[studentId];
          let contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
            const additionalContext = studentPerformance.additionalContext || studentPerformance.additional_context;
            const eventName = collectionType === ASSESSMENT ? SYNC_EVENTS.CA_UPDATE_ASSESSMENT_DATA : SYNC_EVENTS.CA_UPDATE_COLLECTION_DATA;
            return studentPerformance.classId === activityClassId
              && studentPerformance.collectionId === contentId
              && JSON.parse(atob(additionalContext)).dcaContentId === dcaContentId
              && studentPerformance.eventName === eventName;
          });
          if (!contentUpdateEvents?.length) {
            contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
              const additionalContext = studentPerformance.additionalContext || studentPerformance.additional_context;
              return studentPerformance.classId === activityClassId
                && studentPerformance.collectionId === contentId
                && JSON.parse(atob(additionalContext)).dcaContentId === dcaContentId
                && studentPerformance.eventName === SYNC_EVENTS.CA_ADD_DATA;
            });
            if (!contentUpdateEvents?.length) {
              contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
                return studentPerformance.collectionId === contentId && !studentPerformance.eventName;
              });
            }
          }
          if (contentUpdateEvents && contentUpdateEvents.length) {
            activitiesPerformance.push({
              activity: contentUpdateEvents || [],
              userId: studentId
            });
          }
        });
      });
      return {
        usageData: activitiesPerformance
      }
    });
  }

  /**
   * @function transformOfflineEventsToActivityPayload
   * This method is transform offline events to activity payload
   */
  private transformOfflineEventsToActivityPayload(studentsOfflineEvents, summaryPerformance = false) {
    return Object.keys(studentsOfflineEvents).map((studentId) => {
      const studentOfflineEvents = studentsOfflineEvents[studentId];
      const sortedDataList = studentOfflineEvents.sort((x, y) => {
        return y.timestamp - x.timestamp;
      });
      let studentPerformance = sortedDataList[0];
      if (studentPerformance) {
        studentPerformance = this.normalizeOfflineCAStudentEventsPerformance(studentPerformance, summaryPerformance);
      }
      return {
        activity: studentPerformance ? [studentPerformance] : [],
        userId: studentId
      };
    });
  }

  /**
   * @function findActivitiesPerformance
   * This method is used to find activities performance
   */
  private findActivitiesPerformance(dcaPerformanceList, params) {
    const storedItemsCount = Object.keys(dcaPerformanceList).length;
    const keyName = Object.keys(dcaPerformanceList)[storedItemsCount - 1];
    const availableDates = keyName.split('.');
    const startDate = availableDates[0];
    const endDate = availableDates[1];
    const hasActivity = this.checkActivityIsBetween(params.startDate, startDate, endDate);
    if (hasActivity) {
      const userPerformanceList = dcaPerformanceList[keyName];
      return userPerformanceList.filter((userPerformance) => {
        const activityPerformance = userPerformance.activity.filter((item) => {
          const isPresent = this.checkActivityIsBetween(item.date, params.startDate, params.endDate);
          return params.collectionIds.includes(item.collectionId) && isPresent;
        });
        userPerformance.activity = activityPerformance;
        return userPerformance;
      }).filter((item) => {
        return item.activity !== null;
      });
    }
    return [];
  }

  /**
   * @function checkActivityIsBetween
   * This method is used to check activity is between two dates
   */
  private checkActivityIsBetween(activityDate, startDate, endDate) {
    const dcaAddedDate = moment(activityDate, 'YYYY-MM-DD');
    const activityStart = moment(startDate, 'YYYY-MM-DD');
    const activityEnd = moment(endDate, 'YYYY-MM-DD');
    return dcaAddedDate.isBetween(activityStart, activityEnd, 'days', '[]');
  }

  /**
   * @function storeCAPerformanceSummary
   * This method is used to store CA performance summary
   */
  public storeCAPerformanceSummary(classId, contentType, usagePerformances) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENT_PERFORMANCE, {
      classId,
      contentType
    });
    const keyName = Object.keys(usagePerformances)[0];
    return this.databaseService.getDocument(databaseKey).then((result) => {
      const items = result.value;
      items[keyName] = usagePerformances[keyName].usageData;
      return this.databaseService.upsertDocument(databaseKey, items);
    }).catch(() => {
      const items = {};
      items[keyName] = usagePerformances[keyName].usageData;
      return this.databaseService.upsertDocument(databaseKey, items);
    });
  }

  /**
   * @function fetchCAStudentsPerformance
   * Fetch Performance of Class Activity students
   */
  public fetchCAStudentsPerformance(classId, contentType, contentId, dcaContentId, activationDate, endDate) {
    let collectionType = contentType;
    if (contentType === ASSESSMENT_EXTERNAL) {
      collectionType = ASSESSMENT;
    } else if (contentType === COLLECTION_EXTERNAL) {
      collectionType = COLLECTION;
    }
    const endpoint = `${this.performanceNamespace}/dca/class/${classId}/${collectionType}/${contentId}/performance`;
    const params = {
      date: activationDate,
      startDate: activationDate,
      endDate
    };
    if (this.utilsService.isNetworkOnline()) {
      return this.httpService.get<Array<CAStudentPerformance>>(endpoint, params).then((response) => {
        return this.normalizeCaStudentPerformance(response.data.content);
      });
    } else {
      const performanceDatabaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENT_PERFORMANCE, {
        classId,
        contentType
      });
      return Promise.all([
        this.databaseService.getDocument(performanceDatabaseKey).catch((e) => e),
        this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS).catch((e) => e)
      ]).then((result) => {
        const onlinePerformances = result[0].value;
        const offlineEventsPerformances = result[1].value?.data || [];
        const studentLevelEvents = groupByTwoColumns(offlineEventsPerformances, 'payload', 'student_id');
        const transformedOfflineEvents = this.transformOfflineEventsToActivityPayload(studentLevelEvents, true);
        const transformedOnlinePerformances = this.findActivitiesPerformance(onlinePerformances, { ...params, collectionIds: [contentId] });
        const studentAllPerformances = transformedOfflineEvents.concat(transformedOnlinePerformances);
        const groupedUserActivities = groupUserActivities(studentAllPerformances, 'userId');
        const activitiesPerformance = []
        Object.keys(groupedUserActivities).forEach((studentId) => {
          const studentPerformances = groupedUserActivities[studentId];
          let contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
            const additionalContext = studentPerformance.additionalContext || studentPerformance.additional_context;
            const eventName = collectionType === ASSESSMENT ? SYNC_EVENTS.CA_UPDATE_ASSESSMENT_DATA : SYNC_EVENTS.CA_UPDATE_COLLECTION_DATA;
            return studentPerformance.classId === classId
              && studentPerformance.collectionId === contentId
              && JSON.parse(atob(additionalContext)).dcaContentId === dcaContentId
              && studentPerformance.eventName === eventName;
          });
          if (!contentUpdateEvents?.length) {
            contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
              const additionalContext = studentPerformance.additionalContext || studentPerformance.additional_context;
              return studentPerformance.classId === classId
                && studentPerformance.collectionId === contentId
                && JSON.parse(atob(additionalContext)).dcaContentId === dcaContentId
                && studentPerformance.eventName === SYNC_EVENTS.CA_ADD_DATA;
            });
            if (!contentUpdateEvents?.length) {
              contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
                return studentPerformance.collectionId === contentId && !studentPerformance.eventName;
              });
            }
          }
          if (contentUpdateEvents && contentUpdateEvents.length) {
            activitiesPerformance.push({
              activity: contentUpdateEvents[0],
              userId: studentId
            });
          }
        });
        return this.transformActivityToContentPayload(activitiesPerformance, collectionType);
      });
    }
  }

  /**
   * @function fetchActivitySummary
   * Fetch performance summary based on content source and sessionId
   */
  public fetchActivitySummary(contentType, itemId, sessionId, contentSource, userId) {
    let collectionType = contentType;
    if (contentType === ASSESSMENT_EXTERNAL) {
      collectionType = ASSESSMENT;
    } else if (contentType === COLLECTION_EXTERNAL) {
      collectionType = COLLECTION;
    }
    const endpoint = `${this.portfolioNamespace}/content/portfolio/${collectionType}/summary`;
    const paramsData = {
      userId,
      itemId,
      sessionId,
      contentSource
    };
    return this.httpService.get<PortfolioPerformanceSummaryModel>(endpoint, paramsData).then((response) => {
      return this.normalizeActivitySummary(response.data.content, collectionType);
    });
  }

  /**
   * @function normalizeActivitySummary
   * Normalize activity summary
   */
  public normalizeActivitySummary(payload, contentType) {
    const content = payload[contentType];
    const subContents = payload.resources || payload.questions;
    const subType = contentType === ASSESSMENT ? 'questions' : 'resources';
    const result: PortfolioPerformanceSummaryModel = {
      [contentType]: {
        eventTime: content ? content.eventTime : null,
        id: content ? content.id || content.collectionId : null,
        reaction: content ? content.reaction : null,
        score: content ? Math.round(content.score) : null,
        timespent: content ? content.timespent || content.timeSpent : null,
        type: content ? content.type : null,
        sessionId: content ? content.sessionId : null
      },
      [subType]: subContents ? this.normalizeSubFormatContent(subContents, contentType) : null,
    };
    return result;
  }

  /**
   * @function normalizeSubFormatContent
   * Normalize subformat content object
   */
  private normalizeSubFormatContent(subContents, contentType) {
    return subContents.map((subContent) => {
      const subQuestions = subContent.subQuestions || null;
      return {
        answerStatus: subContent.answerStatus,
        isSkipped: subContent.answerStatus === ATTEMP_STATUS.SKIPPED,
        answerObject: subContent.answerObject ? this.normalizeAnswerObject(subContent.answerObject) : null,
        eventTime: subContent.eventTime,
        id: subContent.id || subContent.resourceId || subContent.gooruOId,
        isGraded: subContent.isGraded,
        maxScore: subContent.maxScore,
        questionType: subContent.questionType,
        reaction: subContent.reaction,
        resourceType: subContent.resourceType,
        score: subContent.score,
        percentScore: subContent.percentScore,
        timespent: subContent.timespent || subContent.timeSpent,
        title: subContent.title,
        averageScore: this.calculateAverageScore(subContent, contentType),
        evidence: subContent.evidence ? this.normalizeEvidence(subContent.evidence) : null,
        subQuestions: subQuestions ? this.normalizeSubFormatContent(subQuestions, contentType) : []
      };
    });
  }

  /**
   * @function normalizeEvidence
   * Normalize evidence content object
   */
  private normalizeEvidence(evidence) {
    const environmentCdnUrl = environment.CDN_URL + '/';
    const cdnUrl = this.sessionService.userSession.cdn_urls ? this.sessionService.userSession.cdn_urls.content_cdn_url : environmentCdnUrl;
    return evidence.map((evidenceFile) => {
      const evidenceItem: EvidenceModel = {
        filename: evidenceFile.filename,
        originalFileName: evidenceFile.original_filename,
        url: evidenceFile.url ? evidenceFile.url : cdnUrl + evidenceFile.filename
      }
      return evidenceItem;
    });
  }

  /**
   * @function calculateAverageScore
   * calculate average score
   */
  private calculateAverageScore(content, contentType) {
    return content.answerStatus !== ATTEMP_STATUS.SKIPPED
      ? content.score !== null && content.maxScore
        ? calculateAverageScore(content.score, content.maxScore)
        : content.score
      : null;
  }

  /**
   * @function normalizeCaStudentPerformance
   * normalize ca student individual performance
   */
  public normalizeCaStudentPerformance(payload): Array<CAStudentPerformance> {
    return payload.map((item) => {
      const contentKey = Object.keys(item)[0];
      const contentItem = item[contentKey];
      const content = {
        [contentKey]: {
          collectionType: contentItem.collectionType,
          reaction: contentItem.reaction,
          score: contentItem.score,
          timespent: contentItem.timeSpent || contentItem.timespent
        },
        usageData: this.normalizeCaStudentUsageData(item.usageData),
        userUid: item.userUid
      };
      return content;
    });
  }

  /**
   * @function transformActivityToContentPayload
   * normalize offline ca student individual performance
   */
  public transformActivityToContentPayload(payload, contentType): Array<CAStudentPerformance> {
    return payload.map((item) => {
      const content = {
        [contentType]: {
          collectionType: contentType,
          reaction: item.activity?.reaction,
          score: item.activity?.score || item.activity?.scoreInPercentage,
          timespent: item.activity?.timeSpent || item.activity?.timespent,
          lastSessionId: item.activity?.lastSessionId
        },
        usageData: this.normalizeCaStudentUsageData(item.activity?.contentData || []),
        userUid: item.userId
      };
      return content;
    });
  }

  /**
   * @function normalizeOfflineCAStudentEventsPerformance
   * normalize offline ca student event performance
   */
  public normalizeOfflineCAStudentEventsPerformance(event, summaryPerformance = false) {
    const contentType = event.payload.collection_type;
    const resources = event.payload.resources || [];
    let totalScore;
    if (contentType === ASSESSMENT || contentType === ASSESSMENT_EXTERNAL) {
      totalScore = aggregateCAPerformanceScore(resources);
    }
    const timespent = aggregateCAPerformanceTimeSpent(resources);
    const conductedOn = event.payload.conductedOn || event.payload.conducted_on;
    let content;
    // for activity API - POST
    if (summaryPerformance) {
      content = {
        classId: event.context.class_id,
        collectionId: event.payload.collection_id,
        date: conductedOn ? conductedOn.substring(0, 10) : event.payload.activity_date,
        collectionType: contentType,
        is_graded: true,
        status: 'complete',
        score: totalScore,
        scoreInPercentage: totalScore,
        timeSpent: timespent,
        lastSessionId: event.payload.session_id,
        contentData: this.normalizeCaStudentEventsUsageData(resources, event.payload.session_id),
        userId: event.payload.student_id,
        eventName: event.eventName,
        timestamp: event.timestamp,
        additionalContext: event.payload.additionalContext || event.payload.additional_context
      };
    } else {
      // for DCA API - GET
      content = {
        [contentType]: {
          collectionType: event.payload.collection_type,
          reaction: null,
          score: totalScore,
          timespent,
          lastSessionId: event.payload.session_id
        },
        usageData: this.normalizeCaStudentEventsUsageData(resources, event.payload.session_id),
        userUid: event.payload.student_id
      };
    }
    return content;
  }

  /**
   * @function normalizeCaStudentEventsUsageData
   * normalize ca student student performance usage data
   */
  public normalizeCaStudentEventsUsageData(resources, sessionId, summaryPerformance = false): Array<CAStudentPerformanceUsage> {
    return resources.map((item) => {
      const content = {
        answerObject: item.answerObject ? this.normalizeAnswerObject(item.answerObject) : [],
        eventTime: null,
        evidence: null,
        gooruOId: item.resource_id,
        isGraded: true,
        maxScore: item.max_score,
        questionType: item.question_type,
        rawScore: item.score,
        reaction: null,
        resourceType: item.resource_type,
        score: summaryPerformance ? item.score : convertScoreInPercentage(item.score, item.max_score),
        sessionId,
        lastSessionId: sessionId,
        timeSpent: item.time_spent,
        views: null
      }
      return content;
    });
  }

  /**
   * @function normalizeCaStudentUsageData
   * normalize ca student individual performance usage data
   */
  public normalizeCaStudentUsageData(usageData): Array<CAStudentPerformanceUsage> {
    return usageData.map((item) => {
      const content = {
        answerObject: item.answerObject ? item.answerObject instanceof Array ? this.normalizeAnswerObject(item.answerObject) : this.normalizeAnswerObject(JSON.parse(item.answerObject)) : [],
        eventTime: item.eventTime,
        evidence: item.evidence,
        gooruOId: item.gooruOId,
        isGraded: item.isGraded,
        maxScore: item.maxScore,
        questionType: item.questionType,
        rawScore: item.rawScore || 0,
        reaction: item.reaction,
        resourceType: item.resourceType,
        score: convertScoreInPercentage(item.score, item.maxScore),
        sessionId: item.sessionId,
        timeSpent: item.timeSpent ? Number(item.timeSpent) : 0,
        views: item.views
      }
      return content;
    });
  }

  /**
   * @function normalizeAnswerObject
   * normalize ca student individual performance for answer object
   */
  public normalizeAnswerObject(ansObject): Array<CAStudentAnswerObj> {
    return ansObject.map((item) => {
      const answerObject = {
        answerId: item.answerId,
        order: item.order,
        skip: item.skip,
        status: item.status,
        answer_text: item.text,
        timeStamp: item.timeStamp
      }
      return answerObject;
    });
  }

  /**
   * @function normalizeAllActivityPerformanceSummary
   * normalize all activity performance summary
   */
  public normalizeAllActivityPerformanceSummary(payload) {
    const activityPerformanceSummaryItems = [];
    if (payload && Array.isArray(payload.usageData)) {
      payload.usageData.forEach((activityPerformanceSummaryData) => {
        const userId = activityPerformanceSummaryData.userId;
        const activitiesData = activityPerformanceSummaryData.activity || [];
        activitiesData.forEach((activityData) => {
          const activityPerformanceSummary = this.normalizeActivityPerformanceSummary(userId, activityData);
          activityPerformanceSummaryItems.push(activityPerformanceSummary);
        });
      });
    }
    return activityPerformanceSummaryItems;
  }

  /**
   * @function normalizeActivityPerformanceSummary
   * normalize activity performance summary
   */
  public normalizeActivityPerformanceSummary(userId, payload) {
    const activityPerformanceSummary = {
      userId,
      date: payload.date ? moment(payload.date).format('YYYY-MM-DD') : null,
      activationDate: payload.date ? payload.date : null,
      dcaContentId: payload.dcaContentId || null,
      collectionPerformanceSummary: this.normalizeCollectionPerformanceSummary(payload)
    };
    return activityPerformanceSummary;
  }

  /**
   * @function normalizeCollectionPerformanceSummary
   * normalize collection performance summary
   */
  public normalizeCollectionPerformanceSummary(payload) {
    const collectionPerformanceSummary = {
      id: payload.collectionId || payload.collection_id,
      collectionId: payload.collectionId || payload.collection_id,
      timeSpent: payload.timeSpent,
      attempts: payload.attempts,
      pathId: payload.pathId,
      views: payload.views,
      score: payload.scoreInPercentage,
      sessionId: payload.lastSessionId || payload.sessionId,
      status: payload.status
    };
    return collectionPerformanceSummary;
  }

  /**
   * Normalizes a rubric activities
   */
  public normalizeActivityRubric(activities) {
    return activities.map((activity) => {
      return this.normalizeRubric(activity);
    });
  }

  /**
   * Normalizes a rubric activities
   */
  private normalizeRubric(data) {
    const metadata = data.metadata || null;
    const categories = data.categories;
    const basePath = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const thumbnail = data.thumbnail ? basePath + data.thumbnail : null;
    const url =
      data.url && !data.is_remote ? basePath + data.url : data.url || null;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      thumbnail,
      audience: metadata ? metadata.audience : null,
      url,
      isPublished: data.publishStatus === 'published',
      publishDate: data.publish_date ? data.publish_date : null,
      rubricOn: data.is_rubric,
      uploaded: !data.is_remote,
      feedback: data.feedback_guidance,
      requiresFeedback: data.overall_feedback_required,
      maxScore: data.max_score,
      increment: data.increment,
      scoring: data.scoring,
      categories: categories
        ? categories.map(category =>
          this.normalizeRubricCategory(category)
        )
        : [],
      createdDate: data.created_at,
      updatedDate: data.updated_at,
      tenant: data.tenant,
      gutCodes: data.gut_codes,
      modifierId: data.modifier_id,
      originalCreatorId: data.original_creator_id,
      originalRubricId: data.original_rubric_id,
      parentRubricId: data.parent_rubric_id,
      tenantRoor: data.tenant_root,
      grader: data.grader || null,
      gradeType: data.grader,
      isTeacherRubric: data.grader === 'Teacher'
    };
  }

  /**
   * Normalizes a rubric category
   */
  private normalizeRubricCategory(data) {
    const levels = [];
    if (data.levels) {
      data.levels.map((level) => {
        levels.push({
          name: level.level_name,
          score: Number(level.level_score),
          description: level.level_description
        });
      });
    }
    return {
      title: data.category_title,
      feedbackGuidance: data.feedback_guidance,
      requiresFeedback: data.required_feedback,
      allowsLevels: data.level === true,
      allowsScoring: data.scoring === true,
      levels: this.sortLevels(levels)
    };
  }


  /**
   * @function sortLevels
   * This method is used to sort the level score
   */
  private sortLevels(levels) {
    return levels.sort((a, b) => {
      return a.score - b.score;
    });
  }

  /**
   * @function fetchDCACollectionPerformance
   * Fetch dca collections performance
   */
  public fetchDCACollectionPerformance(collectionType, collectionId, params) {
    const userId = params.studentId || this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/dca/${collectionType}/${collectionId}/user/${userId}`;
    return this.httpService.get<PortfolioPerformanceSummaryModel>(endpoint, params).then((response) => {
      const performanceContent = response.data.content && response.data.content.length ? this.normalizeActivitySummary(response.data.content[0], collectionType) : null;
      return performanceContent;
    });
  }

  /**
   * Fetch collection performance based on context
   */
  public fetchCollectionPerformanceByContext(contentId, collectionType, params) {
    const userId = params.studentId || this.sessionService.userSession.user_id;
    const endpoint = `${this.performanceNamespace}/${collectionType}/${contentId}/user/${userId}`;
    return this.httpService.get<PortfolioPerformanceSummaryModel>(endpoint, params).then((response) => {
      return this.normalizeActivitySummary(response.data.content[0], collectionType);
    });
  }

  /**
   * @function updateCollectionOfflinePerformance
   * This method is used to save offline report for collection
   */
  public updateCollectionOfflinePerformance(contextParams) {
    if (this.utilsService.isNetworkOnline()) {
      const endpoint = `${this.performanceNamespace}/offline-report`;
      return this.httpService.post(endpoint, contextParams);
    } else {
      return this.storeOfflineEvents(SYNC_EVENTS.CA_ADD_DATA, contextParams);
    }
  }

  /**
   * @function serializeOfflineEvents
   * This method is used to serialize offline events
   */
  public serializeOfflineEvents(eventName, context, payload) {
    return {
      eventId: generateUUID(),
      timestamp: new Date().getTime(),
      eventName,
      context,
      payload
    }
  }

  /**
   * @function storeOfflineEvents
   * This method is used to store offline events
   */
  public storeOfflineEvents(eventName, contextParams) {
    const serializedOfflineEvents = this.serializeOfflineEvents(eventName, {
      class_id: contextParams.class_id,
      course_id: contextParams.course_id,
      source: 'ca'
    }, {
      ...contextParams
    });
    return this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS).then((result) => {
      const items = result.value.data || [];
      items.push(serializedOfflineEvents);
      return this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS, {
        data: items
      });
    }).catch(() => {
      return this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS, {
        data: [serializedOfflineEvents]
      });
    });
  }

  /**
   * @function storeBulkOfflineEvents
   * This method is used to store offline events in bulk
   */
  public storeBulkOfflineEvents(offlineEvents) {
    return this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS).then((result) => {
      const items = result.value.data || [];
      return this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS, {
        data: items.concat(offlineEvents)
      });
    }).catch(() => {
      return this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS, {
        data: offlineEvents
      });
    });
  }

  /**
   * @function overwriteCollectionPerformance
   * This method is used to update collection data
   */
  public overwriteCollectionPerformance(contextParams) {
    const endpoint = `${this.performanceNamespace}/perf-update`;
    return this.httpService.put(endpoint, contextParams);
  }

  /**
   * @function fetchAssessmentPerformanceBySession
   * This method is used to fetch assessment performance by session
   */
  public fetchAssessmentPerformanceBySession(classId, assessmentId, sessionId, userId, startDate, endDate) {
    if (this.utilsService.isNetworkOnline()) {
      const endpoint = `${this.performanceNamespace}/dca/class/${classId}/assessment/${assessmentId}/session/${sessionId}/performance`;
      const params = { userId };
      return this.httpService.get(endpoint, params).then((response) => {
        return response.data.content;
      });
    } else {
      const collectionType = 'assessment';
      const performanceDatabaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_CONTENT_PERFORMANCE, {
        classId,
        contentType: collectionType
      });
      return Promise.all([
        this.databaseService.getDocument(performanceDatabaseKey).catch((e) => e),
        this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS).catch((e) => e)
      ]).then((result) => {
        const onlinePerformances = result[0].value;
        const offlineEventsPerformances = result[1].value?.data || [];
        const studentLevelEventss = groupByTwoColumns(offlineEventsPerformances, 'payload', 'student_id');
        const transformedOfflineEvents = this.transformOfflineEventsToActivityPayload(studentLevelEventss, true);
        const transformedOnlinePerformances = this.findActivitiesPerformance(onlinePerformances, {
          collectionType,
          startDate,
          endDate,
          userId,
          collectionIds: [assessmentId]
        });
        const studentAllPerformances = transformedOfflineEvents.concat(transformedOnlinePerformances);
        const groupedUserActivities = groupUserActivities(studentAllPerformances, 'userId');
        const activitiesPerformance = []
        const studentPerformances = groupedUserActivities[userId];
        let contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
          const eventName = collectionType === ASSESSMENT ? SYNC_EVENTS.CA_UPDATE_ASSESSMENT_DATA : SYNC_EVENTS.CA_UPDATE_COLLECTION_DATA;
          return studentPerformance.classId === classId
            && studentPerformance.collectionId === assessmentId
            && studentPerformance.lastSessionId === sessionId
            && studentPerformance.eventName === eventName;
        });
        if (!contentUpdateEvents?.length) {
          contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
            return studentPerformance.classId === classId
              && studentPerformance.collectionId === assessmentId
              && studentPerformance.lastSessionId === sessionId
              && studentPerformance.eventName === SYNC_EVENTS.CA_ADD_DATA;
          });
          if (!contentUpdateEvents?.length) {
            contentUpdateEvents = studentPerformances.filter((studentPerformance) => {
              return studentPerformance.collectionId === assessmentId && !studentPerformance.eventName;
            });
          }
        }
        if (contentUpdateEvents && contentUpdateEvents.length) {
          activitiesPerformance.push({
            activity: contentUpdateEvents[0],
            userId
          });
        }
        return this.transformActivityToContentPayload(activitiesPerformance, collectionType);
      });
    }
  }

  /**
   * @function updateAssessmentOfflineScoreUpdate
   * This method is used to update assessment offline score update
   */
  public updateAssessmentOfflineScoreUpdate(contextParams) {
    if (this.utilsService.isNetworkOnline()) {
      const endpoint = `${this.performanceNamespace}/score`;
      /* Note: This key is not required for online upload */
      if (contextParams.conducted_on) {
        delete contextParams.conducted_on;
      }
      return this.httpService.put(endpoint, contextParams);
    } else {
      return this.storeOfflineEvents(SYNC_EVENTS.CA_UPDATE_ASSESSMENT_DATA, contextParams);
    }
  }

  /*
   * @function getStreakStats
   * This method is used to get the streakstats
   */
  public getStreakStats(params) {
    const endpoint = `${this.portfolioNamespace}/stats/class/streakcompetencies`;
    return this.httpService.post<StreakStatsModel>(endpoint, params).then((res) => {
      const streakStats = res.data;
      return streakStats.data.map(streakStatsPayload => {
        return this.normalizeStreakStats(streakStatsPayload);
      });
    });
  }

  /*
   * Normalize the response from CurrentLocation endpoint
   * @param streakPayload is the endpoint response in JSON format
   * @returns {StreakStatsModel} a class streak stats model object
   */
  private normalizeStreakStats(streakPayload) {
    const streakStats: StreakStatsModel = {
      classId: streakPayload.class_id,
      streakCompetencies: streakPayload.streak_competencies
    };
    return streakStats;
  }

  /**
   * @function fetchStudentCompetencies
   * Method to fetch students competencies
   */
  public fetchStudentCompetencies(param) {
    const endpoint = `${this.portfolioNamespace}/class/user/competency/report`;
    return this.httpService.get<StudentOverallCompetenciesModel>(endpoint, param).then((response) => {
      return this.normalizeStudentReportCompetencies(response.data);
    });
  }

  /**
   * @function normalizeStudentReportCompetencies
   * Method to normalize students report competencies
   */
  public normalizeStudentReportCompetencies(payload) {
    const newCompetenies = this.normalizeStudentCompetencies(payload.new);
    return {
      diagnostics: this.normalizeStudentCompetencies(payload.diagnostic),
      reinforced: this.normalizeStudentCompetencies(payload.reinforced),
      mastered: this.masteredCompetencies(newCompetenies),
      growth: this.growthCompetencies(newCompetenies),
      concern: this.areaConcern(newCompetenies),
      inprogress: this.assessmentInProgress(newCompetenies)
    } as StudentOverallCompetenciesModel;
  }

  /**
   * @function normalizeStudentCompetencies
   * Method to normalize student competencies
   */
  public normalizeStudentCompetencies(payload) {
    return payload.map((competency) => {
      const studentCompetency: StudentClassReportModel = {
        reportDate: competency.report_date,
        code: competency.code,
        title: competency.title,
        description: competency.description,
        score: competency && competency.score !== null ? Math.round(competency.score) : null,
        status: competency.status,
        tries: competency.tries,
        assessmentId: competency.assessment_id
      };
      return studentCompetency;
    });
  }

  /**
   * @function masteredCompetencies
   * Method to get masteredCompetencies
   */
  public masteredCompetencies(newCompetenies) {
    return newCompetenies.filter(item => item.score >= 80 && item.status === 'complete');
  }

  /**
   * @function growthCompetencies
   * Method to get growthCompetencies
   */
  public growthCompetencies(newCompetenies) {
    return newCompetenies.filter(item => item.score <= 79 && item.score >= 51 && item.score !== null);
  }

  /**
   * @function areaConcern
   * Method to get areaConcern
   */
  public areaConcern(newCompetenies) {
    return newCompetenies.filter(item => item.score < 51 && item.score !== null);
  }

  /**
   * @function assessmentInProgress
   * Method to get assessmentInProgress
   */
  public assessmentInProgress(newCompetenies) {
    return newCompetenies.filter(item => item.score === null && item.status === 'inprogress');
  }

  /**
   * @function getSuggestionStats
   * This method is used to get the suggetionstats
   */
  public getSuggestionStats(params) {
    const endpoint = `${this.portfolioNamespace}/stats/class/suggestions`;
    return this.httpService.post<SuggestionStatsModel>(endpoint, params).then((res) => {
      const suggestionStats = res.data;
      return suggestionStats.data.map(suggestionsStatsPayload => {
        return this.normalizeSuggestionStats(suggestionsStatsPayload);
      });
    });
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param suggestionStats is the endpoint response in JSON format
   * @returns {SuggestionStatsModel} a class suggestion stats model object
   */
  private normalizeSuggestionStats(suggestionStats) {
    const suggestions: SuggestionStatsModel = {
      classId: suggestionStats.class_id,
      acceptedSuggestions: suggestionStats.accepted_suggestions,
      totalSuggestions: suggestionStats.total_suggestions
    };
    return suggestions;
  }

  /**
   * @function fetchMasteredStats
   * This method is used to fetch materedStats
   */
  public fetchMasteredStats(params) {
    const endpoint = `${this.portfolioNamespace}/stats/class/competency/greaterthan90`;
    return this.httpService.post<MasteredStatsModel>(endpoint, params).then((res) => {
      const masteredStats = res.data;
      return masteredStats.data.map(masteredStatsPayload => {
        return this.normalizeMasteredStats(masteredStatsPayload);
      });
    });
  }

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param masteredPayload is the endpoint response in JSON format
   * @returns {MasteredStatsModel} a class mastered stats model object
   */
  private normalizeMasteredStats(masteredPayload) {
    const masteredStats: MasteredStatsModel = {
      classId: masteredPayload.class_id,
      completedCompetencies: masteredPayload.completed_competencies
    };
    return masteredStats;
  }

  /**
   * @function fetchStudentDatewiseTimespent
   * Method to fetch students date wise timespent
   */
  public fetchStudentDatewiseTimespent(param) {
    const endpoint = `${this.portfolioNamespace}/class/user/timespent`;
    return this.httpService.get<StudentDatewiseTimespentModel>(endpoint, param).then((response) => {
      return this.normalizeStudentsTimespentReport(response.data);
    });
  }

  /**
   * @function normalizeStudentsTimespentReport
   * Method to normalize students time spent report data
   */
  private normalizeStudentsTimespentReport(payload) {
    const studentsTimespentData = payload.report;
    const serializedStudentsTimespentReportData: Array<StudentDatewiseTimespentModel> =
      studentsTimespentData.map(timespentData => {
        const normalizedTimespentData: Array<StudentDatewiseDataModel> = this.serializeTimespentData(
          timespentData.data
        );
        return {
          reportDate: timespentData.report_date,
          data: normalizedTimespentData
        } as StudentDatewiseTimespentModel;
      });
    return serializedStudentsTimespentReportData;
  }

  /**
   * @function serializeTimespentData
   * Method to serialize timespent data
   */
  private serializeTimespentData(timespentData) {
    return timespentData.map(data => {
      return {
        id: data.id,
        title: data.title,
        format: data.format,
        totalTimespent: data.total_timespent,
        sessions: data.sessions,
        competencies: data.competencies,
        score: data.score,
        source: data.source,
        status: data.status,
        performance: this.normalizePerformanceData(data)
      } as StudentDatewiseDataModel;
    });
  }

  /**
   * @function normalizePerformanceData
   * Method to normalize performance data
   */
  private normalizePerformanceData(payload) {
    const performance: PerformancesModel = {
      score: payload.score,
      timeSpent: payload.total_timespent,
      collectionId: payload.id,
      attempts: payload.sessions.length || null
    };
    return performance;
  }

  /**
   * @function storeMilstonePerformance
   * This method is used to store milestone performance
   */
  public storeMilstonePerformance(classId, courseId, fwCode, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.MILESTONE_PERFORMANCE, {
      classId,
      courseId,
      fwCode
    });
    const normalizePerformance = this.normalizePerformance(payload.content, CONTENT_TYPES.MILESTONE);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }

  /**
   * @function storeStudentMilestonePerformance
   * This method is used to store student milestone performance
   */
  public storeStudentMilestonePerformance(classId, courseId, fwCode, studentId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.STUDENT_MILESTONE_PERFORMANCE, {
      classId,
      courseId,
      fwCode,
      studentId
    });
    const normalizePerformance = this.normalizePerformance(payload.content, CONTENT_TYPES.MILESTONE);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }

  /**
   * @function storeMilestoneLessonPerformance
   * This method is used to store milestone lesson performance
   */
  public storeMilestoneLessonPerformance(classId, courseId, fwCode, milestoneId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.MILESTONE_LESSON_PERFORMANCE, {
      classId,
      courseId,
      fwCode,
      milestoneId
    });
    const normalizePerformance = this.normalizePerformance(payload.content, CONTENT_TYPES.LESSON);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }

  /**
   * @function storeUnitsPerformance
   * This method is used to store units performance
   */
  public storeUnitsPerformance(classId, courseId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.UNITS_PERFORMANCE, {
      classId,
      courseId
    });
    const normalizePerformance = this.normalizePerformance(payload.content, CONTENT_TYPES.MILESTONE);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }

  /**
   * @function storeStudentUnitsPerformance
   * This method is used to student store units performance
   */
  public storeStudentUnitsPerformance(classId, courseId, studentId, payload) {

    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.STUDENT_UNITS_PERFORMANCE, {
      classId,
      courseId,
      studentId
    });
    const normalizePerformance = this.normalizePerformance(payload.content, CONTENT_TYPES.UNIT);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }

  /**
   * @function storeClassPerformance
   * This method is used to stoe the class performance
   */
  public storeClassPerformance(payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASSES_PERFORMANCE, {});
    const normalizePerformance = this.normalizeClassPerformanceUsageData(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }
}