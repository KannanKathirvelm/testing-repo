import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { DatabaseService } from '@app/providers/service/database.service';
import { UtilsService } from '@app/providers/service/utils.service';
import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  COLLECTION,
  COLLECTION_EXTERNAL,
  OFFLINE_ACTIVITY,
  PATH_TYPES,
} from '@constants/helper-constants';
import { Unit0CollectionModel, Unit0LessonModel, Unit0Model } from '@models/unit0/unit0';
import { HttpService } from '@providers/apis/http';
import { SessionService } from '@providers/service/session/session.service';
import { getDefaultImage } from '@utils/global';


@Injectable({
  providedIn: 'root'
})
export class Unit0Provider {
  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v1';

  // -------------------------------------------------------------------------
  // API Path

  public getUnit0ListAPIPath(classId, courseId) {
    return `${this.namespace}/classes/${classId}/courses/${courseId}/unit0`;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private databaseService: DatabaseService

  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getUnit0List
   * This method is used to get the Unit0 details
   */
  public getUnit0List(classId: string, courseId: string) {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.UNIT0_LIST, {
      classId,
      courseId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getUnit0ListAPIPath(classId, courseId);
        this.httpService.get<Unit0Model>(endpoint).then((res) => {
            const normalizeUnit0Milestones = this.normalizeUnit0Milestones(res.data);
            this.databaseService.upsertDocument(DOCUMENT_KEYS.UNIT0_LIST, normalizeUnit0Milestones);
            resolve(normalizeUnit0Milestones);
          }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeUnit0Milestones
   * This method is used to get the Unit0Milestones details
   */
  private normalizeUnit0Milestones(payload): Array<Unit0Model> {
    const unit0Content = payload.unit0 || [];
    return unit0Content.map((unit) => {
      const milestoneData: Unit0Model = {
        milestoneId: unit.milestone_id,
        sequenceId: unit.unit_sequence,
        milestoneTitle: unit.milestone_title || unit.unit_title,
        isUnit0: true,
        lessons: this.normalizeUnit0Lessons(unit),
        unitId: unit.unit_id,
        title: unit.unit_title,
        gradeName: unit.milestone_title || unit.unit_title
      };
      return milestoneData;
    });
  }

  /**
   * Normalize unit0 lessons
   * this method is used to serialize the unit0 lessons
   */
  private normalizeUnit0Lessons(unit): Array<Unit0LessonModel> {
    const lessonList = [];
    unit.lessons.forEach((lesson) => {
      const unit0Lesson: Unit0LessonModel = {
        collections: this.normalizeUnit0Collections(lesson.collections || []),
        lessonId: lesson.lesson_id,
        lessonSequence: lesson.sequence || null,
        lessonTitle: lesson.lesson_title,
        unitId: unit.unit_id,
        unitTitle: unit.unit_title,
        unitSequence: unit.unit_sequence,
        title: lesson.lesson_title
      };
      lessonList.push(unit0Lesson);
    });
    return lessonList;
  }

  /**
   * Normalize unit0 collections
   * this method is used to serialize the unit0 collections
   */
  private normalizeUnit0Collections(collections): Array<Unit0CollectionModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return collections.map((collection) => {
      const route0Collection: Unit0CollectionModel = {
        id: collection.collection_id,
        collectionSequence: collection.collection_sequence,
        collectionType: collection.collection_type,
        format: collection.collection_type,
        pathId: collection.path_id,
        pathType: PATH_TYPES.UNIT0,
        title: collection.collection_title,
        thumbnailXS: collection.thumbnail ? `${cdnUrl}${collection.thumbnail}`
          : getDefaultImage(collection.collectionType),
        ctxPathId: collection.path_id,
        ctxPathType: PATH_TYPES.UNIT0,
        isCollection: collection.collection_type === COLLECTION,
        isAssessment: collection.collection_type === ASSESSMENT,
        isExternalAssessment: collection.collection_type === ASSESSMENT_EXTERNAL,
        isExternalCollection: collection.collection_type === COLLECTION_EXTERNAL,
        isOfflineActivity: collection.collection_type === OFFLINE_ACTIVITY,
        thumbnail: collection.thumbnail ? `${cdnUrl}${collection.thumbnail}`
          : getDefaultImage(collection.collectionType)
      };
      return route0Collection;
    });
  }
  /**
   * @function storeUnit0List
   * This method is used to store unit0 list
   */
  public storeUnit0List(classId, courseId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.UNIT0_LIST, {
      classId,
      courseId
    });
    const normalizePerformance = this.normalizeUnit0Milestones(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }
}
