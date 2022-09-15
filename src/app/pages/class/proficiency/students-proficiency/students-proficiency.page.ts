import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainInfoComponent } from '@components/proficiency/domain-info/domain-info.component';
import { StandardDomainPanelComponent } from '@components/proficiency/standard-domain-panel/standard-domain-panel.component';
import { StudentStandardListPullUpComponent } from '@components/proficiency/student-standard-list-pull-up/student-standard-list-pull-up.component';
import { TopicInfoComponent } from '@components/proficiency/topic-info/topic-info.component';
import { routerPathIdReplace } from '@constants/router-constants';
import { ModalController } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { CompetencyMatrixModel, DomainModel, FwCompetenciesModel, MatrixCoordinatesModel } from '@models/competency/competency';
import { SubjectModel, TaxonomyGrades, TaxonomyModel } from '@models/taxonomy/taxonomy';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { LoadingService } from '@providers/service/loader.service';
import { ProficiencyService } from '@providers/service/proficiency/proficiency.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { SessionService } from '@providers/service/session/session.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { flattenGutToFwCompetency, flattenGutToFwDomain, getCategoryCodeFromSubjectId } from '@utils/global';
import axios from 'axios';
import * as moment from 'moment';


@Component({
  selector: 'app-students-proficiency',
  templateUrl: './students-proficiency.page.html',
  styleUrls: ['./students-proficiency.page.scss'],
})
export class StudentsProficiencyPage {

  // -------------------------------------------------------------------------
  // Properties

  public classDetails: ClassModel;
  public subjects: Array<SubjectModel>;
  public classSubject: string;
  public frameworkId: string;
  public profilePreferences: Array<string>;
  public taxonomyGrades: Array<TaxonomyGrades>;
  public isFromATC: boolean;
  public fwDomains: Array<DomainModel>;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public activeSubject: SubjectModel;
  public domainTopicCompetencyMatrix: Array<CompetencyMatrixModel>;
  public isExpandedDomainReport: boolean;
  public showReport: boolean;
  public isLoading: boolean;
  public showCompetencyInfo: boolean;
  public showDomainInfo: boolean;
  public isExpandedReport: boolean;
  public isChartDataLoaded: boolean;
  public categories: Array<TaxonomyModel>;
  public activeCategory: SubjectModel;
  public domainCoordinates: Array<DomainModel>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private competencyService: CompetencyService,
    private taxonomyService: TaxonomyService,
    private proficiencyService: ProficiencyService,
    private loader: LoadingService,
    private profileService: ProfileService,
    private sessionService: SessionService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  // -------------------------------------------------------------------------
  // Life Cycle Methods

  public ionViewDidEnter() {
    this.isFromATC = this.activatedRoute.snapshot.queryParams
      ? this.activatedRoute.snapshot.queryParams.isFromATC
      : false;
    // remove query params
    this.router.navigate([], {
      queryParams: { isFromATC: null },
      queryParamsHandling: 'merge'
    });
    this.loader.displayLoader();
    this.classDetails = this.classService.class;
    this.classSubject = this.classDetails.preference ? this.classDetails.preference.subject : null;
    this.profilePreferences = this.profileService.profilePreferences;
    this.frameworkId = this.getFrameworkId();
    this.loadData();
  }

