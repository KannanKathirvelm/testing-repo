import { Component, OnInit, ViewChild } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { SignatureContentModel } from '@app/models/signature-content/signature-content';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { ToastService } from '@app/providers/service/toast.service';
import { CaAssignCalenderComponent } from '@components/class/class-activity/ca-assign-calender/ca-assign-calender.component';
import { SearchByFilterComponent } from '@components/search/search-by-filter/search-by-filter.component';
import { ASSESSMENT, COLLECTION, COMPETENCY, PROFICIENCY, SIGNATURE_CONTENT_TYPES, STUDENT_ROLE, TEACHER_ROLE } from '@constants/helper-constants';
import { AnimationController, IonSearchbar } from '@ionic/angular';
import { CompetenciesStrugglingPerformanceModel, StrugglingDomainCompetencyModel } from '@models/competency/competency';
import { SearchFilterContextModel } from '@models/lookup/lookup';
import { SuggestionFilterModel } from '@models/suggestion/suggestion';
import { TenantLibraryContentModel } from '@models/tenant/tenant-settings';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { SearchService } from '@providers/service/search/search.service';
import { SessionService } from '@providers/service/session/session.service';
import { SuggestionService } from '@providers/service/suggestion/suggestion.service';
import { convertArrayToString } from '@utils/global';
import * as moment from 'moment';

