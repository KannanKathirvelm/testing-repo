import { Injectable } from '@angular/core';
import { CONTENT_TYPES } from '@constants/helper-constants';
import { SearchProvider } from '@providers/apis/search/search';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private searchProvider: SearchProvider) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTenantLibrary
   * Method to fetch tenant library
   */
  public fetchTenantLibrary() {
    return this.searchProvider.fetchTenantLibrary();
  }

  /**
   * @function searchLearningMapContent
   * Method to search learning maps content
   */
  public searchLearningMapContent(filter, type) {
    return this.searchProvider.searchLearningMapContent(filter, type);
  }

  /**
   * @function searchAssessments
   * This method is used to search assessments
   */
  public searchAssessments(params) {
    return this.searchProvider.searchAssessments(params);
  }

  /**
   * @function searchCollections
   * This method is used to search collections
   */
  public searchCollections(params) {
    return this.searchProvider.searchCollections(params);
  }

  /**
   * @function searchOfflineActivity
   * This method is used to search offline activity
   */
  public searchOfflineActivity(params) {
    return this.searchProvider.searchOfflineActivity(params);
  }

  /**
   * @function searchCapContents
   * This method is used to search content from cap api
   */
  public searchCapContents(params) {
    return this.searchProvider.searchCapContents(params);
  }

  /**
   * @function getLearningMapContext
   * Method to get the learning map context
   */
  public getLearningMapContext(start, length, type, competencyCode) {
    const filter = {
      q: '*',
      start,
      length
    };
    if (type === CONTENT_TYPES.COURSE || type === CONTENT_TYPES.LESSON) {
      filter['flt.relatedGutCode'] = competencyCode;
    }
    if (type === CONTENT_TYPES.COLLECTION || type === CONTENT_TYPES.ASSESSMENT) {
      filter['flt.collectionType'] = type;
      filter['flt.publishStatus'] = 'published';
      filter['flt.gutCode'] = competencyCode;
    }
    if (type === CONTENT_TYPES.RESOURCE) {
      filter['flt.contentFormat'] = type;
      filter['flt.publishStatus'] = 'published';
      filter['flt.gutCode'] = competencyCode;
    }
    if (type === CONTENT_TYPES.QUESTION) {
      filter['flt.resourceFormat'] = type;
      filter['flt.publishStatus'] = 'published';
      filter['flt.gutCode'] = competencyCode;
    }
    if (type === CONTENT_TYPES.RUBRIC) {
      filter['flt.gutCode'] = competencyCode;
    }
    if (type === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      filter['flt.collectionType'] = type;
      filter['flt.publishStatus'] = 'published';
    }
    return filter;
  }

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content
   */
  public fetchLearningMapsContent(competencyCode, filters) {
    return this.searchProvider.fetchLearningMapsContent(competencyCode, filters);
  }

  /**
   * @function searchFeaturedCourses
   * Method to search featured courses
   */
  public searchFeaturedCourses(params) {
    return this.searchProvider.searchFeaturedCourses(params);
  }
}
