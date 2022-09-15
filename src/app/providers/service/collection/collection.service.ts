import { Injectable } from '@angular/core';
import { ASSESSMENT, COLLECTION } from '@constants/helper-constants';
import { CollectionProvider } from '@providers/apis/collection/collection';
import { PerformanceProvider } from '@providers/apis/performance/performance';
@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private performanceProvider: PerformanceProvider,
    private collectionProvider: CollectionProvider
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCollectionById
   * This method is used to load the collection
   */
  public fetchCollectionById(id, type, storeOffline = false, downloadProgressCb?) {
    return this.collectionProvider.fetchCollectionById(id, type, storeOffline, downloadProgressCb);
  }

  /**
   * @function readQuestion
   * Method to read question
   */
  public readQuestion(questionId) {
    return this.collectionProvider.readQuestion(questionId);
  }

  /**
   * @function fetchCollectionList
   * This Method is used to get collections
   */
  public fetchCollectionList(classId: string, courseId: string, lessonId: string, unitId: string, userId, skippedContents) {
    return this.collectionProvider.fetchCollectionList(classId, courseId, lessonId, unitId, userId)
      .then((collectionResult) => {
        const teacherSuggestions = collectionResult.alternatePaths.teacherSuggestions;
        const systemSuggestions = collectionResult.alternatePaths.systemSuggestions;
        const suggestions = teacherSuggestions.concat(systemSuggestions);
        const skippedCollection = skippedContents && skippedContents.collections ? skippedContents.collections : [];
        const skippedAssessment = skippedContents && skippedContents.assessments ? skippedContents.assessments : [];
        const skippedCollections = skippedCollection.concat(skippedAssessment);
        const collectionSummary = collectionResult.coursePath.collectionSummary;
        if (suggestions && suggestions.length) {
          suggestions.reverse().forEach((suggestion) => {
            const collectionIndex = collectionSummary.findIndex((collection) => {
              return collection.id === suggestion.collectionId;
            });
            collectionSummary.splice(collectionIndex + 1, 0, suggestion);
          });
        }
        collectionSummary.map((collection) => {
          collection.isRescoped = skippedCollections.includes(collection.id);
          return collection;
        });
        this.fetchCollectionPerformance(classId, courseId, lessonId, unitId, ASSESSMENT, collectionSummary, userId);
        this.fetchCollectionPerformance(classId, courseId, lessonId, unitId, COLLECTION, collectionSummary, userId);
        return collectionSummary;
      });
  }


  /**
   * @function fetchCollectionPerformance
   * This Method is used to fetch collection performance
   */
  public fetchCollectionPerformance(classId, courseId, lessonId, unitId, collectionType, collections, userId) {
    this.performanceProvider.fetchUnitCollectionPerformance(classId, courseId, unitId, lessonId, collectionType, true, null, userId)
      .then((assessmentPerformance) => {
        const performances = assessmentPerformance;
        performances.map((performanceData) => {
          const collection = collections.find((item) => {
            return (item.id || item.collectionId) === performanceData.collectionId;
          });
          if (collection) {
            collection.performance = performanceData.performance;
          }
        });
      });
  }
}
