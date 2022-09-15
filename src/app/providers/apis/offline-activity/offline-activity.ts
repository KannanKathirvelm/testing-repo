import { Injectable } from '@angular/core';
import {
  DEFAULT_IMAGES,
  OA,
  OA_TASK_SUBMISSION_TYPES, OFFLINE_ACTIVITY,
  ROLES,
  RUBRIC,
  SUBMISSION_TYPES
} from '@constants/helper-constants';
import { OaGradeItemModel } from '@models/offline-activity/offline-activity';
import { HttpService } from '@providers/apis/http';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import { TaxonomyProvider } from '@providers/apis/taxonomy/taxonomy';
import { SessionService } from '@providers/service/session/session.service';
import { addHttpsProtocol, calculateAverageScore, cleanFilename } from '@utils/global';

@Injectable({
  providedIn: 'root',
})
export class OfflineActivityProvider {

  // -------------------------------------------------------------------------
  // Properties

  private oaNamespace = 'api/nucleus/v2/oa';
  private caNamespace = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private performanceProvider: PerformanceProvider,
    private taxonomyProvider: TaxonomyProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function readActivity
   * This method is used to read activity
   */
  public readActivity(activityId) {
    const endpoint = `${this.oaNamespace}/${activityId}/detail`;
    return this.httpService.get<OaGradeItemModel>(endpoint).then((response) => {
      return this.normalizeOaGradeActivity(response.data);
    });
  }

  /**
   * this method is used to normalize the activity data
   * @returns {activityData}
   */
  public normalizeOaGradeActivity(activityData): OaGradeItemModel {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = activityData.thumbnail
      ? cdnUrl + activityData.thumbnail
      : DEFAULT_IMAGES.OFFLINE_ACTIVITY;
    const settings = activityData.setting || {};
    const rubric = this.performanceProvider.normalizeActivityRubric(activityData.rubrics);
    const teacherRubric = rubric.find((item) => {
      return item.gradeType === RUBRIC.TEACHER;
    });
    const studentRubric = rubric.find((item) => {
      return item.gradeType === RUBRIC.STUDENT;
    });
    const normalizedActivity = {
      id:
        activityData.target_collection_id ||
        activityData.suggested_content_id ||
        activityData.id,
      format:
        activityData.format ||
        activityData.target_content_type ||
        activityData.suggested_content_type ||
        OFFLINE_ACTIVITY,
      courseId:
        activityData.target_course_id ||
        activityData.suggested_course_id ||
        activityData.course_id,
      pathId: activityData.id,
      title: activityData.title,
      learningObjectives: activityData.learning_objective,
      isVisibleOnProfile:
        activityData.visible_on_profile !== 'undefined'
          ? activityData.visible_on_profile
          : true,
      tasks: this.normalizeTasks(activityData.oa_tasks),
      taskCount: activityData.oa_tasks ? activityData.oa_tasks.length : 0,

      sequence: activityData.sequence_id,
      thumbnailUrl,

      classroom_play_enabled:
        settings.classroom_play_enabled !== undefined
          ? settings.classroom_play_enabled
          : true,
      standards: this
        .taxonomyProvider
        .normalizeTaxonomy(activityData.taxonomy),
      subFormat: activityData.subformat,
      reference: activityData.reference,
      exemplar: activityData.exemplar,
      references: this.normalizeReferences(activityData.oa_references),
      rubric,
      teacherRubric,
      studentRubric,
      url: activityData.url,
      ownerId: activityData.owner_id,
      unitId:
        activityData.target_unit_id ||
        activityData.suggested_unit_id ||
        activityData.unit_id,
      lessonId:
        activityData.target_lesson_id ||
        activityData.suggested_lesson_id ||
        activityData.lesson_id,
      collectionSubType:
        activityData.target_content_subtype ||
        activityData.suggested_content_subtype,
      attempts: settings.attempts_allowed || -1,
      bidirectional: settings.bidirectional_play || false,
      showFeedback: settings.show_feedback || '',
      showKey: settings.show_key === '',
      authorEtlSecs: activityData.author_etl_secs || 0,
      maxScore: activityData.max_score || 1
    };
    return normalizedActivity;
  }

