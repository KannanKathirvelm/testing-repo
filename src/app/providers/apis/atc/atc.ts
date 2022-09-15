import { Injectable } from '@angular/core';
import { AtcPerformanceModel, DiagnosticDetailModel, DomainCodeModel, DomainModel, InitialPerformance, NonPremiumAtcPerformance, StudentDetails, TimespentModel } from '@models/atc/atc';
import { GradeCompetency } from '@models/taxonomy/taxonomy';
import { HttpService } from '@providers/apis/http';

@Injectable({
  providedIn: 'root'
})
export class ATCProvider {

  // -------------------------------------------------------------------------
  // Properties
  private namespaceV3 = 'api/ds/users/v3';
  private namespaceV2 = 'api/ds/users/v2';
  private nucleusNamespace = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getAtcPerformanceSummary
   * This method is used to get atc view performance summary
   */
  public getAtcPerformanceSummary(classId, subjectCode, filters): Promise<Array<AtcPerformanceModel>> {
    const endpoint = `${this.namespaceV3}/nc/atc/pvc`;
    const params = {
      classId,
      subjectCode,
      ...filters
    }
    return this.httpService.get<Array<AtcPerformanceModel>>(endpoint, params)
      .then((res) => {
        const response = res.data;
        return this.normalizeAtcPerformance(response.competencyStats);
      });
  }

  /**
   * @function getInitialSkylinePerformanceSummary
   * This method is used to inital view performance summary
   */
  public getInitialSkylinePerformanceSummary(classId, subjectCode, filters) {
    const endpoint = `${this.namespaceV3}/nc/atc/initial/baseline`;
    const params = {
        classId,
        subjectCode,
        ...filters
      }
      return this.httpService.get<InitialPerformance>(endpoint, params)
      .then((res) => {
        const response = res.data;
        return this.normalizeInitialSkylinePerformance(response.competencyStats);
      });
    }

  /**
   * @function getAtcDiagnosticDetails
   * This method is used to get atc diagnostic details
   */
  public getAtcDiagnosticDetails(classId, from, to): Promise<DiagnosticDetailModel> {
    const endpoint = `${this.namespaceV2}/stats/class/diagnostic`;
    const params = {
      classId,
      from,
      to
    }
    return this.httpService.get<DiagnosticDetailModel>(endpoint, params)
      .then((res) => {
        return this.normalizeAtcDiagnosticDetails(res.data);
      });
  }

  /**
   * @function getAtcPerformanceForNonPremiumClass
   * This method is used to get atc view performance summary
   */
  public getAtcPerformanceForNonPremiumClass(classId, courseId): Promise<Array<NonPremiumAtcPerformance>> {
    const endpoint = `${this.nucleusNamespace}/atc/pvc`;
    const params = {
      classId,
      courseId
    }
    return this.httpService.get<Array<NonPremiumAtcPerformance>>(endpoint, params)
      .then((res) => {
        return this.normalizeAtcPerformanceSummary(res.data.usageData);
      });
  }

  /**
   * @function fetchTimespent
   * This method is used to get timespent summary
   */
  public fetchTimespent(classIds, from, to, userId): Promise<Array<TimespentModel>> {
    const endpoint = `${this.namespaceV2}/stats/class/timespent`;
    const params = {
      classIds,
      from,
      to,
      userId
    }
    return this.httpService.post<Array<TimespentModel>>(endpoint, params)
      .then((res) => {
        return this.normalizeTimespentSummary(res.data.data);
      });
  }

  /**
   * @function normalizeTimespentSummary
   * This method is used to normalize atc performance
   */
  public normalizeTimespentSummary(payload): Array<TimespentModel> {
    return payload.map((timespent) => {
      return {
        assessmentTimespent: timespent.assessment_timespent,
        caTimespent: timespent.ca_timespent,
        classTd: timespent.class_id,
        collectionTimespent: timespent.collection_timespent,
        destinationEta: timespent.destination_eta,
        ljTimespent: timespent.lj_timespent,
        totalTimespent: timespent.total_timespent
      };
    });
  }

