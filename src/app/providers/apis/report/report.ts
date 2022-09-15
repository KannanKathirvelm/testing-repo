import { Injectable } from '@angular/core';
import { COMPETENCY_STATUS_VALUE } from '@constants/helper-constants';
import { CompetencyModel, InteractionsModel, StudentsReportModel, StudentSummaryTimespentModel } from '@models/proficiency-report/proficiency-report';
import { HttpService } from '@providers/apis/http';

@Injectable({
  providedIn: 'root'
})

export class ReportProvider {

  // -------------------------------------------------------------------------
  // Properties

  private reportNamespace = 'api/ds/users/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentsWeeklySummaryReport
   * This method is used to fetch students weekly summary report
   */
  public fetchStudentsWeeklySummaryReport(classId: string, dateParams: { fromDate: string, toDate: string }) {
    const endpoint = `${this.reportNamespace}/class/${classId}/student/summary/weekly`;
    return this.httpService.get<StudentsReportModel>(endpoint, dateParams).then((res) => {
      return this.normalizeStudentsWeeklySummaryData(res.data);
    });
  }

  /**
   * @function fetchStudentsSummaryReport
   * This method is used to fetch students summary report
   */
  public fetchStudentsSummaryReport(classId: string, dateParams = null) {
    const endpoint = `${this.reportNamespace}/class/${classId}/student/summary`;
    return this.httpService.get<StudentsReportModel>(endpoint, dateParams).then((res) => {
      return this.normalizeStudentsSummaryData(res.data);
    });
  }

  /**
   * @function normalizeStudentsWeeklySummaryData
   * This method is used to normalize  weekly student summary data
   */
  public normalizeStudentsWeeklySummaryData(payload): StudentsReportModel {
    const studentsPayload = payload.students;
    const studentsSummaryReportData = [];
    studentsPayload.forEach((studentSummaryData) => {
      const normalizeStudent = this.normalizeStudentData(studentSummaryData.student);
      const normalizeSummary = this.normalizeStudentSummaryData(studentSummaryData.summaryData.weekOf);
      studentsSummaryReportData.push({
        student: normalizeStudent,
        summaryData: normalizeSummary
      });
    });
    return {
      class: payload.class,
      course: payload.course,
      studentsSummaryData: studentsSummaryReportData,
      teacher: payload.teacher
    };
  }

  /**
   * @function normalizeStudentsSummaryData
   * This method is used to normalize student summary data
   */
  private normalizeStudentsSummaryData(payload): StudentsReportModel {
    const studentsPayload = payload.students;
    const studentsSummaryReportData = [];
    studentsPayload.forEach((studentSummaryData) => {
      const normalizeStudent = this.normalizeStudentData(studentSummaryData.student);
      const normalizeSummary = this.normalizeStudentSummaryData(studentSummaryData.summaryData);
      studentsSummaryReportData.push({
        student: normalizeStudent,
        summaryData: normalizeSummary
      });
    });
    return {
      class: payload.class,
      course: payload.course,
      studentsSummaryData: studentsSummaryReportData,
      teacher: payload.teacher
    };
  }


  /**
   * @function normalizeStudentData
   * This method is used to normalize student data
   */
  private normalizeStudentData(payload) {
    const student = {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.lastName} ${payload.firstName}`,
      id: payload.id,
      thumbnailUrl: payload.profileImage || null,
      isShowLearnerData: payload.isShowLearnerData
    };
    return student;
  }

  /**
   * @function normalizeStudentSummaryData
   * This method is used to normalize student summary data
   */

  private normalizeStudentSummaryData(payload) {
    let normalizeSummaryData = {};
    if (payload) {
      normalizeSummaryData = {
        masteredCompetencies: this.normalizeCompetencies(payload.mastered, COMPETENCY_STATUS_VALUE.DEMONSTRATED),
        completedCompetencies: this.normalizeCompetencies(payload.completed, COMPETENCY_STATUS_VALUE.EARNED),
        inferredCompetencies: this.normalizeCompetencies(payload.inferred, COMPETENCY_STATUS_VALUE.ASSERTED),
        inprogressCompetencies: this.normalizeCompetencies(payload.inprogress, COMPETENCY_STATUS_VALUE.INFERRED),
        reinforcedMastery: this.normalizeCompetencies(payload.reinforcedMastery,COMPETENCY_STATUS_VALUE.REINFORCEDMASTERY),
        interactionData: {
          assessmentData: this.normalizeInteractions(
            payload.interactions ? payload.interactions.assessment : null
          ),
          collectionData: this.normalizeInteractions(
            payload.interactions ? payload.interactions.collection : null
          )
        },
        suggestionData: {
          assessmentData: this.normalizeInteractions(
            payload.suggestions ? payload.suggestions.assessment : null
          ),
          collectionData: this.normalizeInteractions(
            payload.suggestions ? payload.suggestions.collection : null
          )
        },
        startDate: payload.startDate,
        endDate: payload.endDate
      };
    }
    return normalizeSummaryData;
  }

  /**
   * @function normalizeCompetencies
   * This method is used to normalize competencies
   */
  private normalizeCompetencies(payload, status) {
    return payload && payload.map((competency) => {
      const reportCompetency: CompetencyModel = {
        id: competency.id,
        code: competency.code,
        contentSource: competency.content_source,
        status
      };
      return reportCompetency;
    });
  }

  /**
   * @function normalizeInteractions
   * This method is used to normalize interactions
   */
  private normalizeInteractions(payload) {
    const interactionData: InteractionsModel = {
      averageScore: payload ? payload.averageScore : 0,
      count: payload ? payload.count : 0,
      sessionsCount: payload ? payload.sessionsCount : 0,
      totalMaxScore: payload ? payload.totalMaxScore : 0,
      totalTimespent: payload ? payload.totalTimespent : 0,
      isNotStarted: payload ? false : true
    };
    return interactionData;
  }

  /**
   * @function fetchStudentsTimespentSummaryreport
   * This method is used to fetch student timespent summary report
   */
  public fetchStudentsTimespentSummaryreport(params) {
    const endpoint = `${this.reportNamespace}/class/timespent`;
    return this.httpService.get<Array<StudentSummaryTimespentModel>>(endpoint, params).then((response) => {
      return this.normalizeStudentSummaryTimespent(response.data.members);
    });
  }

  /**
   * @function normalizeStudentSummaryTimespent
   * This method is used to normalize student summary timespent
   */
  public normalizeStudentSummaryTimespent(payload): Array<StudentSummaryTimespentModel> {
    return payload.map((item) => {
      const studentTimespent: StudentSummaryTimespentModel = {
        firstName: item.first_name,
        id: item.id,
        lastName: item.last_name,
        thumbnail: item.thumbnail,
        totalAssessmentTimespent: item.total_assessment_timespent,
        totalCollectionTimespent: item.total_collection_timespent,
        totalOaTimespent: item.total_oa_timespent
      };
      return studentTimespent;
    });
  }
}
