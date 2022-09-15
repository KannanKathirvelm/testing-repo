import { Component, Input, OnInit } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import {  CONTENT_TYPES, REPORT_PERIOD_TYPE } from '@app/constants/helper-constants';
import { SessionModel } from '@app/models/auth/session';
import { MasteredStatsModel, StreakStatsModel, StudentDatewiseTimespentModel, SuggestionStatsModel, TeacherDetailModel } from '@app/models/class-progress/class-progress';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { PerformanceService } from '@app/providers/service/performance/performance.service';
import { SessionService } from '@app/providers/service/session/session.service';
import { CalenderComponent } from '@components/UI/calender/calender.component';
import { ModalController } from '@ionic/angular';
import {  ClassModel } from '@models/class/class';
import {  StudentDomainCompetenciesModel } from '@models/competency/competency';
import { StudentProgressReportModel, StudentsReportModel, StudentSummaryTimespentModel, SummaryDataModel } from '@models/proficiency-report/proficiency-report';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { currentWeekDates, previousWeekDates } from '@utils/global';
import axios from 'axios';
import * as moment from 'moment';

@Component({
  selector: 'nav-student-class-progress-report',
  templateUrl: './student-class-progress-report.component.html',
  styleUrls: ['./student-class-progress-report.component.scss'],
})
export class StudentClassProgressReportComponent implements OnInit{
  public reportPeriod: Array<{ text: string, type: string }>;
  public isShowDayWiseReport: boolean;
  public showNgxAvatar: boolean;
  public userSession: SessionModel;
  public class: ClassModel;
  public showAlert: boolean;
  public studentsDomainPerformance: Array<StudentDomainCompetenciesModel>;
  public isLoaded: boolean;
  public studentId: string;
  public selectedPeriod: string;
  public summaryData: SummaryDataModel;
  public startDate: string = moment().format('YYYY-MM-DD');
  public endDate: string = moment().format('YYYY-MM-DD');
  public suggestionStats: SuggestionStatsModel = {} as SuggestionStatsModel;
  public streakStats: StreakStatsModel = {} as StreakStatsModel;
  public masteredStats: MasteredStatsModel = {} as MasteredStatsModel;
  public teacherInfo: TeacherDetailModel;
  public avatarSize: number;
  public competencyBucket: Array<{ name: string, content: [], contentKey: string, description: string }> = [
    {
      name: this.translateValue('NEW_COMPETENCIES'),
      contentKey: 'mastered',
      content: [],
      description: this.translateValue('NO_COMPETENCIES')
    },
    {
      name: this.translateValue('DIAGNOTIC_GAINS'),
      contentKey: 'diagnostics',
      content: [],
      description: this.translateValue('NO_DIAGNOSTIC')
    },
    {
      name: this.translateValue('REINFORCED_GAINS'),
      contentKey: 'reinforced',
      content: [],
      description: this.translateValue('NO_REINFORCED')
    },
    {
      name: this.translateValue('TARGET_GROWTH'),
      contentKey: 'growth',
      content: [],
      description: this.translateValue('NO_GROWTH')
    },
    {
      name: this.translateValue('AREA_CONCERN'),
      contentKey: 'concern',
      content: [],
      description: this.translateValue('NO_CONCERN')
    },
    {
      name: this.translateValue('INCOMPLETE_COMPETENCIES'),
      contentKey: 'inprogress',
      content: [],
      description: this.translateValue('NO_PROGRESS')
    },
  ];
  public studentDatewiseTimespent: StudentDatewiseTimespentModel[];
  public showMoreItems: boolean[] = [];
  @Input() public studentProgressReport: StudentProgressReportModel;
  @Input() public selectedPeriodType:string;
  @Input() public selectedStartDate: string = moment().format('YYYY-MM-DD');
  @Input() public selectedEndDate: string = moment().format('YYYY-MM-DD');


  constructor(
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private sessionService: SessionService,
    private reportService: ReportService,
    private classService: ClassService,
    private modalService: ModalService,
    private performanceService: PerformanceService,
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
  }

  public ngOnInit() {
    this.selectedPeriod = this.selectedPeriodType;
    this.userSession = this.sessionService.userSession;
    this.avatarSize = 64;
    this.handleAvatarImage();
    this.loadData();
    this.getReportType();
  }

