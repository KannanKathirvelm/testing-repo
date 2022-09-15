import { ClassService } from '@app/providers/service/class/class.service';
import { Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NetworkService } from '@app/providers/service/network.service';
import { UtilsService } from '@app/providers/service/utils.service';
import {
  COMPETENCY_STATUS,
  COMPETENCY_STATUS_VALUE,
  CONTENT_TYPES,
  DEFAULT_FRAMEWORK,
  MICRO_COMPETENCY_CODE_TYPES
} from '@constants/helper-constants';
import { ModalController } from '@ionic/angular';
import {
  CompetencyModel,
  DomainModel,
  FwCompetencyModel,
  MicroCompetenciesModel,
  PrerequisitesModel,
  SelectedCompetencyModel,
  StudentCompetencies
} from '@models/competency/competency';
import { ProfileModel } from '@models/profile/profile';
import {
  ContentModel,
  SearchCompetencyModel,
  SignatureContentModel,
  UserSignatureCompetenciesModel
} from '@models/signature-content/signature-content';
import { SuggestionModel } from '@models/suggestion/suggestion';
import { SubjectModel } from '@models/taxonomy/taxonomy';
import { CollectionService } from '@providers/service/collection/collection.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { SearchService } from '@providers/service/search/search.service';
import { SuggestionService } from '@providers/service/suggestion/suggestion.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { getCourseId, getDomainId, getTaxonomySubjectId } from '@utils/global';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { PortfolioService } from '@app/providers/service/portfolio/portfolio.service';
import { PortfolioUniversalActivitiesModal } from '@app/models/portfolio/portfolio';

