import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { findPercentage } from '@utils/global';
import * as d3 from 'd3';

@Component({
  selector: 'nav-domain-competency-progress-bar',
  templateUrl: './domain-competency-progress-bar.component.html',
  styleUrls: ['./domain-competency-progress-bar.component.scss']
})
export class DomainCompetenciesComponent implements OnChanges, AfterViewInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public domain: {
    inProgress: number;
    notStarted: number;
    mastered: number;
    total: number;
  };
  @Input() public domainSeq: number;
  @Input() public slideChanged: boolean;
  private WIDTH = 980;
  private HEIGHT = 80;
  private OFFSET = 20;
  private progressBarMastered: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private progressBarInProgress: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private progressBarNotStarted: d3.Selection<SVGElement, {}, HTMLElement, {}>;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.slideChanged && !changes.slideChanged.firstChange) {
      setTimeout(() => {
        this.drawprogressBar();
      });
    }
  }

  public ngAfterViewInit() {
    this.drawprogressBar();
  }

  /**
   * @function drawprogressBar
   * This method is used to draw the progress bar
   */
  public drawprogressBar() {
    const offset = this.OFFSET;
    const width = this.WIDTH + offset * 2;
    const height = this.HEIGHT + offset * 2;
    const dimensions = `0 0 ${width} ${height}`;
    d3.select(`svg.domain-competency-progress-bar`).remove();
    const svg = d3.select(`#domain-competency-progress-bar-${this.domainSeq}`).append('svg')
      .attr('id', `domain-progress-bar-${this.domainSeq}-svg`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', dimensions)
      .classed('domain-competency-progress-bar', true);
    const progressBar = svg.append('g')
      .attr('transform', 'translate(' + (offset / 2) + ',' + offset + ')')
      .style('pointer-events', 'none');
    this.progressBarMastered = progressBar.append('rect')
      .attr('class', 'progress-bar-mastered')
      .attr('height', 80)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', 0);
    this.progressBarInProgress = progressBar.append('rect')
      .attr('class', 'progress-bar-in-progress')
      .attr('height', 80)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', 0);
    this.progressBarNotStarted = progressBar.append('rect')
      .attr('class', 'progress-bar-not-started')
      .attr('height', 80)
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
    }, 800);
  }
}