  /**
   * this method is used to normalize the tasks
   * @returns {tasks}
   */
  public normalizeTasks(payload) {
    if (payload) {
      const taskArray = payload.map((item) => {
        return this.normalizeReadTask(item);
      });
      return taskArray.sort((a, b) => a.id - b.id);
    }
    return [];
  }

  /**
   * this method is used to normalize the activity references
   * @returns {reference}
   */
  public normalizeReferences(payload) {
    if (payload) {
      const studentReferences = payload.filter((item) => item.oa_reference_usertype === ROLES.STUDENT);
      return studentReferences.map((item) => {
        return this.normalizeReadReferences(item);
      });
    }
    return [];
  }

  /**
   * Normalize the task data
   * @returns {task}
   */
  public normalizeReadTask(item) {
    return {
      id: item.id,
      oaId: item.oa_id,
      title: item.title,
      description: item.description,
      oaTaskSubmissions: this.normalizeSubmissions(item.oa_tasks_submissions),
      submissionCount: item.oa_tasks_submissions
        ? item.oa_tasks_submissions.length
        : 0
    };
  }

  /**
   * Normalize the submissions
   * @param payload
   * @returns {submissions}
   */
  public normalizeSubmissions(payload) {
    if (payload) {
      return payload.map((item) => {
        return this.normalizeReadSubmissions(item);
      });
    }
    return [];
  }

  /**
   * Normalize the submission
   * @returns {submission}
   */
  public normalizeReadSubmissions(item) {
    return {
      id: item.id,
      oaTaskId: item.oa_task_id,
      taskSubmissionType: item.oa_task_submission_type,
      taskSubmissionSubType: item.oa_task_submission_subtype
    };
  }

  public getGradingStudentList(requestParams) {
    const endpoint = `${this.caNamespace}/rubrics/items/${requestParams.contentId}/students`;
    return this.httpService.get(endpoint, requestParams).then((response) => {
      return response.data.students;
    });
  }

  /**
   * @function fetchOaGradeActivity
   * This method is used to fetch the course list
   */
  public fetchOaSubmissions(classId, activityId, studentId,queryParams = null) {
    const baseEndpoint = queryParams ? `${this.caNamespace}` : `${this.caNamespace}/dca`;
    const endpoint = `${baseEndpoint}/class/${classId}/oa/${activityId}/student/${studentId}/submissions`;
    return new Promise((resolve, reject) => {
      this.httpService.get(endpoint, queryParams).then((res) => {
        const oaSubmitedData = res.data;
        const parseData = {
          tasks: [],
          oaRubrics: this.normalizeOaRubrics(oaSubmitedData.oaRubrics)
        };
        if (oaSubmitedData.tasks && oaSubmitedData.tasks.length) {
          const normalizedSubmissions = this.normalizeOaSubmissions(oaSubmitedData);
          parseData.tasks = normalizedSubmissions.map((task) => {
            const filteredData = [];
            SUBMISSION_TYPES.forEach((type) => {
              const typeData = task.filter((submission) => {
                return submission.submissionType === type;
              });
              typeData.type = type;
              let submissionKey = type;
              submissionKey = type === OA.FREE_FORM_TEXT ? OA.FORM_TEXT : type;
              filteredData[submissionKey] = typeData;
              return filteredData;
            });
            const submissions = {
              submissions: filteredData,
              taskId: task.taskId
            };
            return submissions;
          });
        }
        resolve(parseData);
      }, reject);
    });
  }


