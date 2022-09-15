import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { DatabaseService } from '@app/providers/service/database.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { LessonModel, MilestoneLessonListModel } from '@models/lesson/lesson';
import {
  MilestoneByDateModel,
  MilestoneListModel,
  MilestoneModel,
  MilestoneOfStudentByDateModel,
  SkippedContentModel
} from '@models/milestone/milestone';
import { HttpService } from '@providers/apis/http';
import { SessionService } from '@providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class MilestoneProvider {
  // -------------------------------------------------------------------------
  // Properties

  private milestoneNamespace = 'api/nucleus/v1';
  private rescopeNamespace = 'api/rescope';
  private timeSpendNamespace = 'api/ds/users/v2';

  // -------------------------------------------------------------------------
  // API Path

  public getMilestoneLessonsAPIPath(courseId, milestoneId) {
    return `${this.milestoneNamespace}/courses/ms/${courseId}/milestones/${milestoneId}`;
  }

  public getMilestonesAPIPath(courseId, fwCode) {
    return `${this.milestoneNamespace}/courses/ms/${courseId}/fw/${fwCode}`;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private databaseService: DatabaseService
  ) {}

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchMilestones
   * method is used to fetch milestones
   */
  public fetchMilestones(
    classId: string,
    courseId: string,
    fwCode: string,
    userId?: string
  ) {
    if (fwCode === null) {
      fwCode = 'GUT';
    }
    const isOnline = this.utilsService.isNetworkOnline();
    const documentKeys =
      userId != null
        ? DOCUMENT_KEYS.STUDENT_MILESTONES
        : DOCUMENT_KEYS.MILESTONES;
    const dataBaseKey = this.databaseService.documentKeyParser(documentKeys, {
      courseId,
      fwCode,
      userId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const params = {};
        if (userId) {
          Object.assign(params, {
            class_id: classId,
            user_id: userId
          });
        }
        const endpoint = this.getMilestonesAPIPath(courseId, fwCode);
        this.httpService
          .get<MilestoneListModel>(endpoint, params)
          .then((response) => {
            const milestoneResult = response.data;
            const normalizeMilestoneList =
              this.normalizeMilestoneList(milestoneResult);
            this.databaseService.upsertDocument(
              DOCUMENT_KEYS.MILESTONES,
              normalizeMilestoneList
            );
            resolve(normalizeMilestoneList);
          }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function fetchMilestoneLessons
   * method is used to fetch milestone lesson
   */
  public fetchMilestoneLessons(courseId: string, milestoneId: string) {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.MILESTONE_LESSONS,
      {
        courseId,
        milestoneId
      }
    );
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getMilestoneLessonsAPIPath(courseId, milestoneId);
        this.httpService
          .get<MilestoneLessonListModel>(endpoint)
          .then((response) => {
            const lessonResponse = response.data;
            const lesson: MilestoneLessonListModel = {
              courseId: lessonResponse.course_id,
              lessons: lessonResponse.lessons
                ? this.normalizeLesson(lessonResponse.lessons)
                : [],
              milestoneId: lessonResponse.milestone_id
            };
            this.databaseService.upsertDocument(
              DOCUMENT_KEYS.MILESTONES,
              lesson
            );
            resolve(lesson);
          }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function fetchSkippedContents
   * This method is used to fetch skipped contents
   */
  public fetchSkippedContents(classId, courseId, userId) {
    const endpoint = `${this.rescopeNamespace}/v1/scope/skipped`;
    const params = {
      classId,
      courseId,
      userId
    };
    return this.httpService
      .get<SkippedContentModel>(endpoint, params)
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        return null;
      });
  }

  // -------------------------------------------------------------------------
  // Normalizers

  /**
   * @function normalizeMilestoneList
   * Normalize milestone list
   */
  private normalizeMilestoneList(payload) {
    const milestoneList: MilestoneListModel = {
      aggregatedTaxonomy: payload.aggregated_taxonomy,
      collaborator: payload.collaborator,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      description: payload.description,
      id: payload.id,
      license: payload.license,
      metadata: payload.metadata,
      milestones: this.normalizeMilestone(payload.milestones),
      modifierId: payload.modifier_id,
      originalCourseId: payload.original_course_id,
      originalCreatorId: payload.original_creator_id,
      ownerId: payload.ownerId,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      publishStatus: payload.publish_status,
      sequenceId: payload.sequence_id,
      subjectBucket: payload.subject_bucket,
      taxonomy: payload.taxonomy,
      thumbnail: payload.thumbnail,
      title: payload.title,
      updatedAt: payload.updated_at,
      useCase: payload.use_case,
      version: payload.version,
      visibleOnProfile: payload.visible_on_profile
    };
    return milestoneList;
  }

  /**
   * @function normalizeMilestone
   * Normalize milestone details
   */
  private normalizeMilestone(payload): Array<MilestoneModel> {
    return payload.map((item, index) => {
      const milestoneDetails: MilestoneModel = {
        gradeId: item.grade_id,
        gradeName: item.grade_name,
        gradeSeq: item.grade_seq,
        milestoneId: item.milestone_id,
        txSubjectCode: item.tx_subject_code,
        sequenceId: index + 1
      };
      return milestoneDetails;
    });
  }

  /**
   * @function normalizeLesson
   * Normalize lesson details
   */
  private normalizeLesson(payload): Array<LessonModel> {
    return payload.map((item) => {
      const lesson: LessonModel = {
        fwCode: item.fw_code,
        gradeId: item.grade_id,
        gradeName: item.grade_name,
        gradeSeq: item.grade_seq,
        lessonId: item.lesson_id,
        lessonSequence: item.lesson_sequence,
        lessonTitle: item.lesson_title,
        txCompCode: item.tx_comp_code,
        txCompName: item.tx_comp_name,
        txCompSeq: item.tx_comp_seq,
        txCompStudentDesc: item.tx_comp_student_desc,
        txDomainCode: item.tx_domain_code,
        txDomainId: item.tx_domain_id,
        txDomainName: item.tx_domain_name,
        txDomainSeq: item.tx_domain_seq,
        txSubjectCode: item.tx_subject_code,
        unitId: item.unit_id,
        unitSequence: item.unit_sequence,
        unitTitle: item.unit_title
      };
      return lesson;
    });
  }

  /**
   * @function fetchMilestoneByDate
   * This method is used to fetch milestone by date
   */
  public fetchMilestoneByDate(classId, startDate?, endDate?) {
    const endpoint = `${this.timeSpendNamespace}/stats/class/milestone`;
    const params = {
      classId,
      from: startDate,
      to: endDate
    };
    return this.httpService.get(endpoint, params).then((res) => {
      return this.normalizeMilestoneByDate(res.data.milestones || []);
    });
  }

  /**
   * @function normalizeMilestoneByDate
   * This method is used to normalize milestone by date
   */
  public normalizeMilestoneByDate(payload): Array<MilestoneByDateModel> {
    return payload.map((item, index) => {
      const milestone: MilestoneByDateModel = {
        competencyCount: item.competency_count,
        domainCount: item.domain_count,
        gradeId: item.grade_id,
        gradeName: item.grade_name,
        gradeSeq: item.grade_seq,
        milestoneId: item.milestone_id,
        students: this.normalizeStudentsForMilestones(item.students),
        topicCount: item.topic_count,
        milestoneSeq: index + 1
      };
      return milestone;
    });
  }

  /**
   * @function normalizeStudentsForMilestones
   * This method is used to normalize students for milestones
   */
  public normalizeStudentsForMilestones(
    payload
  ): Array<MilestoneOfStudentByDateModel> {
    return payload.map((item) => {
      const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
      const student: MilestoneOfStudentByDateModel = {
        averageScore: item.average_score,
        completedCompetencies: item.completed_competencies || 0,
        firstName: item.first_name,
        highestCompetency: item.highest_competency,
        highestCompetencyTitle: item.highest_competency_title,
        id: item.id,
        lastName: item.last_name,
        thumbnail: item.thumbnail ? `${basePath}${item.thumbnail}` : null,
        totalCompetencies: item.total_competencies
      };
      return student;
    });
  }

  /**
   * @function storeMilestone
   * This method is used to store milestone data
   */
  public storeMilestone(courseId, fwCode, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.MILESTONES,
      {
        courseId,
        fwCode
      }
    );
    const normalizeMilestoneList = this.normalizeMilestoneList(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeMilestoneList);
  }

  /**
   * @function storeStudentMilestone
   * This method is used to store student milestone data
   */
  public storeStudentMilestone(courseId, fwCode, userId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.STUDENT_MILESTONES,
      {
        courseId,
        fwCode,
        userId
      }
    );

    const normalizeMilestoneList = this.normalizeMilestoneList(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeMilestoneList);
  }

  /**
   * @function storeMilestoneLesson
   * This method is used to store milestone lesson data
   */
  public storeMilestoneLesson(courseId, milestoneId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.MILESTONE_LESSONS,
      {
        courseId,
        milestoneId
      }
    );

    const lesson: MilestoneLessonListModel = {
      courseId,
      lessons: payload ? this.normalizeLesson(payload) : [],
      milestoneId
    };
    this.databaseService.upsertDocument(dataBaseKey, lesson);
  }
}
