import { Injectable } from '@angular/core';
import { CollectionListModel } from '@models/collection/collection';
import {
  Route0CollectionsModel,
  Route0ContentModel,
  Route0LessonsModel,
  Route0MilestonesModel
} from '@models/route0/route0';
import { CollectionProvider } from '@providers/apis/collection/collection';
import { HttpService } from '@providers/apis/http';
import { SessionService } from '@providers/service/session/session.service';
import { getDefaultImage } from '@utils/global';

@Injectable({
  providedIn: 'root'
})

export class Route0Provider {

  // -------------------------------------------------------------------------
  // Properties

  private route0Namespace = 'api/route0/v2';
  private route0NamespaceV1 = 'api/route0/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private collectionProvider: CollectionProvider,
    private httpService: HttpService,
    private sessionService: SessionService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getRoute0List
   * Method to get current location of user
   */
  public getRoute0List(classId: string, courseId: string, userId: string) {
    const endpoint = `${this.route0Namespace}/rtd`;
    const params = {
      classId,
      courseId,
      userId
    };
    return this.httpService.get<Route0ContentModel>(endpoint, params).then((res) => {
      const response = res.data;
      const route0: Route0ContentModel = {
        createdAt: response.createdAt,
        route0Content: {
          milestones: this.normalizeRoute0Milestones(response.route0Content.milestones || []),
        },
        status: response.status
      };
      return route0;
    });
  }

  /**
   * @function fetchRoute0Suggestions
   * This Method is used to fetch route0 suggestions
   */
  public fetchRoute0Suggestions(classId, courseId, unitId, lessonId, userId?) {
    const endpoint = `${this.route0NamespaceV1}/rtd/class/${classId}/courses/${courseId}/units/${unitId}/lessons/${lessonId}/alternate-paths`;
    const params = {
      userId
    }
    return this.httpService.get<CollectionListModel>(endpoint, params).then((res) => {
      const collectionList: CollectionListModel = {
        alternatePaths: {
          systemSuggestions: res.data.alternate_paths
            .system_suggestions
            ? this.collectionProvider.normalizeSuggestionSummary(
              res.data.alternate_paths.system_suggestions,
              false
            )
            : [],
          teacherSuggestions: res.data.alternate_paths
            .teacher_suggestions
            ? this.collectionProvider.normalizeSuggestionSummary(
              res.data.alternate_paths.teacher_suggestions,
              true
            )
            : [],
        }
      };
      return collectionList;
    });
  }

  /**
   * @function updateRoute0Status
   * Method to update route0 status
   */
  public updateRoute0Status(classId: string, courseId: string, status: string) {
    const endpoint = `${this.route0Namespace}/rtd/status`;
    const params = {
      classId,
      courseId,
      status
    };
    return this.httpService.put(endpoint, params);
  }

  private normalizeRoute0Milestones(milestones): Array<Route0MilestonesModel> {
    return milestones.map((milestone) => {
      const milestoneData: Route0MilestonesModel = {
        milestoneId: milestone.milestoneId,
        sequenceId: milestone.milestoneSequence,
        milestoneTitle: milestone.milestoneTitle,
        isRoute0: true,
        lessons: this.normalizeRoute0Lessons(milestone.units || [])
      };
      return milestoneData;
    });
  }

  /**
   * Normalize route0 lessons
   * this method is used to serialize the route0 lessons
   */
  private normalizeRoute0Lessons(units): Array<Route0LessonsModel> {
    const lessonList = [];
    units.forEach((unit) => {
      return unit.lessons.forEach((lesson) => {
        const route0Lesson: Route0LessonsModel = {
          collections: this.normalizeRoute0Collections(lesson.collections || []),
          lessonId: lesson.lessonId,
          lessonSequence: lesson.lessonSequence,
          lessonTitle: lesson.lessonTitle,
          unitId: unit.unitId,
          unitTitle: unit.unitTitle,
          unitSequence: unit.unitSequence,
          txCompCode: Array.isArray(lesson.aggregatedGutCodes) ? lesson.aggregatedGutCodes[0] : lesson.aggregatedGutCodes,
        };
        lessonList.push(route0Lesson);
      });
    });
    return lessonList;
  }

  /**
   * Normalize route0 collections
   * this method is used to serialize the route0 collections
   */
  private normalizeRoute0Collections(collections): Array<Route0CollectionsModel> {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return collections.map((collection) => {
      const route0Collection: Route0CollectionsModel = {
        id: collection.collectionId,
        collectionSequence: collection.collectionSequence,
        collectionType: collection.collectionType,
        format: collection.collectionType,
        pathId: collection.pathId,
        title: collection.title,
        thumbnailXS: collection.thumbnail ? `${cdnUrl}${collection.thumbnail}`
          : getDefaultImage(collection.collectionType),
      };
      return route0Collection;
    });
  }
}