  /**
   * @function fetchCaOaSubmissions
   * This method is used to fetch ca oa submissions
   */
  public fetchCaOaSubmissions(classId, activityId, studentId, isDca, params=null) {
    const dcaContent = isDca && '/dca' || '';
    const endpoint = `${this.caNamespace}${dcaContent}/class/${classId}/oa/${activityId}/student/${studentId}/submissions`;
    return this.httpService.get(endpoint, params).then((res) => {
      return this.normalizeSubmissionGrade(res.data);
    });
  }


  /**
   * @function normalizeSubmissionGrade
   * This method is used to normalize submission grade
   */
  public normalizeSubmissionGrade(response) {
    const oaRubrics = this.normalizeRubricGrade(response.oaRubrics);
    return {
      oaRubrics,
      sessionId: response.sessionId,
      tasks: response.tasks
        ? response.tasks.map((task) => this.normalizeGradeTasks(task))
        : []
    }
  }

  /**
   * @function normalizeRubricGrade
   * This method is used to normalize rubric grade
   */
  public normalizeRubricGrade(payload) {
    return {
      studentGrades: payload.studentGrades
        ? this.normalizeGrade(payload.studentGrades)
        : null,
      teacherGrades: payload.teacherGrades
        ? this.normalizeGrade(payload.teacherGrades)
        : null
    }
  }

  /**
   * @function normalizeGrade
   * This method is used to normalize grade
   */
  public normalizeGrade(payload) {
    return {
      grader: payload.grader,
      maxScore: Math.round(payload.maxScore),
      overallComment: payload.overallComment,
      rubricId: payload.rubricId,
      score: Math.round(payload.studentScore),
      submittedOn: payload.submittedOn,
      timeSpent: payload.timeSpent,
      categoryGrade: payload.categoryScore
        ? payload.categoryScore.map(item =>
          this.normalizeCategoryScore(item)
        )
        : []
    }
  }

  /**
   * @function normalizeCategoryScore
   * This method is used to normalize category score
   */
  public normalizeCategoryScore(data) {
    return {
      title: data.category_title,
      levelObtained: data.level_obtained,
      levelMaxScore: Number(data.level_max_score),
      levelScore: Number(data.level_score),
      levelComment: data.level_comment
    }
  }

  /**
   * this method is used to normalize the activity reference
   * @param item
   * @returns {reference}
   */
  public normalizeReadReferences(item) {
    return {
      id: item.id,
      oaId: item.oa_id,
      type: item.oa_reference_type,
      subType: item.oa_reference_subtype,
      location: addHttpsProtocol(item.location),
      name: item.oa_reference_name
    };
  }

  public normalizeGradeTasks(payload) {
    return {
      taskId: payload.taskId,
      submissionText: payload.submissionText,
      submissions: payload.submissions
        ? payload.submissions.map(submission =>
          this.normalizeGradeSubmission(submission)
        )
        : []
    }
  }

  public normalizeGradeSubmission(payload) {
    const cdnUrls = this.sessionService.userSession.cdn_urls;
    const contentCDN = this.sessionService.userSession.cdn_urls.content_cdn_url;
    let submissionLocation = payload.submissionInfo;
    if (payload.submissionType === 'uploaded') {
      submissionLocation = contentCDN + cleanFilename(submissionLocation, cdnUrls);
    }
    const submissionTypeData = OA_TASK_SUBMISSION_TYPES.find((item) => item.value === payload.submissionSubtype);
    const submissionIcon = submissionTypeData ? submissionTypeData.icon : null;
    return {
      submissionInfo: submissionLocation,
      submissionSubtype: payload.submissionSubtype,
      submissionType: payload.submissionType,
      submittedOn: payload.submittedOn,
      submissionIcon
    }
  }

