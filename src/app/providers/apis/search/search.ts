import { Injectable } from '@angular/core';
import { SearchCourseModel, SearchResultsModel } from '@app/models/search/search';
import {
  CONTENT_TYPES,
  DEFAULT_IMAGES,
  DEFAULT_IMAGES_XS,
  DEFAULT_SEARCH_PAGE_SIZE,
  ROLES,
  SIGNATURE_CONTENT_TYPES,
  STUDENTS,
  TAXONOMY_LEVELS,
  TEACHER
} from '@constants/helper-constants';
import { ContentModel, LearningMapsContent, OwnerModel, SearchCompetencyModel } from '@models/signature-content/signature-content';
import { TenantLibraryContentModel } from '@models/tenant/tenant-settings';
import { HttpService } from '@providers/apis/http';
import { TaxonomyProvider } from '@providers/apis/taxonomy/taxonomy';
import { SessionService } from '@providers/service/session/session.service';
import { getSubjectId } from '@app/utils/global';

@Injectable({
  providedIn: 'root'
})

export class SearchProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'gooru-search/rest/v1/pedagogy-search';
  private namespaceV2 = 'gooru-search/rest/v2/search';
  private namespaceCap = 'gooru-search/rest/v1/cap/content/search';
  private nucleusNamespace = 'api/nucleus/v2';
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private taxonomyProvider: TaxonomyProvider,
    private session: SessionService,
    private httpService: HttpService,
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchLearningMapsContent
   * This method is used to fetch the map content
   */
  public fetchLearningMapsContent(gutCode, filters): Promise<SearchCompetencyModel> {
    const endpoint = `${this.namespace}/learning-maps/standard/${gutCode}`;
    return this.httpService.get<SearchCompetencyModel>(endpoint).then((res) => {
      const normalizedCompetencyContent = this.normalizeLearningMapsContent(res.data);
      return normalizedCompetencyContent;
    });
  }

  /**
   * @function fetchTenantLibrary
   * This method is used to fetch the map content
   */
  public fetchTenantLibrary(): Promise<Array<TenantLibraryContentModel>> {
    const endpoint = `${this.nucleusNamespace}/libraries`;
    return this.httpService.get<Array<TenantLibraryContentModel>>(endpoint).then((res) => {
      return this.normalizeLibrary(res.data.libraries);
    });
  }

  /**
   * @function normalizeLibrary
   * This method is used to normalize library
   */
  public normalizeLibrary(payload) {
    return payload.map((libraryPayload) => {
      const basePath = this.session.userSession.cdn_urls.user_cdn_url;
      const thumbnailUrl = libraryPayload.thumbnail
        ? basePath + libraryPayload.thumbnail
        : DEFAULT_IMAGES.PROFILE_IMAGE;
      return {
        id: libraryPayload.id,
        name: libraryPayload.name,
        image: thumbnailUrl,
        description: libraryPayload.description,
        tenantId: libraryPayload.tenant,
        tenantRoot: libraryPayload.tenant_root,
        courseCount: libraryPayload.course_count,
        assessmentCount: libraryPayload.assessment_count,
        collectionCount: libraryPayload.collection_count,
        resourceCount: libraryPayload.resource_count,
        questionCount: libraryPayload.question_count,
        rubricCount: libraryPayload.rubric_count,
        offlineActivityCount: libraryPayload.offline_activity_count,
        sequence: libraryPayload.sequence_id,
        shortName: libraryPayload.short_name
      };
    });
  }

  /**
   * @function searchLearningMapContent
   * This method is used to fetch the learning map content
   */
  public searchLearningMapContent(filter, type): Promise<Array<ContentModel>> {
    let endpoint = `${this.namespaceV2}/${type}`;
    if (type === CONTENT_TYPES.COLLECTION || type === CONTENT_TYPES.ASSESSMENT) {
      endpoint = `${this.namespaceV2}/scollection`;
    }
    if (type === CONTENT_TYPES.QUESTION) {
      endpoint = `${this.namespaceV2}/resource`;
    }
    return this.httpService.get<Array<ContentModel>>(endpoint, filter).then((res) => {
      return this.normalizeSearchLearningMapsContent(res.data.searchResults, type);
    });
  }

  /**
   * @function searchAssessments
   * This method is used to search assessments
   */
  public searchAssessments(filterParams) {
    const term = filterParams.term;
    const searchParams = filterParams.searchParams ? filterParams.searchParams : {};
    const resetPagination = filterParams.resetPagination ? filterParams.resetPagination : false;
    const additionalParams = filterParams.additionalParams;
    const endpoint = `${this.namespaceV2}/scollection`;
    const page = !searchParams['page'] || resetPagination ? 0 : searchParams['page'];
    const pageSize = searchParams['pageSize'] || DEFAULT_SEARCH_PAGE_SIZE;
    const params = {
      q: term || '*',
      'flt.collectionType': 'assessment,assessment-external',
      'flt.publishStatus': searchParams['isGooruCatalog'] ? 'published' : 'published,unpublished',
      start: page + 1, // page starts at one
      length: pageSize,
      'flt.relatedGutCode': searchParams['gutCode'],
      scopeKey: searchParams['scopeKey'],
      ...additionalParams
    }
    const taxonomies = searchParams['taxonomies'];
    if (Array.isArray(taxonomies) && taxonomies.length > 0) {
      params['flt.standard'] = taxonomies.join(',');
    }
    this.appendFilters(searchParams, params);
    if (searchParams['audienceFilter']) {
      this.appendAudienceFilters(params);
    }
    if (searchParams['languageId']) {
      params['flt.languageId'] = searchParams['languageId'];
    }
    return this.httpService.get<Array<ContentModel>>(endpoint, params).then((response) => {
      const assessmentPayload = response.data.searchResults || [];
      const assessmentPayloadList = this.filterDuplicateContent(assessmentPayload);
      return {
        totalCount: response.data.totalHitCount,
        collections: assessmentPayloadList.map((item) => {
          const normalizeAssessment = this.normalizeAssessment(item);
          return normalizeAssessment;
        })
      }
    });
  }

  /**
   * @function searchCollections
   * This method is used to search collections
   */
  public searchCollections(filterParams) {
    const term = filterParams.term;
    const searchParams = filterParams.searchParams ? filterParams.searchParams : {};
    const resetPagination = filterParams.resetPagination ? filterParams.resetPagination : false;
    const additionalParams = filterParams.additionalParams;
    const endpoint = `${this.namespaceV2}/scollection`;
    const page = !searchParams['page'] || resetPagination ? 0 : searchParams['page'];
    const pageSize = searchParams['pageSize'] || DEFAULT_SEARCH_PAGE_SIZE;
    const params = {
      q: term || '*',
      'flt.collectionType': 'collection,collection-external',
      'flt.publishStatus': searchParams['isGooruCatalog'] ? 'published' : 'published,unpublished',
      start: page + 1, // page starts at one
      length: pageSize,
      'flt.relatedGutCode': searchParams['gutCode'],
      scopeKey: searchParams['scopeKey'],
      ...additionalParams
    }
    const taxonomies = searchParams['taxonomies'];
    if (Array.isArray(taxonomies) && taxonomies.length > 0) {
      params['flt.standard'] = taxonomies.join(',');
    }
    this.appendFilters(searchParams, params);
    if (searchParams['audienceFilter']) {
      this.appendAudienceFilters(params);
    }
    if (searchParams['languageId']) {
      params['flt.languageId'] = searchParams['languageId'];
    }
    return this.httpService.get<Array<ContentModel>>(endpoint, params).then((response) => {
      const collectionPayload = response.data.searchResults || [];
      const collectionPayloadList = this.filterDuplicateContent(collectionPayload);
      return {
        totalCount: response.data.totalHitCount,
        collections: collectionPayloadList.map((item) => {
          const normalizeCollection = this.normalizeCollection(item);
          return normalizeCollection;
        })
      }
    });
  }

  /**
   * @function searchOfflineActivity
   * This method is used to search offline activity
   */
  public searchOfflineActivity(filterParams) {
    const term = filterParams.term;
    const searchParams = filterParams.searchParams ? filterParams.searchParams : {};
    const resetPagination = filterParams.resetPagination ? filterParams.resetPagination : false;
    const endpoint = `${this.namespaceV2}/scollection`;
    const page = !searchParams['page'] || resetPagination ? 0 : searchParams['page'];
    const pageSize = searchParams['pageSize'] || DEFAULT_SEARCH_PAGE_SIZE;
    const params = {
      q: term || '*',
      'flt.collectionType': 'offline-activity',
      'flt.publishStatus': 'published',
      start: page + 1, // page starts at one
      length: pageSize
    }
    const taxonomies = searchParams['taxonomies'];
    if (Array.isArray(taxonomies) && taxonomies.length > 0) {
      params['flt.standard'] = taxonomies.join(',');
    }
    this.appendFilters(searchParams, params);
    if (searchParams['audienceFilter']) {
      this.appendAudienceFilters(params);
    }
    return this.httpService.get<Array<ContentModel>>(endpoint, params).then((response) => {
      const collectionPayload = response.data.searchResults || [];
      const collectionPayloadList = this.filterDuplicateContent(collectionPayload);
      return {
        totalCount: response.data.totalHitCount,
        collections: collectionPayloadList.map((item) => {
          const normalizeCollection = this.normalizeOfflieActivity(item);
          return normalizeCollection;
        })
      }
    });
  }

  /**
   * @function searchCapContents
   * This method is used to search content from cap api
   */
  public searchCapContents(filterParams) {
    const term = filterParams.term;
    const searchParams = filterParams.searchParams ? filterParams.searchParams : {};
    const filters = filterParams.searchParams.filters ? filterParams.searchParams.filters : {};
    const resetPagination = filterParams.resetPagination ? filterParams.resetPagination : false;
    const contentTypes = filterParams['contentType'];
    const endpoint = `${this.namespaceCap}`;
    const page = !searchParams['page'] || resetPagination ? 0 : searchParams['page'];
    const pageSize = searchParams['pageSize'] || DEFAULT_SEARCH_PAGE_SIZE;
    const params = {
      query: term || '*',
      pageNum: page + 1, // page starts at one
      limit: pageSize,
      filters: { includeContentTypes: contentTypes }
    }
    if (filters['flt.audience'] && Object.entries(filters['flt.audience']).length !== 0) {
      params.filters['audience'] = filters['flt.audience'];
    }
    if (searchParams['audience']) {
      params.filters['audience'] = searchParams['audience'];
    }
    if (searchParams['standard']) {
      params.filters['standard'] = searchParams['standard'];
    }
    if (searchParams['languageId']) {
      params.filters['languageId'] = searchParams['languageId'];
    }
    if (searchParams['gutCode']) {
      params.filters['relatedGutCode'] = searchParams['gutCode'];
    }
    if (searchParams['subject']) {
      params.filters['subject'] = searchParams['subject'];
    }
    return this.httpService.post<ContentModel>(endpoint, params).then((response) => {
      let assessmentPayload;
      let totalCount;
      const contentType = contentTypes[0];
      const type = `${contentType}s`;
      if (contentTypes.includes(SIGNATURE_CONTENT_TYPES.DIAGNOSTIC_ASSESSMENT)) {
        assessmentPayload = response.data.contents?.diagnosticAssessments?.searchResults;
        totalCount = response.data.contents?.diagnosticAssessments?.stats?.totalHitCount;
      }
      else if (contentTypes.includes(SIGNATURE_CONTENT_TYPES.ASSESSMENT)) {
        const signatureAssessments = response.data.contents?.signatureAssessments?.searchResults;
        if (signatureAssessments) {
          if (response.data.contents?.assessments?.searchResults) {
            assessmentPayload = response.data.contents?.assessments?.searchResults?.concat(signatureAssessments);
            totalCount = response.data.contents?.signatureAssessments?.stats?.totalHitCount + response.data.contents?.assessments?.stats?.totalHitCount;
          } else {
            assessmentPayload = signatureAssessments;
            totalCount = response.data.contents?.signatureAssessments?.stats?.totalHitCount;
          }
        } else {
          assessmentPayload = response.data.contents?.assessments?.searchResults;
          totalCount = response.data.contents?.assessments?.stats?.totalHitCount;
        }
      } else if (contentTypes.includes(SIGNATURE_CONTENT_TYPES.COLLECTION)) {
        const signatureCollections = response.data.contents?.signatureCollections?.searchResults;
        if (signatureCollections) {
          if ( response.data.contents?.collections?.searchResults) {
            assessmentPayload = response.data.contents?.collections?.searchResults?.concat(signatureCollections)
            totalCount = response.data.contents?.signatureCollections?.stats?.totalHitCount + response.data.contents?.collections?.stats?.totalHitCount;
          } else {
            assessmentPayload = signatureCollections;
            totalCount = response.data.contents?.signatureCollections?.stats?.totalHitCount;
          }
        } else {
          assessmentPayload = response.data.contents?.collections?.searchResults;
          totalCount = response.data.contents?.collections?.stats?.totalHitCount;
        }
      } else {
        assessmentPayload = response.data.contents?.[type]?.searchResults;
        totalCount = response.data.contents?.[type]?.stats?.totalHitCount;
      }
      const payloadContent = assessmentPayload || [];
      const assessmentPayloadList = this.filterDuplicateContent(payloadContent);
      return {
        totalCount,
        collections: assessmentPayloadList?.map((item) => {
          let normalizeContent;
          if (contentType === CONTENT_TYPES.ASSESSMENT || contentType === CONTENT_TYPES.DIAGNOSTIC_ASSESSMENT) {
            normalizeContent = this.normalizeAssessment(item);
          } else if (contentType === CONTENT_TYPES.COLLECTION) {
            normalizeContent = this.normalizeCollection(item);
          } else if (contentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
            normalizeContent = this.normalizeOfflieActivity(item);
          }
          return normalizeContent;
        })
      }
    });
  }

  /**
   * @function appendFilters
   * This method is used to append filters
   */
  public appendFilters(searchParams, params) {
    if (searchParams.filters) {
      const filters = searchParams.filters;
      const filterKeys = Object.keys(filters);
      if (filterKeys) {
        filterKeys.forEach((item, index) => {
          const filterKey = filterKeys[index];
          if (filters[filterKey]) {
            params[filterKey] = filters[filterKey];
          }
        });
      }
    }
  }

  /**
   * append Default Filter
   */
  public appendAudienceFilters(options) {
    const audience = options['flt.audience'];
    if (
      this.session.userSession.user_category === ROLES.TEACHER &&
      Object.keys(audience).length === 0
    ) {
      const defFilter = `${TEACHER},${STUDENTS}`;
      const defaultFilter = {
        'flt.audience': defFilter
      };
      options = Object.assign(options, defaultFilter);
    }
  }

  /**
   * @function normalizeSearchLearningMapsContent
   * This method is used to Normalizes a search learning Map Data
   */
  private normalizeSearchLearningMapsContent(payload, type): Array<ContentModel> {
    if (payload ?.length) {
      if (type === CONTENT_TYPES.ASSESSMENT) {
        return payload.map((content) => {
          return this.normalizeAssessment(content);
        });
      }
      if (type === CONTENT_TYPES.COLLECTION) {
        return payload.map((content) => {
          return this.normalizeCollection(content);
        });
      }
      if (type === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        return payload.map((content) => {
          return this.normalizeOfflieActivity(content);
        });
      }
      if (type === CONTENT_TYPES.RUBRIC) {
        return payload.map((content) => {
          return this.normalizeRubric(content);
        });
      }
      if (type === CONTENT_TYPES.LESSON) {
        return payload.map((content) => {
          return this.normalizeLesson(content);
        });
      }
      if (type === CONTENT_TYPES.QUESTION) {
        return payload.map((content) => {
          return this.normalizeQuestion(content);
        });
      }
      if (type === CONTENT_TYPES.COURSE) {
        return payload.map((content) => {
          return this.normalizeCourse(content);
        });
      }
      if (type === CONTENT_TYPES.RESOURCE) {
        return payload.map((content) => {
          return this.normalizeResource(content);
        });
      }
    }
    return;
  }

  /**
   * @function normalizeRubric
   * This method is used to Normalizes a rubric
   */
  public normalizeRubric(rubric): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const userBasePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = rubric.thumbnail
      ? basePath + rubric.thumbnail
      : DEFAULT_IMAGES_XS.COLLECTION;
    const ownerThumbnailUrl = rubric.creator.profileImage
      ? userBasePath + rubric.creator.profileImage
      : null;
    const taxonomyInfo =
      (rubric.taxonomySet &&
        rubric.taxonomySet.curriculum &&
        rubric.taxonomySet.curriculum.curriculumInfo) ||
      [];
    return {
      id: rubric.id,
      title: rubric.title,
      description: rubric.description,
      thumbnail: thumbnailUrl,
      contentFormat: CONTENT_TYPES.RUBRIC,
      standards: this.taxonomyProvider
        .normalizeLearningMapsTaxonomyList(taxonomyInfo),
      isRubric: true,
      url: rubric.url,
      owner: {
        id: rubric.creator.id,
        firstName: rubric.creator.userFirstName,
        lastName: rubric.creator.userLastName,
        avatarUrl: ownerThumbnailUrl,
        username: rubric.creator.usernameDisplay
      },
      creator: {
        id: rubric.creator.id,
        firstName: rubric.creator.userFirstName,
        lastName: rubric.creator.userLastName,
        avatarUrl: ownerThumbnailUrl,
        username: rubric.creator.usernameDisplay
      },
      isPublished: rubric.publishStatus === 'published',
      createdDate: rubric.createdAt
    };
  }

  /**
   * @function normalizeOfflieActivity
   * This method is used to Normalizes a offline activity
   */
  public normalizeOfflieActivity(offlineActivityData): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const userBasePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = offlineActivityData.thumbnail
      ? basePath + offlineActivityData.thumbnail
      : DEFAULT_IMAGES.OFFLINE_ACTIVITY;
    const userThumbnailUrl = offlineActivityData.userProfileImage
      ? userBasePath + offlineActivityData.userProfileImage
      : null;
    const creatorThumbnailUrl = offlineActivityData.creatorProfileImage
      ? userBasePath + offlineActivityData.creatorProfileImage
      : null;

    const taxonomyInfo =
      (offlineActivityData.taxonomySet &&
        offlineActivityData.taxonomySet.curriculum &&
        offlineActivityData.taxonomySet.curriculum.curriculumInfo) ||
      [];
    const course = offlineActivityData.course || {};
    return {
      id: offlineActivityData.id,
      title: offlineActivityData.title,
      thumbnail: thumbnailUrl,
      contentFormat: CONTENT_TYPES.OFFLINE_ACTIVITY,
      standards: this.taxonomyProvider
        .normalizeLearningMapsTaxonomyList(taxonomyInfo),
      publishStatus: offlineActivityData.publishStatus,
      description: offlineActivityData.languageObjective,
      resourceCount: offlineActivityData.resourceCount || 0,
      questionCount: offlineActivityData.questionCount || 0,
      remixCount: offlineActivityData.scollectionRemixCount || 0,
      course: course.title,
      isOA: true,
      courseId: course.id,
      isVisibleOnProfile: offlineActivityData.profileUserVisibility,
      owner: {
        id: offlineActivityData.gooruUId,
        firstName: offlineActivityData.userFirstName,
        lastName: offlineActivityData.userLastName,
        avatarUrl: userThumbnailUrl,
        username: offlineActivityData.usernameDisplay
      },
      creator: {
        id: offlineActivityData.creatorId,
        firstName: offlineActivityData.creatorFirstname,
        lastName: offlineActivityData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: offlineActivityData.creatornameDisplay
      },
      format: offlineActivityData.format || offlineActivityData.type || null,
      taskCount: offlineActivityData.taskCount || 0,
      collectionType:
        offlineActivityData.collectionType || offlineActivityData.type,
      isOfflineActivity: true
    };
  }

  /**
   * @function normalizeLearningMapsContent
   * This method is used to Normalizes a question
   */
  public normalizeLearningMapsContent(learningMapsContent) {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const signatureData = learningMapsContent.signatureContents;
    if (signatureData && signatureData.assessments) {
      signatureData.assessments.forEach((item) => {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : DEFAULT_IMAGES.COLLECTION;
        item.isCollection = false;
        item.isAssessment = true;
        item.isExternalAssessment = false;
        item.isExternalCollection = false;
      });
    }
    if (signatureData && signatureData.collections) {
      signatureData.collections.forEach((item) => {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : DEFAULT_IMAGES.COLLECTION;
        item.isCollection = true;
        item.isAssessment = false;
        item.isExternalAssessment = false;
        item.isExternalCollection = false;
      });
    }
    const returnObjects: SearchCompetencyModel = {
      title: learningMapsContent.title,
      code: learningMapsContent.code,
      gutCode: learningMapsContent.gutCode,
      contents: learningMapsContent.contents,
      prerequisites: learningMapsContent.prerequisites,
      subject: learningMapsContent.subject,
      course: learningMapsContent.course,
      domain: learningMapsContent.domain,
      signatureContents: signatureData,
      learningMapsContent: this.normalizeSearchLearningMapsContentInfo(
        learningMapsContent.contents
      )
    };
    return returnObjects;
  }

  /**
   * @function normalizeOwner
   * This method is used to Normalizes owner
   */
  public normalizeOwner(ownerData): OwnerModel {
    const basePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = ownerData.profileImage
      ? basePath + ownerData.profileImage
      : DEFAULT_IMAGES.PROFILE_IMAGE;
    const owner: OwnerModel = {
      id: ownerData.gooruUId || ownerData.id,
      firstName: ownerData.firstName || ownerData.firstname,
      lastName: ownerData.lastName || ownerData.lastname,
      username: ownerData.usernameDisplay,
      avatarUrl: thumbnailUrl
    };
    return owner;
  }


  /**
   * @function normalizeAssessment
   * This method is used Normalize an assessment
   */
  public normalizeAssessment(assessmentData): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const userBasePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = assessmentData.thumbnail
      ? basePath + assessmentData.thumbnail
      : DEFAULT_IMAGES_XS.ASSESSMENT;
    const ownerThumbnailUrl = assessmentData.userProfileImage
      ? userBasePath + assessmentData.userProfileImage
      : DEFAULT_IMAGES.PROFILE_IMAGE;
    const creatorThumbnailUrl = assessmentData.creatorProfileImage
      ? userBasePath + assessmentData.creatorProfileImage
      : DEFAULT_IMAGES.PROFILE_IMAGE;
    const taxonomyInfo = (assessmentData.taxonomySet &&
        assessmentData.taxonomySet.curriculum &&
        assessmentData.taxonomySet.curriculum.curriculumInfo) ||
      null;

    const course = assessmentData.course || {};
    return {
      id: assessmentData.id,
      title: assessmentData.title,
      format: assessmentData.format || assessmentData.type || null,
      thumbnail: thumbnailUrl,
      standards: this.taxonomyProvider
        .normalizeLearningMapsTaxonomyList(taxonomyInfo),
      publishStatus: assessmentData.publishStatus,
      description: assessmentData.learningObjective,
      learningObjectives: assessmentData.languageObjective,
      contentFormat: CONTENT_TYPES.ASSESSMENT,
      resourceCount: assessmentData.resourceCount
        ? Number(assessmentData.resourceCount)
        : 0,
      questionCount: assessmentData.questionCount
        ? Number(assessmentData.questionCount)
        : 0,
      isAssessment: assessmentData.collectionType === CONTENT_TYPES.ASSESSMENT,
      isExternalAssessment: assessmentData.collectionType === CONTENT_TYPES.ASSESSMENT_EXTERNAL,
      remixCount: assessmentData.scollectionRemixCount || 0,
      course: course.title,
      courseId: course.id,
      relevance: assessmentData.relevance,
      efficacy: assessmentData.efficacy,
      engagement: assessmentData.engagement,
      isVisibleOnProfile: assessmentData.profileUserVisibility,
      owner: {
        id: assessmentData.gooruUId,
        firstName: assessmentData.userFirstName,
        lastName: assessmentData.userLastName,
        avatarUrl: ownerThumbnailUrl,
        username: assessmentData.usernameDisplay
      },
      creator: {
        id: assessmentData.creatorId,
        firstName: assessmentData.creatorFirstname,
        lastName: assessmentData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: assessmentData.creatornameDisplay
      },
      taxonomy: assessmentData.taxonomy || taxonomyInfo
    };
  }

  /**
   * @function normalizeCourse
   * This method is used Normalize a course
   */
  public normalizeCourse(result): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES_XS.COLLECTION;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      thumbnail: thumbnailUrl,
      subject: result.subjectBucket,
      creator: result.creator
        ? this.normalizeOwner(result.creator)
        : null,
      efficacy: result.efficacy,
      contentFormat: CONTENT_TYPES.COURSE,
      engagement: result.engagement,
      relevance: result.relevance,
      subjectName:
        result.taxonomy && result.taxonomy.subject
          ? result.taxonomy.subject[0]
          : null,
      subjectSequence: result.subjectSequence,
      isVisibleOnProfile: result.visibleOnProfile,
      isCourse: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      unitCount: result.unitCount,
      standards: this.taxonomyProvider
        .normalizeLearningMapsTaxonomyList(taxonomyInfo, TAXONOMY_LEVELS.COURSE),
      owner: result.owner ? this.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      version: result.version || null
    };
  }

  /**
   * @function normalizeCollection
   * This method is used Normalize a Collection
   */
  public normalizeCollection(collectionData): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const userBasePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = collectionData.thumbnail
      ? basePath + collectionData.thumbnail
      : DEFAULT_IMAGES_XS.COLLECTION;
    const userThumbnailUrl = collectionData.userProfileImage
      ? userBasePath + collectionData.userProfileImage
      : null;
    const creatorThumbnailUrl = collectionData.creatorProfileImage
      ? userBasePath + collectionData.creatorProfileImage
      : null;
    const taxonomyInfo = (collectionData.taxonomySet &&
        collectionData.taxonomySet.curriculum &&
        collectionData.taxonomySet.curriculum.curriculumInfo) ||
      null;
    const course = collectionData.course || {};
    return {
      id: collectionData.id,
      title: collectionData.title,
      thumbnail: thumbnailUrl,
      standards: this.taxonomyProvider
        .normalizeLearningMapsTaxonomyList(taxonomyInfo),
      publishStatus: collectionData.publishStatus,
      learningObjectives: collectionData.languageObjective,
      description: collectionData.languageObjective,
      resourceCount: collectionData.resourceCount || 0,
      questionCount: collectionData.questionCount || 0,
      remixCount: collectionData.scollectionRemixCount || 0,
      course: course.title,
      isCollection: collectionData.collectionType === CONTENT_TYPES.COLLECTION,
      isExternalCollection: collectionData.collectionType === CONTENT_TYPES.COLLECTION_EXTERNAL,
      courseId: course.id,
      contentFormat: CONTENT_TYPES.COLLECTION,
      relevance: collectionData.relevance,
      efficacy: collectionData.efficacy,
      engagement: collectionData.engagement,
      isVisibleOnProfile: collectionData.profileUserVisibility,
      owner: {
        id: collectionData.gooruUId,
        firstName: collectionData.userFirstName,
        lastName: collectionData.userLastName,
        avatarUrl: userThumbnailUrl,
        username: collectionData.usernameDisplay
      },
      creator: {
        id: collectionData.creatorId,
        firstName: collectionData.creatorFirstname,
        lastName: collectionData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: collectionData.creatornameDisplay
      },
      format: collectionData.format || collectionData.type || null,
      taxonomy: collectionData.taxonomy || taxonomyInfo
    };
  }

  /**
   * @function normalizeResource
   * This method is used to Normalize a resource
   */
  public normalizeResource(result): ContentModel {
    const format = result.contentSubFormat;
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES_XS.COLLECTION;
    const taxonomyInfo =
      (result.taxonomySet &&
        result.taxonomySet.curriculum &&
        result.taxonomySet.curriculum.curriculumInfo) ||
      [];
    return {
      id: result.gooruOid,
      title: result.title,
      description: result.description,
      format,
      thumbnail: thumbnailUrl,
      url: result.url,
      contentFormat: CONTENT_TYPES.RESOURCE,
      creator: result.creator
        ? this.normalizeOwner(result.creator)
        : null,
      owner: result.user ? this.normalizeOwner(result.user) : null,
      standards: this.taxonomyProvider
        .normalizeLearningMapsTaxonomyList(taxonomyInfo),
      publishStatus: result.publishStatus,
      isResource: true,
      publisher: result.publisher ? result.publisher[0] : null,
      efficacy: result.efficacy,
      engagement: result.engagement,
      relevance: result.relevance
    };
  }


  /**
   * @function normalizeQuestion
   * This method is used to Normalizes a question
   */
  public normalizeQuestion(result): ContentModel {
    if (result) {
      const basePath = this.session.userSession.cdn_urls.content_cdn_url;
      const thumbnailUrl = result.thumbnail
        ? basePath + result.thumbnail
        : DEFAULT_IMAGES_XS.ASSESSMENT;
      const format = result.contentFormat || (result.resourceFormat.value || null);
      const type = result.typeName || result.contentSubFormat;
      const taxonomyInfo =
        (result.taxonomySet &&
          result.taxonomySet.curriculum &&
          result.taxonomySet.curriculum.curriculumInfo) ||
        [];
      return {
        id: result.gooruOid,
        title: result.title,
        contentFormat: CONTENT_TYPES.QUESTION,
        description: result.description,
        creator: result.creator
          ? this.normalizeOwner(result.creator)
          : null,
        efficacy: result.efficacy,
        engagement: result.engagement,
        isQuestion: true,
        relevance: result.relevance,
        format,
        publisher: null,
        thumbnail: thumbnailUrl,
        type,
        owner: result.user ? this.normalizeOwner(result.user) : null,
        standards: this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(taxonomyInfo)
      };
    }
    return;
  }

  /**
   * @function normalizeUnit
   * This method is used to Normalizes a unit
   */
  public normalizeUnit(result): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES.COLLECTION;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      creator: result.creator
        ? this.normalizeOwner(result.creator)
        : null,
      createdDate: result.addDate,
      thumbnail: thumbnailUrl,
      lastModified: result.lastModified,
      lastModifiedBy: result.lastModifiedBy,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      assessmentCount: result.assessmentCount,
      collectionCount: result.collectionCount,
      lessonCount: result.lessonCount,
      standards: this.taxonomyProvider.normalizeLearningMapsTaxonomyList(taxonomyInfo, TAXONOMY_LEVELS.COURSE),
      owner: result.owner ? this.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      relevance: result.relevance,
      efficacy: result.efficacy,
      engagement: result.engagement,
      type: result.format
    };
  }

  /**
   * @function normalizeUnit
   * This method is used to Normalizes a lesson
   */
  public normalizeLesson(result): ContentModel {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES_XS.COLLECTION;
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      createdDate: result.addDate,
      contentFormat: CONTENT_TYPES.LESSON,
      thumbnail: thumbnailUrl,
      lastModified: result.lastModified,
      lastModifiedBy: result.lastModifiedBy,
      creator: result.creator
        ? this.normalizeOwner(result.creator)
        : null,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      assessmentCount: result.assessmentCount,
      collectionCount: result.collectionCount,
      standards: null,
      isLesson: true,
      owner: result.owner ? this.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      relevance: result.relevance,
      efficacy: result.efficacy,
      engagement: result.engagement,
      type: result.format
    };
  }

  /**
   * @function normalizeSearchLearningMapsContentInfo
   * Serialize each content type from the learning map API
   */
  public normalizeSearchLearningMapsContentInfo(contents) {
    const serializedContent: Array<LearningMapsContent> = [];
    if (contents.assessment) {
      const assessmentData = {
        type: CONTENT_TYPES.ASSESSMENT,
        content: [],
        totalHitCount: contents.assessment.totalHitCount
      };
      contents.assessment.searchResults.map((assessment) => {
        const assessmentInfo = this.normalizeAssessment(assessment);
        assessmentInfo.id = assessment.id;
        assessmentInfo.description = assessment.learningObjective;
        assessmentInfo.creator = assessment.creator ? this.normalizeOwner(assessment.creator) : null;
        assessmentInfo.owner = assessment.user ? this.normalizeOwner(assessment.user) : null;
        assessmentInfo.efficacy = assessment.efficacy;
        assessmentInfo.engagement = assessment.engagement;
        assessmentInfo.relevance = assessment.relevance;
        assessmentInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            assessment.taxonomy,
            CONTENT_TYPES.ASSESSMENT
          );
        assessmentData.content.push(assessmentInfo);
      });
      serializedContent.push(assessmentData);
    }
    if (contents.collection) {
      const collectionData = {
        type: CONTENT_TYPES.COLLECTION,
        content: [],
        totalHitCount: contents.collection.totalHitCount
      };
      contents.collection.searchResults.map((collection) => {
        const collectionInfo = this.normalizeCollection(collection);
        collectionInfo.id = collection.id;
        collectionInfo.description = collection.learningObjective;
        collectionInfo.creator = collection.creator ? this.normalizeOwner(collection.creator) : null;
        collectionInfo.owner = collection.user ? this.normalizeOwner(collection.user) : null;
        collectionInfo.efficacy = collection.efficacy;
        collectionInfo.engagement = collection.engagement;
        collectionInfo.relevance = collection.relevance;
        collectionInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            collection.taxonomy,
            CONTENT_TYPES.COLLECTION
          );
        collectionData.content.push(collectionInfo);
      });
      serializedContent.push(collectionData);
    }
    if (contents.course) {
      const courseData = {
        type: CONTENT_TYPES.COURSE,
        content: [],
        totalHitCount: contents.course.totalHitCount
      };
      contents.course.searchResults.map((course) => {
        const courseInfo = this.normalizeCourse(course);
        courseInfo.id = course.id;
        courseInfo.description = course.description;
        courseInfo.creator = course.creator
          ? this.normalizeOwner(course.creator)
          : null;
        courseInfo.owner = course.owner
          ? this.normalizeOwner(course.owner)
          : null;
        courseInfo.efficacy = course.efficacy;
        courseInfo.engagement = course.engagement;
        courseInfo.relevance = course.relevance;
        courseInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            course.taxonomy,
            TAXONOMY_LEVELS.COURSE
          );
        courseData.content.push(courseInfo);
      });
      serializedContent.push(courseData);
    }
    if (contents.resource) {
      const resourceData = {
        type: CONTENT_TYPES.RESOURCE,
        content: [],
        totalHitCount: contents.resource.totalHitCount
      };
      contents.resource.searchResults.map((resource) => {
        const resourceInfo = this.normalizeResource(resource);
        resourceInfo.id = resource.id;
        resourceInfo.description = resource.description;
        resourceInfo.creator = resource.creator
          ? this.normalizeOwner(resource.creator)
          : null;
        resourceInfo.owner = resource.user
          ? this.normalizeOwner(resource.user)
          : null;
        resourceInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            resource.taxonomy,
            TAXONOMY_LEVELS.RESOURCE
          );
        resourceData.content.push(resourceInfo);
      });
      serializedContent.push(resourceData);
    }
    if (contents.question) {
      const questionData = {
        type: CONTENT_TYPES.QUESTION,
        content: [],
        totalHitCount: contents.question.totalHitCount
      };
      contents.question.searchResults.map((question) => {
        const questionInfo = this.normalizeQuestion(question);
        questionInfo.id = question.id;
        questionInfo.description = question.description;
        questionInfo.creator = this.normalizeOwner(question.creator);
        questionInfo.owner = this.normalizeOwner(question.user);
        questionInfo.efficacy = question.efficacy;
        questionInfo.engagement = question.engagement;
        questionInfo.relevance = question.relevance;
        questionInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            question.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        questionData.content.push(questionInfo);
      });
      serializedContent.push(questionData);
    }
    if (contents.offlineActivity) {
      const offlineActivityData = {
        type: CONTENT_TYPES.OFFLINE_ACTIVITY,
        content: [],
        totalHitCount: contents.offlineActivity.totalHitCount
      };
      contents.offlineActivity.searchResults.map((offlineActivity) => {
        const offlineActivityInfo = this.normalizeOfflieActivity(offlineActivity);
        offlineActivityInfo.id = offlineActivity.id;
        offlineActivityInfo.description = offlineActivity.learningObjective;
        offlineActivityInfo.creator = offlineActivity.creator
          ? this.normalizeOwner(offlineActivity.creator)
          : null;
        offlineActivityInfo.owner = offlineActivity.owner
          ? this.normalizeOwner(offlineActivity.owner)
          : null;
        offlineActivityData.content.push(offlineActivityInfo);
      });
      serializedContent.push(offlineActivityData);
    }
    if (contents.lesson) {
      const lessonData = {
        type: CONTENT_TYPES.LESSON,
        content: [],
        totalHitCount: contents.lesson.totalHitCount
      };
      contents.lesson.searchResults.map((lesson) => {
        const lessonInfo = this.normalizeLesson(lesson);
        lessonInfo.id = lesson.id;
        lessonInfo.description = lesson.learningObjective;
        lessonInfo.creator = lesson.creator
          ? this.normalizeOwner(lesson.creator)
          : null;
        lessonInfo.owner = lesson.owner
          ? this.normalizeOwner(lesson.owner)
          : null;
        lessonInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            lessonInfo.standards,
            TAXONOMY_LEVELS.QUESTION
          );
        lessonData.content.push(lessonInfo);
      });
      serializedContent.push(lessonData);
    }
    if (contents.rubric) {
      const rubricData = {
        type: CONTENT_TYPES.RUBRIC,
        content: [],
        totalHitCount: contents.rubric.totalHitCount
      };
      contents.rubric.searchResults.map((rubric) => {
        const rubricInfo = this.normalizeRubric(rubric);
        rubricInfo.id = rubric.id;
        rubricInfo.description = rubric.learningObjective;
        rubricInfo.creator = rubric.creator
          ? this.normalizeOwner(rubric.creator)
          : null;
        rubricInfo.owner = rubric.owner
          ? this.normalizeOwner(rubric.owner)
          : null;
        rubricInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyList(
            rubricInfo.standards,
            TAXONOMY_LEVELS.QUESTION
          );
        rubricData.content.push(rubricInfo);
      });
      serializedContent.push(rubricData);
    }
    return serializedContent;
  }

  /**
   * @function searchFeaturedCourses
   * Method is used to search featured courses
   */
  public searchFeaturedCourses(params) {
    const endpoint = `${this.namespaceV2}/course`;
    return this.httpService.get(endpoint,params).then((response) => {
     return this.normalizeSearchCourses(response.data)
    })
  }

  /**
   * @function normalizeSearchCourses
   * Method is used to normalize search courses
   */
  public normalizeSearchCourses(payload) {
      const searchResults = payload.searchResults.map((result) => {
        return this.normalizeCourses(result);
      })
      return {
        searchResults,
        totalCount: payload.totalHitCount
      } as SearchCourseModel;
  }

  /**
   * @function normalizeCourses
   * Method is used to normalize courses
   */
  public normalizeCourses(result) {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES.COURSE;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      thumbnailUrl,
      subject: result.subjectBucket,
      subjectName:
        result.taxonomy && result.taxonomy.subject
          ? result.taxonomy.subject[0]
          : null,
      subjectSequence: result.subjectSequence,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      unitCount: result.unitCount,
      standards: this.taxonomyProvider.normalizeLearningMapsTaxonomyList(taxonomyInfo, TAXONOMY_LEVELS.COURSE),
      owner: result.owner ? this.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      version: result.version || null
    } as SearchResultsModel;
  }

  /**
   * @function filterDuplicateContent
   * Method is used to filter the duplicate content
   */
   public filterDuplicateContent(collectionPayload) {
    return collectionPayload.filter((collection, index, arr) => {
      const collectionTaxonomyKeys = Object.keys(collection.taxonomy || {});
      const collectionFrameworkCode = collectionTaxonomyKeys.length && collection.taxonomy[collectionTaxonomyKeys[0]].frameworkCode;
      const collectionSubjectId = collectionTaxonomyKeys.length && getSubjectId(collectionTaxonomyKeys[0]);
      return index === arr.findIndex((item) => {
        const itemTaxonomyKeys = Object.keys(item.taxonomy || {});
        const itemFrameworkCode = itemTaxonomyKeys.length && item.taxonomy[itemTaxonomyKeys[0]].frameworkCode;
        const itemSubjectId = itemTaxonomyKeys.length && getSubjectId(itemTaxonomyKeys[0]);
        if (collectionTaxonomyKeys.length && itemTaxonomyKeys.length) {
          return (item.title === collection.title && item.learningObjective === collection.learningObjective &&
            collectionSubjectId === itemSubjectId && collectionFrameworkCode === itemFrameworkCode);
        }
        return (item.title === collection.title && item.learningObjective === collection.learningObjective);
      });
    });
  }
}
