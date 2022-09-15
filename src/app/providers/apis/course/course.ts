import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import { COLLECTION_TYPES, CONTENT_TYPES, DEFAULT_IMAGES, PATH_TYPES } from '@constants/helper-constants';
import {
  CollectionListModel,
  CollectionSuggestionModel,
  FluencyContentModel,
  UnitCollectionContentModel,
  UnitCollectionSummaryModel
} from '@models/collection/collection';
import {
  CourseDetailModel,
  CourseModel,
  CourseStructureCollectionModel,
  CourseStructureLessonModel,
  CourseStructureModel,
  CourseStructureUnitModel
} from '@models/course/course';
import { UnitLessonContentModel, UnitLessonSummaryModel } from '@models/lesson/lesson';
import { UnitSummaryModel } from '@models/unit/unit';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import { getDefaultImage, getDefaultImageXS } from '@utils/global';

@Injectable({
  providedIn: 'root',
})
export class CourseProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1/courses';
  private coursemapNamespace = 'api/nucleus/v2/course-map';
  private skylineNamespace = 'api/skyline-initial/v1';

  // -------------------------------------------------------------------------
  // API Path

  public getCourseAPIPath(courseId) {
    return `${this.namespace}/${courseId}`
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCourseList
   * This method is used to fetch the course list
   */
  public fetchCourseList(courseIDs) {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/list`;
        const param = {
          ids: courseIDs.join(),
        };
        this.httpService
          .get<CourseModel>(endpoint, param)
          .then((res) => {
            const response = res.data;
            const normalizeCourseList = this.normalizeCourseList(response.courses);
            this.databaseService.upsertDocument(DOCUMENT_KEYS.CLASSES_COURSES, normalizeCourseList);
            resolve(normalizeCourseList);
          }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.CLASSES_COURSES).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  public normalizeCourseList(payload) {
    return payload.map((item) => {
      return this.normalizeCourse(item);
    });
  }

  /**
   * @function calculateUserSkyline
   * This method is used to calculate skyline for each user
   */
  public calculateUserSkyline(classId, studentIds) {
    const endpoint = `${this.skylineNamespace}/calculate`;
    const params = {
      classId,
      users: studentIds
    };
    return this.httpService.post(endpoint, params);
  }


  /**
   * @function fetchCourseById
   * This method is used to fetch the course by id
   */
  public fetchCourseById(courseId) {
    return new Promise((resolve, reject) => {
      const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_COURSE, {
        courseId
      });
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = this.getCourseAPIPath(courseId);
        this.httpService.get<CourseDetailModel>(endpoint).then((res) => {
          const response = res.data;
          const normalizeCourseDetails = this.normalizeCourseDetails(response);
          this.databaseService.upsertDocument(databaseKey, normalizeCourseDetails);
          resolve(normalizeCourseDetails);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function storeCourseDetails
   * This method is used to store course details in the pouch db
   */
  public storeCourseDetails(courseId, courseDetails) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_COURSE, {
      courseId
    });
    const normalizeCourseDetails = this.normalizeCourseDetails(courseDetails);
    this.databaseService.upsertDocument(databaseKey, normalizeCourseDetails);
  }

  /**
   * @function fetchUnitLessons
   * Method to fetch unit lessons
   */
  public fetchUnitLessons(courseId, unitId) {
    const endpoint = `${this.namespace}/${courseId}/units/${unitId}`;
    return this.httpService.get<UnitLessonContentModel>(endpoint).then((response) => {
      return this.normalizeUnitLessonsPayload(response.data);
    });
  }

  /**
   * @function fetchUnitCollections
   * Method to fetch unit collection
   */
  public fetchUnitCollections(classId, courseId, unitId, lessonId, userId?) {
    const endpoint = `${this.coursemapNamespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
    const params = {
      classId
    };
    if (userId) {
      Object.assign(params, {
        userId
      });
    }
    return this.httpService.get<CollectionListModel>(endpoint, params).then((response) => {
      const collectionList: CollectionListModel = {
        alternatePaths: {
          systemSuggestions: response.data.alternate_paths
            .system_suggestions
            ? this.normalizeSuggestionSummary(
              response.data.alternate_paths.system_suggestions,
              false
            )
            : [],
          teacherSuggestions: response.data.alternate_paths
            .teacher_suggestions
            ? this.normalizeSuggestionSummary(
              response.data.alternate_paths.teacher_suggestions,
              true
            )
            : [],
        },
        coursePath: this.normalizeUnitCollectionPayload(
          response.data.course_path
        ),
      };
      return collectionList;
    });
  }

  // -------------------------------------------------------------------------
  // Normalizers

  /**
   * @function normalizeCourse
   * Normalize a course response
   */
  public normalizeCourse(payload): CourseModel {
    const basePath = this.sessionService.userSession.cdn_urls
      .content_cdn_url;
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : DEFAULT_IMAGES.COURSE;
    const course: CourseModel = {
      id: payload.id,
      thumbnailUrl,
      title: payload.title,
      ownerId: payload.owner_id,
      version: payload.version,
      subject: payload.subject_bucket,
    };
    return course;
  }

  /**
   * @function normalizeCourseDetails
   * Normalize a course detail response
   */
  private normalizeCourseDetails(payload): CourseDetailModel {
    const courseDetail: CourseDetailModel = {
      aggregatedTaxonomy: payload.payload,
      collaborator: payload.collaborator,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      description: payload.description,
      id: payload.id,
      license: payload.license,
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCourseId: payload.original_course_id,
      originalCreatorId: payload.original_creator_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      publishStatus: payload.publish_status,
      sequenceId: payload.sequence_id,
      subjectBucket: payload.subject_bucket,
      taxonomy: payload.taxonomy,
      thumbnail: payload.thumbnail,
      title: payload.title,
      units: this.normalizeUnitSummary(payload.unit_summary),
      updatedAt: payload.updated_at,
      useCase: payload.use_case,
      version: payload.version,
      visibleOnProfile: payload.visible_on_profile
    };
    return courseDetail;
  }

  /**
   * @function normalizeUnitSummary
   * Method to normalize unit summary
   */
  private normalizeUnitSummary(payload): Array<UnitSummaryModel> {
    if (!payload) {
      return [];
    }
    return payload.map((item) => {
      const unitSummary: UnitSummaryModel = {
        lessonCount: item.lesson_count,
        sequenceId: item.sequence_id,
        title: item.title,
        unitId: item.unit_id
      };
      return unitSummary;
    });
  }

  /**
   * @function normalizeUnitLessonsPayload
   * Method to normalize unit lessons payload
   */
  private normalizeUnitLessonsPayload(payload): UnitLessonContentModel {
    const content: UnitLessonContentModel = {
      aggregatedTaxonomy: payload.aggregated_taxonomy,
      bigIdeas: payload.big_ideas,
      courseId: payload.course_id,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      essentialQuestions: payload.essential_questions,
      lessons: this.normalizeLessons(payload.lesson_summary),
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCreatorId: payload.original_creator_id,
      originalUnitId: payload.original_unit_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      sequenceId: payload.sequence_id,
      taxonomy: payload.taxonomy,
      title: payload.title,
      unitId: payload.unit_id,
      updatedAt: payload.updated_at
    };
    return content;
  }

  /**
   * @function normalizeLessons
   * Method to normalize lesson summary
   */
  private normalizeLessons(payload): Array<UnitLessonSummaryModel> {
    return payload.map((item) => {
      const lesson: UnitLessonSummaryModel = {
        assessmentCount: item.assessment_count,
        collectionCount: item.collection_count,
        externalAssessmentCount: item.external_assessment_count,
        externalCollectionCount: item.external_collection_count,
        lessonId: item.lesson_id,
        oaCount: item.oa_count,
        sequenceId: item.sequence_id,
        title: item.title
      };
      return lesson;
    });
  }

  /**
   * @function normalizeSuggestionSummary
   * This Method is used to serialize suggestion summary
   */
  private normalizeSuggestionSummary(
    payload,
    isTeacherSuggestion
  ): Array<CollectionSuggestionModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return payload.map((item) => {
      const suggestion: CollectionSuggestionModel = {
        id: item.suggested_content_id,
        title: item.title,
        format: item.suggested_content_type || null,
        collectionId: item.ctx_collection_id || null,
        classId: item.ctx_class_id || null,
        courseId: item.ctx_course_id || null,
        unitId: item.ctx_unit_id || null,
        lessonId: item.ctx_lesson_id || null,
        pathId: item.id || null,
        pathType: item.id
          ? isTeacherSuggestion
            ? PATH_TYPES.TEACHER
            : PATH_TYPES.SYSTEM
          : null,
        contentSubFormat: item.content_subformat || null,
        source: item.source,
        resourceCount: item.resourseCount,
        thumbnail: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImage(item.format),
        thumbnailXS: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImageXS(item.format),
        isSuggestedContent: true,
        isCollection: item.suggested_content_type === CONTENT_TYPES.COLLECTION,
        isAssessment: item.suggested_content_type === CONTENT_TYPES.ASSESSMENT,
        isExternalAssessment: item.suggested_content_type === CONTENT_TYPES.ASSESSMENT_EXTERNAL,
        isExternalCollection: item.suggested_content_type === CONTENT_TYPES.COLLECTION_EXTERNAL,
        isOfflineActivity: item.suggested_content_type === CONTENT_TYPES.OFFLINE_ACTIVITY
      };
      return suggestion;
    });
  }

  /**
   * @function normalizeUnitCollectionPayload
   * Method to normalize collection summary
   */
  private normalizeUnitCollectionPayload(payload): UnitCollectionContentModel {
    const collectionContent: UnitCollectionContentModel = {
      aggregatedTaxonomy: payload.aggregated_taxonomy,
      collections: this.normalizeCollections(payload.collection_summary),
      courseId: payload.course_id,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      lessonId: payload.lesson_id,
      metadata: payload.metadata,
      modifierId: payload.modifier_id,
      originalCreatorId: payload.original_creator_id,
      originalLessonId: payload.original_lesson_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      sequenceId: payload.sequence_id,
      taxonomy: payload.taxonomy,
      title: payload.title,
      unitId: payload.unit_id,
      updatedAt: payload.updated_at
    };
    return collectionContent;
  }

  /**
   * @function normalizeCollections
   * Method to normalize collections
   */
  public normalizeCollections(payload): Array<UnitCollectionSummaryModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return payload.map((item) => {
      const collection: UnitCollectionSummaryModel = {
        format: item.format,
        id: item.id,
        oeQuestionCount: item.oe_question_count,
        questionCount: item.question_count,
        resourceCount: item.resource_count,
        sequenceId: item.sequence_id,
        taskCount: item.task_count,
        thumbnail: item.thumbnail ? `${cdnUrl}${item.thumbnail}` : getDefaultImage(item.format),
        title: item.title,
        url: item.url,
        isCollection: item.format === CONTENT_TYPES.COLLECTION,
        isAssessment: item.format === CONTENT_TYPES.ASSESSMENT,
        isExternalAssessment: item.format === CONTENT_TYPES.ASSESSMENT_EXTERNAL,
        isExternalCollection: item.format === CONTENT_TYPES.COLLECTION_EXTERNAL,
        isOfflineActivity: item.format === CONTENT_TYPES.OFFLINE_ACTIVITY,
        metadata: item.metadata.fluency ? this.normalizeFluency(item.metadata.fluency) : null
      };
      return collection;
    });
  }

  /**
   * @function normalizeFluency
   * This method is used to normalize collection summary
   */
  private normalizeFluency(fluency) {
    const fluencyContent: FluencyContentModel = {
      fluencyCode: fluency.fluency_code,
      fluencyDescription: fluency.fluency_description,
      fluencyDisplayCode: fluency.fluency_display_code,
      fluencySequence: fluency.fluency_sequence
    };
    return fluencyContent;
  }

  /**
   * @function getCourseStructure
   * Method to get course structure
   */
  public getCourseStructure(courseId, contentType) {
    const format = COLLECTION_TYPES[contentType];
    const endpoint = `${this.namespace}/${courseId}/${format}`;
    return this.httpService.get(endpoint).then((response) => {
      return this.normalizeCourseStructure(response.data.courses[0], contentType);
    });
  }

  /**
   * @function normalizeCourseStructure
   * Method to normalize course structure
   */
  public normalizeCourseStructure(payload, collectionType): CourseStructureModel {
    const courseContent: CourseStructureModel = {
      id: payload.id,
      title: payload.title,
      children: this.normalizeCourseStructureUnits(payload.units || [], collectionType)
    }
    return courseContent;
  }

  /**
   * @function normalizeCourseStructureUnits
   * Method to normalize course structure units
   */
  public normalizeCourseStructureUnits(payload, collectionType): Array<CourseStructureUnitModel> {
    return payload.map((item) => {
      const courseUnit: CourseStructureUnitModel = {
        id: item.id,
        title: item.title,
        sequence: item.sequence_id,
        children: this.normalizeCourseStructureLessons(item.lessons || [], collectionType)
      }
      return courseUnit;
    });
  }

  /**
   * @function normalizeCourseStructureLessons
   * Method to normalize course structure lessons
   */
  public normalizeCourseStructureLessons(payload, collectionType): Array<CourseStructureLessonModel> {
    const isAssessment = collectionType === CONTENT_TYPES.ASSESSMENT;
    return payload.map((item) => {
      const items = isAssessment ? item.assessments : item.collections;
      return {
        id: item.id,
        title: item.title,
        sequence: item.sequence_id,
        children: this.normalizeCourseStructureCollection(items || [])
      }
    });
  }

  /**
   * @function normalizeCourseStructureCollection
   * Method to normalize course structure collection
   */
  public normalizeCourseStructureCollection(payload): Array<CourseStructureCollectionModel> {
    return payload.map((item) => {
      const collectionItem: CourseStructureCollectionModel = {
        id: item.id,
        title: item.title,
        sequence: item.sequence,
        format: item.format
      }
      return collectionItem;
    });
  }
}