export interface TabsModel {
  title: string;
  isActive: boolean;
  contentType?: string;
  isPortFolio?: boolean;
}
@Component({
  selector: 'competency-info-pull-up',
  templateUrl: './competency-info-pull-up.component.html',
  styleUrls: ['./competency-info-pull-up.component.scss'],
})
export class CompetencyInfoComponent implements OnInit, OnDestroy, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public fwCompetencies: Array<FwCompetencyModel>;
  @Input() public fwDomains: Array<DomainModel>;
  @Input() public studentProfile: ProfileModel | StudentCompetencies;
  @Input() public studentProfileList: Array<StudentCompetencies>;
  @Input() public frameworkId: string;
  @Input() public selectedCompetency: SelectedCompetencyModel;
  @Input() public studentId: string;
  @Input() public isHidePortFolio: boolean;
  @Input() public activeSubject: SubjectModel;
  @Output() public closePullUp = new EventEmitter();
  public competencyStatus: string;
  public showSignatureAssessment: boolean;
  public competency: CompetencyModel;
  public domainCompetencyList: DomainModel;
  public signatureContent: SignatureContentModel;
  public prerequisites: Array<PrerequisitesModel>;
  public standardCode: string;
  public domainId: string;
  public collectionType: string;
  public subjectId: string;
  public courseId: string;
  public tabs: Array<TabsModel>;
  public showMetaData: boolean;
  public showLearningMap: boolean;
  public isMappedWithGutCode: boolean;
  public microCompetencies: Array<MicroCompetenciesModel>;
  public isMasteredDemonstrated: boolean;
  public competencyCode: string;
  public selectedSuggestion: SuggestionModel;
  public showSuggestionPopup: boolean;
  public signatureContentList: Array<UserSignatureCompetenciesModel>;
  public learningMapData: SearchCompetencyModel;
  public learningMapContent: Array<ContentModel>;
  public start: number;
  public limit: number;
  public showLearningMapActivity: boolean;
  public activityType: string;
  public activitiesCount: number;
  public learningMapDataLoaded: boolean;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public showPortFolio: boolean;
  public portfolioDataList: Array<PortfolioUniversalActivitiesModal>;

  /**
   * @properties studentList
   * This properties is used to fetch student list
   */
  get studentList() {
    return this.studentProfileList ? this.studentProfileList : this.studentProfile ? [this.studentProfile] : null;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalController: ModalController,
    private competencyService: CompetencyService,
    private collectionService: CollectionService,
    private suggestionService: SuggestionService,
    private searchService: SearchService,
    private taxonomyService: TaxonomyService,
    private classService: ClassService,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
    private portfolioService: PortfolioService
  ) {
    this.tabs = [{
      title: 'PROFICIENCY_PORTFOLIO',
      isActive: true,
      isPortFolio: true
    }, {
      title: 'METADATA',
      isActive: false
    }, {
      title: 'LEARNING_MAP',
      isActive: false
    }];
    this.showPortFolio = !this.isHidePortFolio;
    this.showMetaData = this.isHidePortFolio;
    this.limit = 8;
    this.portfolioDataList = [];
  }

  public ngOnInit() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
    this.loadData();
    this.loadUniversalUserPortfolioActivities();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedCompetency && !changes.selectedCompetency.firstChange) {
      this.signatureContent = null;
      this.loadData();
    }
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function loadData
   * This method is used to load the data
   */
  private loadData() {
    if (this.isHidePortFolio) {
      this.setDefaultTab(1);
    } else {
      this.setDefaultTab(0);
    }
    if (this.selectedCompetency && this.selectedCompetency.competency) {
      this.competency = this.selectedCompetency.competency;
      this.competencyCode = this.competency.competencyCode;
      this.domainCompetencyList = this.selectedCompetency.domainCompetencyList;
      this.competencyStatus = COMPETENCY_STATUS[this.competency.competencyStatus];
      this.isMasteredDemonstrated = this.competency.competencyStatus === COMPETENCY_STATUS_VALUE.DEMONSTRATED;
      if (this.isOnline) {
        this.fetchUserSignatureCompetencies();
      }
    }
  }

  /**
   * @function onClickShowMore
   * This method is used to show more activity
   */
  public onClickShowMore() {
    this.loadLearningMapActivities();
  }

  /**
   * @function showMetaDataTab
   * This method is used to close the portfolio and open metadata
   */
  public showMetaDataTab() {
    this.tabs[0].isActive = false;
    this.tabs[1].isActive = true;
    // when there is no content available in portfolio it shows metadata tab as default
    this.showPortFolio = false;
    this.showMetaData = true;
  }

  /**
   * @function loadLearningMapActivities
   * This method is used to load the learning map activities
   */
  public loadLearningMapActivities() {
    this.learningMapDataLoaded = false;
    const type = this.activityType;
    const learningMapContent = this.learningMapContent;
    const competencyCode = this.learningMapData.gutCode;
    const start = this.start;
    const length = this.limit;
    const context = this.searchService.getLearningMapContext(start, length, type, competencyCode);
    this.searchService.searchLearningMapContent(context, type).then((content) => {
      if (content ?.length) {
        this.learningMapContent = learningMapContent.concat(content);
        this.start += start;
        this.activitiesCount = content.length;
      }
      this.learningMapDataLoaded = true;
    });
  }

  /**
   * @function onClickLearningMap
   * This method is trigger when user click the learning map content
   */
  public onClickLearningMap(type) {
    this.showLearningMapActivity = true;
    this.resetActivitiesContent();
    this.activityType = type;
    this.loadLearningMapActivities();
  }

  /**
   * @function closeLearningMapActivity
   * This method is used to close the pullup
   */
  public closeLearningMapActivity() {
    this.showLearningMapActivity = false;
    this.resetActivitiesContent();
  }

  /**
   * @function resetActivitiesContent
   * This method is used to reset the content
   */
  private resetActivitiesContent() {
    this.start = 1;
    this.learningMapContent = [];
  }

  /**
   * @function fetchUserSignatureCompetencies
   * This method is used to fetch signature competencies
   */
  public async fetchUserSignatureCompetencies() {
    if (this.studentId && this.activeSubject) {
      const subjectCode = this.activeSubject.code;
      this.signatureContentList = await this.competencyService.fetchUserSignatureCompetencies(this.studentId, subjectCode);
    }
    this.getSignatureAssessment();
    this.getSignatureContent();
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose() {
    this.modalController.dismiss({ isCloseCompetencyReport: true });
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function setDefaultTab
   * This method is used to set the default tab
   */
  private setDefaultTab(index) {
    const defaultTab = this.tabs[index];
    this.showPortFolio = defaultTab.title === 'PROFICIENCY_PORTFOLIO';
    this.showMetaData = defaultTab.title === 'METADATA';
    this.showLearningMap = defaultTab.title === 'LEARNING_MAP';
    this.tabs.map((tab, tabIndex) => {
      tab.isActive = tabIndex === index;
      return tab;
    });
  }

  /**
   * @function getSignatureContent
   * This method is used to get the signature content
   */
  public getSignatureContent() {
    const fwCode = this.classService.class.preference.framework;
    this.isMappedWithGutCode = !!this.competency.isMappedWithFramework;
    this.standardCode = this.isMappedWithGutCode ? this.competency.framework.frameworkCompetencyCode : this.competency.competencyCode;
    this.frameworkId = fwCode ? fwCode : DEFAULT_FRAMEWORK;
    if (this.isMappedWithGutCode) {
      const fwCompetency = this.standardCode.split('.');
      const standardCode = fwCompetency.slice(1, fwCompetency.length).join('.');
      this.domainId = getDomainId(standardCode, fwCode);
      this.subjectId = getTaxonomySubjectId(standardCode, fwCode);
      this.courseId = getCourseId(standardCode, fwCode);
    } else {
      this.domainId = getDomainId(this.standardCode, fwCode);
      this.subjectId = getTaxonomySubjectId(this.standardCode, fwCode);
      this.courseId = getCourseId(this.standardCode, fwCode);
    }
    this.fetchLearningMapsContent();
    this.fetchMicroCompetency();
  }

  /**
   * @function getSignatureAssessment
   * This Method is used to get the signature assessment
   */
  private getSignatureAssessment() {
    const signatureContentList = this.signatureContentList;
    const competency = this.competency;
    const domainCode = competency.domainCode;
    if (competency.showSignatureAssessment || signatureContentList && signatureContentList.hasOwnProperty(domainCode)
      && signatureContentList[domainCode] === competency.competencyCode) {
      this.showSignatureAssessment = true;
    }
  }

  /**
   * @function setCollectionType
   * Method to set the collection type
   */
  private setCollectionType() {
    this.collectionType = this.showSignatureAssessment ? CONTENT_TYPES.ASSESSMENT : CONTENT_TYPES.COLLECTION;
  }

  /**
   * @function fetchMicroCompetency
   * Method to fetch micro competency
   */
  private async fetchMicroCompetency() {
    const codes = await this.taxonomyService.fetchMicroCompetency(this.frameworkId, this.subjectId, this.courseId, this.domainId);
    this.microCompetencies = this.filterMicroCompetency(codes);
  }

  /**
   * @function showTab
   * This method is used to active tab
   */
  public showTab(tab, selectedTabIndex) {
    this.tabs.map((rubricTab, tabIndex) => {
      rubricTab.isActive = tabIndex === selectedTabIndex;
    });
    this.showPortFolio = tab.title === 'PROFICIENCY_PORTFOLIO';

    this.showMetaData = tab.title === 'METADATA';
    this.showLearningMap = tab.title === 'LEARNING_MAP';
  }

  /**
   * @function filterMicroCompetency
   * Method to filter micro competency
   */
  private filterMicroCompetency(codes) {
    const standardCode = this.standardCode;
    const regex = new RegExp(standardCode);
    const microCompetencies = codes.filter((code) => {
      return (
        regex.test(code.id) &&
        MICRO_COMPETENCY_CODE_TYPES.includes(code.codeType)
      );
    });
    return microCompetencies;
  }

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content
   */
  private fetchLearningMapsContent() {
    const filters = {
      isDisplayCode: true
    };
    this.searchService.fetchLearningMapsContent(this.competency.competencyCode, filters).then((learningMapData) => {
      this.learningMapData = learningMapData;
      const signatureContentList = learningMapData.signatureContents;
      this.showSignatureAssessment = this.showSignatureAssessment && signatureContentList.assessments.length > 0;
      const signatureContent = this.showSignatureAssessment
        ? signatureContentList.assessments
        : signatureContentList.collections;
      this.setCollectionType();
      const content = Array.isArray(signatureContent) && signatureContent.length ? signatureContent[0] : null;
      this.checkPrerequisiteCompetencyStatus(learningMapData.prerequisites);
      if (content) {
        if (this.collectionType === CONTENT_TYPES.ASSESSMENT) {
          this.fetchCollectionById(content, CONTENT_TYPES.ASSESSMENT);
        } else {
          this.fetchCollectionById(content, CONTENT_TYPES.COLLECTION);
        }
      }
    });
  }

  /**
   * @function fetchCollectionById
   * Method to check fetch collection
   */
  public async fetchCollectionById(content, contentType) {
    this.signatureContent = content;
    this.signatureContent.collection = await this.collectionService.fetchCollectionById(content.id, contentType);
    this.signatureContent.collectionType = contentType;
  }

  /**
   * @function checkPrerequisiteCompetencyStatus
   * Method to check prerequisite competency status
   */
  public checkPrerequisiteCompetencyStatus(prerequisites) {
    const domainCompetencyList = this.getDomainCompetencies(this.domainCompetencyList);
    if (prerequisites && domainCompetencyList) {
      prerequisites.forEach(competency => {
        const filteredCompetency = domainCompetencyList.find((list) => {
          return list.competencyCode === competency.id;
        });
        const status = filteredCompetency ? filteredCompetency.status : 0;
        competency.status = status;
      });
    }
    this.prerequisites = prerequisites;
  }

  /**
   * @function getDomainCompetencies
   * Method used to get the domain competencies
   */
  public getDomainCompetencies(domainData) {
    domainData.competencies = [];
    domainData.topics.map((topic) => {
      domainData.competencies = domainData.competencies.concat(topic.competencies);
    });;
    return domainData.competencies;
  }

  /**
   * @function onClickSuggestion
   * Method will trigger when user click the suggestion
   */
  public onClickSuggestion(suggestion) {
    this.selectedSuggestion = suggestion;
    this.showSuggestionPopup = true;
  }

  /**
   * @function onConfirmSuggestion
   * Method will trigger when user click the confirm
   */
  public onConfirmSuggestion() {
    this.showSuggestionPopup = false;
    if (this.studentList) {
      this.studentList.forEach((student: StudentCompetencies) => {
        const userId = student.userId ? student.userId : student.id;
        this.suggestCollection(userId);
      });
    } else {
      this.suggestCollection(this.studentId)
    }
  }

  /**
   * @function suggestCollection
   * Method to suggest a collection
   */
  public suggestCollection(userId) {
    const collection = this.selectedSuggestion;
    const contextParams = this.suggestionService.getSuggestionContext(userId, collection, this.competencyCode);
    this.suggestionService.suggestCollection(contextParams);
  }

  /**
   * @function onCancelSuggestion
   * Method will trigger when user click the cancel
   */
  public onCancelSuggestion() {
    this.showSuggestionPopup = false;
  }

  /**
   * @function loadUniversalUserPortfolioActivities
   * Method to fetch the universal user portfolio Data
   */
  public loadUniversalUserPortfolioActivities() {
    this.portfolioService.fetchUniversalUserPortfolioUniqueItems(this.studentId).then((portfolioData)=>{
      this.portfolioDataList = portfolioData;
    });
  }
}
