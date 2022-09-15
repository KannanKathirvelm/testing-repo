import { Injectable } from '@angular/core';
import {
  BackgroundTask,
  BackgroundTaskJob
} from '@app/background-workers/models/background-task.model';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { DatabaseService } from '@providers/service/database.service';
import { OfflineApiService } from '@providers/service/offline/offline-api.service';
import { SessionService } from '@providers/service/session/session.service';
import { environment } from '@environment/environment';
import { ClassModel } from '@app/models/class/class';
import { CourseProvider } from '../apis/course/course';
import { ClassProvider } from '../apis/class/class';
import { ClassActivityProvider } from '../apis/class-activity/class-activity';
import moment from 'moment';
import { CONTENT_TYPES } from '@app/constants/helper-constants';
import { PerformanceProvider } from '../apis/performance/performance';
import {
  getCAContentIds,
  getMaxDateOfActivity,
  getMinDateOfActivity
} from '@app/utils/performance';
import { CompetencyProvider } from '../apis/competency/competency';
import { TaxonomyProvider } from '../apis/taxonomy/taxonomy';
import { getCategoryCodeFromSubjectId } from '@app/utils/global';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { SYNC_EVENTS } from '@app/constants/events-constants';
import { MilestoneProvider } from '../apis/milestone/milestone';
import { Unit0Provider } from '../apis/unit0/unit0';
import { LocationProvider } from '../apis/location/location';
@Injectable({
  providedIn: 'root'
})
export class SyncService {
  public offlineUploadSubject: BehaviorSubject<string>;
  public offlineUpload: Observable<string>;
  private readonly ACTIVITIES_PERIOD_DAYS = 14;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private databaseService: DatabaseService,
    private offlineApiService: OfflineApiService,
    private sessionService: SessionService,
    private courserProvider: CourseProvider,
    private classProvider: ClassProvider,
    private classActivityProvider: ClassActivityProvider,
    private performanceProvider: PerformanceProvider,
    private competencyProvider: CompetencyProvider,
    private taxonomyProvider: TaxonomyProvider,
    private milestoneProvider: MilestoneProvider,
    private unit0: Unit0Provider,
    private locationProvider: LocationProvider
  ) {
    this.offlineUploadSubject = new BehaviorSubject<string>(null);
    this.offlineUpload = this.offlineUploadSubject.asObservable();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function processOfflineEvents
   * This Method is used to check and process offline stored events
   */
  public processOfflineEvents() {
    const userSession = this.sessionService.userSession;
    const userId = userSession.user_id;
    const tenantId = userSession.tenant?.tenantId;
    const fileName = `${userId}_${tenantId}_${new Date().getTime()}.json`;
    this.databaseService
      .getDocument(DOCUMENT_KEYS.OFFLINE_DATA_EVENTS)
      .then((result) => {
        const offlineEvents = result.value;
        const blob = new Blob(
          [JSON.stringify(this.removeAdditionalAttributes(offlineEvents))],
          { type: 'text/plain' }
        );
        this.offlineApiService
          .uploadOfflineEvents(blob, fileName)
          .then(async (response) => {
            const uploadId = response.headers.location;
            await this.databaseService.upsertDocument(
              DOCUMENT_KEYS.LAST_UPLOAD_ID,
              uploadId
            );
            this.offlineUploadSubject.next(uploadId);
            this.databaseService.deleteDocument(result._id, result._rev);
          });
      });
  }

  /**
   * @function syncClassDataList
   * This method is used to sync the class data list
   */
  public syncClassDataList(
    classDetails: ClassModel,
    initiateClassActivitiesJob
  ) {
    const classId = classDetails.id;
    const taskId = `class-${classId}-sync`;
    const courseId = classDetails.courseId;
    const secondaryClasses = classDetails.setting
      ? classDetails.setting['secondary.classes']
      : null;
    const secondaryClassesList = secondaryClasses?.list || [];
    const jobs = [];
    if (courseId) {
      jobs.push(this.generateClassCourseJob(taskId, courseId));
    }
    if (secondaryClassesList.length) {
      jobs.push(
        this.getSecondaryClasses(taskId, classId, secondaryClassesList)
      );
    }
    jobs.push(this.generateClassMembersJob(taskId, classId));
    jobs.push(this.getOverAllClassActivityPerformance(taskId, classId));
    if (initiateClassActivitiesJob) {
      jobs.push(
        this.generateClassActivitiesJob(taskId, classId, secondaryClassesList)
      );
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function syncClassActivities
   * This method is used to sync activities
   */
  public syncClassActivities(classDetails: ClassModel) {
    const classId = classDetails.id;
    const taskId = `class-${classId}-sync`;
    const secondaryClasses = classDetails.setting
      ? classDetails.setting['secondary.classes']
      : null;
    const secondaryClassesList = secondaryClasses?.list || [];
    const jobs = [
      this.generateClassActivitiesJob(taskId, classId, secondaryClassesList)
    ];
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function syncClassActivitiesPerformance
   * This method is used to sync class activities performance
   */
  public syncClassActivitiesPerformance(classId: string, classActivities) {
    const taskId = `class-${classId}-activites-performance-sync`;
    const jobs = this.generateClassActivitiesPerformanceJob(
      taskId,
      classActivities
    );
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateClassActivitiesPerformanceJob
   * This method is used to generate the class activities performance job
   */
  private generateClassActivitiesPerformanceJob(taskId, payload) {
    const jobs = [];
    const classActivities =
      this.classActivityProvider.normalizeClassAllContents(
        payload.class_contents
      );
    const uniqueClassIds = classActivities
      .map((item) => item.classId)
      .filter((item, index, array) => index === array.indexOf(item));
    uniqueClassIds.forEach((classId) => {
      const activitiesByClass = classActivities.filter(
        (classActivity) => classActivity.classId === classId
      );
      const assessmentIds = getCAContentIds(
        activitiesByClass,
        CONTENT_TYPES.ASSESSMENT
      );
      const collectionIds = getCAContentIds(
        activitiesByClass,
        CONTENT_TYPES.COLLECTION
      );
      const offlineIds = getCAContentIds(
        activitiesByClass,
        CONTENT_TYPES.OFFLINE_ACTIVITY
      );
      const minStartDate = getMinDateOfActivity(activitiesByClass);
      const maxEndDate = getMaxDateOfActivity(activitiesByClass);
      if (assessmentIds.length) {
        jobs.push(
          this.generateCAPerformanceByContentType(taskId, classId, {
            collectionIds: assessmentIds,
            collectionType: CONTENT_TYPES.ASSESSMENT,
            startDate: minStartDate,
            endDate: maxEndDate
          })
        );
      }
      if (collectionIds.length) {
        jobs.push(
          this.generateCAPerformanceByContentType(taskId, classId, {
            collectionIds,
            collectionType: CONTENT_TYPES.COLLECTION,
            startDate: minStartDate,
            endDate: maxEndDate
          })
        );
      }
      if (offlineIds.length) {
        jobs.push(
          this.generateCAPerformanceByContentType(taskId, classId, {
            dcaContentIds: offlineIds,
            collectionType: CONTENT_TYPES.OFFLINE_ACTIVITY
          })
        );
      }
    });
    return jobs;
  }

  /**
   * @function generateCAPerformanceByContentType
   * This method is used to generate the class activities performance by content type
   */
  private generateCAPerformanceByContentType(taskId, classId, body) {
    const jobId = `${taskId}-class-${classId}-activities-${body.collectionType}-performance-sync`;
    const secondaryClassesJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.performanceProvider.getCAContentPerformanceSummaryAPIPath(
          classId
        )}`,
        method: 'POST',
        headers: this.getTokenHeaders(),
        body: JSON.stringify(body)
      },
      callback: (result) => {
        this.performanceProvider.storeCAPerformanceSummary(
          classId,
          body.collectionType,
          {
            [`${body.startDate}.${body.endDate}`]: result
          }
        );
      }
    };
    return secondaryClassesJob;
  }

  /**
   * @function generateClassCourseJob
   * This method is used to generate the class course job
   */
  private generateClassCourseJob(taskId, courseId): BackgroundTaskJob {
    const jobId = `${taskId}-course-sync`;
    const classCourseJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.courserProvider.getCourseAPIPath(courseId)}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.courserProvider.storeCourseDetails(courseId, result);
      }
    };
    return classCourseJob;
  }

  /**
   * @function generateClassMembersJob
   * This method is used to generate the class members job
   */
  private generateClassMembersJob(taskId, classId) {
    const jobId = `${taskId}-class-members-sync`;
    const classMembersJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.classProvider.getClassMembersAPIPath(classId)}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.classProvider.storeClassMembers(classId, result);
      }
    };
    return classMembersJob;
  }

  /**
   * @function getSecondaryClasses
   * This method is get the secondary classes
   */
  private getSecondaryClasses(taskId, classId, secondaryClasses) {
    const jobId = `${taskId}-secondary-classes-sync`;
    const body = JSON.stringify({
      classIds: secondaryClasses
    });
    const secondaryClassesJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.classProvider.getSecondaryClassesDetailsAPIPath()}`,
        method: 'POST',
        headers: this.getTokenHeaders(),
        body
      },
      callback: (result) => {
        this.classProvider.storeSecondaryClassDetails(classId, result);
      }
    };
    return secondaryClassesJob;
  }

  /**
   * @function generateClassActivitiesJob
   * This method generates the class activities job
   */
  private generateClassActivitiesJob(taskId, classId, secondaryClasses) {
    const jobId = `${taskId}-class-activities-sync`;
    const queryParams = this.getClassActivitiesRequestParams(secondaryClasses);
    const classActivitiesJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.classActivityProvider.getScheduledActivitiesAPIPath(classId)}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.classActivityProvider.storeClassActivties(classId, result);
      }
    };
    return classActivitiesJob;
  }

  /**
   * @function getOverAllClassActivityPerformance
   * This method gets the overall class activity performance
   */
  private getOverAllClassActivityPerformance(taskId, classId) {
    const jobId = `${taskId}-class-activity-performance-sync`;
    const classMembersJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.classActivityProvider.getCAPerformanceAPIPath(classId)}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.classActivityProvider.storeCAPerformance(classId, result);
      }
    };
    return classMembersJob;
  }

  /**
   * @function getClassActivitiesRequestParams
   * This method gets the  class activities to request params
   */
  private getClassActivitiesRequestParams(secondaryClasses) {
    const contentTypes = [
      CONTENT_TYPES.ASSESSMENT,
      CONTENT_TYPES.COLLECTION,
      CONTENT_TYPES.OFFLINE_ACTIVITY,
      CONTENT_TYPES.MEETING
    ];
    const dateOfPreviousWeek = moment()
      .subtract(this.ACTIVITIES_PERIOD_DAYS, 'd')
      .format('YYYY-MM-DD');
    const dateOfNextWeek = moment()
      .add(this.ACTIVITIES_PERIOD_DAYS, 'd')
      .format('YYYY-MM-DD');
    const requestParams = {
      content_type: contentTypes.join(','),
      secondaryClasses: secondaryClasses ? secondaryClasses.toString() : null,
      start_date: dateOfPreviousWeek,
      end_date: dateOfNextWeek
    };
    return requestParams;
  }

  /**
   * @function getTokenHeaders
   * This Method is used to get the token headers
   */
  public getTokenHeaders() {
    const token = this.sessionService.userSession.access_token;
    return {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    };
  }

  /**
   * @function syncCompetencyReport
   * This method is used to sync the compentency report list
   */
  public syncCompetencyReport(compentencyDetails) {
    const classId = compentencyDetails.id;
    const taskId = `class-${classId}-compentency-report`;
    const courseId = compentencyDetails.courseId;
    const jobs = [];
    if (courseId && classId) {
      jobs.push(this.generateCompetencyReportJob(taskId, classId, courseId));
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateCompetencyReportJob
   * This method generates the compentency report job
   */
  private generateCompetencyReportJob(taskId, classId, courseId) {
    const jobId = `${taskId}-compentency-report-sync`;
    const queryParams = {
      classId,
      courseId
    };
    const competencyReportJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.competencyProvider.getCompentencyReportAPIPath()}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.competencyProvider.storeCompetencyReport(classId, result);
      }
    };
    return competencyReportJob;
  }

  /**
   * @function syncTaxonomyCategories
   * This method is used to sync the taxonomy categories
   */
  public syncTaxonomyCategories(classDetails) {
    const classId = classDetails.id;
    const taskId = `class-${classId}-taxonomy-categories`;
    const jobs = [];
    jobs.push(this.generateTaxonomyCategoriesJob(taskId));
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateTaxonomyCategoriesJob
   * This method generates the compentency report job
   */
  private generateTaxonomyCategoriesJob(taskId) {
    const jobId = `${taskId}-taxonomy-categories-sync`;
    const taxonomyCategoriesJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.taxonomyProvider.fetchCategoriesAPIPath()}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.taxonomyProvider.storeCategories(result.subject_classifications);
      }
    };
    return taxonomyCategoriesJob;
  }

  /**
   * @function syncProficiencyStudentSubjectJob
   * This method is used to sync the proficiency students subject data
   */
  public syncProficiencyStudentSubjectJob(classDetails, categories) {
    const classId = classDetails.id;
    const frameworkId = classDetails.preference
      ? classDetails.preference.framework
      : null;
    const subjectId = classDetails.preference
      ? classDetails.preference.subject
      : null;
    const categoryId = subjectId
      ? getCategoryCodeFromSubjectId(subjectId)
      : null;
    const gradeBoundry = classDetails.gradeCurrent;
    const defaultCategory = categories.find((category) => {
      return category.code === categoryId;
    });
    const taskId = `class-${classId}-proficiency-student-subject`;
    const jobs = [];
    if (defaultCategory) {
      jobs.push(
        this.generateProficiencyStudentSubjectJob(taskId, defaultCategory)
      );
    }
    if (subjectId) {
      jobs.push(this.generateSubjectDomainTopicMetaDataJob(taskId, subjectId));
    }
    if (subjectId && frameworkId) {
      jobs.push(this.generateCrossWalkFWCJob(taskId, frameworkId, subjectId));
      jobs.push(
        this.generateGradesBySubjectJob(taskId, frameworkId, subjectId)
      );
    }
    if (gradeBoundry) {
      jobs.push(this.generateGradeBoundaryBySubjectJob(taskId, gradeBoundry));
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateProficiencyStudentSubjectJob
   * This method generates the proficiency student subject job
   */
  private generateProficiencyStudentSubjectJob(taskId, defaultCategory) {
    const queryParams = {
      classificationType: defaultCategory.id
    };
    const jobId = `${taskId}-proficiency-student-subject-sync`;
    const proficiencyStudentSubjectJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.taxonomyProvider.getSubjectsAPIPath()}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.taxonomyProvider.storeProficiencyStudentSubject(
          defaultCategory.id,
          result.subjects
        );
      }
    };
    return proficiencyStudentSubjectJob;
  }

  /**
   * @function generateSubjectDomainTopicMetaDataJob
   * This method generates the student subject domain topic meta data job
   */
  private generateSubjectDomainTopicMetaDataJob(taskId, subjectId) {
    const queryParams = {
      subject: subjectId
    };
    const jobId = `${taskId}-subject-domain-topic-meta-data-sync`;
    const subjectDomainTopicMetaDataJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.competencyProvider.getSubjectDomainTopicAPIPath()}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.competencyProvider.storeSubjectDomainTopicMetaData(
          subjectId,
          result
        );
      }
    };
    return subjectDomainTopicMetaDataJob;
  }

  /**
   * @function generateCrossWalkFWCJob
   * This method generates the cross walk FWC job
   */
  private generateCrossWalkFWCJob(taskId, frameworkCode, subjectCode) {
    const jobId = `${taskId}-cross-walk-fwc-sync`;
    const crossWalkFWCJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.taxonomyProvider.fetchCrossWalkFWCAPIPath(
          frameworkCode,
          subjectCode
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.taxonomyProvider.storeCrossWalkFWC(
          subjectCode,
          result.competencyMatrix
        );
      }
    };
    return crossWalkFWCJob;
  }

  /**
   * @function generateGradesBySubjectJob
   * This method generates the grades by subjects job
   */
  private generateGradesBySubjectJob(taskId, frameworkId, subjectId) {
    const jobId = `${taskId}-grades-by-subject-sync`;
    const queryParams = {
      subject: subjectId,
      fw_code: frameworkId
    };
    const gradesBySubject: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.taxonomyProvider.fetchGradesBySubjectAPIPath()}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.taxonomyProvider.storeGradesBySubject(subjectId, result);
      }
    };
    return gradesBySubject;
  }

  /**
   * @function generateGradeBoundaryBySubjectJob
   * This method generates the grade boundry by subjects job
   */
  private generateGradeBoundaryBySubjectJob(taskId, gradeBoundry) {
    const jobId = `${taskId}-grade-boundary-by-subject-sync`;
    const gradeBoundaryBySubject: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.taxonomyProvider.fetchDomainGradeBoundaryBySubjectIdAPIPath(
          gradeBoundry
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.taxonomyProvider.storeGradeBoundaryBySubject(
          gradeBoundry,
          result.domains
        );
      }
    };
    return gradeBoundaryBySubject;
  }

  /**
   * @function syncUserCompetencyMatrix
   * This method is used to sync the user compentency matrix report list
   */
  public syncUserCompetencyMatrix(compentencyDetails) {
    const classId = compentencyDetails.classId;
    const taskId = `class-${classId}-user-compentency-matrix`;
    const jobs = [];
    jobs.push(
      this.generateUserCompetencyMatrixJob(taskId, classId, compentencyDetails)
    );
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateUserCompetencyMatrixJob
   * This method generates the user compentency matrix report job
   */
  private generateUserCompetencyMatrixJob(taskId, classId, params) {
    const jobId = `${taskId}-user-compentency-matrix-sync`;
    const queryParams = {
      user: params.studentId,
      subject: params.subject,
      month: params.month,
      year: params.year,
      classId
    };
    const competencyReportJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.competencyProvider.getDomainTopicCompetencyMatrixAPIPath()}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.competencyProvider.storeUserCompetencyMatrix(
          params.studentId,
          params.subject,
          result
        );
      }
    };
    return competencyReportJob;
  }

  /**
   * @function checkUserCompetencyMatrixIsCached
   * This method is used to check the whether the user competency matrix data is cached in local database or not
   */
  public checkUserCompetencyMatrixIsCached(subjectId, userId) {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.TAXONOMY_USER_COMPETENCY_MATRIX,
      {
        subjectId,
        userId
      }
    );
    return this.databaseService
      .getDocument(databaseKey)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  /**
   * @function removeAdditionalAttributes
   * This method is used to remove additional attributes in offlineEvents
   */
  private removeAdditionalAttributes(offlineEvents) {
    const eventAttributes = {
      [SYNC_EVENTS.CA_UPDATE_ASSESSMENT_DATA]: ['payload.conducted_on']
    };
    Object.keys(eventAttributes).forEach((eventName) => {
      // Todo Need to remove the attributes dynamically
      offlineEvents.data.forEach((event) => {
        if (event.eventName === eventName) {
          delete event['payload']['conducted_on'];
        }
      });
    });
    return offlineEvents;
  }

  /**
   * @function syncCourseMapContentData
   * This method is used to sync course map content data
   */
  public syncCourseMapContentData(classDetails) {
    const classId = classDetails.id;
    const taskId = `class-${classId}-course-map-content`;
    const jobs = [];
    if (classId && classDetails.courseId) {
      jobs.push(this.generateCourseMapContentJob(taskId, classId));
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateCourseMapContentJob
   * This method generates the course map content job
   */
  private generateCourseMapContentJob(taskId, classId) {
    const jobId = `${taskId}-course-map-content-sync`;
    const courseMapContentJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.classProvider.getCourseMapContentsAPIPath(classId)}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.classProvider.storeCourseMapContent(classId, result);
      }
    };
    return courseMapContentJob;
  }

  /**
   * @function syncMilestoneList
   * This method is used to sync the milestones list
   */
  public syncMilestoneList(classDetails) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const studentId = classDetails.userUid ? classDetails.userUid : null;
    let fwCode = studentId
      ? classDetails.fwCode
      : classDetails.preference?.framework || null;
    const taskId = `class-${classId}-milestone`;
    const jobs = [];
    if (fwCode == null) {
      fwCode = 'GUT';
    }
      jobs.push(
        this.generateMilestoneJob(taskId, classId, courseId, fwCode, studentId)
      );
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateMilestoneJob
   * This method generates the milestone job
   */
  private generateMilestoneJob(taskId, classId, courseId, fwCode, studentId) {
    const queryParams = {};
    if (studentId) {
      Object.assign(queryParams, {
        class_id: classId,
        user_id: studentId
      });
    }
    const jobId = `${taskId}-milestone-sync`;
    const milestoneJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.milestoneProvider.getMilestonesAPIPath(courseId, fwCode)}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        if (studentId) {
          this.milestoneProvider.storeStudentMilestone(
            courseId,
            fwCode,
            studentId,
            result
          );
        } else {
          this.milestoneProvider.storeMilestone(courseId, fwCode, result);
        }
      }
    };
    return milestoneJob;
  }

  /**
   * @function syncMilestonePerformance
   * This method is used to sync milestone performace
   */
  public syncMilestonePerformance(classDetails) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const studentId = classDetails.userUid ? classDetails.userUid : null;
    const fwCode = studentId
      ? classDetails.fwCode
      : classDetails.preference?.framework || null;
    const taskId = `class-${classId}-milestone-performace-sync`;
    const jobs = [];
    if (fwCode) {
      jobs.push(
        this.generateMilestonePerformanceJob(
          taskId,
          classId,
          courseId,
          fwCode,
          studentId
        )
      );
    }

    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateMilestonePerformanceJob
   * This method generates the units milestone performance job
   */
  public generateMilestonePerformanceJob(
    taskId,
    classId,
    courseId,
    fwCode,
    studentId
  ) {
    const jobId = `${taskId}-milestone-performance-job`;
    const queryParams = {
      collectionType: CONTENT_TYPES.ASSESSMENT,
      fwCode
    };

    if (studentId) {
      Object.assign(queryParams, {
        userUid: studentId
      });
    }

    const milestonePerformanceJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.performanceProvider.getMilestonePerformanceAPIPath(
          classId,
          courseId
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        if (studentId) {
          this.performanceProvider.storeStudentMilestonePerformance(
            classId,
            courseId,
            fwCode,
            studentId,
            result
          );
        } else {
          this.performanceProvider.storeMilstonePerformance(
            classId,
            courseId,
            fwCode,
            result
          );
        }
      }
    };
    return milestonePerformanceJob;
  }

  /**
   * @function checkMilestonePerformanceCached
   * This method is used to check the milestone performance data is cached in local database or not
   */
  public checkMilestoneContentCached(courseId, fwCode, userId) {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.STUDENT_MILESTONES,
      {
        courseId,
        fwCode,
        userId
      }
    );

    return this.databaseService
      .getDocument(databaseKey)
      .then(() => {
        return true;
      })
      .catch((err) => {
        return false;
      });
  }

  /**
   * @function syncMilestoneLessons
   * This method is used to sync milestone lessons
   */
  public syncMilestoneLessons(classDetails, currentMilestoneId) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const fwCode = classDetails.preference?.framework || null;
    const taskId = `class-${classId}-milestone-lessons-sync`;
    const jobs = [];
    if (classDetails.milestoneViewApplicable && fwCode) {
      jobs.push(
        this.generateMilestoneLessonsJob(taskId, courseId, currentMilestoneId)
      );
      jobs.push(
        this.generateMilesoneLessonPerformanceJob(
          taskId,
          classId,
          courseId,
          fwCode,
          currentMilestoneId
        )
      );
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateMilestoneLessonsJob
   * This method generates the milestone lessons job
   */
  public generateMilestoneLessonsJob(taskId, courseId, milestoneId) {
    const jobId = `${taskId}-milestone-lessons-job`;
    const milestoneLessonJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.milestoneProvider.getMilestoneLessonsAPIPath(
          courseId,
          milestoneId
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.milestoneProvider.storeMilestoneLesson(
          courseId,
          milestoneId,
          result.lessons
        );
      }
    };
    return milestoneLessonJob;
  }

  /**
   * @function generateMilesoneLessonPerformanceJob
   * This method generates the milestone lessons performance job
   */
  public generateMilesoneLessonPerformanceJob(
    taskId,
    classId,
    courseId,
    fwCode,
    milestoneId
  ) {
    const jobId = `${taskId}-milestone-lessons-performace-job`;
    const queryParams = {
      collectionType: CONTENT_TYPES.ASSESSMENT,
      fwCode
    };

    const milestoneLessonJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.performanceProvider.getMilestoneLessonPerformanceAPIPath(
          classId,
          courseId,
          milestoneId
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.performanceProvider.storeMilestoneLessonPerformance(
          classId,
          courseId,
          fwCode,
          milestoneId,
          result
        );
      }
    };
    return milestoneLessonJob;
  }

  /**
   * @function syncUnit0List
   * This method is used to sync unit0 list
   */
  public syncUnit0List(classDetails) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const taskId = `class-${classId}-unit0-list-sync`;
    const jobs = [];
    if (courseId) {
      jobs.push(this.generateUnit0ListJob(taskId, classId, courseId));
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateUnit0ListJob
   * This method generates the units0 list job
   */
  public generateUnit0ListJob(taskId, classId, courseId) {
    const jobId = `${taskId}-unit0-list-job`;
    const unit0ListJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${environment.API_END_POINT}/${this.unit0.getUnit0ListAPIPath(
          classId,
          courseId
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders()
      },
      callback: (result) => {
        this.unit0.storeUnit0List(classId, courseId, result);
      }
    };
    return unit0ListJob;
  }

  /**
   * @function syncUnitsPerformance
   * This method is used to sync units performace
   */
  public syncUnitsPerformance(classDetails) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const studentId = classDetails.userUid ? classDetails.userUid : null;
    const taskId = `class-${classId}-units-performace-sync`;
    const jobs = [];
    if (courseId) {
      jobs.push(
        this.generateUnitsPerformanceJob(taskId, classId, courseId, studentId)
      );
    }

    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateUnitsPerformanceJob
   * This method generates the units performance job
   */
  public generateUnitsPerformanceJob(taskId, classId, courseId, studentId) {
    const jobId = `${taskId}-units-performance-job`;
    const queryParams = {
      collectionType: CONTENT_TYPES.ASSESSMENT
    };
    if (studentId) {
      Object.assign(queryParams, {
        userUid: studentId
      });
    }

    const unitsPerformanceJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.performanceProvider.getUnitsPerformanceAPIPath(
          classId,
          courseId
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        if (studentId) {
          this.performanceProvider.storeStudentUnitsPerformance(
            classId,
            courseId,
            studentId,
            result
          );
        } else {
          this.performanceProvider.storeUnitsPerformance(
            classId,
            courseId,
            result
          );
        }
      }
    };
    return unitsPerformanceJob;
  }

  /**
   * @function checkUnitPerformanceCached
   * This method is used to check the whether the unit performance data is cached in local database or not
   */
  public checkUnitContentCached(classId, courseId, studentId) {
    const databaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.STUDENT_UNITS_PERFORMANCE,
      {
        classId,
        courseId,
        studentId
      }
    );
    return this.databaseService
      .getDocument(databaseKey)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  /**
   * @function syncStudentCurrentLocation
   * This method is used to sync student current location
   */
  public syncStudentCurrentLocation(classDetails) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const fwCode = classDetails.fwCode;
    const userId = classDetails.userUid;
    const taskId = `class-${classId}-student-current-location-sync`;
    const jobs = [];
    if (fwCode) {
      jobs.push(
        this.generateStudentCurrentLocationJob(
          taskId,
          classId,
          courseId,
          userId,
          fwCode
        )
      );
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateStudentCurrentLocationJob
   * This method generates the student current location
   */
  public generateStudentCurrentLocationJob(
    taskId,
    classId,
    courseId,
    userId,
    fwCode
  ) {
    const jobId = `${taskId}-student-current-location-job`;
    const queryParams = { courseId };
    if (fwCode) {
      Object.assign(queryParams, {
        fwCode
      });
    }
    const studentCurrentLocationJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.locationProvider.getStudentCurrentLocationAPIPath(
          classId,
          userId
        )}`,
        method: 'GET',
        headers: this.getTokenHeaders(),
        queryParams
      },
      callback: (result) => {
        this.locationProvider.storeStudentCurrentLocation(
          classId,
          courseId,
          fwCode,
          userId,
          result
        );
      }
    };
    return studentCurrentLocationJob;
  }

  /**
   * @function syncClassPerformance
   * This method is used to sync class performance job
   */
  public syncClassPerformance(classDetails) {
    const classId = classDetails.id;
    const courseId = classDetails.courseId;
    const classCourseIds = [
      {
        classId,
        courseId
      }
    ];
    const taskId = `class-${classId}-class-performance-sync`;
    const jobs = [];
    if (classId && courseId) {
      jobs.push(this.generateClassPerformanceJob(taskId, classCourseIds));
    }
    return {
      id: taskId,
      jobs
    } as BackgroundTask;
  }

  /**
   * @function generateClassPerformanceJob
   * This method generates class performance job
   */
  public generateClassPerformanceJob(taskId, classCourseIds) {
    const jobId = `${taskId}-class-performance-job`;
    const body = {
      classes: classCourseIds
    };
    const classPerformanceJob: BackgroundTaskJob = {
      id: jobId,
      name: jobId,
      http: {
        url: `${
          environment.API_END_POINT
        }/${this.performanceProvider.getClassPerformanceAPIPath()}`,
        method: 'POST',
        headers: this.getTokenHeaders(),
        body: JSON.stringify(body)
      },
      callback: (result) => {
        this.performanceProvider.storeClassPerformance(result.usageData);
      }
    };
    return classPerformanceJob;
  }
}
