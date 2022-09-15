import { Injectable } from '@angular/core';
import { ReportProvider } from '@app/providers/apis/report/report';
import { CONTENT_TYPES } from '@constants/helper-constants';
import { CaAggregratePerformanceModel } from '@models/performance/performance';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import {
  aggregateClassActivityPerformanceSummaryItems,
  aggregateMilestonePerformanceScore,
  aggregateMilestonePerformanceTimeSpent,
  aggregateOfflineClassActivityPerformanceSummaryItems,
  calculateAverageByItem,
  calculateSumByItem,
  findNumberOfStudentsByItem,
  getCAContentIds,
  getMaxDateOfActivity,
  getMinDateOfActivity
} from '@utils/performance';
import axios from 'axios';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private performanceProvider: PerformanceProvider,
    private reportProvider:ReportProvider
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchUnitsPerformance
   * This method is used to fetch unit performance
   */
  public fetchUnitsPerformance(reqParams) {
    return this.performanceProvider.fetchUnitsPerformance(
      reqParams.classId,
      reqParams.courseId,
      reqParams.studentList,
      reqParams.studentId
    ).then((unitPerformanceResult) => {
      const unitList = reqParams.units;
      const isCourseMap = true;
      this.setPerformance(unitList, unitPerformanceResult, CONTENT_TYPES.UNIT, reqParams.isTeacherView, isCourseMap);
    });
  }

  /**
   * @function getUnitsPerformance
   * This method is used to fetch unit performance
   */
  public getUnitsPerformance(reqParams) {
    return this.performanceProvider.fetchUnitsPerformance(
      reqParams.classId,
      reqParams.courseId,
      reqParams.studentList,
      reqParams.studentId
    );
  }

  /**
   * @function fetchUserSessionIds
   * This Method is used to get list of session ids
   */
  public fetchUserSessionIds(contentType, assessmentId, context, openSession?) {
    return this.performanceProvider.fetchUserSessionIds(contentType, assessmentId, context, openSession);
  }

  /**
   * @function fetchUnitLessonPerformance
   * This method is used to fetch lesson performance
   */
  public fetchUnitLessonPerformance(reqParams) {
    this.performanceProvider.fetchUnitLessonPerformance(
      reqParams.classId,
      reqParams.courseId,
      reqParams.unitId,
      reqParams.isTeacherView,
      reqParams.studentList,
      reqParams.studentId
    ).then((lessonPerformanceResult) => {
      const lessons = reqParams.lessons;
      const isCourseMap = true;
      this.setPerformance(lessons, lessonPerformanceResult, CONTENT_TYPES.LESSON, reqParams.isTeacherView, isCourseMap);
    });
  }

  /**
   * @function getUnitLessonPerformance
   * This method is used to fetch unit lesson performance
   */
  public getUnitLessonPerformance(reqParams) {
    return this.performanceProvider.fetchUnitLessonPerformance(
      reqParams.classId,
      reqParams.courseId,
      reqParams.unitId,
      reqParams.isTeacherView,
      reqParams.studentList
    );
  }

  /**
   * @function fetchCollectionPerformance
   * This method is used to fetch collection performance
   */
  public fetchCollectionPerformance(params) {
    const unitCollections = params.collections;
    const assessments = unitCollections.filter((item) => item.format === CONTENT_TYPES.ASSESSMENT || item.format === CONTENT_TYPES.OFFLINE_ACTIVITY);
    const collections = unitCollections.filter((item) => item.format === CONTENT_TYPES.COLLECTION);
    const assessmentContext = {
      classId: params.classId,
      courseId: params.courseId,
      unitId: params.unitId,
      lessonId: params.lessonId,
      collections: assessments,
      contentType: CONTENT_TYPES.ASSESSMENT,
      isTeacherView: params.isTeacherView,
      studentList: params.studentList,
      studentId: params.studentId
    };
    const collectionContext = {
      classId: params.classId,
      courseId: params.courseId,
      unitId: params.unitId,
      lessonId: params.lessonId,
      collections,
      contentType: CONTENT_TYPES.COLLECTION,
      isTeacherView: params.isTeacherView,
      studentList: params.studentList,
      studentId: params.studentId
    };
    this.fetchAssessmentCollectionPerformance(assessmentContext);
    this.fetchAssessmentCollectionPerformance(collectionContext);
  }

  /**
   * @function fetchMilestonePerformance
   * This method is get milestone performance
   */
  public fetchMilestonePerformance(params) {
    this.performanceProvider.fetchMilestonePerformance(
      params.classId,
      params.courseId,
      params.fwCode,
      params.studentList,
      params.studentId
    ).then((milestonePerformanceResult) => {
      const milestones = params.milestones;
      this.setPerformance(milestones, milestonePerformanceResult, CONTENT_TYPES.MILESTONE, params.isTeacherView);
    });
  }

  /**
   * @function getMilestonePerformance
   * This method is get milestone performance
   */
  public getMilestonePerformance(params) {
    return this.performanceProvider.fetchMilestonePerformance(
      params.classId,
      params.courseId,
      params.fwCode,
      params.studentList,
      params.studentId
    );
  }

  /**
   * @function fetchMilestoneLessonPerformance
   * This method is get milestone lesson performance
   */
  public fetchMilestoneLessonPerformance(reqParams) {
    this.performanceProvider.fetchMilestoneLessonPerformance(
      reqParams.classId,
      reqParams.courseId,
      reqParams.fwCode,
      reqParams.milestoneId,
      reqParams.studentList,
      reqParams.studentId
    ).then((lessonPerformanceResult) => {
      const lessons = reqParams.lessons;
      this.setPerformance(lessons, lessonPerformanceResult, CONTENT_TYPES.LESSON, reqParams.isTeacherView);
    });
  }

  /**
   * @function getMilestoneLessonPerformance
   * This method is get milestone performance
   */
  public getMilestoneLessonPerformance(reqParams) {
    return this.performanceProvider.fetchMilestoneLessonPerformance(
      reqParams.classId,
      reqParams.courseId,
      reqParams.fwCode,
      reqParams.milestoneId,
      reqParams.studentList,
      reqParams.studentId
    );
  }

  /**
   * @function fetchClassActivitiesPerformanceSummary
   * This method is used to fetch class activities performance
   */
  public fetchClassActivitiesPerformanceSummary(classId, classActivities, startDate, endDate) {
    return new Promise((resolve, reject) => {
      const assessmentIds = getCAContentIds(classActivities, CONTENT_TYPES.ASSESSMENT);
      const collectionIds = getCAContentIds(classActivities, CONTENT_TYPES.COLLECTION);
      const offlineIds = getCAContentIds(classActivities, CONTENT_TYPES.OFFLINE_ACTIVITY);
      const minStartDate = getMinDateOfActivity(classActivities) || startDate;
      const maxEndDate = getMaxDateOfActivity(classActivities) || endDate;
      return axios.all<{}>([
        assessmentIds.length ? this.fetchCaPerformanceByContentType(classId, {
          collectionIds: assessmentIds,
          collectionType: CONTENT_TYPES.ASSESSMENT,
          startDate: minStartDate,
          endDate: maxEndDate
        }) : [],
        collectionIds.length ? this.fetchCaPerformanceByContentType(classId, {
          collectionIds,
          collectionType: CONTENT_TYPES.COLLECTION,
          startDate: minStartDate,
          endDate: maxEndDate
        }) : [],
        offlineIds.length ? this.fetchCaPerformanceByContentType(classId, {
          collectionType: CONTENT_TYPES.OFFLINE_ACTIVITY,
          dcaContentIds: offlineIds
        }) : []
      ]).then(axios.spread((assessmentActivityPerformance: Array<CaAggregratePerformanceModel> = [], collectionActivityPerformance: Array<CaAggregratePerformanceModel> = [], offlineActivityPerformance: Array<CaAggregratePerformanceModel> = []) => {
        const performances = assessmentActivityPerformance.concat(collectionActivityPerformance).concat(offlineActivityPerformance);
        performances.forEach((performance) => {
          let classActivity = classActivities
            .filter((activity) => this.inBetweenDate(activity, performance))
            .filter((item) => item.contentId === performance.collectionPerformanceSummary.collectionId)[0];
          classActivity = classActivity || classActivities.find((item) => item.id === performance.collectionPerformanceSummary.collectionId) || null;
          if (classActivity) {
            const classActivityIndex = classActivities.indexOf(classActivity);
            const performanceData = performance.collectionPerformanceSummary;
            performanceData.hasStarted = true;
            classActivities[classActivityIndex].collection.performance = performanceData;
          }
        });
        resolve(classActivities);
      }), reject);
    });
  }

  /**
   * @function fetchCaPerformanceByContentType
   * This method is used to fetch ca assement collection performance
   */
  public fetchCaPerformanceByContentType(classId, contextParams, doAggregate = true) {
    return this.performanceProvider.fetchClassActivitiesPerformanceSummary(classId, contextParams).then((performanceActivities) => {
      return doAggregate
        ? contextParams.collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY
          ? aggregateOfflineClassActivityPerformanceSummaryItems(performanceActivities)
          : aggregateClassActivityPerformanceSummaryItems(performanceActivities)
        : performanceActivities;
    });
  }

  /**
   * @function inBetweenDate
   * This method is used to get inbetween date
   */
  public inBetweenDate(activity, performance) {
    const activationDate = activity.activationDate || activity.dcaAddedDate;
    const endDate = moment(activity.endDate);
    const playedDate = performance.activationDate;
    const isStartDateSameOrBefore = moment(playedDate).isSameOrBefore(
      activationDate,
      'day'
    );
    const isEndDateSameOrAfter = endDate.isSameOrAfter(playedDate, 'day');
    return (
      (isStartDateSameOrBefore || isEndDateSameOrAfter) &&
      activity.contentId ===
      performance.collectionPerformanceSummary.collectionId &&
      !activity.performance
    );
  }

  /**
   * @function fetchAssessmentCollectionPerformance
   * This method is used to fetch assessment/collection performance
   */
  public fetchAssessmentCollectionPerformance(params) {
    this.performanceProvider.fetchUnitCollectionPerformance(
      params.classId,
      params.courseId,
      params.unitId,
      params.lessonId,
      params.contentType,
      params.isTeacherView,
      params.studentList,
      params.studentId
    ).then((performanceResponse) => {
      const collections = params.collections;
      if (collections && collections.length) {
        this.setPerformance(collections, performanceResponse, params.contentType, params.isTeacherView, true);
      }
    });
  }

  /**
   * @function getCollectionPerformance
   * This method is get collection performance
   */
  public getCollectionPerformance(params) {
    return this.performanceProvider.fetchUnitCollectionPerformance(
      params.classId,
      params.courseId,
      params.unitId,
      params.lessonId,
      params.contentType,
      params.isTeacherView,
      params.studentList,
      params.studentId
    );
  }

  /**
   * @function getMilestonesCollectionPerformance
   * This method is get collection performance
   */
  public getMilestonesCollectionPerformance(params) {
    return this.performanceProvider.fetchMilestonesCollectionPerformance(
      params.classId,
      params.courseId,
      params.unitId,
      params.lessonId,
      params.contentType,
      params.studentList,
      params.contentId
    );
  }

  /**
   * @function setPerformance
   * This method is used to set performance based on role type
   */
  public setPerformance(payload, performances, contentType, isTeacherView, isCourseMap?) {
    if (isTeacherView) {
      this.setPerformanceForTeacher(payload, performances, contentType, isCourseMap);
    } else {
      this.setPerformanceForStudent(payload, performances, contentType);
    }
  }

  /**
   * @function setPerformanceForTeacher
   * This method is used to set performance for teacher view
   */
  public setPerformanceForTeacher(payload, performances, contentType, isCourseMap = false) {
    const idKey = `${contentType}Id`;
    payload.map((item) => {
      const contentId = item[idKey] || item.id;
      const itemPerformance = performances.filter((performanceResult) => (performanceResult[idKey] === contentId));
      const performanceContent = isCourseMap ?
        this.getUnitPerformanceContent(contentId, itemPerformance, contentType) :
        this.getMilestonePerformanceContent(contentId, itemPerformance, contentType);
      if (performanceContent) {
        item.performance = performanceContent;
      }
    });
  }

  /**
   * @function setPerformanceForStudent
   * This method is used to set performance for student
   */
  public setPerformanceForStudent(payload, performances, contentType) {
    const idKey = `${contentType}Id`;
    payload.map((item) => {
      const contenId = item[idKey] || item.id;
      const itemPerformance = performances.find(
        (performance) => performance[idKey] === contenId
      );
      if (itemPerformance) {
        item.performance = itemPerformance.performance;
      }
    });
  }

  /**
   * @function getUnitPerformanceContent
   * This method is get unit performance content
   */
  public getUnitPerformanceContent(id, studentPerformanceData = [], type) {
    if (!studentPerformanceData.length) {
      return null;
    }
    const scoreInPercentage = calculateAverageByItem(
      id,
      'scoreInPercentage',
      studentPerformanceData
    );
    const timespent = calculateSumByItem(
      id,
      'timespent',
      studentPerformanceData
    );
    const studentsCount = findNumberOfStudentsByItem(
      id,
      studentPerformanceData,
      type
    );
    return {
      studentsCount,
      scoreInPercentage,
      timespent
    };
  }

  /**
   * @function getMilestonePerformanceContent
   * This method is get milestone performance content
   */
  public getMilestonePerformanceContent(id, studentPerformanceData = [], type) {
    if (!studentPerformanceData.length) {
      return null;
    }
    const averageScore = aggregateMilestonePerformanceScore(
      studentPerformanceData
    );
    const timespent = aggregateMilestonePerformanceTimeSpent(
      studentPerformanceData
    );
    const studentsCount = findNumberOfStudentsByItem(
      id,
      studentPerformanceData,
      type
    );
    return {
      studentsCount,
      averageScore,
      timespent
    };
  }

  /**
   * @function updateCollectionOfflinePerformance
   * This method is update collection offline performance
   */
  public updateCollectionOfflinePerformance(contextParams) {
    return this.performanceProvider.updateCollectionOfflinePerformance(contextParams);
  }

  /**
   *  @function overwriteCollectionPerformance
   * Method to overwrite collection performance
   */
  public overwriteCollectionPerformance(performanceData) {
    return this.performanceProvider.overwriteCollectionPerformance(performanceData);
  }

  /**
   * @function fetchAssessmentPerformanceBySession
   * This method is used to fetch assessment performance by session/userid
   */
  public fetchAssessmentPerformanceBySession(classId, assessmentId, sessionId, userId, startDate, endDate) {
    return this.performanceProvider.fetchAssessmentPerformanceBySession(classId, assessmentId, sessionId, userId, startDate, endDate);
  }

  /**
   * @function updateAssessmentOfflineScoreUpdate
   * This method is used to update offline score for assessment
   */
  public updateAssessmentOfflineScoreUpdate(contextParams) {
    return this.performanceProvider.updateAssessmentOfflineScoreUpdate(contextParams);
  }

  /**
   * @function serializeOfflineEvents
   * This method is used to serialize offline events
   */
  public serializeOfflineEvents(eventName, context, payload) {
    return this.performanceProvider.serializeOfflineEvents(eventName, context, payload);
  }

  /**
   * @function storeOfflineEvents
   * This method is used to store offline events in bulk
   */
  public storeBulkOfflineEvents(offlineEvents) {
    return this.performanceProvider.storeBulkOfflineEvents(offlineEvents);
  }

  /*
   * @function getStudentProgressReport
   * This method is used to get student progress report
   */
  public getStudentProgressReport(params: any) {
    const { timespentParams, summaryParams, statsParams, timespentDatewiseParams } = this.requestParam(params);
    return axios.all([
      this.performanceProvider.fetchStudentCompetencies(timespentParams),
      this.reportProvider.fetchStudentsSummaryReport(params.classId, summaryParams) as any,
      this.reportProvider.fetchStudentsTimespentSummaryreport(timespentParams),
      this.performanceProvider.getSuggestionStats(statsParams),
      this.performanceProvider.getStreakStats(statsParams),
      this.performanceProvider.fetchMasteredStats(statsParams),
      this.performanceProvider.fetchStudentDatewiseTimespent(timespentDatewiseParams)
    ]).then(axios.spread((studentReport, summaryData, classMembersTimespent, suggestionStats,
      streakStats, masteredStats, timespentDatewiseData) => {
      return {
        studentReport,
        summaryData,
        classMembersTimespent,
        suggestionStats,
        streakStats,
        masteredStats,
        timespentDatewiseData
      };
    }));
  }

  /*
   * @function requestParam
   * This method is used to get the params
   */
  public requestParam(params) {
    return {
      timespentParams: {
        classId: params.classId,
        userId: params.userId,
        to: params.endDate,
        from: params.startDate ? params.startDate : params.endDate,
        subjectCode: params.subjectCode
      },
      timespentDatewiseParams: {
        classId: params.classId,
        userId: params.userId,
        to: params.endDate,
        from: params.startDate ? params.startDate : params.endDate
      },
      summaryParams: {
        fromDate: params.startDate ? params.startDate : params.endDate,
        toDate: params.endDate,
        subjectCode: params.subjectCode,
        userId: params.userId
      },
      statsParams: {
        userId: params.userId,
        classIds: [params.classId],
        to: params.endDate,
        from: params.startDate ? params.startDate : params.endDate,
      }
    };
  }
}