   /*
   * @function getReportType
   * This method used to get report type
   */
  public getReportType() {
    if (this.selectedPeriodType === REPORT_PERIOD_TYPE.CURRENT_WEEK) {
      this.fetchCurrentWeekData();
      this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_CURRENT_DATA);
    } else if (this.selectedPeriodType === REPORT_PERIOD_TYPE.PREVIOUS_WEEK) {
      this.fetchPreviousWeekData();
      this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_PREVIOUS_DATA);
    } else if (this.selectedPeriodType === REPORT_PERIOD_TYPE.TILL_NOW) {
      this.fetchTillNowData();
      this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_ALLTIME);
    } else {
      this.startDate =this.selectedStartDate;
      this.endDate = this.selectedEndDate;
      this.loadData();
    }
  }

  /*
   * @function translateValue
   * This method used to translate value
   */
  public translateValue(value) {
    return this.translate.instant(value);
  }

  /*
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /*
   * @function handleAvatarImage
   * This Method is used to handle avatar image.
   */
  public handleAvatarImage() {
    this.showNgxAvatar = this.studentProgressReport && this.studentProgressReport.student && !this.studentProgressReport.student.thumbnailUrl;
  }

  /*
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }


  /*
   * @function changeReportPeriod
   * Method to change report by type
   */
  public changeReportPeriod(event) {
    const reportType = event.detail.value;
    this.selectedPeriod = reportType;
    if (reportType === REPORT_PERIOD_TYPE.CURRENT_WEEK) {
      this.fetchCurrentWeekData();
    } else if (reportType === REPORT_PERIOD_TYPE.PREVIOUS_WEEK) {
      this.fetchPreviousWeekData();
    } else if (reportType === REPORT_PERIOD_TYPE.TILL_NOW) {
      this.fetchTillNowData();
    } else {
      this.openCalender();
    }
    this.parseService.trackEvent(EVENTS.CLICK_INDIVIDUAL_REPORTS_DATE);
  }


  /*
   * @function loadData
   * This method is used to load data
   */
  public loadData() {
    const classId = this.class.id;
    const startDate = this.startDate;
    const endDate = this.endDate;
    const subjectCode = this.class.preference.subject;
    const studentId = this.studentProgressReport.student.id
    const dataParam = {
      startDate,
      endDate,
      subjectCode,
      userId: studentId,
      classId
    };
    this.performanceService.getStudentProgressReport(dataParam).then((classProgressData) => {
      this.parseStudentsWeeklySummaryReportData(classProgressData.summaryData, classProgressData.classMembersTimespent);
      const { suggestionStats, streakStats, masteredStats, timespentDatewiseData } = classProgressData;
      this.teacherInfo = classProgressData.summaryData.teacher;
      this.suggestionStats = suggestionStats[0];
      this.streakStats = streakStats[0];
      this.masteredStats = masteredStats[0];
      this.parseReportData(classProgressData.studentReport);
      this.studentDatewiseTimespent = timespentDatewiseData.sort((a, b) => {
        return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
      });
    });
  }

  /*
   * @function parseReportData
   * This method used to report data
   */
  private parseReportData(report) {
    const competencyBucket = this.competencyBucket;
    competencyBucket.forEach(item => {
      item.content = report[item.contentKey].sort((a, b) => {
        return new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
      });
    });
  }

   /*
   * @function fetchCurrentWeekData
   * Method to fetch students report data of current week
   */
    public fetchCurrentWeekData() {
      const currentWeek = currentWeekDates();
      this.startDate = currentWeek[0];
      this.endDate = currentWeek[currentWeek.length - 1];
      this.loadData();
    }

    /*
     * @function fetchPreviousWeekData
     * Method to fetch students report data of previous week
     */
    public fetchPreviousWeekData() {
      const previousWeek = previousWeekDates();
      this.startDate = previousWeek[0];
      this.endDate = previousWeek[previousWeek.length - 1];
      this.loadData();
    }

    /*
     * @function fetchTillNowData
     * Method to fetch students report data of till now
     */
    public fetchTillNowData() {
      this.startDate = moment(this.class.createdAt).format('YYYY-MM-DD');
      this.endDate = moment().format('YYYY-MM-DD');
      this.loadData();
    }


   /*
   * @function changeReportPeriod
   * Method to change report by type
   */
    public openCalender() {
      const dateParams = {
        minDate: moment(this.class.createdAt),
        maxDate: moment()
      };
      this.modalCtrl.create({
        component: CalenderComponent,
        enterAnimation: this.modalService.enterAnimation(),
        leaveAnimation: this.modalService.leaveAnimation(),
        componentProps: dateParams
      }).then((modal) => {
        modal.onDidDismiss().then(response => {
           const context = response.data;
           if (context) {
             this.startDate = moment(context.startDate).format('YYYY-MM-DD');
             this.endDate = moment(context.endDate).format('YYYY-MM-DD');
             this.loadData();
            }
        });
        modal.present();
      });
    }

  /*
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

  /*
   * @function parseStudentsWeeklySummaryReportData
   * Method to parse students weekly report data
   */
  public parseStudentsWeeklySummaryReportData(summaryReportData, classMembersTimespent) {
    let parsedStudentsSummaryReportData = [];
    const studentsSummaryReportData = summaryReportData.studentsSummaryData;
    studentsSummaryReportData?.forEach((studentSummaryReportData) => {
      const student = studentSummaryReportData.student;
      this.studentId = studentSummaryReportData.student.id;
      const isShareData = this.studentsDomainPerformance?.find((item) => item.id === student.id);
      const studentTimespentData = classMembersTimespent?.find((item) => item.id === student.id);
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
        const diagonticsCompetencies = completedCompetencies.filter((diagontics) => {
          return diagontics.contentSource.includes('diagnostic') || diagontics.contentSource.includes('domain-diagnostic') || diagontics.contentSource.includes('ca-diagnostic');
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
          masteredCompetenciesCount: (masteredCompetencies.length + completedCompetencies.length),
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
    this.isLoaded = true;
    this.summaryData = parsedStudentsSummaryReportData[0].weeklyReportData;
  }

  /*
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

  /*
   * @function toggleReport
   * This method is used to toggle report
   */
  public toggleReport() {
    this.isShowDayWiseReport = !this.isShowDayWiseReport;
  }

  /*
   * @function showReport
   * This method is used to show report based on type
   */
  public showReport(content) {
    const isDateWiseReport = this.isShowDayWiseReport;
    const context = {
      classId: this.class.id,
      collectionType: isDateWiseReport ? content.format : CONTENT_TYPES.ASSESSMENT,
      collectionId: isDateWiseReport ? content.id : content.assessmentId,
      studentId: this.studentProgressReport.student.id,
      endDate: content.reportDate,
      isClassProgressReport: true
    };
    if (isDateWiseReport) {
      context['performance'] = content.performance;
    }
    this.reportService.showReport(context);
    this.parseService.trackEvent(EVENTS.CLICK_INDIVIDUAL_STUDENTS_ASSESSMENT);
  }
}