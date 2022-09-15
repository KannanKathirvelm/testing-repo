import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ClassModel } from '@app/models/class/class';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { CompetencyInfoComponent } from '@components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { StudentStandardListPullUpComponent } from '@components/proficiency/student-standard-list-pull-up/student-standard-list-pull-up.component';
import { ModalController } from '@ionic/angular';
import { DomainModel, FwCompetenciesModel, SelectedCompetencyModel, SelectedTopicsModel } from '@models/competency/competency';
import { SubjectModel } from '@models/taxonomy/taxonomy';
import { collapseAnimation } from 'angular-animations';
import * as d3 from 'd3';

export interface DomainChartModel {
  key?: string;
  value?: number;
  competencyType?: string;
  competencyCount?: number;
}

@Component({
  selector: 'topic-info',
  templateUrl: './topic-info.component.html',
  styleUrls: ['./topic-info.component.scss'],
  animations: [
    collapseAnimation()
  ]
})
export class TopicInfoComponent implements AfterViewInit, OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public content: SelectedTopicsModel;
  @Input() public listView: boolean;
  @Input() public isEmitCloseEvent: boolean;
  @Input() public isDiagnostic: boolean;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public fwDomains: Array<DomainModel>;
  @Input() public frameworkId: string;
  @Input() public studentId: string;
  @Input() public activeSubject: SubjectModel;
  @Input() public competencyPullUpClassName: string;
  @Input() public isClassProgressCompetency: boolean;
  public classDetails: ClassModel;
  @Output() public closePullUp = new EventEmitter();
  @Output() public selectCompetency: EventEmitter<SelectedCompetencyModel> = new EventEmitter();
  public notStartedCompetenciesCount: number;
  public masteredCompetenciesCount: number;
  public inProgressCompetenciesCount: number;
  private readonly WIDTH = 180;
  private readonly HEIGHT = 180;
  private readonly MARGIN = 20;
  public showMoreItems: boolean[] = [];

  constructor(
    private modalController: ModalController,
    private classService: ClassService,
    private parseService: ParseService) { }

  public ngOnInit() {
    this.isClassProgressCompetency = true;
    if (this.content && this.content.topic) {
      this.notStartedCompetenciesCount = this.content.topic.notstartedCompetencies;
      this.masteredCompetenciesCount = this.content.topic.masteredCompetencies;
      this.inProgressCompetenciesCount = this.content.topic.inprogressCompetencies;
    }
    this.classDetails = this.classService.class;
  }

  public ngAfterViewInit() {
    this.drawCompetencyProgressBar();
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose(event) {
    event.stopPropagation();
    if (this.isEmitCloseEvent) {
      this.closePullUp.emit();
    } else {
      this.modalController.dismiss();
    }
  }

  /**
   * @function drawCompetencyProgressBar
   * This method is used to draw the compentency progress bar
   */
  private drawCompetencyProgressBar() {
    const width = this.WIDTH;
    const height = this.HEIGHT;
    const margin = this.MARGIN;
    const radius = Math.min(width, height) / 2 - margin;
    d3.select('svg#domain-competency-progressbar').remove();
    const svg = d3.select('#domain-competency-progressbar-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'domain-competency-progressbar')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    const data: Array<DomainChartModel> = [{
      competencyType: 'mastered',
      competencyCount: this.masteredCompetenciesCount
    }, {
      competencyType: 'in-progress',
      competencyCount: this.inProgressCompetenciesCount
    }, {
      competencyType: 'not-started',
      competencyCount: this.notStartedCompetenciesCount
    }];
    const pie = d3.pie<DomainChartModel>()
      .value((d) => {
        return d['competencyCount'];
      })(data);
    const arc = d3.arc<d3.PieArcDatum<DomainChartModel>>().innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);
    svg
      .selectAll('allSlices')
      .data(pie)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('class', (d) => {
        return `competencies-line ${d['data']['competencyType']}`;
      });
  }

  public openCompetencyInfo(competency) {
    const selectedCompetency = {
      competency,
      domainCompetencyList: this.content.domain
    };
    const componentProps = {
      studentId: this.studentId,
      activeSubject: this.activeSubject,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency
    };
    const cssClass = this.competencyPullUpClassName ? this.competencyPullUpClassName : 'competency-info-component';
    this.openModal(CompetencyInfoComponent, componentProps, cssClass);
  }

  public openStudentStandardList(competency) {
    const params = {
      classId: this.classDetails.id,
      competency,
      subject: this.activeSubject,
      framework: this.frameworkId
    };
    this.openModal(StudentStandardListPullUpComponent, params, 'student-standard-list-pullup');
  }

  public async openModal(component, componentProps, cssClass) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component,
      componentProps,
      cssClass
    });
    await modal.present();
  }

  /**
   * @function onSelectCompetency
   * This method is used to open the competency report
   */
  public async onSelectCompetency(event, competency) {
    event.stopPropagation();
    if (this.isClassProgressCompetency) {
      this.openStudentStandardList(competency);
    } else {
      this.openCompetencyInfo(competency);
    }
    this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_COMPETENCIES);
  }
}
