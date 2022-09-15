import { Injectable } from '@angular/core';
import { CONTENT_TYPES } from '@app/constants/helper-constants';
import { CollectionsVisibilityModel } from '@app/models/class/class';
import { Unit0Model } from '@app/models/unit0/unit0';
import { STORE_KEY } from '@constants/store-constants';
import { CollectionListModel } from '@models/collection/collection';
import { CourseDetailModel } from '@models/course/course';
import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { UnitSummaryModel } from '@models/unit/unit';
import { Store } from '@ngrx/store';
import { CourseProvider } from '@providers/apis/course/course';
import { Unit0Provider } from '@providers/apis/unit0/unit0';
import { PerformanceService } from '@providers/service/performance/performance.service';
import {
  setLessonCollection,
  setUnit,
  setUnitLesson
} from '@stores/actions/course-map.action';
import {
  getCollectionByLessonId,
  getLessonByUnitId,
  getUnitByCourseId
} from '@stores/reducers/course-map.reducer';
import { cloneObject, removeDuplicateValues } from '@utils/global';

@Injectable({
  providedIn: 'root',
})
export class CourseMapService {

  // ------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private courseProvider: CourseProvider,
    private store: Store,
    private performanceService: PerformanceService,
    private unit0Provider: Unit0Provider
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getUnitsByCourseId
   * This Method is used to get units by course id
   */
  public getUnitsByCourseId(reqParams) {
    return this.fetchUnitsByCourseId(reqParams.classId, reqParams.courseId).then((units: Array<UnitSummaryModel> | any) => {
      return this.unit0Provider.getUnit0List(reqParams.classId, reqParams.courseId).then((unit0Content: Array<Unit0Model>) => {
        if(unit0Content){
          units = [...unit0Content, ...units]
        }
        reqParams.units = units && units.length ? units : [];

      this.performanceService.fetchUnitsPerformance(reqParams);
      return units;
      });
    });
  }

  /**
   * @function getUnitLessons
   * This Method is used to get unit lessons
   */
  public getUnitLessons(reqParams) {
    const lessonPromise = reqParams.lessons ? Promise.resolve(reqParams.lessons) : this.fetchUnitLessons(reqParams.courseId, reqParams.unitId);
    return lessonPromise.then((lessons: Array<UnitLessonSummaryModel>) => {
      reqParams.lessons = lessons && lessons.length ? lessons : [];
      this.performanceService.fetchUnitLessonPerformance(reqParams);
      return lessons;
    });
  }

  /**
   * @function getUnitCollections
   * This Method is used to get unit collections
   */
  public getUnitCollections(reqParams) {
    const skippedContents = reqParams.skippedContents;
    const collectionsPromise = reqParams.collections ? Promise.resolve(reqParams.collections) : this.fetchUnitCollections(reqParams.classId, reqParams.courseId, reqParams.unitId, reqParams.lessonId, reqParams.studentId);
    return collectionsPromise.then((collectionResult: CollectionListModel) => {
      let collections = reqParams.collections ? reqParams.collections : collectionResult.coursePath.collections;
      if (!reqParams.isTeacherView && !reqParams.isCourseMap && !reqParams.collections) {
        collections = this.filterSkippedCollections(collectionResult, skippedContents);
      }
      reqParams.collections = (collections && collections.length) ? collections : [];
      this.performanceService.fetchCollectionPerformance(reqParams);
      return collections;
    });
  }

  /**
   * @function filterSkippedCollections
   * This Method is used to filter skip collections
   */
  public filterSkippedCollections(collections, skippedContents) {
    const teacherSuggestions = collections.alternatePaths.teacherSuggestions;
    const systemSuggestions = collections.alternatePaths.systemSuggestions;
    const suggestions = teacherSuggestions.concat(systemSuggestions);
    const skippedCollections = skippedContents.collections.concat(skippedContents.assessments);
    const collectionSummary = collections.coursePath.collections;
    if (suggestions && suggestions.length) {
      suggestions.forEach((suggestion) => {
        const collectionIndex = collectionSummary.findIndex((collection) => {
          return collection.id === suggestion.collectionId;
        });
        collectionSummary.splice(collectionIndex + 1, 0, suggestion);
      });
    }
    return collectionSummary.filter(
      collection => !skippedCollections.includes(collection.id)
    );
  }

