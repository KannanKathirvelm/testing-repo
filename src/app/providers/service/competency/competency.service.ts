import { Injectable } from '@angular/core';
import { UserSignatureCompetenciesModel } from '@models/signature-content/signature-content';
import { CompetencyProvider } from '@providers/apis/competency/competency';

@Injectable({
  providedIn: 'root',
})
export class CompetencyService {

  // -------------------------------------------------------------------------
  // Methods

  constructor(private competencyProvider: CompetencyProvider) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchDomainLevelSummary
   * Method to fetch domain level summary
   */
  public fetchDomainLevelSummary(filters) {
    return this.competencyProvider.fetchDomainLevelSummary(filters);
  }

  /**
   * @function fetchSubjectDomainTopicMetadata
   * This Method is used to fetch collection performance
   */
  public fetchSubjectDomainTopicMetadata(params) {
    return this.competencyProvider.fetchSubjectDomainTopicMetadata(params);
  }

  /**
   * @function fetchCompletionStatus
   * This method is used to fetch lesson competency completion status
   */
  public fetchCompletionStatus(params) {
    return this.competencyProvider.fetchCompletionStatus(params);
  }

  /**
   * @function fetchDomainTopicCompetencyMatrix
   * This Method is used to fetch collection performance
   */
  public fetchDomainTopicCompetencyMatrix(subject, year, month, classId, user) {
    return this.competencyProvider.fetchDomainTopicCompetencyMatrix(subject, year, month, classId, user);
  }

  /**
   * @function fetchStrugglingCompetency
   * Method to fetch domain level summary
   */
  public fetchStrugglingCompetency(filters) {
    return this.competencyProvider.fetchStrugglingCompetency(filters);
  }

  /**
   * @function fetchStudentsPerfomance
   * Method to fetch student performance
   */
  public fetchStudentsPerfomance(params) {
    return this.competencyProvider.fetchStudentsPerfomance(params);
  }

  /**
   * @function fetchCompetencyCompletionStats
   * This method is used to fetc competency stats
   */
  public fetchCompetencyCompletionStats(classIds) {
    return this.competencyProvider.fetchCompetencyCompletionStats(classIds);
  }

  /**
   * @function fetchUserSignatureCompetencies
   * This method is used to fetch signature competencies
   */
  public fetchUserSignatureCompetencies(userId, subjectCode): Promise<Array<UserSignatureCompetenciesModel>> {
    return this.competencyProvider.fetchUserSignatureCompetencies(userId, subjectCode);
  }

  /**
   * @function getDomainLevelSummary
   * Method to fetch the domain level summary
   */
  public getDomainLevelSummary(userId, subjectCode, year, month) {
    return this.competencyProvider.getDomainLevelSummaryMatrix(userId, subjectCode, year, month);
  }

  /**
   * @function getCompetencyMatrixCoordinates
   * Method to fetch the matrix coordinates
   */
  public getCompetencyMatrixCoordinates(subject) {
    return this.competencyProvider.getCompetencyMatrixCoordinates(subject);
  }

  /**
   * @function fetchLJCompetency
   * Method to fetch Learning journey competency
   */
  public fetchLJCompetency(params) {
    return this.competencyProvider.fetchLJCompetency(params);
  }

  /**
   * @function fetchStudentsByCompetency
   * Method to fetch students by competency
   */
  public fetchStudentsByCompetency(classId, competency) {
    return this.competencyProvider.fetchStudentsByCompetency(classId, competency);
  }
}
