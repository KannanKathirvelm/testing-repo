import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EVENTS } from '@app/constants/events-constants';
import { NetworkService } from '@app/providers/service/network.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { ProficiencyService } from '@app/providers/service/proficiency/proficiency.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { CompetencyInfoComponent } from '@components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainInfoComponent } from '@components/proficiency/domain-info/domain-info.component';
import { LegendPullUpComponent } from '@components/proficiency/legend-pull-up/legend-pull-up.component';
import { TopicInfoComponent } from '@components/proficiency/topic-info/topic-info.component';
import { ModalController } from '@ionic/angular';
import { ClassMembersGrade, ClassMembersModel, ClassModel } from '@models/class/class';
import { CompetencyMatrixModel, DomainModel, FwCompetenciesModel, MatrixCoordinatesModel, SelectedCompetencyModel } from '@models/competency/competency';
import { ProfileModel } from '@models/profile/profile';
import { SubjectModel, TaxonomyGrades, TaxonomyModel } from '@models/taxonomy/taxonomy';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { LoadingService } from '@providers/service/loader.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { flattenGutToFwCompetency, flattenGutToFwDomain, getCategoryCodeFromSubjectId } from '@utils/global';
import axios from 'axios';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'student-proficiency',
  templateUrl: './student-proficiency.page.html',
  styleUrls: ['./student-proficiency.page.scss'],
})

export class StudentProficiencyPage implements OnInit, OnDestroy {
  public class: ClassModel;
  public activeSubject: SubjectModel;
  public categories: Array<TaxonomyModel>;
  public frameworkId: string;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public showCompetencyInfo: boolean;
  public showDomainInfo: boolean;
  public isExpandedReport: boolean;
  public selectedCompetency: SelectedCompetencyModel;
  public subjects: Array<SubjectModel>;
  public classSubject: string;
  public profilePreferences: Array<string>;
  public defaultCategory: string;
  public classFramework: string;
  public domainTopicCompetencyMatrix: Array<CompetencyMatrixModel>;
  public domainCoordinates: Array<DomainModel>;
  public activeCategory: SubjectModel;
  public taxonomyGrades: Array<TaxonomyGrades>;
  public selectedDomain: DomainModel;
  public isExpandedDomainReport: boolean;
  public showReport: boolean;
  public isLoading: boolean;
  public isThumbnailError: boolean;
  public showLegendInfo: boolean;
  public studentId: string;
  public studentProfile: ProfileModel;
  public isChartDataLoaded: boolean;
  public studentGrade: number;
  public studentGradeLoaded: boolean;
  public crossWalkData: Array<DomainModel>;
  public networkSubscription: AnonymousSubscription;
  public isOnline: boolean;
  public isPrivateStudent = false;

  /**
   * @property hideProficiencyScroll
   * This property is used to hide the scroll
   */
  get hideProficiencyScroll(): boolean {
    if (this.showDomainInfo && this.showReport) {
      return !this.isExpandedDomainReport;
    }
    return this.showReport;
  }

  constructor(
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private loader: LoadingService,
    private profileService: ProfileService,
    private classService: ClassService,
    private taxonomyService: TaxonomyService,
    private competencyService: CompetencyService,
    private networkService: NetworkService,
    private zone: NgZone,
    private utilsService: UtilsService,
    private proficiencyService: ProficiencyService,
    private parseService: ParseService
  ) {
    this.isExpandedReport = false;
    this.class = this.classService.class;
    this.showReport = false;
  }

  public ngOnInit() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
    this.loader.displayLoader();
    this.studentId = this.activatedRoute.snapshot.params.id;
    this.classSubject = this.class.preference ? this.class.preference.subject : null;
    this.profilePreferences = this.profileService.profilePreferences;
    this.frameworkId = this.getFrameworkId();
    this.loadData();
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  /**
   * @function getFrameworkId
   * Method to get the frameworkId
   */
  public getFrameworkId(subjectCode?) {
    const classFramework = this.class.preference ? this.class.preference.framework : null;
    return subjectCode && subjectCode !== this.classSubject ? this.profilePreferences[`${subjectCode}`] :
      classFramework ? classFramework : this.profilePreferences[`${this.classSubject}`];
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  private loadData() {
    this.isLoading = true;
    this.fetchStudentGrade();
    this.fetchCategories();
    this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_SELECT_MONTH);
  }

