import { Component, ElementRef, ViewChild } from '@angular/core';
import { CompetencyInfoComponent } from '@components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { ModalController } from '@ionic/angular';
import { ClassMembersModel } from '@models/class/class';
import {
  DomainCompetencyCoverageModel,
  DomainLevelSummaryModel,
  DomainModel,
  DomainsCompetencyPerformanceModel,
  FwCompetenciesModel, StudentDomainCompetenciesModel
} from '@models/competency/competency';
import { AppService } from '@providers/service/app.service';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { ProficiencyService } from '@providers/service/proficiency/proficiency.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { flattenGutToFwCompetency, flattenGutToFwDomain } from '@utils/global';
import axios from 'axios';

@Component({
  selector: 'app-domain-competency',
  templateUrl: './domain-competency.page.html',
  styleUrls: ['./domain-competency.page.scss'],
})
export class DomainCompetencyPage {
  // -------------------------------------------------------------------------
  // Properties
  @ViewChild('domainContainer') public domainContainer: ElementRef;
  public domainCoverageCount: Array<DomainCompetencyCoverageModel>;
  public totalCompetencies: number;
  public numberOfStudents: number;
  public maxNumberOfCompetencies: number;
  public courseCoverageCount: {
    notStarted: number;
    inProgress: number;
    mastered: number;
    total: number;
  };
  public studentsDomainPerformance: Array<StudentDomainCompetenciesModel>;
  public totalStudentsDomainPerformance: Array<StudentDomainCompetenciesModel>;
  public isSlideNext: boolean;
  public isSlidePrev: boolean;
  public domainsCompetencyPerformance: Array<DomainsCompetencyPerformanceModel>;
  public isShowDomainCompetencyPerformance: boolean;
  public activeDomainSeq: number;
  public length: number;
  public studentsDomainPanelContentHeight: number;
  public showClassCount: boolean;
  public isShowProficiencyView: boolean;
  public isShowMore: boolean;
  public isFetchedAll: boolean;
  public domainLevelSummary: DomainLevelSummaryModel;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public frameworkId: string;
  public showCompetencyInfo: boolean;
  public subjectCode: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private taxonomyService: TaxonomyService,
    private modalController: ModalController,
    private appService: AppService,
    private proficiencyService: ProficiencyService,
    private competencyService: CompetencyService,
    private classService: ClassService) { }

  public ionViewDidEnter() {
    this.activeDomainSeq = 0;
    this.length = 0;
    this.isShowProficiencyView = true;
    this.loadData();
  }

  public ionViewDidLeave() {
    this.isShowProficiencyView = false;
    this.studentsDomainPerformance = [];
    this.domainsCompetencyPerformance = [];
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function slideNextStudent
   * Method to slide next student
   */
  public slideNextStudent(activeDomainSeq) {
    this.isSlideNext = true;
    this.isSlidePrev = false;
    this.activeDomainSeq = activeDomainSeq;
  }

  /**
   * @function toggleClassStatisticsCount
   * Method to toggle class statistics
   */
  public toggleClassStatisticsCount() {
    this.showClassCount = !this.showClassCount;
  }

  /**
   * @function onClickShowMore
   * Method to used to show more content
   */
  public onClickShowMore() {
    this.isShowMore = !this.isShowMore;
    if (!this.isFetchedAll) {
      this.showMoreContent();
    }
  }

  /**
   * @function slidePrevStudent
   * Method to slide previous student
   */
  public slidePrevStudent(activeDomainSeq) {
    this.isSlideNext = false;
    this.isSlidePrev = true;
    this.activeDomainSeq = activeDomainSeq;
  }

  /**
   * @function loadData
   * This method used to load the data
   */
  private loadData() {
    const classDetails = this.classService.class;
    this.subjectCode = classDetails.preference?.subject || null;
    const classId = classDetails.id;
    const filters = {
      classId,
      subjectCode: this.subjectCode
    };
    this.loadCrossWalkData();
    if (this.subjectCode) {
      return axios.all<{}>([
        this.competencyService.fetchDomainLevelSummary(filters),
        this.classService.fetchClassMembersByClassId(classId)
      ]).then(axios.spread((domainLevelSummary: DomainLevelSummaryModel, classmembers: ClassMembersModel) => {
        this.domainLevelSummary = domainLevelSummary;
        const classMembersModel = classmembers && classmembers.members ? classmembers.members : null;
        const members = classMembersModel.filter((member) => member.isActive);
        this.isShowProficiencyView = members && Array.isArray(members) && !!members.length && !!domainLevelSummary;
        if (this.isShowProficiencyView) {
          const parsedStudentsDomainProficiencyData = this.proficiencyService.parseStudentsDomainProficiencyData(domainLevelSummary, members);
          this.maxNumberOfCompetencies = parsedStudentsDomainProficiencyData.maxNumberOfCompetencies;
          this.domainCoverageCount = parsedStudentsDomainProficiencyData.domainCoverageCount;
          this.totalCompetencies = parsedStudentsDomainProficiencyData.totalCompetencies;
          this.numberOfStudents = parsedStudentsDomainProficiencyData.numberOfStudents;
          this.courseCoverageCount = parsedStudentsDomainProficiencyData.courseCoverageCount;
          const domainsCompetencyPerformance = this.proficiencyService.parseStudentsDomainCompetencyPerformance(domainLevelSummary, members);
          this.domainsCompetencyPerformance = domainsCompetencyPerformance;
          const studentsDomainPanelHeight = 62;
          // tslint:disable-next-line
          const domainContainerHeight = this.domainContainer['el'].offsetHeight;
          this.studentsDomainPanelContentHeight = domainContainerHeight + studentsDomainPanelHeight;
          this.totalStudentsDomainPerformance = parsedStudentsDomainProficiencyData.studentsDomainPerformance;
          this.studentsDomainPerformance = this.getStudentsDomainPerformanceByViewPort(parsedStudentsDomainProficiencyData.studentsDomainPerformance, this.studentsDomainPanelContentHeight, studentsDomainPanelHeight);
        }
      }));
    }
  }

  /**
   * @function onSelectTopic
   * This method is used to open the competency report
   */
  public onSelectTopic(item) {
    const selectedCompetency = {
      competency: item.competency,
      domainCompetencyList: item.domainCompetencyList
    }
    this.showCompetencyInfo = true;
    const params = {
      studentProfileList: item.selectedStudents,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency,
      isHidePortFolio: true
    };
    this.openModalReport(
      CompetencyInfoComponent,
      params,
      'competency-info-component'
    );
  }

  /**
   * @function onSelectCompetency
   * This method is used to open the competency report
   */
  public onSelectCompetency(item) {
    const selectedCompetency = {
      competency: item.competency,
      domainCompetencyList: item.domainCompetencyList
    }
    this.showCompetencyInfo = true;
    const params = {
      studentProfile: item.selectedStudent,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency,
      studentId: item.selectedStudent.userId
    };
    this.openModalReport(
      CompetencyInfoComponent,
      params,
      'competency-info-component'
    );
  }

  /**
   * @function loadCrossWalkData
   * This method is used to fetch the cross Walk Data
   */
  public async loadCrossWalkData() {
    const classDetails = this.classService.class;
    const subjectCode = classDetails.preference ? classDetails.preference.subject : null;
    this.frameworkId = classDetails.preference ? classDetails.preference.framework : null;
    if (this.frameworkId) {
      const crossWalkData = await this.taxonomyService.fetchCrossWalkFWC(this.frameworkId, subjectCode);
      this.fwCompetencies = flattenGutToFwCompetency(crossWalkData);
      this.fwDomains = flattenGutToFwDomain(crossWalkData);
    }
  }

  /**
   * @function openModalReport
   * This method is used to open modal report
   */
  public async openModalReport(component, componentProps, className?: string) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component,
      componentProps,
      cssClass: className
    });
    await modal.present();
  }

  /**
   * @function getStudentsDomainPerformanceByViewPort
   * This method is used to show student domain performance based on the viewport height
   */
  public getStudentsDomainPerformanceByViewPort(studentsDomainPerformance, panelContenctHeight, studentPanelHeight) {
    const viewPortDimensions = this.appService.getDeviceDimension();
    const viewPortHeight = viewPortDimensions.height;
    const studentsDomainPerformanceVisibleHeight = viewPortHeight - panelContenctHeight;
    const numberOfStudents = Math.round(studentsDomainPerformanceVisibleHeight / studentPanelHeight);
    this.length = numberOfStudents;
    this.isFetchedAll = numberOfStudents >= studentsDomainPerformance.length;
    if (!this.isFetchedAll) {
      const studensDomain = [...studentsDomainPerformance];
      const parsedStudensDomain = studensDomain.slice(0, numberOfStudents);
      return parsedStudensDomain;
    }
    return studentsDomainPerformance;
  }

  /**
   * @function showMoreContent
   * This method is used to show more content
   */
  public showMoreContent() {
    const totalPerformance = this.totalStudentsDomainPerformance;
    this.isFetchedAll = this.length >= totalPerformance.length;
    if (!this.isFetchedAll) {
      this.length = this.length + this.length;
      this.studentsDomainPerformance = totalPerformance.slice(0, this.length);
      this.isFetchedAll = this.length >= totalPerformance.length;
    }
  }

  /**
   * @function onSelectDomain
   * This Method triggers when user slect domain
   */
  public onSelectDomain() {
    this.isShowDomainCompetencyPerformance = !this.isShowDomainCompetencyPerformance;
  }
}
