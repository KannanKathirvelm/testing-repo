import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { LookupService } from '@app/providers/service/lookup/lookup.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { SearchByFilterComponent } from '@components/search/search-by-filter/search-by-filter.component';
import { AllowAccessComponent } from '@components/UI/allow-access/allow-access.component';
import {
  ASSESSMENT,
  AUDIENCE_LIST,
  CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS,
  COLLECTION,
  GOORU_CATALOG,
  LEVEL_ACTION_KEYS,
  MEETING_TOOLS,
  OFFLINE_ACTIVITY,
  SCOPE_AND_SEQUENCE_RESOURCE_TYPE,
  SEARCH_FILTER_BY_CONTENT_TYPES,
  SMP_STRING
} from '@constants/helper-constants';
import { AlertController, AnimationController, IonSearchbar, NavParams } from '@ionic/angular';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ContentTypeModel, ScopeAndSequenceModel, SequenceModel, SNSScopeModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { ClassModel } from '@models/class/class';
import { SearchFilterContextModel } from '@models/lookup/lookup';
import { ContentModel } from '@models/signature-content/signature-content';
import { TaxonomyGrades } from '@models/taxonomy/taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { NetworkService } from '@providers/service/network.service';
import { ScopeAndSequenceService } from '@providers/service/scope-and-sequence/scope-and-sequence.service';
import { SearchService } from '@providers/service/search/search.service';
import { SessionService } from '@providers/service/session/session.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { ToastService } from '@providers/service/toast.service';
import { UtilsService } from '@providers/service/utils.service';
import { VideoConferenceService } from '@providers/service/video-conference/video-conference.service';
import { formatimeToDateTime } from '@utils/global';
import { collapseAnimation } from 'angular-animations';
import axios from 'axios';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'nav-assign-activity',
  templateUrl: './assign-activity.component.html',
  styleUrls: ['./assign-activity.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})

export class AssignActivityComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  @ViewChild('search', { static: false }) public searchElement: IonSearchbar;
  public isTab1Active: boolean;
  public contentTypes: Array<ContentTypeModel>;
  public classDetails: ClassModel;
  public activeComponentKey: string;
  public page: number;
  public pageSize: number;
  public activeSequence: Array<SequenceModel>;
  public additionalFilter: { filters?: any; standard?: Array<any> };
  public isDefaultScopeSequence: boolean;
  public contentResource: Array<SequenceModel>;
  public activeCompetencyList: any;
  public selectedContentResource: Array<SequenceModel>;
  public searchTerms: string;
  public scopeAndSequences: Array<ScopeAndSequenceModel>;
  public activeScopeAndSequence: ScopeAndSequenceModel;
  public snsScopeSequence: SNSScopeModel;
  public activeSequenceIndex: number;
  public activeContentType: ContentTypeModel;
  public isScopeAndSequenceActive: boolean;
  public showAllContent: {
    contentData: Array<ContentModel>;
    sequenceIndex: number;
    sequenceData: SequenceModel;
    page: number;
    totalCount: number;
  };
  public showLoader: boolean;
  public isLoading: boolean;
  public activities: Array<ClassContentModel>;
  public isInitialLoaded: boolean;
  public showMeeting: boolean;
  public isShowScopeAndSequence: boolean;
  public isShowDefaultView: boolean;
  public selectedContentLibraryName: string;
  public toggledIndexValues: { domainIndex: number; topicIndex: number; competencyIndex: number };
  public isFiltered: boolean;
  private searchElementWidth: number;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public isCaBaselineWorkflow: boolean;
  public filterCount: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private classService: ClassService,
    private taxonomyService: TaxonomyService,
    private scopeAndSequenceService: ScopeAndSequenceService,
    private searchService: SearchService,
    private classActivityService: ClassActivityService,
    private toastService: ToastService,
    private translate: TranslateService,
    private navParams: NavParams,
    private videoConferenceService: VideoConferenceService,
    private utilsService: UtilsService,
    private sessionService: SessionService,
    private alertCtrl: AlertController,
    private animationCtrl: AnimationController,
    private networkService: NetworkService,
    private zone: NgZone,
    private parseService: ParseService,
    private lookupService: LookupService,
  ) {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        this.initialize();
        this.isTab1Active = true;
        this.isScopeAndSequenceActive = true;
        this.isInitialLoaded = false;
      });
    });
  }

  /**
   * @function initialize
   * This method is used to intialize value
   */
  public initialize() {
    this.contentTypes = [];
    this.activeSequence = [];
    this.additionalFilter = {};
    this.activeCompetencyList = [];
    this.isDefaultScopeSequence = false;
    this.showMeeting = false;
    this.showLoader = true;
    this.searchTerms = '';
    this.classDetails = this.classService.class;
    this.page = 0;
    this.pageSize = 10;
    this.contentTypes = SEARCH_FILTER_BY_CONTENT_TYPES;
    this.contentTypes = this.contentTypes.sort((item1, item2) => item1.seqId - item2.seqId);
    this.activities = this.navParams.get('activities');
    const isPremiumClass = this.classDetails.isPremiumClass;
    this.isShowScopeAndSequence = !!isPremiumClass;
    this.isShowDefaultView = !this.classDetails.gradeCurrent || !isPremiumClass;
  }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    if (this.isOnline) {
      this.fetchContentSources().then(() => {
        this.isFilterApplied();
        const contentAdditionalFilter = this.contentAdditionalFilter();
        const isClassHasGrade = this.classDetails.gradeCurrent;
        this.applyFilter(this.selectedContentResource, contentAdditionalFilter, isClassHasGrade);
      });
      // default selection collection
      this.setDefaultSelection();
      this.filterCount = 0;
    }
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function applyFilter
   * This method is used to apply filter
   */
  public applyFilter(contentResouce, additionalFilter, isClassHasGrade) {
    this.resetFilterProperties();
    this.additionalFilter = additionalFilter;
    this.activeSequence = contentResouce;
    this.selectedContentLibraryName = contentResouce && contentResouce[0].name || null;
    if (additionalFilter.standard && additionalFilter.standard.length) {
      if (this.activeComponentKey === CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS.defaultView) {
        this.activeComponentKey = CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS.defaultView;
      }
    }
    if (this.isShowDefaultView) {
      this.defaultViewContent();
    } else {
      this.fetchScopeAndSequenceContent();
    }
  }

  /**
   * @function resetFilterProperties
   * This method is used to reset filter Properties
   */
  public resetFilterProperties() {
    this.activeSequenceIndex = 0;
    this.page = 0;
    this.showLoader = true;
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal() {
    this.lookupService.searchFilterContextSubject.next(null);
    this.modalService.dismissModal();
  }

  /**
   * @function selectScopeAndSequence
   * This method is used to select scope and sequence
   */
  public selectScopeAndSequence() {
    this.activeSequenceIndex = 0;
    this.isScopeAndSequenceActive = true;
  }

  /**
   * @function onContentChange
   * This method is used to change content type
   */
  public onContentChange(sequenceIndex) {
    this.resetFilterProperties();
    this.isScopeAndSequenceActive = false;
    this.activeSequenceIndex = sequenceIndex;
    this.defaultViewContent();
  }

  /**
   * @function defaultViewContent
   * This method is used to view show all contents
   */
  public defaultViewContent() {
    this.isLoading = true;
    this.searchBySequenceIndex(this.activeSequenceIndex).then((response) => {
      this.showAllContent = {
        contentData: response.collections,
        sequenceIndex: this.activeSequenceIndex,
        sequenceData: this.activeSequence[this.activeSequenceIndex],
        page: 1,
        totalCount: response.totalCount
      };
      this.isInitialLoaded = true;
      this.isScopeAndSequenceActive = false;
      this.isLoading = false;
    });
  }


  public searchBySequenceIndex(sequenceIndex, offset = 0) {
    const activeContentKey = this.activeContentType.apiKey;
    const queryParams = this.contentRequestBody(null, null, sequenceIndex);
    queryParams['audienceFilter'] = true;
    queryParams['pageSize'] = this.pageSize;
    queryParams['page'] = offset;
    if (queryParams && queryParams['filters']) {
      const context = {
        term: this.searchTerms,
        searchParams: queryParams
      }
      if (this.selectedContentLibraryName === 'Gooru Catalog') {
        context['contentType'] = [this.activeContentType.format];
        const contentSubType = this.additionalFilter.filters?.['flt.contentSubtype'];
        if (contentSubType) {
          context['contentType'] = [contentSubType];
        }
        const audience = context.searchParams['filters']['flt.audience'];
        if (Object.keys(audience).length === 0) {
          context.searchParams['filters']['flt.audience'] = SCOPE_AND_SEQUENCE_RESOURCE_TYPE.TEACHERS['flt.audience'];
        }
        queryParams['subject'] = queryParams['filters']['flt.subject'];
        return this.searchService.searchCapContents(context);
      }
      return this.searchService[activeContentKey](context);
    }
  }


  /**
   * @function selectContentType
   * This method is used to select content type
   */
  public selectContentType(contentIndex) {
    this.showMeeting = false;
    this.activeContentType = this.contentTypes[contentIndex];
    switch (this.activeContentType.format) {
     case ASSESSMENT:
       this.parseService.trackEvent(EVENTS.CLICK_CA_ASSESSMENT);
       break;
     case COLLECTION:
       this.parseService.trackEvent(EVENTS.CLICK_CA_COLLECTION);
       break;
     case OFFLINE_ACTIVITY:
       this.parseService.trackEvent(EVENTS.CLICK_CA_OFFLINE_ACTIVITY);
       break;
    }
    this.searchContent();
  }

  public searchContent() {
    this.showMeeting = false;
    if (this.isScopeAndSequenceActive) {
      this.resetFilterProperties();
      if (this.isShowScopeAndSequence) {
        this.onFetchModules();
      } else {
        this.onFetchDomains();
      }
    } else {
      this.defaultViewContent();
    }
  }

  /**
   * @function changeActiveScope
   * This method is used to change scope (grade list)
   */
  public changeActiveScope(event) {
    const selectedScope = event.target.value;
    this.activeScopeAndSequence = this.scopeAndSequences.find((item) => item.id === selectedScope);
    if (this.isShowScopeAndSequence) {
      this.onFetchModules();
    } else {
      this.onFetchDomains();
    }
  }

  /**
   * @function fetchContentSources
   * This method is used to fetch content sources
   */
  public fetchContentSources() {
    const preference = this.classDetails.preference;
    const subjectId = preference ? preference.subject : '';
    return this.scopeAndSequenceService.fetchContentSources({ subjectId }).then((contentSource) => {
      const buildSequence = [];
      contentSource.forEach((item) => {
        if (!this.classDetails.courseId && item.key === 'course-map') {
          return;
        }
        item.filters = this.parseDefaultSequenceFilter()[item.key]
          ? Object.assign(this.parseDefaultSequenceFilter()[item.key])
          : {}
        if (item.key === 'open-library' || item.key === 'tenant-library') {
          item.filters.scopeTargetNames = item.short_name;
        }
        item.isActive = true;
        buildSequence.push(item);
      });
      this.contentResource = buildSequence.sort((sequence1, sequence2) => {
        return sequence1.sequenceId - sequence2.sequenceId
      });
    });
  }

  /**
   * @function isFilterApplied
   * This method is used to check is filter applied
   */
  public isFilterApplied() {
    const activeCompetencies = this.activeCompetencyList;
    this.selectedContentResource = this.contentResource.filter((item) => item.isActive);
    return (
      AUDIENCE_LIST.length > 0 ||
      activeCompetencies.length > 0 ||
      JSON.stringify(this.contentResource) !== JSON.stringify(this.selectedContentResource)
    )
  }

  /**
   * @function contentAdditionalFilter
   * This method is used to content additional filter
   */
  public contentAdditionalFilter() {
    const filterList = { filters: {} };
    let standardIds = [];
    const activeCompetencies = this.activeCompetencyList;
    const audiences = activeCompetencies.audiences || [];
    const subject = activeCompetencies.subject && activeCompetencies.subject || null;
    const preference = this.classDetails.preference;
    const subjectCode = preference && preference.subject ? preference.subject : null;
    const frameWorkCode = preference && preference.framework ? preference.framework : null;
    const fwCode = activeCompetencies.frameworkId && activeCompetencies.frameworkId || null;
    const taxGrade = activeCompetencies.grade && activeCompetencies.grade || null;
    const domain = activeCompetencies.domain && activeCompetencies.domain || null;
    const standard = activeCompetencies.competencies &&
      activeCompetencies.competencies.length &&
      activeCompetencies.competencies || null;
    const diagnostic = activeCompetencies.diagnostic || [];
    if (fwCode) {
      standardIds.push(fwCode);
    }
    if (subject) {
      standardIds.push(subject.id);
    }
    if (taxGrade) {
      standardIds.push(taxGrade.id);
    }
    if (domain) {
      standardIds.push(domain.id);
    }
    if (standard) {
      standardIds = [...standardIds, ...standard.map((item) => item.id)];
    }
    filterList.filters['flt.audience'] = audiences.length
      ? audiences.map((item) => item.label).toString()
      : {};
    filterList['standard'] = standardIds;
    filterList.filters['flt.taxGrade'] = taxGrade && taxGrade.title || null;
    filterList.filters['flt.fwCode'] = fwCode || null;
    const isDiagnostic = diagnostic.length && diagnostic.map((item) => item.isActive).length ? true : false;
    filterList.filters['flt.contentSubtype'] = isDiagnostic ? 'diagnostic-assessment' : null;
    filterList.filters['flt.domain'] = domain && domain.id || null;
    filterList.filters['flt.contentSubtype'] = diagnostic.length && diagnostic.map((item) => item.isActive).length
    ? 'diagnostic-assessment' : null;
    if (subjectCode) {
      filterList.filters['flt.subject'] = isDiagnostic && frameWorkCode ? `${frameWorkCode}.${subjectCode}` : subjectCode;
    }
    return filterList;
  }

  /**
   * @function fetchScopeAndSequenceContent
   * This method is used to fetch scope and sequence content
   */
  public fetchScopeAndSequenceContent() {
    const classPreference = this.classDetails.preference;
    const taxonomyParams = {
      subject: classPreference.subject,
      fw_code: classPreference.framework
    };
    return axios.all<{}>([
      this.taxonomyService.fetchGradesBySubject(taxonomyParams),
      this.taxonomyService.fetchTaxonomyCourses(taxonomyParams),
      this.scopeAndSequenceService.fetchScopeAndSequence(taxonomyParams),
      this.scopeAndSequenceService.fetchSNSScopeAndSequence(this.classDetails.id)
    ]).then(axios.spread((gradeList: Array<TaxonomyGrades>, defaultScope: Array<ScopeAndSequenceModel>, scopeAndSequenceList: any, snsScope: SNSScopeModel) => {
      let parseScopeAndSequenceList = this.parseScopeAndSequence(gradeList, scopeAndSequenceList);
      this.snsScopeSequence = snsScope;
      if (!scopeAndSequenceList['length']) {
        this.isDefaultScopeSequence = true;
        parseScopeAndSequenceList = defaultScope;
        parseScopeAndSequenceList = parseScopeAndSequenceList.filter(item => item.title !== SMP_STRING);
        this.activeComponentKey = CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS.defaultScopeAndSequence;
        this.isShowScopeAndSequence = false;
      }
      const currentGrade = parseScopeAndSequenceList.find((item) => item.id === this.classDetails.gradeCurrent);
      if (currentGrade) {
        this.activeScopeAndSequence = currentGrade;
      }
      const activeGradeObject = gradeList.find((item) => item.id === this.classDetails.gradeCurrent);
      let defaultActiveScope = parseScopeAndSequenceList.find((grade, index) => {
        const gradeKey = grade.title ? 'title' : 'grade';
        return grade[gradeKey] === (activeGradeObject && activeGradeObject.grade) ||
          index + 1 === (activeGradeObject && activeGradeObject.sequence);
      });
      if (!defaultActiveScope && this.isDefaultScopeSequence) {
        defaultActiveScope = parseScopeAndSequenceList.find((grade) => {
          return grade.sequenceId === activeGradeObject.sequenceId;
        });
      }
      if (defaultActiveScope) {
        this.activeScopeAndSequence = defaultActiveScope;
      }
      if (!currentGrade && !defaultActiveScope) {
        this.activeScopeAndSequence = parseScopeAndSequenceList[0];
      }
      this.scopeAndSequences = parseScopeAndSequenceList;
      this.isInitialLoaded = true;
    }));
  }

  /**
   * @function onToggleDomain
   * This method is used to toggle domain
   */
  public onToggleDomain(event) {
    const params = {
      pathParams: {
        domainId: event.id
      }
    }
    this.onSelectLevel(LEVEL_ACTION_KEYS.topicsList, event, params);
  }

  /**
   * @function onToggleDomain
   * This method is used to toggle domain
   */
  public onToggleTopic(event) {
    const params = {
      pathParams: {
        domainId: event.domain.id,
        topicId: event.topic.id
      }
    }
    this.onSelectLevel(LEVEL_ACTION_KEYS.competenciesList, event.topic, params);
  }

  /**
   * @function onToggleCompetency
   * This method is used to toggle competency
   */
  public onToggleCompetency(event) {
    this.toggledIndexValues = event;
    if (event) {
      const competency = this.activeScopeAndSequence.domainsList[event.domainIndex].topicsList[event.topicIndex].competenciesList[event.competencyIndex];
      this.toggleCompetency(competency);
    }
  }

  /**
   * @function onFetchDomains
   * This method is used to fetch domains
   */
  public onFetchDomains() {
    const params = this.defaultPathParams();
    if (params) {
      this.taxonomyService.fetchTaxonomyDomains(params).then((domainsList) => {
        Object.assign(this.activeScopeAndSequence, { domainsList });
      });
    }
  }

  /**
   * @function onSelectLevel
   * This method is used to on select level
   */
  public onSelectLevel(levelActionKey, level, params) {
    params.pathParams = Object.assign({}, this.defaultPathParams(), params.pathParams);
    level.isActive = !level.isActive;
    if (!level.levelActionKey) {
      this.loadLevelData(levelActionKey, level, params);
    }
  }

  /**
   * @function loadLevelData
   * This method is used to on load level data
   */
  public loadLevelData(levelActionKey, level, params = null) {
    const pathParams = params.pathParams;
    this.taxonomyService[levelActionKey.actionKey](pathParams).then((levelData) => {
      level[`${levelActionKey.levelKey}`] = levelData;
    });
  }

  /**
   * @function toggleCompetency
   * This method is used to toggle competency
   */
  public toggleCompetency(competency) {
    if (!competency.isActive) {
      this.resetProperties('isActive');
    }
    competency.isActive = true;
    if (competency.isActive) {
      this.loadActivitiesContent(competency);
    }
  }

  /**
   * @function loadActivitiesContent
   * This method is used load activities content
   */
  public loadActivitiesContent(competency) {
    const filterKeys = ['TEACHERS', 'STUDENTS'];
    Object.assign(competency, {
      teacherspage: 0,
      studentspage: 0,
      hasContent: true,
      teachersContent: [],
      studentsContent: [],
      studentsContentLoading: false,
      studentsSkipedLevels: [],
      teachersSkipedLevels: []
    });
    this.onSelectCompetency(competency, filterKeys);
  }


  /**
   * @function onSelectCompetency
   * This method is used to select competency
   */
  public onSelectCompetency(competency, filterKeys) {
    this.onLoadScopeAndSequence(competency, filterKeys);
  }

  /**
   * @function onLoadScopeAndSequence
   * This method is used to on load scope and sequence
   */
  public onLoadScopeAndSequence(competency, filterKeys) {
    filterKeys.forEach((filterKey) => {
      this.scopeAndSequenceActivitiesContent(competency, filterKey, this.activeSequenceIndex);
    });
  }

  /**
   * @function scopeAndSequenceActivitiesContent
   * This method is used to scope and sequence activities content
   */
  public scopeAndSequenceActivitiesContent(competency, filterKey, activeIndex = 0) {
    const searchParams = this.contentRequestBody(competency, filterKey, activeIndex);
    const actionKey = this.activeContentType.apiKey;
    const activityContentKey = `${SCOPE_AND_SEQUENCE_RESOURCE_TYPE[filterKey].name}Content`;
    competency[`${SCOPE_AND_SEQUENCE_RESOURCE_TYPE[filterKey].name}ContentLoading`] = true;
    const context = {
      term: this.searchTerms,
      searchParams
    };
    if (this.selectedContentLibraryName === 'Gooru Catalog') {
      context['contentType'] = [this.activeContentType.format];
      searchParams['standard'] = competency.id;
      const contentSubYype = this.additionalFilter.filters?.['flt.contentSubtype'];
      if (contentSubYype) {
        context['contentType'] = [contentSubYype];
      }
      this.searchService.searchCapContents(context).then((response) => {
        const contentData = response.collections;
        competency[`${activityContentKey}`] = {
          contentData,
          sequenceData: this.activeSequence[activeIndex],
          sequenceIndex: activeIndex,
          page: 1,
          totalCount: response.totalCount
        };
        competency[`${SCOPE_AND_SEQUENCE_RESOURCE_TYPE[filterKey].name}ContentLoading`] = false;
      });
    } else {
      this.searchService[actionKey](context).then((response) => {
        const contentData = response.collections;
        competency[`${activityContentKey}`] = {
          contentData,
          sequenceData: this.activeSequence[activeIndex],
          sequenceIndex: activeIndex,
          page: 1,
          totalCount: response.totalCount
        };
        competency[`${SCOPE_AND_SEQUENCE_RESOURCE_TYPE[filterKey].name}ContentLoading`] = false;
      });
    }
  }

  /**
   * @function contentRequestBody
   * This method is used to get content request body
   */
  public contentRequestBody(competency = null, filterKey = null, activeIndex = 0) {
    let params = {
      taxonomies: null,
      page: this.page,
      pageSize: this.pageSize
    };
    params.taxonomies = this.additionalFilter['standard'];
    if (this.activeSequence && this.activeSequence && this.additionalFilter) {
      params = Object.assign(params, {
        filters: Object.assign(
          this.activeSequence[activeIndex].filters,
          this.additionalFilter.filters
        )
      });
    }
    if (filterKey && competency) {
      params['page'] = competency[`${SCOPE_AND_SEQUENCE_RESOURCE_TYPE[filterKey].name}page`];
      const standardCode = this.isDefaultScopeSequence
        ? competency.id
        : competency.code;
      params['taxonomies'] = params['taxonomies'].concat([standardCode]);
      params['filters'] = Object.assign({}, params['filters'], {
        'flt.audience': SCOPE_AND_SEQUENCE_RESOURCE_TYPE[filterKey]['flt.audience']
      });
      params['filters']['isCrosswalk'] = true;
    }
    if (this.isScopeAndSequenceActive) {
      params['filters']['flt.subject'] = null;
    }
    return params;
  }

  /**
   * @function resetProperties
   * This method is used to reset properties
   */
  public resetProperties(propKey) {
    const domainList = this.activeScopeAndSequence.domainsList || [];
    if (domainList && domainList.length) {
      domainList.map((domain) => {
        if (domain.topicsList && domain.topicsList.length) {
          domain.topicsList.forEach((topics) => {
            return topics.competenciesList && topics.competenciesList.filter((item) => {
              return item[`${propKey}`]
            }).forEach((competency) => {
              competency[`${propKey}`] = false;
            })
          });
        }
      });
    }
  }

  /**
   * @function resetProperties
   * This method is used to help to parse the list of scope and sequence list by grade
   */
  public parseScopeAndSequence(gradeList = [], scopeAndSequenceList = []) {
    const parsedList = [];
    scopeAndSequenceList.forEach(item => {
      if (item.gradesCovered.length) {
        const gradesCovered = item.gradesCovered;
        gradesCovered.forEach(gradeId => {
          const grade = gradeList.find((gradeItem) => gradeItem.id === gradeId);
          if (grade) {
            Object.assign(grade, {
              scopeName: item.name,
              scopeId: item.id
            });
            parsedList.push(grade);
          }
        });
      }
    });
    return parsedList;
  }

  /**
   * @function defaultPathParams
   * This method is used has default path params that needs for all the level
   */
  public defaultPathParams() {
    const classPreference = this.classDetails.preference;
    return classPreference
      ? {
        fwCode: classPreference.framework,
        subject: classPreference.subject,
        gradeId: this.activeScopeAndSequence.id
      }
      : null
  }

  /**
   * @function parseDefaultSequenceFilter
   * This Methods help to parse the path params
   */
  public parseDefaultSequenceFilter() {
    return {
      'course-map': {
        'flt.courseId': this.classDetails.courseId,
        'flt.publishStatus': 'published,unpublished'
      },
      'open-library': {
        scopeKey: 'open-library',
        'flt.publishStatus': 'published,unpublished',
        scopeTargetNames: ''
      },
      'tenant-library': {
        scopeKey: 'tenant-library',
        'flt.publishStatus': 'published,unpublished',
        scopeTargetNames: ''
      },
      'open-all': {
        scopeKey: 'open-all',
        'flt.publishStatus': 'published'
      },
      'my-content': {
        scopeKey: 'my-content',
        'flt.publishStatus': 'published,unpublished'
      }
    };
  }

  /**
   * @function addActivity
   * This Methods help to add acivity
   */
  public addActivity(event) {
    const classSetting = this.classDetails.setting;
    const secondaryClasses = classSetting && classSetting['secondary.classes'] && classSetting['secondary.classes'].list || [];
    const classIds = [...[this.classDetails.id], ...secondaryClasses];
    const promiseList = classIds.map((classId) => {
      return new Promise((resolve, reject) => {
        const addActivityParams = this.classActivityContext(event, classId);
        this.classActivityService.rescheduleClassActivity(addActivityParams).then((response) => {
          const classMembers = this.classService.classMembers;
          const studentList = classMembers && classMembers.members || [];
          const studentIds = studentList.map((student) => student.email);
          const activityId = response.headers.location;
          if (event.context.startTime && event.context.endTime) {
            const contextParams = {
              title: event.content.title,
              meetingStartTime: formatimeToDateTime(event.context.startTime),
              meetingEndTime: formatimeToDateTime(event.context.endTime),
              id: activityId,
              classId
            }
            this.videoConferenceService.createVideoConferenceList(contextParams, studentIds);
          }
          if (this.activeCompetencyList.diagnostic?.length) {
            this.onUpdateMasteryAccural(classId, activityId, true);
          }
          resolve();
        }, reject);
      });
    });
    Promise.all(promiseList).then(() => {
      const successMessage = this.translate.instant('ASSIGNED_SUCCESSFULLY')
      this.toastService.presentToast(successMessage, true);
    }).catch((error) => {
      const errorMessage = this.translate.instant('SOMETHING_WENT_WRONG');
      this.toastService.presentToast(errorMessage, false);
    });
  }

  /**
   * @function classActivityContext
   * methods to load class activity context
   */
  public classActivityContext(params, classId) {
    return {
      classId,
      contentId: params.content.id,
      contentType: params.content.format,
      startDate: params.context.startDate,
      endDate: params.context.endDate,
      month: Number(moment(params.context.startDate).format('MM')),
      year: Number(moment(params.context.endDate).format('YYYY'))
    }
  }

  /**
   * @function loadMoreData
   * methods to load more data
   */
  public loadMoreData(content) {
    if (content.contentData.length !== content.totalCount) {
      const sequenceIndex = content.sequenceIndex;
      content.isLoading = true;
      this.searchBySequenceIndex(sequenceIndex, content.page).then((response) => {
        content.contentData = [...content.contentData, ...response.collections];
        content.page = content.page + 1;
        content.isLoading = false;
      });
    }
  }

  /**
   * @function loadLessData
   * methods to load less data
   */
  public loadLessData(content) {
    content.contentData = content.contentData.filter((item, index) => index < this.pageSize);
    content.page = 0;
  }

  /**
   * @function onUpdateMasteryAccural
   * This method is used to update mastery accural
   */
  public onUpdateMasteryAccural(classId, contentId, enable) {
    this.classActivityService.updateMasteryAccural(classId, contentId, { allow_mastery_accrual: enable });
  }

  /**
   * @function onSearch
   * methods to search
   */
  public onSearch() {
    this.parseService.trackEvent(EVENTS.SEARCH_CA);
    this.defaultViewContent();
  }

  /**
   * @function onSearchClear
   * methods to search clear
   */
  public onSearchClear(event) {
    this.searchTerms = '';
    this.searchContent();
  }

  /**
   * @function toggleMeeting
   * methods to toggle meeting
   */
  public toggleMeeting() {
    this.parseService.trackEvent(EVENTS.CLICK_CA_VIDEO_CONFERENCE);
    const classMembers = this.classService.classMembers;
    const studentList = classMembers && classMembers.members || [];
    if (studentList.length) {
      this.showMeeting = !this.showMeeting;
      this.checkConferenceToken();
    } else {
      this.alertForMeetingActivityForNoStudent();
    }
  }

  /**
   * @function checkConferenceToken
   * methods to check conference token
   */
  public async checkConferenceToken() {
    const meetingTool = await this.utilsService.preferredMeetingTool();
    const videoConferenceType = meetingTool === MEETING_TOOLS.zoom ? 'getZoomTokenFromSession' : 'getConferenceTokenFromSession';
    this.sessionService[videoConferenceType]().then((token) => {
      if (!token) {
        this.modalService.openModal(AllowAccessComponent, {}, 'allow-access', false).then((context: { isAllow: boolean }) => {
          this.showMeeting = context && context.isAllow || false;
        });
      }
    });
  }

  /**
   * @function createMeetingActivity
   * methods to create meeting activity
   */
  public createMeetingActivity(activityContext) {
    const selectedDate = moment(activityContext.selectedDate).format('YYYY-MM-DD')
    const activityParams = {
      class_id: this.classDetails.id,
      dca_added_date: selectedDate,
      end_date: selectedDate,
      for_month: Number(moment(activityContext.selectedDate).format('MM')),
      for_year: Number(moment(activityContext.selectedDate).format('YYYY')),
      title: activityContext.meetingName
    };
    this.classActivityService.createMeetingActivity(activityParams).then((response) => {
      this.toastService.presentToast(this.translate.instant('MEETING_CREATED_MSG'), true);
      this.showMeeting = false;
      const videoConferenceParams = {
        id: response.headers.location,
        meetingStartTime: formatimeToDateTime(activityContext.startTime),
        meetingEndTime: formatimeToDateTime(activityContext.endTime),
        classId: this.classDetails.id,
        title: activityContext.meetingName
      };
      this.videoConferenceService.createVideoConferenceList(videoConferenceParams, activityContext.studentIds);
    });
  }

  /**
   * @function alertForMeetingActivityForNoStudent
   * This Method is used to show alert for meeting class activity for there is no student
   */
  public async alertForMeetingActivityForNoStudent() {
    const alert = await this.alertCtrl.create({
      cssClass: 'alert-meeting-class-activity',
      header: this.translate.instant('ADD_STUDENT'),
      message: this.translate.instant('ADD_STUDENT_CREATE_MEETING'),
      buttons: [{
        text: this.translate.instant('OK'),
        role: 'cancel',
        cssClass: 'secondary'
      }]
    });
    await alert.present();
  }

  /**
   * @function loadLevelDataForScopeAndSequence
   * This Method is used to show to load level data for scope and sequence
   */
  public loadLevelDataForScopeAndSequence(levelActionKey, level, params = null) {
    const pathParams = params && params.pathParams || null;
    const queryParams = params && params.queryParams || {};
    // Here actionKey is the method name from the {scopeAndSequenceService} service file
    this.scopeAndSequenceService[levelActionKey.actionKey](pathParams, queryParams).then((levelData) => {
      level[`${levelActionKey.levelKey}`] = levelData;
    });
  }

  /**
   * @function onToggleCompetencyForScopeSequence
   * This Method is used to toggle competency for scope and sequence
   */
  public onToggleCompetencyForScopeSequence(competency) {
    competency.isActive = true;
    if (competency.isActive) {
      this.loadActivitiesContent(competency);
    }
  }

  /**
   * @property {Object} getLevelAndActionKeys
   * help to define list of action name for each level
   */
  public getLevelAndActionKeys() {
    return {
      gradesList: {
        actionKey: 'fetchModulesByScopeId',
        levelKey: 'modulesList'
      },
      modules: {
        actionKey: 'fetchTopicsByModule',
        levelKey: 'topicsList'
      },
      topics: {
        actionKey: 'fetchCompeteciesByTopics',
        levelKey: 'competenciesList'
      }
    }
  }

  /**
   * @function onFetchModules
   * This Method is used to fetch modules
   */
  public onFetchModules() {
    const levelActionKeys = this.getLevelAndActionKeys().gradesList;
    this.loadLevelDataForScopeAndSequence(
      levelActionKeys,
      this.activeScopeAndSequence,
      {
        pathParams: { ssId: this.activeScopeAndSequence.scopeId },
        queryParams: { gradeMasterId: this.activeScopeAndSequence.id }
      })
  }

  /**
   * @function onSelectLevelForScopeAndSequence
   * This Method is used to select level for scope and sequence
   */
  public onSelectLevelForScopeAndSequence(levelActionKey, level, params) {
    level.isActive = !level.isActive;
    if (!level[levelActionKey.levelKey]) {
      this.loadLevelDataForScopeAndSequence(levelActionKey, level, params);
    }
  }

  /**
   * @function onToggleModule
   * This Method is used to toggle module
   */
  public onToggleModule(moduleData) {
    const moduleId = moduleData.id;
    const ssId = this.activeScopeAndSequence.id;
    const pathParams = {
      pathParams: {
        ssId,
        moduleId
      }
    };
    const levelAndActionKeys = this.getLevelAndActionKeys().modules;
    this.onSelectLevelForScopeAndSequence(levelAndActionKeys, moduleData, pathParams);
  }

  /**
   * @function onToggleTopicForSS
   * This Method is used to toggle topics for scope and sequence
   */
  public onToggleTopicForSS(event) {
    const topic = event.topic;
    const topicId = topic.id;
    const ssId = this.activeScopeAndSequence.id;
    const pathParamsTopics = {
      pathParams: {
        ssId,
        topicId
      }
    };
    const levelAndActionTopics = this.getLevelAndActionKeys().topics;
    this.onSelectLevelForScopeAndSequence(levelAndActionTopics, topic, pathParamsTopics);
  }

  /**
   * @function onToggleCompetencyForSS
   * This Method is used to toggle competency for scope and sequence
   */
  public onToggleCompetencyForSS(event) {
    this.toggledIndexValues = event;
    const competency = this.activeScopeAndSequence && this.activeScopeAndSequence.modulesList[event.moduleIndex].topicsList[event.topicIndex].competenciesList[event.competencyIndex];
    this.onToggleCompetencyForScopeSequence(competency);
  }

  /**
   * @function toggleScopeAndSequence
   * This Method is used to toggle scope and sequence
   */
  public toggleScopeAndSequence(event) {
    this.isScopeAndSequenceActive = event.detail.checked;
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_CA_SHOW_ALL, context);
    if (this.isScopeAndSequenceActive) {
      this.onFetchDomains();
    } else {
      this.defaultViewContent();
    }
  }

  /**
   * @function changeContentLibrary
   * This Method is used to change content library
   */
  public changeContentLibrary(event) {
    if (this.activeScopeAndSequence || this.isShowDefaultView) {
      const sequenceName = event.detail.value;
      this.selectedContentLibraryName = sequenceName;
      this.activeSequenceIndex = this.activeSequence.findIndex((item) => item.name === sequenceName);
      if (this.isScopeAndSequenceActive) {
        if (this.isShowScopeAndSequence) {
          this.onToggleCompetencyForSS(this.toggledIndexValues);
        } else {
          this.onToggleCompetency(this.toggledIndexValues);
        }
      } else {
        this.defaultViewContent();
      }
    }
  }

  /**
   * @function onFilter
   * This Method is used to filter content
   */
  public onFilter() {
    this.parseService.trackEvent(EVENTS.CLICK_CA_VIDEO_CONFERENCE);
    const filterContext = {
      contentType: this.activeContentType.format,
      isCaBaselineWorkflow: this.isCaBaselineWorkflow
    };
    this.modalService.openModal(SearchByFilterComponent, filterContext, 'ca-search-by-filter').then((context: SearchFilterContextModel) => {
      if (context) {
        if (context && context.diagnostic) {
          this.selectedContentLibraryName = GOORU_CATALOG;
        }
        this.filterCount = 0;
        this.isFiltered = !context.isCancel;
        this.activeCompetencyList = context.isCancel ? [] : context;
        if (this.isFiltered) {
          this.filterCount = Object.keys(context).filter((key) => {
            return context[key];
          }).length;
        }
        this.additionalFilter = this.contentAdditionalFilter();
        this.defaultViewContent();
      }
    });
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
      this.searchElementWidth = this.searchElementWidth || searchElementDefaultWidth + paddingSize;
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
   * @function setDefaultSelection
   * This Method is used to set default selection
   */
  public setDefaultSelection() {
    const selectedContentType = this.navParams.get('selectedContentType');
    if (selectedContentType) {
      const activeType = this.contentTypes.find(content => content.format === selectedContentType);
      if (activeType) {
        this.activeContentType = activeType;
      }
      if (selectedContentType === 'meeting') {
        this.toggleMeeting();
        this.activeContentType = this.contentTypes[1];
      }
    } else {
      this.activeContentType = this.contentTypes[1];
    }
  }

  /**
   * @function getEventContext
   * This method is used to get the context for scope and sequence event
   */
  public getEventContext() {
    return {
      classId: this.classDetails.id,
      className: this.classDetails.title,
      courseId: this.classDetails.courseId
    };
  }
}
