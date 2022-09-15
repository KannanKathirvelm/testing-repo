import { Injectable } from '@angular/core';
import { ATCProvider } from '@providers/apis/atc/atc';

@Injectable({
  providedIn: 'root'
})
export class ATCService {

  constructor(private atcProvider: ATCProvider) { }

  /**
   * @function getAtcPerformanceSummary
   * This method is used to get atc view performance summary
   */
  public getAtcPerformanceSummary(classId, subjectCode, filters) {
    return this.atcProvider.getAtcPerformanceSummary(classId, subjectCode, filters);
  }

  /**
   * @function getInitialSkylinePerformanceSummary
   * This method is used to get initial skyline performance summary
   */
  public getInitialSkylinePerformanceSummary(classId, subjectCode, filters) {
    return this.atcProvider.getInitialSkylinePerformanceSummary(classId, subjectCode, filters);
  }

  /**
   * @function fetchTimespent
   * This method is used to get timespent summary
   */
  public fetchTimespent(classId, fromDate, toDate, userId) {
    return this.atcProvider.fetchTimespent(classId, fromDate, toDate, userId);
  }

  /**
   * @function getAtcDiagnosticDetails
   * This method is used to get diagnostic summary
   */
  public getAtcDiagnosticDetails(classId, fromDate, toDate) {
    return this.atcProvider.getAtcDiagnosticDetails(classId, fromDate, toDate);
  }

  /**
   * @function getGradeCompetencyCount
   * This method is used to get grade competency count
   */
  public getGradeCompetencyCount(params) {
    return this.atcProvider.getGradeCompetencyCount(params);
  }

  /**
   * @function getAtcPerformanceForNonPremiumClass
   * This method is used to get grade competency count
   */
  public getAtcPerformanceForNonPremiumClass(classId, courseId) {
    return this.atcProvider.getAtcPerformanceForNonPremiumClass(classId, courseId);
  }
}