@Component({
  selector: 'search-suggestions',
  templateUrl: './search-suggestions.component.html',
  styleUrls: ['./search-suggestions.component.scss'],
})
export class SearchSuggestionsComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @ViewChild('search', { static: false }) public searchElement: IonSearchbar;
  public suggestions:  Array<SignatureContentModel>;
  public isShowAssessment: boolean;
  public classId: string;
  public selectedContentType: string;
  public selectedCompetency: StrugglingDomainCompetencyModel;
  public activeSuggestion: string;
  public suggestionFilters: Array<SuggestionFilterModel>;
  public tenantLibraryContent: Array<TenantLibraryContentModel>;
  public isShowLibrary: boolean;
  public studentsPerfomance: Array<CompetenciesStrugglingPerformanceModel>;
  public showSuggestionPopup: boolean;
  public selectedSuggestion: SuggestionFilterModel;
  public isShowFilter: boolean;
  public filterCount: number;
  public tenantLibrary: TenantLibraryContentModel;
  public signatureType: string;
  public courseId: string;
  public isDiagnostic: boolean;
  public searchTerms: string;
  private searchElementWidth: number;
  public standardCode: Array<string>;
  public isShowSearch: boolean;
  public isProgressReport: boolean;
  public isThumbnailError: boolean;
  public gutCodeId: string;

  constructor(
    private lookupService: LookupService,
    private session: SessionService,
    private suggestionService: SuggestionService,
    private classActivityService: ClassActivityService,
    private modalService: ModalService,
    private competencyService: CompetencyService,
    private searchService: SearchService,
    private parseService: ParseService,
    private classService: ClassService,
    private toastService: ToastService,
    private translate: TranslateService,
    private animationCtrl: AnimationController
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
     if (this.signatureType) {
      this.selectedContentType = this.signatureType;
      this.isShowAssessment = this.selectedContentType === ASSESSMENT ? true : false;
      this.isShowSearch = true;
    } else {
      this.isShowAssessment = false;
      this.selectedContentType = COLLECTION;
    }
    if (!this.activeSuggestion) {
      this.activeSuggestion = 'suggested';
      this.isShowFilter = false;
      this.isShowSearch = false;
      this.fetchStudentsPerfomance();
    }
    this.suggestionFilters = [{
      key: 'my_content',
      title: 'My Content',
      value: 'my-content'
    }, {
      key: 'gooru_catalog',
      title: 'Gooru Catalog',
      value: 'open-all'
    }, {
      key: 'tenant_library',
      title: 'Tenant Library',
      value: 'open-library'
    }, {
      key: 'suggested',
      title: 'Suggested',
      value: 'open-all'
    }];
    this.filterCount = 0;
    this.searchCollections();
    if (this.selectedContentType === COLLECTION && this.activeSuggestion === 'suggested') {
      this.parseService.trackEvent(EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT);
    }
  }

  /**
   * @function fetchStudentsPerfomance
   * This method is used to fetch students performance
   */
  public async fetchStudentsPerfomance() {
    const params = {
      competency: this.selectedCompetency && this.selectedCompetency.code,
      classId: this.classId,
      month: moment().format('MM'),
      year: moment().format('YYYY')
    };
    this.studentsPerfomance = await this.competencyService.fetchStudentsPerfomance(params);
  }

  /**
   * @function openFilter
   * This method is used to open the filter
   */
  public openFilter() {
    this.modalService.openModal(
      SearchByFilterComponent,
      null, 'search-by-filter-pullup').then((context: SearchFilterContextModel) => {
        if (context) {
          this.filterCount = 0;
          if (!context.isCancel) {
            const filters = context;
            this.filterCount = Object.keys(context).filter((key) => {
              return context[key];
            }).length;
            this.searchbyFilters(filters);
          }
        }
      });
  }

  /**
   * @function searchbyFilters
   * This method is used to search by filters
   */
  public searchbyFilters(context) {
    const educationalUse = context.educationalUses ? convertArrayToString(context.educationalUses, 'label') : null;
    const languages = context.languages ? convertArrayToString(context.languages, 'label') : null;
    const competencies = context.competencies ? convertArrayToString(context.competencies, 'id') : null;
    const params = {
      'flt.educationalUse': educationalUse,
      'flt.language': languages,
      'flt.standard': competencies
    }
    this.searchCollections(params);
  }

  /**
   * @function addActivityToClass
   * This method is used to add activity to class
   */
  public async addActivityToClass(selectedActivity) {
    const date = moment().format('YYYY-MM-DD');
    const month = Number(moment().format('MM'));
    const year = Number(moment().format('YYYY'));
    this.rescheduleClassActivity(selectedActivity, date, date, month, year)
  }

  /**
   * @function saveUsers
   * This method is used to save users
   */
  public saveUsers(contentId) {
    const studentIds = this.studentsPerfomance.map((item) => item.id || item['userId']);
    this.classActivityService.updateClassActivityUsers(this.classId, contentId, studentIds);
  }

  /**
   * @function searchCollections
   * This method is used to fetch collections
   */
  public async searchCollections(additionalParams = {}) {
    const selectedSuggestion = this.suggestionFilters.find((suggestion) => {
      return suggestion.key !== 'course_map' && suggestion.key === this.activeSuggestion;
    })
    const searchParams = {
      gutCode: this.selectedCompetency?.code,
      scopeKey: selectedSuggestion?.value,
    }
    const term = this.searchTerms;
    const params = {
      term,
      searchParams,
      additionalParams
    }
    if (this.activeSuggestion === 'suggested') {
      if(this.gutCodeId) {
        searchParams['gutCode'] = this.gutCodeId;
      } else if (this.standardCode && this.standardCode.length) {
        searchParams['standard'] = this.standardCode[0] || null;
      }
      searchParams['audience'] = null;
      if (this.classService.class && this.classService.class.primaryLanguage) {
        searchParams['languageId'] = this.classService.class.primaryLanguage;
      }
      let contentType;
      if (this.selectedContentType === ASSESSMENT) {
        contentType = [ASSESSMENT, SIGNATURE_CONTENT_TYPES.ASSESSMENT];
      } else {
        contentType = [COLLECTION, SIGNATURE_CONTENT_TYPES.COLLECTION];
      }
      params['contentType'] = contentType;
      const searchResult = await this.searchService.searchCapContents(params);
      this.suggestions = searchResult.collections;
    } else if (this.isProgressReport) {
      const filters = {
        isDisplayCode: true
      };
      this.searchService.fetchLearningMapsContent(this.standardCode[0], filters).then((result) => {
        this.suggestions = result.signatureContents[`${this.selectedContentType}s`] ;
      });
    } else {
        if (this.courseId) {
            additionalParams['flt.courseId'] = this.courseId;
            searchParams['taxonomies'] = this.standardCode;
        }
        if (this.standardCode) {
          additionalParams['flt.standard'] = this.standardCode ? this.standardCode.join(',') : null;
        }
        if (this.classService.class && this.classService.class.primaryLanguage) {
          searchParams['languageId'] = this.classService.class.primaryLanguage;
        }
        searchParams['isGooruCatalog'] = this.activeSuggestion === 'gooru_catalog';
        if (this.selectedContentType === ASSESSMENT) {
            const searchResult = await this.searchService.searchAssessments(
                params
            );
            this.suggestions = searchResult.collections;
        } else {
            const searchResult = await this.searchService.searchCollections(
                params
            );
            this.suggestions = searchResult.collections;
        }
    }
    this.isShowLibrary = false;
  }

  /**
   * @function onSelectSuggestion
   * This method is used to select suggstion
   */
  public onSelectSuggestion(event) {
    this.activeSuggestion = event.detail.value;
    this.isShowSearch = this.activeSuggestion === 'my_content' || this.activeSuggestion === 'gooru_catalog';
    this.isShowFilter = this.activeSuggestion === 'course_map' ? false : true;
    this.tenantLibrary = null;
    if (this.activeSuggestion === 'tenant_library') {
      this.fetchTenantLibrary();
      this.parseService.trackEvent(EVENTS.CLICK_GROWTH_TENANT_LIBRARY);
    } else {
      this.searchCollections();
    }
    if (this.activeSuggestion === 'suggested'){
      if (this.selectedContentType === ASSESSMENT) {
        this.parseService.trackEvent(EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT);
      } else {
        this.parseService.trackEvent(EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION);
      }
    }
    else if(this.activeSuggestion === 'my_content' || 'gooru_catalog') {
      if (this.selectedContentType === ASSESSMENT) {
        this.parseService.trackEvent(EVENTS.CLICK_GROWTH_MYCONTENT_ASSESSMENT);
     } else {
        this.parseService.trackEvent(EVENTS.CLICK_GROWTH_MYCONTENT_COLLECTION);
      }
    }
  }

  /**
   * @function fetchTenantLibrary
   * This method is used to fetch tenant library
   */
  public async fetchTenantLibrary() {
    this.tenantLibraryContent = await this.searchService.fetchTenantLibrary();
    this.isShowLibrary = true;
  }

  /**
   * @function compareWithFilterKey
   * This method is used to check the filter key
   */
  public compareWithFilterKey(item1, item2) {
    return item1 && item2 ? item1 === item2 : false;
  }

  /**
   * @function onClosePullUp
   * This method is used to close pullup
   */
  public onClosePullUp() {
    this.lookupService.storeSearchFilterContext(null);
    this.modalService.dismissModal();
  }

  /**
   * @function onClickSuggestion
   * This method is used to suggest a collection
   */
  public onClickSuggestion(selectedSuggestion) {
    this.showSuggestionPopup = true;
    this.selectedSuggestion = selectedSuggestion;
  }

  /**
   * @function onConfirmSuggestion
   * This method is used to suggest a collection
   */
  public onConfirmSuggestion() {
    this.showSuggestionPopup = false;
    const collection = this.selectedSuggestion;
    const competencyCode = this.selectedCompetency.code;
    collection.isSuggested = true;
    const studentList = this.studentsPerfomance
    if (studentList.length) {
      studentList.forEach((student) => {
        this.suggestContent(student.id, collection, competencyCode);
      });
    }
  }

  /**
   * @function suggestContent
   * Method used to post suggest content
   */
  public suggestContent(userId, collection, competencyCode) {
    const currentUserId = this.session.userSession.user_id;
    const contextParams = {
      user_id: userId,
      class_id: this.classId,
      suggested_content_id: collection.id,
      suggestion_origin: TEACHER_ROLE,
      suggestion_originator_id: currentUserId,
      suggestion_criteria: 'performance',
      suggested_content_type: collection.format,
      suggested_to: STUDENT_ROLE,
      suggestion_area: PROFICIENCY,
      tx_code: competencyCode,
      tx_code_type: COMPETENCY
    };
    this.suggestionService.suggestCollection(contextParams);
  }

  /**
   * @function openCalender
   * Method used to open the calender
   */
  public openCalender(selectedActivity) {
    const content = selectedActivity;
    this.modalService.openModal(CaAssignCalenderComponent, {
      startDate: new Date(),
      selectedDates: null,
      endDate: null,
      content
    }, 'atc-reschedule-calender').then((context: { startDate: string, endDate: string }) => {
      if (context) {
        const month = Number(moment(context.startDate).format('MM'));
        const year = Number(moment(context.startDate).format('YYYY'));
        this.rescheduleClassActivity(selectedActivity, context.startDate, context.endDate, month, year)
      }
    });
  }

  /**
   * @function rescheduleClassActivity
   * Method used to reschedule activity
   */
  public async rescheduleClassActivity(selectedActivity, startDate, endDate, month, year) {
    const contentFormat = selectedActivity.isCollection ? 'collection' : 'assessment';
    const params = {
      classId: this.classId,
      contentId: selectedActivity.id,
      contentType: selectedActivity.format ? selectedActivity.format : contentFormat,
      startDate,
      endDate,
      month,
      year
    };
    const response = await this.classActivityService.rescheduleClassActivity(params);
    if (response) {
      const successMessage = this.translate.instant('ASSIGNED_SUCCESSFULLY')
      this.toastService.presentToast(successMessage, true);
      const newContentId = response.headers.location;
      this.saveUsers(newContentId);
    } else {
      const errorMessage = this.translate.instant('SOMETHING_WENT_WRONG');
      this.toastService.presentToast(errorMessage, false);
    }
  }

  /**
   * @function onCancelSuggestion
   * This method is used to suggest a collection
   */
  public onCancelSuggestion() {
    this.showSuggestionPopup = false;
  }

  /**
   * @function toggleActionsTab
   * This method is used to toggle the action tab
   */
  public toggleActionsTab(type) {
    if (!this.isDiagnostic) {
      this.isShowAssessment = !this.isShowAssessment;
      this.selectedContentType = type;
      if (this.tenantLibrary){
        const context = {
          scopeTargetNames: this.tenantLibrary.shortName
        }
        this.searchCollections(context);
      } else {
        this.searchCollections();
      }
      this.trackSuggestionEvent();
    }
  }

  /**
   * @function trackSuggestionEvent
   * This Method is used to track the suggested events
   */
  public trackSuggestionEvent() {
    const context = this.getSuggestionEvent();
    this.parseService.trackEvent(EVENTS.CLICK_OPPORTUNITIES_GROWTH_SUGGESTION_VIEW, context);
  }

  /**
   * @function getSuggestionEvent
   * This method is used to get the suggested events
   */
  private getSuggestionEvent() {
    const classDetails = this.classService.class;
    return {
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.courseId,
    };
  }

  /**
   * @function onClickLibraryContent
   * This method is used to get the  selected tenant library content
   */
  public onClickLibraryContent(event) {
    this.tenantLibrary = event;
    const context = {
      scopeTargetNames: this.tenantLibrary.shortName
    }
    this.searchCollections(context);
  }

  /**
   * @function onSearch
   * methods to search
   */
  public onSearch() {
    this.searchCollections();
  }

  /**
   * @function onSearchClear
   * methods to search clear
   */
  public onSearchClear(event) {
    this.searchTerms = '';
    this.searchCollections();
  }

  /**
   * @function onSearchFocus
   * This Method is used to add animation on focus
   */
   public onSearchFocus() {
    const searchElement = this.searchElement['el'];
    if (searchElement) {
      const searchElementDefaultWidth = searchElement.offsetWidth;
      const paddingSize = 16;
      this.searchElementWidth = this.searchElementWidth || searchElementDefaultWidth - paddingSize;
      const animation = this.animationCtrl.create()
        .addElement(searchElement)
        .duration(500)
        .fromTo('width', `${searchElementDefaultWidth}px`, `calc(100% - ${this.searchElementWidth}px)`)
        .beforeStyles({
          position: 'absolute',
          width: `${searchElementDefaultWidth}px`
        })
      animation.play();
    }
  }

  /**
   * @function onSearchBlur
   * This Method is used to revert animation while added animaton in focus
   */
  public onSearchBlur() {
    const searchElement = this.searchElement['el'];
    if (searchElement) {
      const animatedSearchElementWidth = searchElement.offsetWidth;
      const animation = this.animationCtrl.create()
        .addElement(searchElement)
        .duration(500)
        .fromTo('width', `${animatedSearchElementWidth}px`, `${this.searchElementWidth}px`)
        .afterStyles({
          position: 'relative'
        })
      animation.play();
    }
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
