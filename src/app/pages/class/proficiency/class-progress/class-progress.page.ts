import {
  Component,
  ComponentFactoryResolver,
  ViewContainerRef
} from '@angular/core';
import { StudentClassProgressReportComponent } from '@app/components/student-class-progress-report/student-class-progress-report.component';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { StudentClassProficiencyChartComponent } from '@components/proficiency/student-class-proficiency-chart/student-class-proficiency-chart.component';
import { CalenderComponent } from '@components/UI/calender/calender.component';
import { REPORT_PERIOD_TYPE } from '@constants/helper-constants';
import { ModalController } from '@ionic/angular';
import { ClassMembersModel, ClassModel } from '@models/class/class';
import { DomainCompetenciesModel, DomainLevelSummaryModel, StudentDomainCompetenciesModel } from '@models/competency/competency';
import { StudentProgressReportModel, StudentsReportModel, StudentSummaryTimespentModel } from '@models/proficiency-report/proficiency-report';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ProficiencyService } from '@providers/service/proficiency/proficiency.service';
import { ReportService } from '@providers/service/report/report.service';
import { currentWeekDates, previousWeekDates } from '@utils/global';
import axios from 'axios';
import * as moment from 'moment';

@Component({
  selector: 'app-class-progress',
  templateUrl: './class-progress.page.html',
  styleUrls: ['./class-progress.page.scss'],
})
export class ClassProgressPage {

  // -------------------------------------------------------------------------
  // Properties

