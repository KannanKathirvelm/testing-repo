import { Component, OnDestroy } from '@angular/core';
import { PerformanceProvider } from '@app/providers/apis/performance/performance';
import { ReportProvider } from '@app/providers/apis/report/report';
import { SearchSuggestionsComponent } from '@components/class/search-suggestions/search-suggestions.component';
import { CALENDAR_VIEW } from '@constants/helper-constants';
import { ClassMembersDetailModel, DiagnosticDetailModel, NonPremiumAtcPerformance, TimespentModel } from '@models/atc/atc';
import { ClassMembersModel, ClassModel } from '@models/class/class';
import { ClassCompetencySummaryModel, DomainModel, FwCompetenciesModel, StrugglingDomainCompetencyModel } from '@models/competency/competency';
import { TaxonomyGrades } from '@models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { ATCService } from '@providers/service/atc/atc.service';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { flattenGutToFwCompetency, flattenGutToFwDomain } from '@utils/global';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-atc',
  templateUrl: './atc.page.html',
  styleUrls: ['./atc.page.scss'],
})
export class AtcPage implements OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public class: ClassModel;
  public classMembers: ClassMembersModel;
  public gradeRange: {
    minGrade: number;
    maxGrade: number;
  };
  public gradeCompetencyDomainList: Array<StrugglingDomainCompetencyModel>;
  public opportunitiesForGrowthList: Array<StrugglingDomainCompetencyModel>;
  public otherGradeTopComp: Array<StrugglingDomainCompetencyModel>;
  // public otherGradeCompetency: Array<StrugglingCompetencyModel>; /* NILE-MOBILE-568 */
  public currentGradeName: string;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public totalMasteredCompetencies: number;
  public totalCompetencies: number;
  public monthlyViewDate: string;
  public selectedStudentData: ClassMembersDetailModel;
  public isShowStudentAtcReport: boolean;
  public isShowStudentListAtcReport: boolean;
  public selectedStudentList: Array<ClassMembersDetailModel>;
  public isShowLearningChallengesPullUp: boolean;
  public selectedLearningStruggle: StrugglingDomainCompetencyModel;
  public selectedLearningGaps: StrugglingDomainCompetencyModel;
  public selectedDomainCompetencyIndex: number;
  public selectedGradeDomainIndex: number;
  public selectedGradeCompetencyIndex: number;
  public activitiesCount: { scheduled: number, unscheduled: number };
  public isPremiumClass: boolean;
  public selectedStudentPerformance: NonPremiumAtcPerformance;
  public showStudentPerformanceReport: boolean;
  public showAtcChart: boolean;
  public isLoaded: boolean;
  public showCalendar: boolean;
  public disableNextDate: boolean;
  public classDetailsSubscription: AnonymousSubscription;
  public isShowMonthSelector: boolean;
  public competencyScore: ClassCompetencySummaryModel;
  public inProgressData: number;
  public gainedData: number;
  public performanceScore: number;
  public timespentSummary: TimespentModel;
  public tenantSettings: TenantSettingsModel;
  public diagnosticSummary: DiagnosticDetailModel;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classActivityService: ClassActivityService,
    private modalService: ModalService,
    private classService: ClassService,
    private atcService: ATCService,
    private lookupService: LookupService,
    private taxonomyService: TaxonomyService,
    private competencyService: CompetencyService,
    private reportProvider: ReportProvider,
    private performanceProvider: PerformanceProvider
  ) {
    const todayDate = moment();
    this.monthlyViewDate = todayDate.startOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    this.totalMasteredCompetencies = 0;
    this.inProgressData = 0;
    this.gainedData = 0;
    this.gradeCompetencyDomainList = [];
  }

  // -------------------------------------------------------------------------
  // Methods

  public ionViewWillEnter() {
    this.isShowMonthSelector = true;
    this.classDetailsSubscription = this.classService.fetchClassDetails
      .subscribe((classDetails) => {
        this.class = classDetails;
        this.isPremiumClass = classDetails.isPremiumClass;
      });
  }

  public ngOnDestroy() {
    this.classDetailsSubscription.unsubscribe();
  }

  public ionViewDidEnter() {
    this.fetchTenantSettings();
    this.getStudentsGradeRange();
    this.loadCrosswalkFramework();
    this.getMonthlyActivitiesCount();
    this.checkNextMonthDate();
    this.fetchCAPerformance();
    this.fetchTimespent();
    this.getAtcDiagnosticDetails();
  }

  /**
   * @function getMonthlyActivitiesCount
   * Method to get monthly activities count
   */
  public async getMonthlyActivitiesCount() {
    const classId = this.class.id;
    const month = moment().format('MM');
    const year = moment().format('YYYY');
    this.activitiesCount = await this.classActivityService.getMonthlyActivitiesCount(classId, month, year);
  }

  /**
   * @function fetchCAPerformance
   * This Method is used to fetch CA performance
   */
  public fetchCAPerformance() {
    const classId = this.class.id;
    const courseId = this.class.courseId;
    if (courseId) {
      this.performanceProvider.fetchClassPerformance([{
        classId,
        courseId
      }]).then((performance) => {
        this.performanceScore = performance ? performance[0].score : null;
      });
    }
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public async fetchTenantSettings() {
    this.tenantSettings = await this.lookupService.fetchTenantSettings();
  }

  /**
   * @function fetchTimespent
   * This Method is used to fetch CA performance
   */
  public fetchTimespent() {
    const classId = [this.class.id];
    const fromDate = moment(this.class.createdAt).format('YYYY-MM-DD');
    const toDate = moment(this.class.updatedAt).format('YYYY-MM-DD');
    const userId = this.class.creatorId;
    this.atcService.fetchTimespent(classId, fromDate, toDate, userId).then((timespent) => {
      this.timespentSummary = timespent ? timespent[0] : null;
    });
  }

  /**
   * @function getAtcDiagnosticDetails
   * This Method is used to fetch CA performance
   */
  public getAtcDiagnosticDetails() {
    const classId = this.class.id;
    const fromDate = moment(this.class.createdAt).format('YYYY-MM-DD');
    const toDate = moment(this.class.updatedAt).format('YYYY-MM-DD');
    this.atcService.getAtcDiagnosticDetails(classId, fromDate, toDate).then((diagnostic) => {
      this.diagnosticSummary = diagnostic;
    });
  }

  /**
   * @function loadCrosswalkFramework
   * Method to load cross walk framework
   */
  public loadCrosswalkFramework() {
    const subject = this.class.preference ? this.class.preference.subject : null;
    const framework = this.class.preference ? this.class.preference.framework : null;
    if (subject && framework) {
      this.taxonomyService.fetchCrossWalkFWC(framework, subject).then((crosswalkFramework) => {
        this.fwCompetencies = flattenGutToFwCompetency(crosswalkFramework);
        this.fwDomains = flattenGutToFwDomain(crosswalkFramework);
      });
    }
  }

  /**
   * @function onToggleCalendar
   * This method is triggered when user click date
   */
  public onToggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  /**
   * @function closeStudentPerformanceReport
   * Method to close the student performance report
   */
  public closeStudentPerformanceReport() {
    this.isShowStudentAtcReport = false;
    this.showStudentPerformanceReport = false;
  }

  /**
   * @function closeLearningGapsPullUp
   * Method to close learning gaps pullup
   */
  public closeLearningGapsPullUp() {
    this.selectedGradeCompetencyIndex = null;
    this.selectedGradeDomainIndex = null;
  }

  /**
   * @function closeLearningChallengesPullUp
   * Method to close learning challenges pullup
   */
  public closeLearningChallengesPullUp() {
    this.isShowLearningChallengesPullUp = false;
    this.selectedDomainCompetencyIndex = null;
  }

  /**
   * @function closeStudentListReport
   * Method to close the student list report
   */
  public closeStudentListReport() {
    this.isShowStudentListAtcReport = false;
  }

  /**
   * @function onPreviousDate
   * Method to get previous date
   */
  public onPreviousDate() {
    const previousMonth = moment(this.monthlyViewDate).add(-1, 'months');
    this.monthlyViewDate = previousMonth.format(CALENDAR_VIEW.DATE_FORMAT);
    this.disableNextDate = false;
    this.fetchStrugglingCompetency();
  }

  /**
   * @function onNextDate
   * Method to get next date
   */
  public onNextDate() {
    const nextMonth = moment(this.monthlyViewDate).add(1, 'months');
    this.monthlyViewDate = nextMonth.format(CALENDAR_VIEW.DATE_FORMAT);
    this.checkNextMonthDate();
    this.fetchStrugglingCompetency();
  }

  /**
   * @function selectedCalendarDate
   * Method to get monthly activities count
   */
  public async selectedCalendarDate(date) {
    const classId = this.class.id;
    this.monthlyViewDate = date;
    this.checkNextMonthDate();
    const month = moment(date).format('MM');
    const year = moment(date).format('YYYY');
    this.activitiesCount = await this.classActivityService.getMonthlyActivitiesCount(classId, month, year);
  }

  /**
   * @function checkNextMonthDate
   * Method to check the next month date
   */
  public checkNextMonthDate() {
    const todayDate = moment();
    const currentMonth = todayDate.startOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    const nextMonth = moment(this.monthlyViewDate).add(1, 'months');
    const monthlyDate = nextMonth.format(CALENDAR_VIEW.DATE_FORMAT);
    this.disableNextDate = moment(monthlyDate).isAfter(currentMonth);
  }

  /**
   * @function getStudentsGradeRange
   * Method to get student grade range
   */
  public async getStudentsGradeRange() {
    this.isLoaded = false;
    this.classService.fetchClassMembersByClassId(this.class.id).then((classMember: ClassMembersModel) => {
      this.classMembers = classMember;
      const classMembersModel = this.classMembers.members;
      const students = classMembersModel.filter((member) => member.isActive);
      const isStudentsAvailable: boolean = !!students && !!students.length;
      this.isLoaded = true;
      this.showAtcChart = this.isPremiumClass
        ? isStudentsAvailable
        : isStudentsAvailable && !!this.class.courseId;
      if (this.showAtcChart) {
        const memberGradeBounds: any = this.classMembers.memberGradeBounds;
        const availableGrade = [];
        students.map((student) => {
          const memberId = student.id;
          const grade = memberGradeBounds.find((memberGrade) => {
            return memberGrade.userId === memberId;
          });
          if (grade) {
            const gradeBounds = grade.bounds;
            availableGrade.push(gradeBounds);
          }
        });
        const gradeAsc = availableGrade.sort((grade1, grade2) => grade1.gradeLowerBound - grade2.gradeLowerBound).find(lowestGrade => lowestGrade.gradeLowerBound);
        const gradeDesc = availableGrade.sort((grade1, grade2) => grade1.gradeUpperBound - grade2.gradeUpperBound).reverse().find(highestGrade => highestGrade.gradeUpperBound);
        const minGrade =
          gradeAsc && gradeAsc.gradeLowerBound
            ? gradeAsc.gradeLowerBound
            : null;
        const maxGrade =
          gradeDesc && gradeDesc.gradeUpperBound
            ? gradeDesc.gradeUpperBound
            : null;
        if (minGrade && maxGrade) {
          this.gradeRange = {
            minGrade,
            maxGrade
          }
          this.fetchStrugglingCompetency();
          this.fetchStudentCompetenciesCount();
        }
      }
    })
  }

  /**
   * @function fetchStudentCompetenciesCount
   * This method is used to fetch the student class progress count.
   */
  public fetchStudentCompetenciesCount() {
    const classId = this.class.id;
    this.reportProvider.fetchStudentsSummaryReport(classId).then((competencyScoreSummary) => {
      const studentsSummaryData = competencyScoreSummary.studentsSummaryData;
      studentsSummaryData.forEach((studentSummaryReportData) => {
        const summaryData = studentSummaryReportData.summaryData;
        const weeklySummaryData = summaryData || null;
        if(weeklySummaryData) {
          if(weeklySummaryData.completedCompetencies.length || weeklySummaryData.masteredCompetencies.length) {
            this.gainedData += 1;
          }
          if (weeklySummaryData.inprogressCompetencies.length) {
            this.inProgressData += 1;
          }
        }
      })
    });
    return;
  }

  /**
   * @function fetchStrugglingCompetency
   * Method to fetch struggling competency
   */
  public fetchStrugglingCompetency() {
    const component = this;
    const activeMonth = moment(this.monthlyViewDate).format('M');
    const activeYear = moment(this.monthlyViewDate).year();
    const subject = this.class.preference ? this.class.preference.subject : null;
    const framework = this.class.preference ? this.class.preference.framework : null;
    const filters = {
      subject,
      fw_code: framework || 'GUT'
    };
    this.taxonomyService.fetchGradesBySubject(filters).then((grades: Array<TaxonomyGrades>) => {
      let gradeIds = [];
      if (grades && grades.length) {
        gradeIds = grades.map((grade) => {
          return grade.id;
        });
      }
      const queryParams = {
        grade: gradeIds.toString(),
        classId: this.class.id,
        month: activeMonth,
        year: activeYear
      };
      this.competencyService.fetchStrugglingCompetency(queryParams).then((gradeLevelCompetencies) => {
        if (gradeLevelCompetencies && gradeLevelCompetencies.length) {
          /* Ref NILE-MOBILE-568*/
          // https://github.com/Gooru/navigator-instructor-mobile/pull/656
          // const classGradeId = this.class.gradeCurrent;
          // const classGradeCompetencies = gradeLevelCompetencies.find((competency) => {
          //   return competency.gradeId === classGradeId;
          // });
          // const learningChalanges = [];
          // const learningGaps = [];
          // gradeLevelCompetencies.map(grade => {
          //   if (grade.gradeSeq >= classGradeCompetencies.gradeSeq) {
          //     learningChalanges.push(grade);
          //   } else {
          //     learningGaps.push(grade);
          //   }
          // });
          // if (classGradeCompetencies) {
          //   component.currentGradeName = classGradeCompetencies.grade;
          //   component.serializeClassGradeContent(learningChalanges);
          // }
          // if (learningGaps && learningGaps.length) {
          //   const otherGradeTopComp = [];
          //   learningGaps.map(grade => grade.domains).map((domains, gradeIndex) => {
          //     const competencyList = [];
          //     domains.forEach((domain, domainIndex) => {
          //       const competencies = domain.competencies.reverse();
          //       competencies.forEach((competency) => {
          //         const fwCompItem = this.fwCompetencies.find(fwCompetency => fwCompetency[competency.code]);
          //         competency.domainIndex = domainIndex;
          //         competency.domainName = domain.domainName;
          //         competency.loCode =  fwCompItem && fwCompItem[competency.code].loCode;
          //         competencyList.push(competency);
          //       });
          //     });
          //     if (competencyList && competencyList.length) {
          //       const gradeLevelTopCompetency = competencyList.reduce(
          //         (prevCompetency, currentCompetency) => {
          //           return prevCompetency.studentsCount < currentCompetency.studentsCount ? currentCompetency : prevCompetency;
          //         }
          //       );
          //       if (gradeLevelTopCompetency) {
          //         gradeLevelTopCompetency.gradeIndex = gradeIndex;
          //         otherGradeTopComp.push(gradeLevelTopCompetency);
          //       }
          //     }
          //   });
          //   const sortedOtherCompetency = otherGradeTopComp.length
          //     ? otherGradeTopComp.sort((grade1, grade2) => grade1.studentsCount - grade2.studentsCount).reverse()
          //     : otherGradeTopComp;
          //   component.otherGradeTopComp = sortedOtherCompetency;
          //   component.otherGradeCompetency = learningGaps;
          //   this.opportunitiesForGrowthList = this.gradeCompetencyDomainList?.concat(this.otherGradeTopComp);
          // }
          component.serializeClassGradeContent(gradeLevelCompetencies);
        }
      })
    })
  }

  /**
   * @function selectStudentFromList
   * Method to select student from list
   */
  public selectStudentFromList(student) {
    this.onSelectStudent(student);
  }

  /**
   * @function openLearningChallenges
   * Method to open competency report
   */
  public openLearningChallenges(competency) {
    this.selectedLearningStruggle = competency;
    this.selectedDomainCompetencyIndex = competency.sequence;
    this.isShowLearningChallengesPullUp = true;
  }

  /**
   * @function navigateToLearningChallenges
   * Method to open competency report
   */
  public navigateLearningChallenges() {
    this.isShowLearningChallengesPullUp = true;
  }

  /**
   * @function openLearningGaps
   * Method to open competency report
   */
  public openLearningGaps(competency) {
    this.selectedLearningGaps = competency;
    this.selectedGradeCompetencyIndex = competency.gradeIndex;
    this.selectedGradeDomainIndex = competency.domainIndex;
  }

  /**
   * @function onSelectStudent
   * Method to select student from list
   */
  public onSelectStudent(studentData) {
    this.selectedStudentData = studentData;
    this.isShowStudentAtcReport = true;
  }

  /**
   * @function onRotateScreen
   * Method to remove / add month selector based on screen view
   */
  public onRotateScreen(isPortrait) {
    this.isShowMonthSelector = isPortrait;
  }

  /**
   * @function onSelectStudentPerformance
   * Method to select student from list
   */
  public onSelectStudentPerformance(performance) {
    this.selectedStudentPerformance = performance;
    this.showStudentPerformanceReport = true;
  }

  /**
   * @function openLearningStruggleSuggestion
   * Method to open the suggestion container
   */
  public openLearningStruggleSuggestion(competency) {
    const selectedCompetency = competency || this.selectedLearningStruggle;
    const params = {
      selectedCompetency,
      classId: this.class.id,
      gutCodeId: selectedCompetency.code
    }
    this.openSuggestionContainer(params);
  }

  /**
   * @function openLearningGapsSuggestion
   * Method to open the suggestion container
   */
  public openLearningGapsSuggestion() {
    const params = {
      selectedCompetency: this.selectedLearningGaps,
      classId: this.class.id,
      gutCodeId: this.selectedLearningGaps.code
    }
    this.openSuggestionContainer(params);
  }

  /**
   * @function openSuggestionContainer
   * Method to open the suggestion container
   */
  public openSuggestionContainer(params) {
    this.modalService.openModal(SearchSuggestionsComponent, params, 'suggstion-pullup');
  }

  /**
   * @function onSelectStudentList
   * Method to select student from list
   */
  public onSelectStudentList(studentList) {
    this.selectedStudentList = studentList;
    this.isShowStudentListAtcReport = true;
  }

  /**
   * @function getTotalMasteredCompetencies
   * Method to get total mastered competencies
   */
  public getTotalMasteredCompetencies(event) {
    this.totalMasteredCompetencies = event.totalMasteredCompetencies;
    this.totalCompetencies = event.totalCompetencies;
  }

  /**
   * @function serializeClassGradeContent
   * Method to serialize class grade content
   */
   public serializeClassGradeContent(learningChalanges) {
    const gradeDomainsList = [];
    learningChalanges.forEach((classGradeDomains) => {
      classGradeDomains.domains.forEach((domain) => {
        const competencies = domain.competencies;
        competencies.forEach((competenciesItem) => {
          if (competenciesItem) {
            const fwCompetency = this.fwCompetencies.find((fwCompetencie) => fwCompetencie[competenciesItem.code]);
            competenciesItem.loCode = fwCompetency && fwCompetency[competenciesItem.code].loCode;
            gradeDomainsList.push(
              {
                domainCode: domain.domainCode,
                domainId: domain.domainId,
                domainName: domain.domainName,
                domainSeq: domain.domainSeq,
                competencies,
                ...competenciesItem,
                isLearningChallenges: true,
                grade: classGradeDomains.grade
              }
            );
          }
        });
      });
    });
    const sortedGradeList = gradeDomainsList.sort((grade1, grade2) => grade1.grade - grade2.grade).reverse();
    this.gradeCompetencyDomainList = sortedGradeList.filter((item, index, arr) =>
    index === arr.findIndex((t) => (t.domainName === item.domainName && t.grade === item.grade)));
    this.opportunitiesForGrowthList = this.gradeCompetencyDomainList;
  }
}
