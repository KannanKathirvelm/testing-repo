import { Injectable } from '@angular/core';
import { StudentOfflineActivityReportComponent } from '@app/components/student-offline-activity-report/student-offline-activity-report.component';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { AddDataAssessmentComponent } from '@components/class/class-activity/add-data/add-data-assessment/add-data-assessment.component';
import { AddDataCollectionComponent } from '@components/class/class-activity/add-data/add-data-collection/add-data-collection.component';
import { OfflineActivityReportComponent } from '@components/class/reports/offline-activity-report/offline-activity-report.component';
import { StudentAssessmentReportComponent } from '@components/class/reports/student-assessment-report/student-assessment-report.component';
import { StudentCollectionReportComponent } from '@components/class/reports/student-collection-report/student-collection-report.component';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, COLLECTION_EXTERNAL } from '@constants/helper-constants';
import { STYLE } from '@constants/pdf-preview-styles';
import { ModalController } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { TranslateService } from '@ngx-translate/core';
import { TransformTimeSpent } from '@pipes/transform-timespent.pipe';
import { ReportProvider } from '@providers/apis/report/report';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // -------------------------------------------------------------------------
  // Properties

  public class: ClassModel;
  public startTime: number;
  public sessionId = new BehaviorSubject(null);

  // -------------------------------------------------------------------------
  // Methods

  constructor(
    private reportProvider: ReportProvider,
    private classService: ClassService,
    private modalCtrl: ModalController,
    private modalService: ModalService,
    private translate: TranslateService,
    private transformTimeSpent: TransformTimeSpent,
    private parseService: ParseService
  ) {
    this.class = this.classService.class;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentsWeeklySummaryReport
   * Method to fetch student weekly report
   */
  public fetchStudentsWeeklySummaryReport(classId, dateParams) {
    return this.reportProvider.fetchStudentsWeeklySummaryReport(classId, dateParams);
  }

  /**
   * @function showReport
   * This method is used to show report based on type
   */
  public showReport(context) {
    this.startTime = moment().valueOf();
    if (context.collectionType === ASSESSMENT || context.collectionType === ASSESSMENT_EXTERNAL) {
      this.showAssessmentReport(context);
    } else if (context.collectionType === COLLECTION || context.collectionType === COLLECTION_EXTERNAL) {
      this.showCollectionReport(context);
    } else {
      this.showOfflineActivityReport(context);
    }
  }

  /**
   * @function showAssessmentReport
   * This method is used to show assessment report
   */
  public showAssessmentReport(context) {
    const performance = context.performance ? context.performance : {};
    const userPerformance = {
      eventTime: performance.eventTime ? performance.eventTime : null,
      id: performance.id,
      reaction: performance.reaction ? performance.reaction : null,
      score: performance.score,
      timespent: performance.timeSpent,
      type: context.collectionType,
      sessionId: performance.sessionId ? performance.sessionId : null
    };
    this.modalCtrl.create({
      component: StudentAssessmentReportComponent,
      cssClass: 'assessment-modal',
      enterAnimation: this.modalService.enterAnimation(),
      leaveAnimation: this.modalService.leaveAnimation(),
      componentProps: {
        classId: context.classId,
        contentId: context.collectionId,
        sessionId: context.sessionId,
        contentSource: context.contentSource,
        collectionType: context.collectionType,
        showCorrectAnswer: true,
        userPerformance,
        studentId: context.studentId,
        isPreview: context.isPreview,
        isClassProgressReport: context.isClassProgressReport,
        competency: context.competency
      }
    }).then((modal) => {
      this.startTime = moment().valueOf();
      modal.present();
      modal.onWillDismiss().then(() => {
        this.trackCollectionReportEvent(context);
      });
    });
  }

  /**
   * @function trackCollectionReportEvent
   * This method is used to track the collection report
   */
  public trackCollectionReportEvent(context) {
    const params = this.getCollectionReportContext(context);
    this.parseService.trackEvent(EVENTS.VIEW_COLLECTION_REPORT, params);
  }

  /**
   * @function getCollectionReportContext
   * This method is used to get the context for collection report event
   */
  private getCollectionReportContext(context) {
    const endTime = moment().valueOf();
    return {
      classId: context.classId,
      pathId: context.pathId,
      collectionId: context.collectionId,
      courseId: context.courseId,
      courseName: context.course_title,
      unitId: context.unitId,
      contentSource: context.contentSource,
      lessonId: context.lessonId,
      collectionType: context.collectionType,
      collectionTitle: context.title,
      startTime: this.startTime,
      endTime
    };
  }

  /**
   * @function showCollectionReport
   * This method is used to show collection report
   */
  public showCollectionReport(context) {
    const performance = context.performance ? context.performance : {};
    const userPerformance = {
      eventTime: performance.eventTime ? performance.eventTime : null,
      id: performance.id,
      reaction: performance.reaction ? performance.reaction : null,
      score: performance.score,
      timespent: performance.timeSpent,
      type: context.collectionType,
      sessionId: performance.sessionId
    };
    const params = {
      classId: context.classId,
      courseId: context.courseId,
      unitId: context.unitId,
      lessonId: context.lessonId,
      activityDate: context.activityDate ? context.activityDate : null,
      endDate: context.endDate ? context.endDate : null,
      pathId: context.pathId ? context.pathId : null,
      sessionId: performance.sessionId,
      isPreview: context.isPreview,
    };
    this.modalCtrl.create({
      component: StudentCollectionReportComponent,
      cssClass: 'collection-modal',
      enterAnimation: this.modalService.enterAnimation(),
      leaveAnimation: this.modalService.leaveAnimation(),
      componentProps: {
        contentId: context.collectionId,
        context: params,
        contentSource: context.contentSource,
        isSuggestion: context.isSuggestion || false,
        collectionType: context.collectionType,
        userPerformance,
        studentId: context.studentId,
        isPreview: context.isPreview,
        isClassProgressReport: context.isClassProgressReport
      }
    }).then((modal) => {
      modal.present();
      modal.onWillDismiss().then(() => {
        this.trackCollectionReportEvent(context);
      });
    });
  }

  /**
   * @function showOfflineActivityReport
   * This method is used to show offline activity report
   */
  public showOfflineActivityReport(context) {
    const params = {
      activityId: context.contentId,
      contentId: context.id,
      classId: context.classId,
      studentId: context.studentId,
      isPreview: context.isPreview,
      isStudent: context.isStudent
    };
    this.modalCtrl.create({
      component: context.studentId ? StudentOfflineActivityReportComponent : OfflineActivityReportComponent,
      cssClass: 'offline-activity-modal',
      enterAnimation: this.modalService.enterAnimation(),
      leaveAnimation: this.modalService.leaveAnimation(),
      componentProps: {
        context: params
      }
    }).then((modal) => {
      modal.present();
    });
  }

  /**
   * @function getLastSessionId
   * This method is used to get last session id
   */
  public getLastSessionId(sessionIds) {
    sessionIds.sort(function(a, b) {
      return b.sequence - a.sequence;
    });
    return sessionIds[0].sessionId;
  }

  /**
   * @function fetchStudentsSummaryReport
   * Method to fetch student weekly report
   */
  public fetchStudentsSummaryReport(classId, dateParams) {
    return this.reportProvider.fetchStudentsSummaryReport(classId, dateParams);
  }

  /**
   * @function fetchStudentsTimespentSummaryreport
   * Method to fetch student timespent summary report
   */
  public fetchStudentsTimespentSummaryreport(params){
    return this.reportProvider.fetchStudentsTimespentSummaryreport(params);
  }

  // /**
  //  * @function createPdf
  //  * Method to create PDF
  //  */
  // public async createPdf(studentReports, selectedPeriod) {
  //   const classDetail = this.class;
  //   const userDetail = this.session.userSession;
  //   const teacherName = `${userDetail.first_name} ${userDetail.last_name}`;
  //   const todayDate = moment().format('DD/MM/YYYY');
  //   const docDefinition = {
  //     pageSize: STYLE.pageSize,
  //     pageMargins: STYLE.pageMargin,
  //     header() {
  //       return [{
  //         margin: STYLE.headerMargin,
  //         columns: [
  //           {
  //             table: {
  //               widths: STYLE.headerWidth,
  //               body: [
  //                 [
  //                   {
  //                     alignment: STYLE.alignmentLeft,
  //                     text: todayDate,
  //                   },
  //                   {
  //                     alignment: STYLE.alignmentRight,
  //                     ul: [
  //                       { text: classDetail.title, listType: STYLE.listTypeNone },
  //                       { text: teacherName, listType: STYLE.listTypeNone },
  //                       { text: selectedPeriod, listType: STYLE.listTypeNone }
  //                     ]
  //                   }
  //                 ]
  //               ]
  //             },
  //             layout: STYLE.layoutNoBorder
  //           }
  //         ],
  //       }, {
  //         margin: STYLE.headerLineMargin,
  //         canvas: [{ type: 'line', x1: 45, y1: 10, x2: 565, y2: 8, lineWidth: 1 }]
  //       }];
  //     },
  //     content: await this.pdfContentRender(studentReports),
  //     defaultStyle: {
  //       alignment: STYLE.alignmentCenter,
  //       fontSize: STYLE.defaultFontSize
  //     }
  //   };
  // const pdfCollection = pdfMake.createPdf(docDefinition);
  // const fileName = `${this.class.title}-competency-report.pdf`;
  // return this.utilsService.downloadPdf(pdfCollection, fileName);
  // }

  /**
   * @function pdfContentRender
   * Method to prepare pdf content body
   */
  public pdfContentRender(studentReportTableData) {
    const contentBody = [];
    const reportColumn = [
      'name',
      'competencyGained',
      'competencyInferred',
      'competencyInProgress',
      'timespentCollection',
      'timespentAssessment',
      'timespentTotal',
      'badgesEarned',
      'averageScore',
      'suggestionTaken'
    ];
    const studentReportTable = {
      margin: STYLE.reportTableMargin,
      table: {
        heights: STYLE.tableRowHeight,
        headerRows: STYLE.headerRowTwo,
        alignment: STYLE.alignmentLeft,
        widths: STYLE.reportTableColumnWidth,
        body: this.buildDynamicTableBody(true, studentReportTableData, reportColumn),
      },
      pageBreak: STYLE.pageBreakAfter
    };
    contentBody.push(studentReportTable);
    reportColumn.shift();
    studentReportTableData.forEach((studentDetail, index, array) => {
      const individualStudentReport = {
        margin: STYLE.individualReportTableMargin,
        table: {
          headerRows: STYLE.headerRowTwo,
          alignment: STYLE.alignmentLeft,
          widths: STYLE.individualReportTableColumnWidth,
          body: this.buildDynamicTableBody(false, [studentDetail], reportColumn),
        }
      };
      const individualStudentCompetency = this.renderCompetencyTable(studentDetail);
      const chartSvgContainer = studentDetail.chartElement;
      const individualStudentChart = {
        pageBreak: STYLE.pageBreakAfter,
        margin: STYLE.chartMargin,
        columns: [
          {
            svg: chartSvgContainer
          }, {
            alignment: STYLE.alignmentLeft,
            fontSize: STYLE.domainFontSize,
            ol: this.domainCompetencyList(studentDetail.domanCompetencies)
          }
        ]
      };
      contentBody.push(individualStudentReport);
      contentBody.push(individualStudentCompetency);
      contentBody.push(individualStudentChart);
    });
    return contentBody;
  }

  /**
   * @function domainCompetencyList
   * Method to prepare domain competency list
   */
  public domainCompetencyList(domainCompetencies) {
    const domainCompetency = [];
    domainCompetencies.forEach((competency) => {
      domainCompetency.push({ text: competency.domainName, margin: STYLE.domainMargin });
    });
    return domainCompetency;
  }

  /**
   * @function renderCompetencyTable
   * Method to prepare competeneyc table for pdf
   */
  public renderCompetencyTable(studentDetail) {
    const competencyTable = {
      margin: STYLE.competencyTableMargin,
      table: {
        widths: STYLE.competencyTableWidth,
        headerRows: STYLE.headerRowOne,
        alignment: STYLE.alignmentLeft,
        body: this.renderCompetencySubTable(studentDetail)
      }
    };
    return competencyTable;
  }

  /**
   * @function renderCompetencySubTable
   * Method to prepare competenecy sub table for pdf
   */
  public renderCompetencySubTable(studentDetail) {
    const table = [];
    const competencyMasteredMsg = this.translateValue('COMPETENCY_MASTERED_REPORT');
    const competencyInProgress = this.translateValue('COMPETENCY_IN_PROGRESS');
    const tableHeader = [{ text: competencyMasteredMsg }, { text: competencyInProgress }];
    table.push(tableHeader);
    const masteredCompetencies = studentDetail.masteredCompetencies;
    const inProgressCompetencies = studentDetail.inProgressCompetencies;
    if (masteredCompetencies.length || inProgressCompetencies.length) {
      masteredCompetencies.forEach((competency) => {
        const tableRow = [];
        tableRow.push({ text: competency.code });
        tableRow.push({});
        table.push(tableRow);
      });
      inProgressCompetencies.forEach((competency, index) => {
        const competencyIndexInTable = index + 1;
        const competencyExists = table[competencyIndexInTable] || [];
        if (competencyExists.length) {
          table[competencyIndexInTable][1].text = competency.code;
        } else {
          const tableRow = [];
          tableRow.push({});
          tableRow.push({ text: competency.code });
          table.push(tableRow);
        }
      });
    } else {
      table.push([{}, {}]);
    }
    return table;
  }

  /**
   * @function buildDynamicTableBody
   * Method to prepare student report tabe
   */
  public buildDynamicTableBody(withName, studentReports, tableColumns) {
    const table = [];
    const tableFirstHeader = [];
    const tableSecondHeader = [];
    // transle name
    const textCompetencies = this.translateValue('COMPETENCIES');
    const textTimespent = this.translateValue('TIMESPENT');
    const textBadgesEarned = this.translateValue('BADGES_EARNED');
    const textAverageScore = this.translateValue('AVERAGE_SCORE');
    const textSuggestionTaken = this.translateValue('SUGGESTIONS_TAKEN');
    const textName = this.translateValue('NAME');
    const textGained = this.translateValue('GAINED');
    const textInferred = this.translateValue('INFERRED');
    const textInprogress = this.translateValue('IN_PROGRESS');
    const textCollections = this.translateValue('COLLECTIONS');
    const textAssessments = this.translateValue('ASSESSMENTS');
    const textTotal = this.translateValue('TOTAL');
    // first row of the header
    tableFirstHeader.push({ text: textCompetencies, colSpan: STYLE.reportCompetencyColSpan });
    tableFirstHeader.push({});
    tableFirstHeader.push({});
    tableFirstHeader.push({ text: textTimespent, colSpan: STYLE.reportTimespentColSpan });
    tableFirstHeader.push({});
    tableFirstHeader.push({});
    tableFirstHeader.push({ text: textBadgesEarned, rowSpan: STYLE.reportHeaderRowSpan });
    tableFirstHeader.push({ text: textAverageScore, rowSpan: STYLE.reportHeaderRowSpan });
    tableFirstHeader.push({ text: textSuggestionTaken, rowSpan: STYLE.reportHeaderRowSpan });
    // individual student table there is no need of name
    if (withName) {
      tableFirstHeader.unshift({ text: textName, rowSpan: STYLE.reportHeaderRowSpan });
    }
    // second row of header
    tableSecondHeader.push({ text: textGained });
    tableSecondHeader.push({ text: textInferred });
    tableSecondHeader.push({ text: textInprogress });
    tableSecondHeader.push({ text: textCollections });
    tableSecondHeader.push({ text: textAssessments });
    tableSecondHeader.push({ text: textTotal });
    // empty value initialized to maintain row value consistent
    tableSecondHeader.push('');
    tableSecondHeader.push('');
    tableSecondHeader.push('');
    // intialized empty value for second header
    if (withName) {
      tableSecondHeader.unshift('');
    }
    table.push(tableFirstHeader);
    table.push(tableSecondHeader);
    studentReports.forEach((studentData) => {
      const tableRow = [];
      tableColumns.forEach((column) => {
        tableRow.push({ text: studentData[column] });
      });
      table.push(tableRow);
    });
    return table;
  }

  /**
   * @function translateValue
   * This method used to translate value
   */
  public translateValue(value) {
    return this.translate.instant(value);
  }

  /**
   * @function normalizeStudentDetail
   * This method used to normalize student detail
   */
  public normalizeStudentDetail(studentDetail) {
    const weeklyReport = studentDetail.weeklyReportData;
    const student = {
      name: studentDetail.student.fullName,
      competencyGained: weeklyReport.masteredCompetenciesCount || '-',
      competencyInferred: weeklyReport.inferredCompetenciesCount || '-',
      competencyInProgress: weeklyReport.inprogressCompetenciesCount || '-',
      timespentCollection: weeklyReport.collectionTimespent ? this.transformTimeSpent.transform(weeklyReport.collectionTimespent) : '-',
      timespentAssessment: weeklyReport.assessmentTimespent ? this.transformTimeSpent.transform(weeklyReport.assessmentTimespent) : '-',
      timespentTotal: weeklyReport.totalTimespent ? this.transformTimeSpent.transform(weeklyReport.totalTimespent) : '-',
      badgesEarned: weeklyReport.badgeEarned || '-',
      averageScore: weeklyReport.averageScore || '-',
      suggestionTaken: weeklyReport.suggestionTaken || '-',
      id: studentDetail.student.id,
      masteredCompetencies: weeklyReport.masteredCompetencies,
      inProgressCompetencies: weeklyReport.inprogressCompetencies,
      domanCompetencies: null,
      chartElement: null
    };
    return student;
  }

  /**
   * @function openAddDataReport
   * This method used to open add data
   */
  public openAddDataReport(activity, performance = null) {
    const context = {
      activationDate: activity.activationDate,
      classId: activity.classId,
      contentId: activity.contentId,
      contentType: activity.contentType,
      thumbnail: activity.thumbnail,
      title: activity.title,
      activityId: activity.id,
      taxonomy: activity.taxonomy,
      performance,
      startDate: activity.activationDate || activity.dcaAddedDate,
      endDate: activity.endDate,
      isDiagnostic: activity.isDiagnostic,
      students: activity.isDiagnostic && activity.students ? activity.students : null
    }
    if (activity.isCollection || activity.isExternalCollection) {
      return this.showAddDataForCollection(context);
    } else if (activity.isAssessment || activity.isExternalAssessment) {
      return this.showAddDataForAssessment(context);
    }
  }

  /**
   * @function showAddDataForCollection
   * This Method is used to open add data for collection
   */
  public showAddDataForCollection(context) {
    return this.modalService.openModal(AddDataCollectionComponent, context, 'add-data-for-collection');
  }

  /**
   * @function showAddDataForAssessment
   * This Method is used to open add data for assessment
   */
  public showAddDataForAssessment(context) {
    return this.modalService.openModal(AddDataAssessmentComponent, context, 'add-data-for-assessment');
  }
}