  public normalizeOA(payload) {
    const basePath = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const oaContent = {
      authorEtlSecs: payload.author_etl_secs,
      collaborator: payload.collaborator,
      courseId: payload.course_id,
      creatorId: payload.creator_id,
      durationHours: payload.duration_hours,
      exemplar: payload.exemplar,
      grading: payload.grading,
      id: payload.id,
      learningObjective: payload.learning_objective,
      lessonId: payload.lesson_id,
      license: payload.license,
      loginRequired: payload.login_required,
      maxScore: payload.max_score,
      metadata: payload.metadata,
      oaReferences: payload.oa_references,
      oaTasks: payload.oa_tasks,
      originalCollectionId: payload.original_collection_id,
      originalCreatorId: payload.original_creator_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      reference: payload.reference,
      rubrics: payload.rubrics,
      setting: payload.setting,
      subformat: payload.subformat,
      taxonomy: payload.taxonomy,
      thumbnail: payload.thumbnail ? `${basePath}${payload.thumbnail}` : null,
      title: payload.title,
      unitId: payload.unit_id,
      url: payload.url,
      visibleOnProfile: payload.visible_on_profile,
      taskCount: payload.oa_tasks ? payload.oa_tasks.length : 0,
    };
    return oaContent;
  }

  /**
   * Normalize offline activity oa rubrics
   * @return {oaRubricsData}
   */
  private normalizeOaRubrics(oaRubricsData) {
    if (oaRubricsData.studentGrades) {
      const studentGrades = {
        categoryScore: oaRubricsData.studentGrades.categoryScore,
        grader: oaRubricsData.studentGrades.grader,
        maxScore: oaRubricsData.studentGrades.maxScore,
        overallComment: oaRubricsData.studentGrades.overallComment,
        rubricId: oaRubricsData.studentGrades.rubricId,
        studentScore: oaRubricsData.studentGrades.studentScore,
        scoreInPercentage: calculateAverageScore(Number(oaRubricsData.studentGrades.studentScore), Number(oaRubricsData.studentGrades.maxScore)),
        submittedOn: oaRubricsData.studentGrades.submittedOn,
        timeSpent: oaRubricsData.studentGrades.timeSpent
      };
      oaRubricsData.studentGrades = studentGrades;
    }
    if (oaRubricsData.teacherGrades) {
      const teacherGrades = {
        categoryScore: oaRubricsData.teacherGrades.categoryScore,
        grader: oaRubricsData.teacherGrades.grader,
        maxScore: oaRubricsData.teacherGrades.maxScore,
        overallComment: oaRubricsData.teacherGrades.overallComment,
        rubricId: oaRubricsData.teacherGrades.rubricId,
        studentScore: oaRubricsData.teacherGrades.studentScore,
        scoreInPercentage: calculateAverageScore(Number(oaRubricsData.teacherGrades.studentScore), Number(oaRubricsData.teacherGrades.maxScore)),
        submittedOn: oaRubricsData.teacherGrades.submittedOn,
        timeSpent: oaRubricsData.teacherGrades.timeSpent
      };
      oaRubricsData.teacherGrades = teacherGrades;
    }
    return oaRubricsData;
  }


  /**
   * Normalize offline activity performance
   * @return {submissions}
   */
  private normalizeOaSubmissions(oaSubmitedData) {
    const normalizeData = oaSubmitedData.tasks.map((data) => {
      const submissions = data.submissions.map((item) => {
        let submissionLocation = item.submissionInfo;
        if (item.submissionType === OA.UPLOADS) {
          const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
          submissionLocation = addHttpsProtocol(cdnUrl + item.submissionInfo, cdnUrl);
        }
        const submissionTypeData = OA_TASK_SUBMISSION_TYPES.find((oaTask) => {
          return oaTask.value === item.submissionSubtype;
        });
        const submissionIcon = submissionTypeData ? submissionTypeData.icon : null;
        return {
          submissionInfo: submissionLocation,
          submissionSubtype: item.submissionSubtype,
          submissionType: item.submissionType,
          submittedOn: item.submittedOn,
          submissionIcon
        };
      });
      submissions.taskId = data.taskId;
      return submissions;
    });
    return normalizeData;
  }
}
