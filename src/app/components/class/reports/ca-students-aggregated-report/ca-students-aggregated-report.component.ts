import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NetworkService } from '@app/providers/service/network.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, CONTENT_TYPES, PLAYER_EVENT_SOURCE, REPORT_FILTERS, SCORES, SORTING_TYPES } from '@constants/helper-constants';
import { aggregateCAOverallPerformanceScore, aggregateCAOverallPerformanceTimeSpent } from '@app/utils/performance';
import { CAStudentList, CAStudentPerformance, ClassContentModel } from '@models/class-activity/class-activity';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { SearchSuggestionsComponent } from '@components/class/search-suggestions/search-suggestions.component';
import { getObjectsDeepCopy, getTaxonomyStandard, sortByNumber } from '@app/utils/global';
import { CompetencyModel } from '@app/models/collection/collection';
import { ClassService } from '@app/providers/service/class/class.service';
import { CollectionProvider } from '@app/providers/apis/collection/collection';
import { LookupService } from '@app/providers/service/lookup/lookup.service';
import { TenantSettingsModel } from '@app/models/tenant/tenant-settings';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';

@Component({
  selector: 'ca-students-aggregated-report',
  templateUrl: './ca-students-aggregated-report.component.html',
  styleUrls: ['./ca-students-aggregated-report.component.scss'],
})
export class CaStudentsAggregatedReportComponent implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public activity: ClassContentModel;
  @Input() public competency: CompetencyModel;
  @Input() public courseId: string;
  @Input() public isCaBaselineWorkflow: boolean;
  public totalScore: number;
  public totalTimespent: number;
  public caStudentList: Array<CAStudentList>;
  public caStudentData: Array<CAStudentList>;
  public selectedStudentCount: number;
  public studentListCount: number;
  public isShowUpdateData: boolean;
  public isThumbnailError: boolean;
  public isShowCheckBox: boolean;
  public performance: Array<CAStudentPerformance>;
  public standardCode: Array<string>;
  public isOnline: boolean;
  public isSortBy: boolean;
  public showMore: boolean;
  public networkSubscription: AnonymousSubscription;
  public frameworkId: string;
  public filters: Array<{id: string, title: string}>;
  public selectedFilter: string;
  public tenantSettings: TenantSettingsModel;
  public competencyScore: number;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private modalService: ModalService,
    private performanceProvider: PerformanceProvider,
    private reportService: ReportService,
    private classActivityService: ClassActivityService,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
    private classService: ClassService,
    private collectionProvider: CollectionProvider,
    private lookupService: LookupService,
    private parseService: ParseService
  ) {
    this.totalScore = 0;
    this.totalTimespent = 0;
    this.filters = [{
      id:'1',
      title: REPORT_FILTERS.ALL
    }, {
      id:'2',
      title: REPORT_FILTERS.MASTERED
    },
    {
      id:'3',
      title: REPORT_FILTERS.INPROGRESS
    }];
  }

  // -------------------------------------------------------------------------
  // Methods
  public ngOnInit() {
    this.selectedFilter = REPORT_FILTERS.ALL;
    this.frameworkId = this.classService.class && this.classService.class.preference && this.classService.class.preference.framework;
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
    this.totalTimespent = this.activity.collection.performance?.timeSpent;
    this.isShowCheckBox = this.isCaBaselineWorkflow && this.activity.contentType !== COLLECTION ? true : false;
    this.fetchClassActivityUserList();
    this.standardCode = this.activity.standards?.map((standard) => {
      return standard.id;
    });
    this.fetchTenantSettings();
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  /**
   * @function fetchClassActivityUserList
   * This Method is used to get list of students in class activity
   */
  public fetchClassActivityUserList() {
    this.isSortBy = false;
    this.classActivityService.fetchClassActivityUserList(this.activity.classId, this.activity.id).then((response) => {
      this.caStudentList = response;
      this.studentListCount = this.caStudentList.length;
      this.fetchCAStudentsPerformance(false, true);
    });
    this.parseService.trackEvent(EVENTS.VIEW_REPORT_CA);
  }

  /**
   * @function fetchCAStudentsPerformance
   * This Method is used to get performance of students in class activity
   */
  public fetchCAStudentsPerformance(calculateTotalScore = false, isSort = false) {
    this.performanceProvider.fetchCAStudentsPerformance(
      this.activity.classId,
      this.activity.contentType,
      this.activity.contentId,
      this.activity.id,
      this.activity.activationDate || this.activity.dcaAddedDate,
      this.activity.endDate
    ).then((response) => {
      this.performance = response;
      this.isShowUpdateData = this.performance.length === this.caStudentList.length ? false : true;
      this.performance.forEach((performance, index) => {
        const studentIndex = this.caStudentList.findIndex((item) => item.id === performance.userUid);
        if (studentIndex !== -1) {
          if (this.competency) {
            const answer = performance.usageData.find((question) => {
              return this.competency.id === question.gooruOId;
            });
            if (answer) {
              const score = answer.score > 100 ? answer.score / 100 : answer.score;
              this.caStudentList[studentIndex].performanceScore = score;
              this.performance[index][this.activity.contentType].score = score;
            }
            this.caStudentList[studentIndex].performance = performance;
          } else {
            this.caStudentList[studentIndex].performance = performance;
            this.caStudentList[studentIndex].performanceScore = performance[this.activity.contentType].score;
            this.caStudentList[studentIndex].timeSpent = performance[this.activity.contentType].timespent;
          }
        }
      });
      this.caStudentData = getObjectsDeepCopy(this.caStudentList);
      if (isSort) {
        this.onSortByScore();
      }
      if (this.competency) {
        this.totalScore = aggregateCAOverallPerformanceScore(this.activity.contentType, this.performance);
      } else {
        this.totalScore = this.activity.collection.performance?.score;
      }
      if (calculateTotalScore) {
        const isAssessment = this.activity.contentType === ASSESSMENT || this.activity.contentType === ASSESSMENT_EXTERNAL
        this.totalTimespent = aggregateCAOverallPerformanceTimeSpent(this.activity.contentType, this.performance, isAssessment);
        this.totalScore = aggregateCAOverallPerformanceScore(this.activity.contentType, this.performance);
      }
    });
  }

  /**
   * @function onClickStudentReport
   * This method used to call report function based on type
   */
  public onClickStudentReport(event) {
    if (event.performance && this.isOnline) {
      const context = {
        collectionId: this.activity.contentId,
        classId: this.activity.classId,
        collectionType: this.activity.contentType,
        activityDate: this.activity.activationDate || this.activity.dcaAddedDate,
        performance: this.activity.performance,
        contentSource: PLAYER_EVENT_SOURCE.DAILY_CLASS,
        contentId: this.activity.id,
        studentId: event.id,
        endDate: this.activity.endDate,
        competency: this.competency
      };
      this.reportService.showReport(context);
    }
  }

  /**
   * @function openSignatureSuggestion
   * Method to open the signature suggestion container
   */
   public async openSignatureSuggestion(signatureType?) {
    const standardCode = this.standardCode;
    const gutCodes = await this.collectionProvider.fetchCrosswalkFramework(this.frameworkId ,{codes : standardCode});
    const gutCodeId = gutCodes && gutCodes.length && gutCodes[0] && gutCodes[0].sourceTaxonomyCodeId;
    const selectedStudentList = this.caStudentList.filter((item) => item.isSelected);
    const params = {
      activeSuggestion: 'suggested',
      studentsPerfomance: selectedStudentList,
      classId: this.activity.classId,
      standardCode,
      signatureType,
      gutCodeId,
      isDiagnostic: true
    };
    this.modalService.openModal(SearchSuggestionsComponent, params, 'suggstion-pullup');
  }

  /**
   * @function openSuggestion
   * Method to open the suggestion container
   */
  public async  openSuggestion(competency) {
    const selectedStudentList = this.caStudentList.filter((item) => item.isSelected);
    const standardCode = [competency.standard.id];
    const gutCodes = await this.collectionProvider.fetchCrosswalkFramework(this.frameworkId ,{codes : standardCode});
    const gutCodeId = gutCodes && gutCodes.length && gutCodes[0] && gutCodes[0].sourceTaxonomyCodeId;
    const params = {
      activeSuggestion: 'suggested',
      studentsPerfomance: selectedStudentList,
      classId: this.activity.classId,
      courseId: this.courseId,
      standardCode,
      signatureType: COLLECTION,
      isDiagnostic: false,
      gutCodeId
    };
    this.modalService.openModal(SearchSuggestionsComponent, params, 'suggstion-pullup');
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function updateData
   * This method is used to update data
   */
  public updateData(isDiagnostic?) {
    if (isDiagnostic) {
      const nonPerformedStudent = this.caStudentList.filter(item => !item.performance);
      this.activity['students'] = nonPerformedStudent;
    }
    this.reportService.openAddDataReport(this.activity, this.performance).then((modal) => {
      this.fetchCAStudentsPerformance(true);
    });
    this.parseService.trackEvent(EVENTS.CLICK_CA_ACTIVITY_REPORT_UPLOAD_DATA);
  }

  /**
   * @function onSortByScore
   * This method is used to sort the student by score
   */
  public onSortByScore() {
    this.isSortBy = !this.isSortBy;
    const sortKey = this.activity.contentType === ASSESSMENT ? 'performanceScore' : 'timeSpent';
    const performedStudent = this.caStudentData.filter(item => item.performance);
    const nonPerformedStudent = this.caStudentData.filter(item => !item.performance);
    let caStudentData: Array<CAStudentList>;
    if (this.isSortBy) {
      caStudentData = sortByNumber(performedStudent, sortKey, SORTING_TYPES.ascending);
      this.caStudentData = nonPerformedStudent.concat(caStudentData);
    } else {
      caStudentData = sortByNumber(performedStudent, sortKey, SORTING_TYPES.descending);
      this.caStudentData = caStudentData.concat(nonPerformedStudent);
    }
  }

  /**
   * @function toggleStudentSelection
   * This method is used to toggle student selection
   */
  public toggleStudentSelection(student) {
    if (this.isOnline && !this.isCaBaselineWorkflow && student.performance && this.activity.contentType === CONTENT_TYPES.ASSESSMENT) {
      student.isSelected = !student.isSelected;
    }
  }

  /**
   * @function clearSelectedStudent
   * This method is used to clear the students list
   */
  public clearSelectedStudent() {
    this.clearAllSelectedStudent(this.caStudentData);
    this.clearAllSelectedStudent(this.caStudentList);
  }

  /**
   * @function clearAllSelectedStudent
   * This method is used to clear the selected student list
   */
  public clearAllSelectedStudent(studentList) {
    if (studentList) {
      studentList.forEach((item) => {
        item.isSelected = false;
      });
    }
  }

  /**
   * @function selectedStudentListCount
   * This method is used to get selected student list count
   */
   get selectedStudentListCount() {
    if (this.caStudentData && this.caStudentData.length) {
      const selectedStudentListCount = this.caStudentData.filter((item) => item.isSelected).length;
      return selectedStudentListCount;
    }
  }

  /**
   * @function onCheckAll
   * This method is used to call the select students list
   */
  public onCheckAll() {
    this.selectAllStudent(this.caStudentData);
    this.selectAllStudent(this.caStudentList);
  }

  /**
   * @function selectAllStudent
   * This method is used to select the all students list
   */
  public selectAllStudent(studentData) {
    if (studentData) {
      studentData.forEach((item) => {
        if (item.performance) {
          item.isSelected = true;
        }
      });
    }
  }

  /**
   * @function onChangeCheckbox
   * This method is used to select the student
   */
  public onChangeCheckbox(event, student) {
    student.isSelected = event.detail.checked;
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }

  /**
   * @function onSelectFilter
   * This method is used to filter data
   */
  public onSelectFilter(event) {
    this.selectedFilter = event.detail.value;
    const tenantSettings = this.tenantSettings;
    let compeletionScore = SCORES.VERY_GOOD;
    if (tenantSettings && tenantSettings['competencyCompletionMinScore']) {
      const competencyScore = tenantSettings['competencyCompletionMinScore'];
      const competencyDefaultScore = tenantSettings['competencyCompletionDefaultMinScore'];
      if (this.activity.taxonomy) {
        const taxonomyId = Object.keys(this.activity.taxonomy)[0];
        const taxonomyStandardCode =  getTaxonomyStandard(taxonomyId);
        const minScore = competencyScore[`${taxonomyStandardCode}`]
          ? competencyScore[`${taxonomyStandardCode}`]
          : competencyDefaultScore
            ? competencyDefaultScore
            : SCORES.VERY_GOOD;
        compeletionScore = minScore;
      } else {
        compeletionScore = competencyDefaultScore;
      }
    }
    this.filterStudentsByCompletionScore(compeletionScore);
    this.studentListCount = this.caStudentData.length;
  }

  /**
   * @function filterStudentsByCompletionScore
   * This method is used to filter student score
   */
  private filterStudentsByCompletionScore(compeletionScore) {
    switch (this.selectedFilter) {
      case REPORT_FILTERS.MASTERED:
        this.caStudentData = this.caStudentList.filter((student) => { return ((student.performanceScore && student.performanceScore) >= compeletionScore);});
      return;
      case REPORT_FILTERS.INPROGRESS:
        this.caStudentData = this.caStudentList.filter((student) => { return ((student.performanceScore && student.performanceScore) < compeletionScore);});
      return;
      default:
        this.caStudentData = this.caStudentList;
      return;
    }
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public async fetchTenantSettings() {
    await this.lookupService.fetchTenantSettings().then((tenantSettings) => {
      this.tenantSettings = tenantSettings;
    });
  }
}
