import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { COMPETENCY_STATUS_VALUE, PROFICIENCY_CHART_COLORS } from '@constants/helper-constants';
import { DomainCompetenciesModel } from '@models/competency/competency';
import * as d3 from 'd3';

@Component({
  selector: 'nav-student-class-proficiency-chart',
  templateUrl: './student-class-proficiency-chart.component.html',
  styleUrls: ['./student-class-proficiency-chart.component.scss']
})
export class StudentClassProficiencyChartComponent implements AfterViewInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public studentSeq: number;
  @Input() public studentDomains: Array<DomainCompetenciesModel>;
  @Input() public maxNumberOfCompetencies: number;
  @Input() public source: string;
  @Output() public chartLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  public chartHeight: number;
  public cellWidth: number;
  get cellHeight() {
    const maxNumberOfCompetencies = this.maxNumberOfCompetencies;
    const chartHeight = this.chartHeight;
    return chartHeight / maxNumberOfCompetencies;
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngAfterViewInit() {
    this.chartHeight = 110;
    this.cellWidth = 10;
    this.drawProficiencyChart();
  }

  public ngOnDestroy() {
    const studentSeq = this.studentSeq;
    d3.select(`svg.proficiency-chart-${studentSeq}-${this.source}`).remove();
  }

  /**
   * @function drawProficiencyChart
   * Method to draw proficiency chart
   */
  public drawProficiencyChart() {
    const domainDataSet = this.studentDomains;
    const studentSeq = this.studentSeq;
    const numberOfDomains = domainDataSet.length;
    const cellWidth = this.cellWidth;
    const chartWidth = numberOfDomains * cellWidth;
    const chartHeight = this.chartHeight;
    const proficiencyChartContainer = d3
      .select(`.student-proficiency-view-${studentSeq}-${this.source}`)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('id', 'proficiency-chart')
      .attr('class', `proficiency-chart-${studentSeq}-${this.source}`);
    const domainChartContainer = proficiencyChartContainer
      .append('g')
      .attr('id', 'chart-container');
    domainDataSet.forEach((dataSet) => {
      this.drawDomainCompetencyChart(domainChartContainer, dataSet);
    });
    this.chartLoaded.emit(true);
  }

  /**
   * @function drawDomainCompetencyChart
   * Method to draw domain competency chart
   */
  public drawDomainCompetencyChart(domainChartContainer, dataSet) {
    const domainSeq = dataSet.domainSeq;
    const cellWidth = this.cellWidth;
    const cellHeight = this.cellHeight;
    let competencySeq = -1;
    const xSeq = (domainSeq - 1) * cellWidth;
    const cells = domainChartContainer
      .selectAll('.competency')
      .data(dataSet.competencies);
    cells
      .enter()
      .append('rect')
      .attr('class', d => {
        return `domain-${domainSeq} competency-${
          d.competencySeq
          } fill-${d.competencyStatus}`;
      })
      .attr('id', 'student-competency-cell')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('stroke', PROFICIENCY_CHART_COLORS.CELL_STROKE)
      .attr('stroke-dasharray', '0.5, 20, 0.1, 0.1')
      .attr('stroke-width', '10')
      .attr('fill', d => {
        if (d.competencyStatus === COMPETENCY_STATUS_VALUE.NOT_STARTED) {
          return PROFICIENCY_CHART_COLORS.NOT_STARTED;
        } else if (d.competencyStatus === COMPETENCY_STATUS_VALUE.IN_PROGRESS) {
          return PROFICIENCY_CHART_COLORS.IN_PROGRESS;
        }
        return PROFICIENCY_CHART_COLORS.MASTERED;
      })
      .attr('x', xSeq)
      .attr('y', () => {
        competencySeq++;
        return this.chartHeight - (competencySeq * cellHeight);
      });
  }
}
