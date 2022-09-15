import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { DatabaseService } from '@app/providers/service/database.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { MilestoneLocationModel } from '@models/location/location';
import { HttpService } from '@providers/apis/http';

@Injectable({
  providedIn: 'root'
})
export class LocationProvider {
  // -------------------------------------------------------------------------
  // Properties

  private locationNamespace = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService
  ) {}

  // -------------------------------------------------------------------------
  // API Path

  public getStudentCurrentLocationAPIPath(classId, userId) {
    return `${this.locationNamespace}/class/${classId}/user/${userId}/current/location`;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentCurrentLocation
   * Method to fetch current location of user
   */
  public fetchStudentCurrentLocation(
    classId: string,
    courseId: string,
    fwCode: string,
    userId: string
  ) {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.STUDENT_CURRENT_LOCATION,
      {
        classId,
        courseId,
        fwCode,
        userId
      }
    );
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getStudentCurrentLocationAPIPath(classId, userId);
        const params = { courseId };
        if (fwCode) {
          Object.assign(params, {
            fwCode
          });
        }
        this.httpService
          .get<MilestoneLocationModel>(endpoint, params)
          .then((res) => {
            const response = res.data.content ? res.data.content[0] : null;
            if (response) {
              const normalizeAllActivityPerformanceSummary =
                this.normalizeAllActivityPerformanceSummary(response);
              this.databaseService.upsertDocument(
                DOCUMENT_KEYS.STUDENT_CURRENT_LOCATION,
                normalizeAllActivityPerformanceSummary
              );
              resolve(normalizeAllActivityPerformanceSummary);
            }
            resolve(response);
          }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeAllActivityPerformanceSummary
   * normalize all activity performance summary
   */
  public normalizeAllActivityPerformanceSummary(payload) {
    const location: MilestoneLocationModel = {
      classId: payload.classId,
      collectionId: payload.collectionId || payload.assessmentId,
      collectionTitle: payload.collectionTitle,
      collectionType: payload.collectionType,
      courseId: payload.courseId,
      lessonId: payload.lessonId,
      milestoneId: payload.milestoneId,
      pathId: payload.pathId,
      pathType: payload.pathType,
      status: payload.status,
      unitId: payload.unitId
    };
    return location;
  }

  /**
   * @function storeStudentCurrentLocation
   * This method is used to store milestone performance
   */
  public storeStudentCurrentLocation(
    classId,
    courseId,
    fwCode,
    userId,
    payload
  ) {
    const dataBaseKey = this.databaseService.documentKeyParser(
      DOCUMENT_KEYS.STUDENT_CURRENT_LOCATION,
      {
        classId,
        courseId,
        fwCode,
        userId
      }
    );
    const normalizePerformance = this.normalizeAllActivityPerformanceSummary(
      payload.content
    );
    this.databaseService.upsertDocument(dataBaseKey, normalizePerformance);
  }
}