  /**
   * @function normalizeAtcDiagnosticDetails
   * This method is used to normalize atc diagnostic
   */
  public normalizeAtcDiagnosticDetails(payload) {
    const result: DiagnosticDetailModel = {
      domains: payload.domains && this.normalizeDomainDetails(payload.domains) || [],
      highestDomain: payload.highest_domain && this.normalizeHighAndLowDomain(payload.highest_domain) || null,
      lowestDomain: payload.lowest_domain && this.normalizeHighAndLowDomain(payload.lowest_domain) || null,
    };
    return result;
  }

  /**
   * @function normalizeHighAndLowDomain
   * This method is used to normalize atc diagnostic high and low domain values
   */
  public normalizeHighAndLowDomain(item) {
    const domain: DomainCodeModel = {
      code: item.code,
      grade: item.grade,
      title: item.title
    };
    return domain;
  }

  /**
   * @function normalizeDomainDetails
   * This method is used to normalize diagnostic domain details
   */
  public normalizeDomainDetails(payload): Array<DomainModel> {
    return payload.map((domain) => {
      return {
        code: domain.code,
        sequenceId: domain.sequence_id,
        students: domain.students && this.normalizeDomainStudents(domain.students) || null,
        title: domain.title
      };
    });
  }

  /**
   * @function normalizeDomainStudents
   * This method is used to normalize diagnostic domain student details
   */
  public normalizeDomainStudents(payload): Array<StudentDetails> {
    return payload.map((student) => {
      return {
        firstName: student.first_name,
        id: student.id,
        lastName: student.last_name,
        level: student.level,
        startingCompetency: student.starting_competency,
        thumbnail: student.thumbnail
      };
    });
  }

  /**
   * @function normalizeAtcPerformanceSummary
   * Normalize method for classic course atc view chart
   */
  public normalizeAtcPerformanceSummary(performanceSummary): Array<NonPremiumAtcPerformance> {
    const normalizedClassPerformanceSummary = [];
    if (performanceSummary) {
      performanceSummary.map((performance) => {
        const userPerformanceData = {
          progress: performance.percentCompletion,
          score: performance.percentScore,
          userId: performance.userId
        };
        normalizedClassPerformanceSummary.push(userPerformanceData);
      });
    }
    return normalizedClassPerformanceSummary;
  }

  /**
   * @function normalizeAtcPerformance
   * This method is used to normalize atc performance
   */
  public normalizeAtcPerformance(paylod): Array<AtcPerformanceModel> {
    return paylod.map((competency) => {
      return {
        assertedCompetencies: competency.assertedCompetencies,
        completedCompetencies: competency.completedCompetencies,
        grade: competency.grade,
        gradeId: competency.gradeId,
        inferredCompetencies: competency.inferredCompetencies,
        inprogressCompetencies: competency.inprogressCompetencies,
        masteredCompetencies: competency.masteredCompetencies,
        percentCompletion: competency.percentCompletion,
        percentScore: competency.percentScore,
        totalCompetencies: competency.totalCompetencies,
        userId: competency.userId
      };
    });
  }

  /**
   * @function getGradeCompetencyCount
   * This method is used to get grade competency count
   */
  public getGradeCompetencyCount(params): Promise<Array<GradeCompetency>> {
    const endpoint = `${this.namespaceV2}/tx/grade/competency/count`;
    return this.httpService.get<Array<GradeCompetency>>(endpoint, params)
      .then((res) => {
        const response = res.data;
        return this.normalizeGradeCompetencyCount(response.grades);
      });
  }

  /**
   * @function normalizeGradeCompetencyCount
   * This method is used to normalize atc performance
   */
  public normalizeGradeCompetencyCount(paylod): Array<GradeCompetency> {
    return paylod.map((grade) => {
      return {
        description: grade.description,
        grade: grade.grade,
        id: grade.id,
        sequence: grade.sequence,
        thumbnail: grade.thumbnail,
        totalCompetencies: grade.totalCompetencies
      };
    });
  }

  /**
   * @function normalizeInitialSkylinePerformance
   * This method is used to normalize initial skyline performance
   */
  public normalizeInitialSkylinePerformance(payload): InitialPerformance {
    return payload.map((item) => {
      return {
        assertedCompetencies: item.assertedCompetencies,
        completedCompetencies: item.completedCompetencies,
        inferredCompetencies: item.inferredCompetencies,
        inprogressCompetencies: item.inprogressCompetencies,
        masteredCompetencies: item.masteredCompetencies,
        userId: item.userId
      }
    })
  }
}