  /**
   * @function fetchStudentGrade
   * This method is used to fetch class Details
   */
  public fetchStudentGrade() {
    this.studentGradeLoaded = false;
    this.classService.fetchClassMembersByClassId(this.class.id).then((classMembers: ClassMembersModel) => {
      const classMember = classMembers.memberGradeBounds.find((member: ClassMembersGrade) => {
        return member.userId === this.studentId;
      });
      this.studentProfile = classMembers.members.find((memberDetails: ProfileModel) => {
        return memberDetails.id === this.studentId;
      });
      this.studentGrade = classMember.bounds.gradeUpperBound;
      this.studentGradeLoaded = true;
    });
  }

  /**
   * @function onSelectDomain
   * This method is used to open the domain report
   */
  public onSelectDomain(domainData) {
    const crossWalkDomainData = this.crossWalkData.filter((data) => { return data.domainCode === domainData.domainCode });
    const crossWalkDomainItem = crossWalkDomainData[0];
    const domain = {
      ... domainData,
      fwDomainName: crossWalkDomainItem ? crossWalkDomainItem.fwDomainName : null,
      topics: this.getCrossWalkTopicsDomainData(domainData, crossWalkDomainItem)
    }
    this.showDomainInfo = true;
    const params = {
      domain,
      fwCompetencies: this.fwCompetencies
    };
    this.openModalReport(
      DomainInfoComponent,
      params,
      'domain-info-component'
    );
  }

  /**
   * @function getCrossWalkTopicsDomainData
   * This method is used to get cross domain data
   */
  public getCrossWalkTopicsDomainData(domainData, crossWalkDomainItem) {
    const crossWalkFwTopicName = crossWalkDomainItem.topics || [];
    return domainData.topics.map((topics) => {
      return {
        ...topics,
        fwTopicName: crossWalkFwTopicName ? this.getCrossWalkFwTopicName(crossWalkFwTopicName, topics.topicCode) : null
      }
    });
  }

  /**
   * @function getCrossWalkFwTopicName
   * This method is used to get topic name
   */
  public getCrossWalkFwTopicName(crossWalkFwTopicName, topicCode) {
    const topics = crossWalkFwTopicName.filter((item) => { return item.topicCode === topicCode});
    return topics && topics.length ? topics[0].fwTopicName : null;
  }