  // -------------------------------------------------------------------------
  // Store Methods

  /**
   * @function fetchUnitsByCourseId
   * This Method is used to fetch units by course Id
   */
  public fetchUnitsByCourseId(classId, courseId) {
    return new Promise((resolve, reject) => {
      const storeId = `${STORE_KEY.COURSE_MAP}_${classId}_${courseId}`;
      const unitsStoreSubscription = this.store.select(getUnitByCourseId(storeId)).subscribe((unitData) => {
        if (!unitData) {
          this.courseProvider.fetchCourseById(courseId).then((courseResult: CourseDetailModel) => {
            const units = courseResult.units;
            this.store.dispatch(setUnit({ key: storeId, data: units }));
            resolve(cloneObject(units));
          }, reject);
        } else {
          resolve(cloneObject(unitData));
        }
      });
      unitsStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchUnitLessons
   * This Method is used to get unit lessons
   */
  public fetchUnitLessons(courseId, unitId) {
    return new Promise((resolve, reject) => {
      const storeId = `${STORE_KEY.COURSE_MAP}_${courseId}_${unitId}`;
      const unitLessonStoreSubscription = this.store.select(getLessonByUnitId(storeId)).subscribe((lessonData) => {
        if (!lessonData) {
          this.courseProvider.fetchUnitLessons(courseId, unitId).then((lessonResult) => {
            const lessons = removeDuplicateValues(lessonResult.lessons, 'lessonId');
            this.store.dispatch(setUnitLesson({ key: storeId, data: lessons }));
            resolve(cloneObject(lessons));
          }, reject);
        } else {
          resolve(cloneObject(lessonData));
        }
      });
      unitLessonStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchUnitCollections
   * This Method is used to get unit collections
   */
  public fetchUnitCollections(classId, courseId, unitId, lessonId, userId = null) {
    return new Promise((resolve, reject) => {
      const storeId = `${STORE_KEY.COURSE_MAP}_${unitId}_${lessonId}`;
      const collectionStoreSubscription = this.store.select(getCollectionByLessonId(storeId)).subscribe((collectionData) => {
        if (!collectionData) {
          this.courseProvider.fetchUnitCollections(classId, courseId, unitId, lessonId, userId).then((collectionResult) => {
            collectionResult.coursePath.collections = removeDuplicateValues(collectionResult.coursePath.collections, 'id');
            this.store.dispatch(setLessonCollection({ key: storeId, data: collectionResult }));
            resolve(cloneObject(collectionResult));
          }, reject);
        } else {
          resolve(cloneObject(collectionData));
        }
      });
      collectionStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function assignVisibilitySettings
   * This method is used to assign the visibility settings
   */
  public assignVisibilitySettings(unitId, lessonId, collections, courseVisibilities) {
    const activeUnit = courseVisibilities.units.find(unit => unit.id === unitId);
    const activeLesson = activeUnit && activeUnit.lessons.find(lesson => lesson.id === lessonId);
    const visibilityFlag = (visibilities, id) => visibilities.find(visibility => visibility.id === id);
    if (activeLesson) {
      collections.forEach(collection => {
        let activeCollections;
        if (collection.format === CONTENT_TYPES.COLLECTION || collection.format === CONTENT_TYPES.COLLECTION_EXTERNAL) {
          activeCollections = activeLesson.collections || [];
        } else {
          activeCollections = activeLesson.assessments || [];
        }
        const visibilitySetting: CollectionsVisibilityModel = visibilityFlag(activeCollections, collection.id);
        collection.isVisible = visibilitySetting && visibilitySetting.visible === 'on';
      })
    }
  }
}
