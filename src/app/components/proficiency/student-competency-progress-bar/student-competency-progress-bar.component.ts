import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { findPercentage } from '@utils/global';
import * as d3 from 'd3';

@Component({
  selector: 'nav-student-competency-progress-bar',
  templateUrl: './student-competency-progress-bar.component.html',
  styleUrls: ['./student-competency-progress-bar.component.scss']
})
export class StudentDomainCompetenciesComponent implements OnInit, OnChanges, AfterViewInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public domain: {
    inProgress: number;
    notStarted: number;
    mastered: number;
    total: number;
  };
  @Input() public domainSeq: number;
  @Input() public studentSeq: number;
  @Input() public progressBarName: string;
  @Output() public progressBarLoaded = new EventEmitter();
  private WIDTH = 980;
  private HEIGHT = 30;
  private OFFSET = 20;
  private progressBarMastered: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private progressBarInProgress: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private progressBarNotStarted: d3.Selection<SVGElement, {}, HTMLElement, {}>;

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.domainSeq = this.domainSeq ? this.domainSeq : 0;
    this.studentSeq = this.studentSeq ? this.studentSeq : 0;
  }

  public ngAfterViewInit() {
    this.drawprogressBar();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.domain && !changes.domain.firstChange) {
      this.updateTheprogressBar();
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function drawprogressBar
   * This method is used to draw the progress bar
   */
  public drawprogressBar() {
    const offset = this.OFFSET;
    const width = this.WIDTH + offset * 2;
    const height = this.HEIGHT + offset * 2;
    const dimensions = `0 0 ${width} ${height}`;
    d3.select(`svg#${this.progressBarName}-${this.domainSeq}-${this.studentSeq}-svg`).remove();
    const svg = d3.select(`#${this.progressBarName}-${this.domainSeq}-${this.studentSeq}`).append('svg')
      .attr('id', `${this.progressBarName}-${this.domainSeq}-${this.studentSeq}-svg`)
      .attr('class', 'class-progress-bar')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', dimensions)
      .classed('competency-progress-bar', true);
    const progressBar = svg.append('g')
      .attr('transform', 'translate(' + (offset / 2) + ',' + offset + ')')
      .style('pointer-events', 'none');
    this.progressBarMastered = progressBar.append('rect')
      .attr('class', 'student-progress-bar-mastered competency-progress-bar-border')
      .attr('height', 30)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', 0);
    this.progressBarInProgress = progressBar.append('rect')
      .attr('class', 'student-progress-bar-in-progress competency-progress-bar-border')
      .attr('height', 30)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', 0);
    this.progressBarNotStarted = progressBar.append('rect')
      .attr('class', 'student-progress-bar-not-started')
      .attr('height', 30)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', 0);
    this.updateTheprogressBar();
  }

  /**
   * @function updateTheprogressBar
   * This method is used to update the progress bar
   */
  public updateTheprogressBar() {
    setTimeout(() => {
      const totalCoverage = this.domain.total;
      const masteredPercentage = findPercentage(this.domain.mastered, totalCoverage);
      const progressPercentage = findPercentage(this.domain.inProgress, totalCoverage);
      const notstartedPercentage = findPercentage(this.domain.notStarted, totalCoverage);
      const masteredValue = (this.WIDTH * masteredPercentage) / 100;
      this.progressBarMastered.transition()
        .duration(500)
        .attr('width', () => {
          return masteredValue;
        });
      const inProgressvalue = (this.WIDTH * progressPercentage) / 100;
      this.progressBarInProgress.transition()
        .duration(500)
        .attr('width', () => {
          return inProgressvalue;
        }).attr('x', () => {
          return masteredValue;
        });
      const notStartedvalue = (this.WIDTH * notstartedPercentage) / 100;
      this.progressBarNotStarted.transition()
        .duration(500)
        .attr('width', () => {
          return notStartedvalue;
        }).attr('x', () => {
          return masteredValue + inProgressvalue;
        });
      this.progressBarLoaded.emit();
    }, 800);
  }
}
