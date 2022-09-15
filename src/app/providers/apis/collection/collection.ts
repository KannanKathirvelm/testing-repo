import { Injectable } from '@angular/core';
import { DOWNLOAD_MEDIA_EXTENSIONS } from '@app/constants/download-constants';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  COLLECTION,
  COLLECTION_EXTERNAL,
  COLLECTION_TYPES,
  CONTENT_TYPES,
  MULTIPLE_SELECT_IMAGES,
  OFFLINE_ACTIVITY,
  PATH_TYPES,
  QUESTION_TYPES_CONFIG,
} from '@constants/helper-constants';
import { environment } from '@environment/environment';
import {
  AnswerModel,
  CollectionListModel,
  CollectionSettings,
  CollectionsModel,
  CollectionSuggestionModel,
  ContentModel,
  CrossWalkFrameWorkModel,
  UnitCollectionContentModel,
  UnitCollectionSummaryModel
} from '@models/collection/collection';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import {
  addHttpsProtocol,
  getDefaultImage,
  getDefaultImageXS
} from '@utils/global';

@Injectable({
  providedIn: 'root',
})
export class CollectionProvider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1';
  private namespaceV2 = 'api/nucleus/v2';
  private courseMapNamespace = 'api/nucleus/v2/course-map';
  private crossWalkFrameCodeNamespace = 'api/nucleus/v1/taxonomy/framework/crosswalk/competency';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private databaseService: DatabaseService,
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCollectionList
   * This method is used to fetch collection
   */
  public fetchCollectionList(
    classId: string,
    courseId: string,
    lessonId: string,
    unitId: string,
    userId?
  ) {
    const endpoint = `${this.courseMapNamespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
    const params = {
      classId,
      userId
    };
    return this.httpService
      .get<CollectionListModel>(endpoint, params)
      .then((res) => {
        const collectionList: CollectionListModel = {
          alternatePaths: {
            systemSuggestions: res.data.alternate_paths
              .system_suggestions
              ? this.normalizeSuggestionSummary(
                res.data.alternate_paths.system_suggestions,
                false
              )
              : [],
            teacherSuggestions: res.data.alternate_paths
              .teacher_suggestions
              ? this.normalizeSuggestionSummary(
                res.data.alternate_paths.teacher_suggestions,
                true
              )
              : [],
          },
          coursePath: this.normalizeCollectionSummary(
            res.data.course_path
          ),
        };
        return collectionList;
      });
  }


  /**
   * @function normalizeSuggestionSummary
   * This Method is used to serialize suggestion summary
   */
  public normalizeSuggestionSummary(
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
        pathId: item.id || 0,
        pathType: item.id
          ? isTeacherSuggestion
            ? PATH_TYPES.TEACHER
            : PATH_TYPES.SYSTEM
          : null,
        ctxPathId: item.ctx_path_id || 0,
        ctxPathType: item.ctx_path_id ? item.ctx_path_type : null,
        contentSubFormat: item.content_subformat || null,
        source: item.source,
        resourceCount: item.resourseCount,
        thumbnail: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImage(item.format),
        thumbnailXS: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImageXS(item.suggested_content_type),
        isSuggestedContent: true,
        isRescoped: item.isRescoped,
        isCollection: item.suggested_content_type === COLLECTION,
        isAssessment: item.suggested_content_type === ASSESSMENT,
        isExternalAssessment: item.suggested_content_type === ASSESSMENT_EXTERNAL,
        isExternalCollection: item.suggested_content_type === COLLECTION_EXTERNAL,
        isOfflineActivity: item.suggested_content_type === OFFLINE_ACTIVITY
      };
      return suggestion;
    });
  }

  /**
   * @function normalizeCollectionSummary
   * This method is used to normalize collection summary
   */
  private normalizeCollectionSummary(payload): UnitCollectionContentModel {
    const collectionSummaryDetails: UnitCollectionContentModel = {
      aggregatedTaxonomy: payload.aggregated_taxonomy,
      collectionSummary: payload.collection_summary
        ? this.normalizeCollection(payload.collection_summary)
        : [],
      courseId: payload.course_id,
      createdAt: payload.created_at,
      creatorId: payload.creator_id,
      creatorSystem: payload.creator_system,
      lessonId: payload.lesson_id,
      lessonPlan: payload.lesson_plan,
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
      updatedAt: payload.updated_at,
    };
    return collectionSummaryDetails;
  }

  /**
   * @function normalizeCollection
   * This method is used to normalize collection
   */
  private normalizeCollection(payload): Array<UnitCollectionSummaryModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return payload.map((item) => {
      const collection: UnitCollectionSummaryModel = {
        format: item.format,
        id: item.id,
        oeQuestionCount: item.oe_question_count,
        questionCount: item.question_count,
        resourceCount: item.resource_count,
        sequenceId: item.sequence_id,
        subformat: item.subformat,
        taskCount: item.task_count,
        thumbnailXS: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImageXS(item.format),
        thumbnail: item.thumbnail
          ? `${cdnUrl}${item.thumbnail}`
          : getDefaultImage(item.format),
        title: item.title,
        isRescoped: item.isRescoped,
        learningObjective: item.learning_objective,
        url: item.url ? addHttpsProtocol(item.url) : null,
        isCollection: item.format === COLLECTION,
        isAssessment: item.format === ASSESSMENT,
        isExternalAssessment: item.format === ASSESSMENT_EXTERNAL,
        isExternalCollection: item.format === COLLECTION_EXTERNAL,
        isOfflineActivity: item.format === OFFLINE_ACTIVITY,
        gutCodes: item.gut_codes
      };
      return collection;
    });
  }

  /**
   * @function fetchCollectionById
   * This method is used to fetch collection
   */
  public fetchCollectionById(collectionId: string, collectionType: string, storeOffline = false, downloadProgressCb?): Promise<CollectionsModel> {
    return new Promise((resolve, reject) => {
      const format = COLLECTION_TYPES[collectionType];
      const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.COLLECTION, {
        collectionId
      });
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/${format}/${collectionId}`;
        this.httpService.get<CollectionsModel>(endpoint, null, null, downloadProgressCb).then((res) => {
          const collectionContent = this.normalizeCollections(res.data, collectionType);
          if (storeOffline) {
            this.databaseService.upsertDocument(databaseKey, collectionContent);
          }
          resolve(collectionContent);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeCollections
   * This method is used to normalize the collection
   */
  public normalizeCollections(payload, collectionType) {
    if (!Object.keys(payload).length) {
      return null;
    }
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const content = payload.content || payload.question;
    const collections: CollectionsModel = {
      id: payload.id,
      format: this.getCollectionFormat(collectionType),
      collaborator: payload.collaborator,
      content: content ? this.normalizeCollectionContents(content) : [],
      courseId: payload.course_id,
      creatorId: payload.creator_id,
      grading: payload.grading,
      learningObjective: payload.learning_objective,
      lessonId: payload.lesson_id,
      license: payload.license,
      originalCollectionId: payload.original_collection_id,
      originalCreatorId: payload.original_creator_id,
      ownerId: payload.owner_id,
      primaryLanguage: payload.primary_language,
      publishDate: payload.publish_date,
      title: payload.title,
      unitId: payload.unit_id,
      taxonomy: payload.taxonomy,
      thumbnail: payload.thumbnail
        ? `${cdnUrl}${payload.thumbnail}`
        : getDefaultImage(collectionType),
      settings: this.normalizeCollectionSettings(payload.setting),
      visibleOnProfile: payload.visible_on_profile,
      collectionType,
      url: payload.url ? addHttpsProtocol(payload.url) : null,
      gutCodes: payload.gut_codes,
      isCollection: collectionType === CONTENT_TYPES.COLLECTION,
      isAssessment: collectionType === CONTENT_TYPES.ASSESSMENT,
      isExternalAssessment: collectionType === CONTENT_TYPES.ASSESSMENT_EXTERNAL,
      isExternalCollection: collectionType === CONTENT_TYPES.COLLECTION_EXTERNAL,
    };
    return collections;
  }

  /**
   * @function getCollectionFormat
   * This method is used to get the collection format
   */
  private getCollectionFormat(collectionType) {
    return collectionType === CONTENT_TYPES.COLLECTION_EXTERNAL ||
      collectionType === CONTENT_TYPES.COLLECTION
      ? CONTENT_TYPES.COLLECTION
      : CONTENT_TYPES.ASSESSMENT;
  }

  /**
   * @function normalizeCollectionSettings
   * This method is used to normalize the collection settings
   */
  private normalizeCollectionSettings(settings) {
    if (settings) {
      const settingsModel: CollectionSettings = {
        attemptsAllowed: settings.attempts_allowed,
        bidirectionalPlay: settings.bidirectional_play,
        showFeedback: settings.show_feedback,
        showKey: settings.show_key,
        showHints: settings.show_hints,
        showExplanation: settings.show_explanation,
        randomizePlay: settings.randomize_play,
        contributesToPerformance: settings.contributes_to_performance,
        contributesToMastery: settings.contributes_to_mastery,
        classroomPlayEnabled: settings.classroom_play_enabled,
      };
      return settingsModel;
    }
    return null;
  }

  /**
   * @function normalizeCollectionContents
   * This method is used to Normalize collection contents
   */
  private normalizeCollectionContents(contents) {
    return contents.map((contentPayload) => {
      return this.normalizeCollectionContent(contentPayload);
    });
  }

  private normalizeCollectionContent(contentPayload) {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    if (contentPayload.content_subformat === MULTIPLE_SELECT_IMAGES) {
      contentPayload.answer.map((answer) => {
        return (answer.answer_text = cdnUrl + answer.answer_text);
      });
    }
    const subFormat = contentPayload.content_subformat;
    const format = contentPayload.content_format || 'question';
    const content: ContentModel = {
      answer: contentPayload.answer
        ? this.normalizeAnswer(contentPayload.answer, subFormat)
        : [],
      subQuestions: contentPayload.subQuestions,
      contentFormat: format,
      contentSubformat: subFormat,
      type: format === 'resource' ? subFormat : QUESTION_TYPES_CONFIG[subFormat],
      creatorId: contentPayload.creator_id,
      description: contentPayload.description,
      hintExplanationDetail: contentPayload.hint_explanation_detail,
      id: contentPayload.id,
      isCopyrightOwner: contentPayload.is_copyright_owner,
      maxScore: contentPayload.max_score,
      narration: contentPayload.narration,
      originalCreatorId: contentPayload.original_creator_id,
      publishDate: contentPayload.publish_date,
      sequenceId: contentPayload.sequence_id,
      taxonomy: contentPayload.taxonomy,
      title: contentPayload.title,
      thumbnail: contentPayload.thumbnail
        ? cdnUrl + contentPayload.thumbnail
        : null,
      s3Url: contentPayload.url && this.checkMediaDownloadExtension(contentPayload.url)
        ? this.encryptedMediaURL(contentPayload.url) : null,
      url: contentPayload.url
        ? addHttpsProtocol(contentPayload.url, cdnUrl)
        : null,
      visibleOnProfile: contentPayload.visible_on_profile,
    };
    return content;
  }

  /**
   * @function checkMediaDownloadExtension
   * This method is used to check whether the requested media url is available
   */
  private checkMediaDownloadExtension(mediaUrl) {
    return (
      mediaUrl.includes(DOWNLOAD_MEDIA_EXTENSIONS.YOUTUBE) ||
      mediaUrl.includes(DOWNLOAD_MEDIA_EXTENSIONS.DRIVE) ||
      mediaUrl.includes(DOWNLOAD_MEDIA_EXTENSIONS.DOC) ||
      mediaUrl.includes(DOWNLOAD_MEDIA_EXTENSIONS.YT_SHORLINK)
    );
  }

  /**
   * @function encryptedMediaURL
   * Method used to encrypt the media URL
   */
  private encryptedMediaURL(url: string) {
    if (url) {
      if (url.includes(DOWNLOAD_MEDIA_EXTENSIONS.YOUTUBE) || url.includes(DOWNLOAD_MEDIA_EXTENSIONS.YT_SHORLINK)) {
        const encryptedYoutubeURL = this.utilsService.encryptByMd5(url)
        url = `${environment.S3_BUCKET_URL}/${encryptedYoutubeURL}.mp4`;
      }
    }
    return url;
  }

  /**
   * @function normalizeAnswer
   * This method is used to Normalize answer content
   */
  private normalizeAnswer(answers, subFormat) {
    const format = QUESTION_TYPES_CONFIG[subFormat];
    return answers.map((answer) => {
      const item: AnswerModel = {
        id: format === 'FIB' ? '0' : `answer_${answer.sequence}`,
        answer_text: answer.answer_text,
        answer_type: answer.answer_type,
        is_correct: answer.is_correct,
        sequence: answer.sequence,
        highlight_type: answer.highlight_type,
      };
      return item;
    });
  }

  /**
   * @function readQuestion
   * This method is used to fetch Rubric items
   */
  public readQuestion(questionId) {
    const endpoint = `${this.namespaceV2}/questions/${questionId}`;
    return this.httpService.get(endpoint, {}).then((result) => {
      return result.data;
    });
  }

  /**
   * @function fetchCrosswalkFramework
   * This method is used to Crosswalk Framework code
   */
  public fetchCrosswalkFramework(frameworkId , params) : Promise<Array<CrossWalkFrameWorkModel>> {
    const endpoint = `${this.crossWalkFrameCodeNamespace}/${frameworkId}`;
    return this.httpService.post(endpoint,params ).then((result) => {
      return this.normalizeCrosswalkFrameworkItems(result.data.frameworkCrossWalkComp);
    });
  }

  /**
   * @function normalizeCrosswalkFrameworkItems
   * This method is used to Normalize Crosswalk content
   */
  public normalizeCrosswalkFrameworkItems(payload) {
    return payload.map((item) => {
      const frameworkItems = {
        sourceDisplayCode: item.source_display_code,
        sourceTaxonomyCodeId: item.source_taxonomy_code_id,
        targetDisplayCode: item.target_display_code,
      }
      return frameworkItems;
    });
  }
}