  /**
   * @function loadData
   * Method to load data
   */
  public loadData() {
    this.fetchCategories();
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
   * @function getFrameworkId
   * Method to get the frameworkId
   */
  public getFrameworkId(subjectCode?) {
    const classFramework = this.classDetails.preference ? this.classDetails.preference.framework : null;
    return subjectCode && subjectCode !== this.classSubject ? this.profilePreferences[`${subjectCode}`] :
      classFramework ? classFramework : this.profilePreferences[`${this.classSubject}`];
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
      this.domainTopicCompetencyMatrix = this.proficiencyService.parseDomainTopicCompetencyData(domainTopicCompetencyMatrix, matrixCoordinates, crossWalkData);
      this.parseDomainData();
      this.domainCoordinates = matrixCoordinates;
      this.fwCompetencies = flattenGutToFwCompetency(crossWalkData);
      this.fwDomains = flattenGutToFwDomain(crossWalkData);
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
   * @function parseDomainData
   * This method is used to parse domain data
   */
  public parseDomainData() {
    this.fetchDomainGradeBoundary().then((competencyList) => {
      const proficiencyChartData = this.domainTopicCompetencyMatrix;
      proficiencyChartData.forEach((domain) => {
        let competenciesSeq = -1;
        domain.compSeqList = [];
        domain.classGradeCompetencies = 0;
        domain.topics.forEach((topic) => {
          topic.competencies.forEach(competency => {
            competenciesSeq++;
            if (competencyList.indexOf(competency.competencyCode) !== -1) {
              domain.compSeqList.push(competenciesSeq);
              competency.isClassGrade = true;
              domain.classGradeCompetencies++;
            }
          });
        });
      });
      this.isLoading = false;
      this.isChartDataLoaded = true;
    });
  }

  /**
   * @function fetchDomainGradeBoundary
   * This method is used to fetch domain grade boundary
   */
  public fetchDomainGradeBoundary() {
    const params = {
      classId: this.classDetails.id,
      courseId: this.classDetails.courseId
    }
    return this.competencyService.fetchLJCompetency(params);
  }

  /**
   * @function fetchCrossWalkFWC
   * Method to fetch cross walk competencies
   */
  public fetchCrossWalkFWC() {
    const frameworkId = this.classDetails.preference.framework;
    const subjectId = this.classDetails.preference.subject;
    return new Promise((resolve, reject) => {
      if (frameworkId) {
        return this.taxonomyService.fetchCrossWalkFWC(frameworkId, subjectId)
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
   * @function fetchDomainTopicCompetencyMatrix
   * Method to fetch the topic competency matrix
   */
  private fetchDomainTopicCompetencyMatrix() {
    const userSession = this.sessionService.userSession;
    const subjectCode = this.activeSubject.code;
    const currentDate = moment();
    const month = currentDate.format('M');
    const year = currentDate.format('YYYY');
    const classId = this.classDetails.id;
    return this.competencyService.fetchDomainTopicCompetencyMatrix(subjectCode, year, month, classId, userSession.user_id);
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
   * @function chartLoded
   * This method is used to dismiss the loader
   */
  public chartLoded() {
    this.loader.dismissLoader();
  }

  /**
   * @function onSelectDomain
   * This method is used to open the domain report
   */
  public onSelectDomain(domain) {
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
   * @function closeDomainInfoPullUp
   * This method is used to close the domain pull up
   */
  public closeDomainInfoPullUp() {
    this.showReport = false;
    this.showDomainInfo = false;
    this.isExpandedDomainReport = false;
  }

  /**
   * @function navigateToAtcPage
   * This method is used to navigate to atc page
   */
  public navigateToAtcPage() {
    const atcURL = routerPathIdReplace('atc', this.classDetails.id);
    this.router.navigate([atcURL]);
  }

  /**
   * @function onSelectCompetency
   * This method is used to on select competency
   */
  public onSelectCompetency(event) {
    const competency= event.competency;
    const params = {
      classId: this.classDetails.id,
      competency,
      subject: this.activeSubject,
      framework: this.frameworkId
    };
    this.openModalReport(
      StudentStandardListPullUpComponent,
      params,
      'student-standard-list-pullup'
    );
  }

  /**
   * @function openCompetencyPanel
   * This method is used to open competency panel
   */
  public openCompetencyPanel() {
    const params = {
      domains: this.domainTopicCompetencyMatrix,
      activeSubject: this.activeSubject,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      classId: this.classDetails.id
    }
    this.openModalReport(
      StandardDomainPanelComponent,
      params,
      'student-standard-domain-panel'
    );
  }

  /**
   * @function onSelectTopic
   * This method is used to open the topic pull up
   */
  public onSelectTopic(topic) {
    const params = {
      activeSubject: this.activeSubject,
      content: topic,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      classId: this.classDetails.id
    };
    this.openModalReport(
      TopicInfoComponent,
      params,
      'topic-info-component'
    );
  }
}