  /**
   * @function openModalReport
   * This method is used to open modal report
   */
  public async openModalReport(component, componentProps, cssClass) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component,
      componentProps,
      cssClass
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data && dismissContent.data.isCloseCompetencyReport) {
        this.closePullUp();
      }
      if (dismissContent.data && dismissContent.data.isCloseDomainReport) {
        this.closeDomainInfoPullUp();
      }
    });
    await modal.present();
  }

  /**
   * @function loadTaxonomyGrades
   * Method to taxonomy grades
   */
  private loadTaxonomyGrades(subject) {
    const filters = {
      subject: subject.code,
      fw_code: this.frameworkId
    };
    return this.taxonomyService.fetchGradesBySubject(filters)
      .then((taxonomyGrades: Array<TaxonomyGrades>) => {
        this.taxonomyGrades = taxonomyGrades.sort((grade1, grade2) =>
          grade1.sequenceId - grade2.sequenceId);
      });
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      const defaultCategoryCode = this.classSubject ? getCategoryCodeFromSubjectId(this.classSubject)
        : categories[0].code;
      const defaultCategory = categories.find((category) => {
        return category.code === defaultCategoryCode;
      });
      this.categories = categories;
      this.activeCategory = defaultCategory;
      this.fetchSubjects(defaultCategory.id);
    });
  }

  /**
   * @function fetchSubjects
   * Method to fetch the subjects
   */
  public fetchSubjects(categoryId) {
    this.taxonomyService.fetchSubjects(categoryId).then((subjects) => {
      const activeSubject = subjects.find((subject) => {
        return subject.code === this.classSubject;
      });
      const defaultSubject = activeSubject ? activeSubject : subjects[0];
      this.onSelectSubject(defaultSubject);
      this.subjects = subjects;
    });
  }

  /**
   * @function onSelectSubject
   * This method is used to load the data based on the selected subject
   */
  public onSelectSubject(subject) {
    this.loader.displayLoader();
    this.isLoading = true;
    this.frameworkId = this.getFrameworkId(subject.code);
    if (subject.code === this.classSubject) {
      this.loadTaxonomyGrades(subject);
    } else {
      this.taxonomyGrades = null;
    }
    this.activeSubject = subject;
    this.loadChartData();
  }

  /**
   * @function chartLoded
   * This method is used to dismiss the loader
   */
  public chartLoded() {
    this.loader.dismissLoader();
  }

  /**
   * @function onSelectCategory
   * This method is used to load the data based on the selected category
   */
  public onSelectCategory(category) {
    this.loader.displayLoader();
    this.isLoading = true;
    this.activeCategory = category;
    this.fetchSubjects(category.id);
  }

  /**
   * @function onSelectLegend
   * This method is used to show the legend report
   */
  public onSelectLegend() {
    const params = {
      activeSubject: this.activeSubject
    };
    this.openModalReport(
      LegendPullUpComponent,
      params,
      'legend-info-component'
    );
  }

  /**
   * @function onSelectTopic
   * This method is used to open the topic pull up
   */
  public onSelectTopic(topic) {
    const params = {
      studentId: this.studentId,
      activeSubject: this.activeSubject,
      content: topic,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId
    };
    this.openModalReport(
      TopicInfoComponent,
      params,
      'topic-info-component'
    );
  }

  /**
   * @function closeLegendPullUp
   * This method is used to close the legend pull up
   */
  public closeLegendPullUp() {
    this.showLegendInfo = false;
  }

  /**
   * @function loadCrossWalkData
   * This method is used to fetch the cross Walk Data
   */
  public loadCrossWalkData() {
    return new Promise((resolve, reject) => {
      if (this.frameworkId) {
        const subjectCode = this.activeSubject.code;
        return this.taxonomyService.fetchCrossWalkFWC(this.frameworkId, subjectCode)
          .then((crossWalkData) => {
            resolve(crossWalkData);
          }, (error) => {
            resolve([]);
          });
      } else {
        resolve([]);
      }
    });
  }

  /**
   * @function loadChartData
   * This method is used to get the chart data
   */
  private loadChartData() {
    return axios.all<{}>([
      this.fetchDomainTopicCompetencyMatrix(),
      this.fetchCompetencyMatrixCordinates(),
      this.loadCrossWalkData()
    ]).then(axios.spread((domainTopicCompetencyMatrix: Array<any>, matrixCoordinates: Array<MatrixCoordinatesModel>, crossWalkData) => {
      this.isPrivateStudent = !domainTopicCompetencyMatrix.length
      this.domainTopicCompetencyMatrix = this.proficiencyService.parseDomainTopicCompetencyData(domainTopicCompetencyMatrix, matrixCoordinates, crossWalkData);
      this.domainCoordinates = matrixCoordinates;
      this.crossWalkData = crossWalkData;
       this.fwCompetencies = flattenGutToFwCompetency(crossWalkData);
      this.fwDomains = flattenGutToFwDomain(crossWalkData);
      this.isLoading = false;
      this.isChartDataLoaded = true;
    }), (error) => {
      this.domainTopicCompetencyMatrix = [];
      this.domainCoordinates = [];
      this.fwCompetencies = [];
      this.fwDomains = [];
      this.isLoading = false;
      this.isChartDataLoaded = true;
    });
  }

  /**
   * @function closeDomainInfoPullUp
   * This method is used to close the domain pull up
   */
  public closeDomainInfoPullUp() {
    this.showReport = false;
    this.showDomainInfo = false;
    this.isExpandedDomainReport = false;
  }

  /**
   * @function fetchDomainTopicCompetencyMatrix
   * Method to fetch the topic competency matrix
   */
  private fetchDomainTopicCompetencyMatrix() {
    const subjectCode = this.activeSubject.code;
    const currentDate = moment();
    const month = currentDate.format('M');
    const year = currentDate.format('YYYY');
    const classId = this.class.id;
    return this.competencyService.fetchDomainTopicCompetencyMatrix(subjectCode, year, month, classId, this.studentId);
  }

  /**
   * @function fetchCompetencyMatrixCordinates
   * Method to fetch the matrix coordinates
   */
  private fetchCompetencyMatrixCordinates() {
    const subject = {
      subject: this.activeSubject.code
    };
    return this.competencyService.fetchSubjectDomainTopicMetadata(subject);
  }

  /**
   * @function closePullUp
   * This method is used to close the pull up
   */
  public closePullUp() {
    if (!this.showDomainInfo) {
      this.showReport = false;
    }
    this.showCompetencyInfo = false;
    this.isExpandedReport = false;
  }

  /**
   * @function onSelectCompetency
   * This method is used to get the selected values from chart
   */
  public onSelectCompetency(competency) {
    this.showCompetencyInfo = true;
    const params = {
      studentId: this.studentId,
      studentProfile: this.studentProfile,
      activeSubject: this.activeSubject,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency: competency
    };
    this.openModalReport(
      CompetencyInfoComponent,
      params,
      'competency-info-component'
    );
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
