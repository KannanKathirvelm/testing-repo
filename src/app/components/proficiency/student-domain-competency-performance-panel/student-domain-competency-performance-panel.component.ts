import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CompetencyModel, DomainLevelCompetenciesModel, DomainLevelSummaryModel, DomainsCompetencyPerformanceModel, SelectedStudentDomainCompetencyModel, StudentCompetencies } from '@models/competency/competency';
import { AppService } from '@providers/service/app.service';

@Component({
  selector: 'nav-student-domain-competency-performance-panel',
  templateUrl: './student-domain-competency-performance-panel.component.html',
  styleUrls: ['./student-domain-competency-performance-panel.component.scss']
})
export class StudentDomainCompetencyPerformancePanelComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activeDomainSeq: number;
  @Input() public studentsDomainPanelContentHeight: number;
  @Input() public isShowMore: boolean;
  @Input() public domainsCompetencyPerformance: Array<DomainsCompetencyPerformanceModel>;
  @Input() public domainLevelSummary: DomainLevelSummaryModel;
  @Output() public selectTopic: EventEmitter<SelectedStudentDomainCompetencyModel> = new EventEmitter();
  @Output() public selectCompetency: EventEmitter<SelectedStudentDomainCompetencyModel> = new EventEmitter();
  public activeDomainData: DomainLevelCompetenciesModel;
  public selectedStudents: Array<StudentCompetencies>;
  public domainCompetencies: Array<CompetencyModel>;
  public domain: DomainsCompetencyPerformanceModel;
  public length: number;
  public studentCompetencies: Array<StudentCompetencies>;
  private DOMAIN_COMPETENCY_PANEL_HEIGHT = 50;
  public isFetchedAll: boolean;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private appService: AppService) {
    this.selectedStudents = [];
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.domainsCompetencyPerformance && changes.domainsCompetencyPerformance.firstChange) {
      this.length = 0;
      this.slideStudentDomain(0);
    }
    if (changes.activeDomainSeq && !changes.activeDomainSeq.firstChange && changes.activeDomainSeq.currentValue ||
      changes.activeDomainSeq && changes.activeDomainSeq.currentValue === 0 && !changes.activeDomainSeq.firstChange) {
      this.length = 0;
      this.slideStudentDomain(this.activeDomainSeq);
    }
    if (changes.isShowMore && !changes.isShowMore.firstChange) {
      if (!this.isFetchedAll) {
        this.showMoreContent();
      }
    }
  }

  /**
   * @function onSelectTopic
   * This method is used to select topic
   */
  public onSelectTopic(competency) {
    this.selectTopic.emit({ competency, domainCompetencyList: this.domainCompetencies, selectedStudents: this.selectedStudents });
  }

  /**
   * @function onSelectCompetency
   * This method is used to select topic
   */
  public onSelectCompetency(competency, studentCompetencyPerformance) {
    this.selectCompetency.emit({ competency, domainCompetencyList: this.domainCompetencies, selectedStudent: studentCompetencyPerformance });
  }

  /**
   * @function getStudentsDomainPerformanceByViewPort
   * This method is used to show student domain performance based on the viewport height
   */
  public getStudentsDomainPerformanceByViewPort(studentsDomainPerformance) {
    const panelContenctHeight = this.studentsDomainPanelContentHeight;
    const studentPanelHeight = this.DOMAIN_COMPETENCY_PANEL_HEIGHT;
    const viewPortDimensions = this.appService.getDeviceDimension();
    const viewPortHeight = viewPortDimensions.height;
    const studentsDomainPerformanceVisibleHeight = viewPortHeight - panelContenctHeight;
    const numberOfStudents = Math.round(studentsDomainPerformanceVisibleHeight / studentPanelHeight);
    this.length = numberOfStudents;
    this.isFetchedAll = numberOfStudents >= studentsDomainPerformance.length;
    const studensDomain = [...studentsDomainPerformance];
    if (!this.isFetchedAll) {
      const parsedStudensDomain = studensDomain.slice(0, numberOfStudents);
      return parsedStudensDomain;
    }
    return studensDomain;
  }

  /**
   * @function slideStudentDomain
   * This method is used to slide the student domain
   */
  public slideStudentDomain(domainSeq) {
    this.domain = this.domainsCompetencyPerformance[domainSeq];
    this.studentCompetencies = this.getStudentsDomainPerformanceByViewPort(this.domain.studentCompetencies);
    const domainData = this.domain.domainData;
    this.domainCompetencies = this.domain.domainData.competencies;
    this.activeDomainData = this.domainLevelSummary.domainCompetencies.find((domain) => {
      return domain.domainCode === domainData.domainCode;
    });
  }

  /**
   * @function onSelectStudent
   * This method is used select student
   */
  public onSelectStudent(student) {
    student.isActive = !student.isActive;
    if (student.isActive) {
      this.selectedStudents.push(student);
    } else {
      const studentIndex = this.selectedStudents.findIndex((selectedStudent) => selectedStudent.userId === student.userId);
      this.selectedStudents.splice(studentIndex, 1);
    }
  }

  /**
   * @function showMoreContent
   * This method is used to show more content
   */
  public showMoreContent() {
    const totalCompetencies = [...this.domain.studentCompetencies];
    this.isFetchedAll = this.length >= totalCompetencies.length;
    if (!this.isFetchedAll) {
      this.length = this.length + this.length;
      this.studentCompetencies = totalCompetencies.slice(0, this.length);
      this.isFetchedAll = this.length >= totalCompetencies.length;
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