  public class: ClassModel;
  public reportPeriod: Array<{ text: string, type: string }>;
  public studentProgressReport: Array<StudentProgressReportModel>;
  public selectedPeriod: string;
  public showAlert: boolean;
  public isClassMembers: boolean;
  public isShowProficiencyView: boolean;
  public maxNumberOfCompetencies: number;
  public studentsDomainPerformance: Array<StudentDomainCompetenciesModel>;
  public isLoaded: boolean;
  public isThumbnailError: boolean;
  public searchText: string;
  public startDate : string = moment().format('YYYY-MM-DD');
  public endDate: string = moment().format('YYYY-MM-DD');

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService,
    private classService: ClassService,
    private translate: TranslateService,
    private modal: ModalService,
    private proficiencyService: ProficiencyService,
    private competencyService: CompetencyService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private modalCtrl: ModalController,
    private parseService: ParseService
  ) {
    this.class = this.classService.class;
    this.reportPeriod = [{
      text: this.translateValue('CURRENT_WEEK'),
      type: REPORT_PERIOD_TYPE.CURRENT_WEEK
    }, {
      text: this.translateValue('PREVIOUS_WEEK'),
      type: REPORT_PERIOD_TYPE.PREVIOUS_WEEK
    }, {
      text: this.translateValue('TILL_NOW'),
      type: REPORT_PERIOD_TYPE.TILL_NOW
    }, {
      text: this.translateValue('CUSTOM_RANGE'),
      type: REPORT_PERIOD_TYPE.CUSTOM_RANGE
    }];
    this.selectedPeriod = REPORT_PERIOD_TYPE.CURRENT_WEEK;
    this.showAlert = false;
  }

  // -------------------------------------------------------------------------
  // Lifecycle methods

  public ionViewDidEnter() {
    this.isClassMembers = true;
    this.isShowProficiencyView = true;
    this.loadChart();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCurrentWeekData
   * Method to fetch students report data of current week
   */
  public fetchCurrentWeekData() {
    const currentWeek = currentWeekDates();
    const startDate = currentWeek[0];
    const endDate = currentWeek[currentWeek.length - 1];
    this.fetchStudentsWeeklySummaryReport(startDate, endDate);
  }

  /**
   * @function fetchPreviousWeekData
   * Method to fetch students report data of previous week
   */
  public fetchPreviousWeekData() {
    const previousWeek = previousWeekDates();
    const previousWeekStartDate = previousWeek[0];
    const previousWeekEndDate = previousWeek[previousWeek.length - 1];
    this.fetchStudentsWeeklySummaryReport(previousWeekStartDate, previousWeekEndDate);
  }

  /**
   * @function fetchTillNowData
   * Method to fetch students report data of till now
   */
  public fetchTillNowData() {
    const startDate = moment(this.class.createdAt).format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    this.fetchStudentsSummaryReport(startDate, endDate);
  }

  /**
   * @function changeReportPeriod
   * Method to change report by type
   */
  public changeReportPeriod(event) {
    const reportType = event.detail.value;
    this.selectedPeriod = reportType;
    if (reportType === REPORT_PERIOD_TYPE.CURRENT_WEEK) {
      this.fetchCurrentWeekData();
      this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_CURRENT_DATA);
    } else if (reportType === REPORT_PERIOD_TYPE.PREVIOUS_WEEK) {
      this.fetchPreviousWeekData();
      this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_PREVIOUS_DATA);

    } else if (reportType === REPORT_PERIOD_TYPE.TILL_NOW) {
      this.fetchTillNowData();
      this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_ALLTIME);

    } else {
      this.openCalender();
    }
  }

  /**
   * @function changeReportPeriod
   * Method to change report by type
   */
  public openCalender() {
    const dateParams = {
      minDate: moment(this.class.createdAt),
      maxDate: moment()
    };
    this.modal.openModal(CalenderComponent, dateParams)
      .then((content?: { startDate: Date, endDate: string }) => {
        if (content) {
          const selectedStartDate = content.startDate;
          const selectedEndDate = content.endDate;
          this.startDate = moment(selectedStartDate).format('YYYY-MM-DD');
          this.endDate = moment(selectedEndDate).format('YYYY-MM-DD');
          this.fetchStudentsSummaryReport(this.startDate, this.endDate);
        }
      });
  }

  /**
   * @function fetchStudentsWeeklySummaryReport
   * Method to fetch students weekly summary report
   */
  public fetchStudentsWeeklySummaryReport(startDate, endDate) {
    this.isLoaded = false;
    const classId = this.class.id;
    const subjectCode = this.class.preference ? this.class.preference.subject : null;
    const dataParam = {
      fromDate: startDate,
      toDate: endDate,
      subjectCode
    };
    const params = {
      classId,
      to: endDate,
      from: startDate
    };
    return axios.all<{}>([
      this.reportService.fetchStudentsWeeklySummaryReport(classId, dataParam),
      this.reportService.fetchStudentsTimespentSummaryreport(params)
    ]).then(axios.spread((summaryReportResponse: Array<StudentsReportModel>, summaryReportTimespentResponse: Array<StudentSummaryTimespentModel>) => {
      this.parseStudentsWeeklySummaryReportData(summaryReportResponse, summaryReportTimespentResponse);
    }));
  }

  /**
   * @function fetchStudentsSummaryReport
   * Method to fetch students summary report
   */
  public fetchStudentsSummaryReport(startDate?, endDate?) {
    this.isLoaded = false;
    const classId = this.class.id;
    const subjectCode = this.class.preference ? this.class.preference.subject : null;
    const dataParam = {
      fromDate: startDate,
      toDate: endDate,
      subjectCode
    };
    const params = {
      classId,
      to: endDate,
      from: startDate
    };
    return axios.all<{}>([
      this.reportService.fetchStudentsSummaryReport(classId, dataParam),
      this.reportService.fetchStudentsTimespentSummaryreport(params)
    ]).then(axios.spread((summaryReportResponse: Array<StudentsReportModel>, summaryReportTimespentResponse: Array<StudentSummaryTimespentModel>) => {
      this.parseStudentsWeeklySummaryReportData(summaryReportResponse, summaryReportTimespentResponse);
    }));
  }

  /**
   * @function parseStudentsWeeklySummaryReportData
   * Method to parse students weekly report data
   */
  public parseStudentsWeeklySummaryReportData(summaryReportData, classMembersTimespent) {
    let parsedStudentsSummaryReportData = [];
    const studentsSummaryReportData = summaryReportData.studentsSummaryData;
    studentsSummaryReportData.forEach((studentSummaryReportData) => {
      const student = studentSummaryReportData.student;
      const isShareData = this.studentsDomainPerformance.find((item) => item.id === student.id);
      const studentTimespentData = classMembersTimespent.find((item) => item.id === student.id);
      student.isShowLearnerData = isShareData && isShareData.isShowLearnerData || false;
      const parsedStudentSummaryData = {
        studentName: student.fullName,
        studentFirstName: student.firstName,
        student,
        weeklyReportData: {}
      };
      const summaryData = studentSummaryReportData.summaryData;
      const weeklySummaryData = summaryData || null;
      if (weeklySummaryData) {
        const completedCompetencies = weeklySummaryData.completedCompetencies;
        const diagonticsCompetencies = completedCompetencies.filter((diagontics)=>{
          return diagontics.contentSource.includes('diagnostic');
        });
        const newMasteredCompetencies = completedCompetencies.length - diagonticsCompetencies.length;
        const inferredCompetencies = weeklySummaryData.inferredCompetencies;
        const inprogressCompetencies = weeklySummaryData.inprogressCompetencies;
        const interactionContents = weeklySummaryData.interactionData;
        const masteredCompetencies = weeklySummaryData.masteredCompetencies;
        const suggestionContents = weeklySummaryData.suggestionData;
        const assessmentInteration = interactionContents.assessmentData;
        const assessmentSuggestion = suggestionContents.assessmentData;
        const collectionSuggestion = suggestionContents.collectionData;
        const reInForcedMastery = weeklySummaryData.reinforcedMastery;
        const weeklyReportData = {
          masteredCompetencies: masteredCompetencies.concat(completedCompetencies),
          masteredCompetenciesCount: masteredCompetencies.length + completedCompetencies.length,
          inferredCompetencies,
          inferredCompetenciesCount: inferredCompetencies.length,
          inprogressCompetencies,
          inprogressCompetenciesCount: inprogressCompetencies.length,
          totalTimespent: studentTimespentData
            ? studentTimespentData.totalCollectionTimespent + studentTimespentData.totalAssessmentTimespent
            : null,
          collectionTimespent: studentTimespentData
            ? studentTimespentData.totalCollectionTimespent
            : null,
          assessmentTimespent: studentTimespentData
            ? studentTimespentData.totalAssessmentTimespent
            : null,
          isNotStarted: assessmentInteration.isNotStarted,
          badgeEarned: masteredCompetencies.length,
          averageScore: assessmentInteration.averageScore,
          suggestionTaken: assessmentSuggestion.count + collectionSuggestion.count,
          diagonticsCompetencies: diagonticsCompetencies.length,
          reInForcedMasteryCount: reInForcedMastery ? reInForcedMastery.length : null,
          newMasteredCompetenciesCount: newMasteredCompetencies
        };
        parsedStudentSummaryData.weeklyReportData = weeklyReportData;
      }
      parsedStudentsSummaryReportData.push(parsedStudentSummaryData);
    });
    parsedStudentsSummaryReportData = parsedStudentsSummaryReportData.sort((a, b) => a.student.lastName.localeCompare(b.student.lastName));
    this.studentProgressReport = parsedStudentsSummaryReportData;
    this.isLoaded = true;
  }

  // /**
  //  * @function downloadReport
  //  * Method to download report
  //  */
  // public downloadReport() {
  //   this.showAlert = true;
  //   // timeout is used for wait for boolean to update
  //   setTimeout(() => {
  //     this.createPdf();
  //   });
  // }

  // /**
  //  * @function createPdf
  //  * Method to create pdf
  //  */
  // public async createPdf() {
  //   const studentDetails = await this.formStudentDetailsForPdf();
  //   this.reportService.createPdf(studentDetails, this.selectedPeriod).then(() => {
  //     this.showAlert = false;
  //   });
  // }

  /**
   * @function formStudentDetailsForPdf
   * Method to create structure for pdf input
   */
  public formStudentDetailsForPdf() {
    const studentReportTableData = [];
    const studentsReports = this.studentProgressReport;
    return new Promise((resolve, reject) => {
      studentsReports.forEach((studentDetail, index, array) => {
        const studentDomain = this.studentsDomainPerformance.find((item) => item.id === studentDetail.student.id);
        const student = this.reportService.normalizeStudentDetail(studentDetail);
        student.domanCompetencies = studentDomain.domainCompetencies;
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(StudentClassProficiencyChartComponent);
        const componentRef = this.viewContainerRef.createComponent(componentFactory);
        const instance = componentRef.instance as {
          studentSeq: number;
          studentDomains: Array<DomainCompetenciesModel>;
          maxNumberOfCompetencies: number;
          source: string;
        };
        instance.studentDomains = studentDomain.domainCompetencies;
        instance.source = 'class-progress';
        instance.maxNumberOfCompetencies = this.maxNumberOfCompetencies;
        instance.studentSeq = index;
        componentRef.instance.chartLoaded.subscribe((isLoaded) => {
          if (isLoaded) {
            const chartElement = componentRef.location.nativeElement;
            if (chartElement) {
              const chartSvgContainer = chartElement.querySelector('#proficiency-chart');
              student.chartElement = chartSvgContainer ? chartSvgContainer.outerHTML : null;
            }
            studentReportTableData.push(student);
            if (index === array.length - 1) {
              resolve(studentReportTableData);
            }
          }
        });
      });
    });
  }

  /**
   * @function translateValue
   * This method used to translate value
   */
  public translateValue(value) {
    return this.translate.instant(value);
  }

  /**
   * @function loadChart
   * This method used to load the chart
   */
  private loadChart() {
    const classDetails = this.classService.class;
    const classId = classDetails.id;
    const subjecode = classDetails.preference?.subject || null;
    const filters = {
      classId,
      courseId: classDetails.courseId,
      subjecode
    };
    this.isLoaded = false;
    if (subjecode) {
      return axios.all<{}>([
        this.competencyService.fetchDomainLevelSummary(filters),
        this.classService.fetchClassMembersByClassId(classId)
      ]).then(axios.spread((domainLevelSummary: DomainLevelSummaryModel, classmembers: ClassMembersModel) => {
        const classMembersModel = classmembers && classmembers.members ? classmembers.members : null;
        const members = classMembersModel.filter((member) => member.isActive);
        this.isClassMembers = members && Array.isArray(members) && !!members.length;
        this.isShowProficiencyView = this.isClassMembers && !!domainLevelSummary;
        if (this.isShowProficiencyView && this.isClassMembers) {
          this.fetchCurrentWeekData();
          const parsedStudentsDomainProficiencyData = this.proficiencyService.parseStudentsDomainProficiencyData(
            domainLevelSummary, members);
          this.maxNumberOfCompetencies = parsedStudentsDomainProficiencyData.maxNumberOfCompetencies;
          this.studentsDomainPerformance = parsedStudentsDomainProficiencyData.studentsDomainPerformance;
        } else {
          this.isLoaded = true;
        }
      }), (error) => {
        this.isLoaded = true;
      });
    }
  }

  /**
   * @function filterStudentList
   * This method is used to filter student list
   */
  public filterStudentList(event) {
    const searchTerm = event.srcElement.value;
    this.searchText = searchTerm;
  }

  /*
   * @function openStudentProgressReport
   * This method is used to  open student progress report level
   */
  public openStudentProgressReport(studentReport) {
    const props = {
    studentProgressReport:  studentReport,
    selectedPeriodType: this.selectedPeriod,
    selectedStartDate: this.startDate,
    selectedEndDate: this.endDate
  }
    this.modalCtrl.create({
      component: StudentClassProgressReportComponent,
      cssClass: 'assessment-modal',
      enterAnimation: this.modal.enterAnimation(),
      leaveAnimation: this.modal.leaveAnimation(),
      componentProps: props
    }).then((modal) => {
      modal.present();
    });
    this.parseService.trackEvent(EVENTS.CLICK_INDIVIDUAL_REPORTS);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
