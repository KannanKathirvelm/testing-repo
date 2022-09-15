import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DEFAULT_IMAGES } from '@app/constants/helper-constants';
import { ClassMembersDetailModel, InitialPerformance } from '@models/atc/atc';
import { ClassMembersModel } from '@models/class/class';
import { GradeCompetency } from '@models/taxonomy/taxonomy';
import * as d3 from 'd3';

@Component({
  selector: 'nav-initial-skyline-location',
  templateUrl: './initial-skyline-location.component.html',
  styleUrls: ['./initial-skyline-location.component.scss'],
})
export class InitialSkylineLocationComponent implements OnChanges {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public selectedDate: string;
  @Input() public classMembers: ClassMembersModel;
  @Input() public gradeCompetencies: Array<GradeCompetency>;
  @Input() public atcPerformanceSummary: Array<ClassMembersDetailModel>;
  @Input() public initialCompetencySummary: Array<InitialPerformance>;
  @Output() public emitInitialSkyline: EventEmitter<boolean> = new EventEmitter();
  public isPortrait: boolean;
  public totalMasteredCompetencies: number;
  private isShowGradeCompetency: boolean;
  private width: number;
  private height: number;
  private svgWidth: number;
  private svgHeight: number;
  public isInitialSkyline: boolean;
  public initialSkylineList: Array<InitialPerformance>;

  private readonly MARGIN = {
    top: 10,
    right: 30,
    bottom: 60,
    left: 50,
  };
  private readonly PROFILE_SIZE = 30;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor() {
    this.isShowGradeCompetency = true;
    this.isPortrait = true;
    this.isInitialSkyline = true;
  }

  public async ngOnChanges() {
    this.initialSkylineList = await this.parseInitialSkylineSummary(
      this.classMembers.details,
      this.initialCompetencySummary,
      this.atcPerformanceSummary
    );
    this.drawAtcChart();
  }

  /**
   * @function drawAtcChart
   * Method to draw atc chart
   */
  public drawAtcChart() {
    const component = this;
    const gradeCounts = component.gradeCompetencies;
    const isShowGradeCompetency = component.isShowGradeCompetency;
    this.width = window.innerWidth - 20 - this.MARGIN.left - this.MARGIN.right;
    const bottom = this.isPortrait ? this.MARGIN.bottom : 40;
    this.height = 470 - this.MARGIN.top - bottom;
    if (!this.isPortrait) {
      this.height = window.innerHeight - 60 - this.MARGIN.top - bottom;
    }
    d3.select('.navigator-atc-chart').remove();
    const competecyCounts = gradeCounts?.map((count) => {
      return count.totalCompetencies;
    });
    const maxTickValue: number = this.getMaxTickValue(gradeCounts);
    const xScale = this.getXScale(maxTickValue);
    const xAxis = this.getXAxis(xScale, competecyCounts);
    const xAxisTop = d3
      .axisTop(xScale)
      .tickSizeOuter(0)
      .tickPadding(20)
      .tickValues(competecyCounts)
      .tickFormat((d, i) => (i % 2 === 0 ? '' : gradeCounts[i].grade));
    this.svgWidth = this.width + this.MARGIN.left + 20;
    this.svgHeight = this.height + this.MARGIN.top + this.MARGIN.bottom + 20;
    const svg = d3
      .select('.atc-chart-container')
      .append('svg')
      .attr('class', 'navigator-atc-chart')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .append('g')
      .attr('transform', `translate(${this.MARGIN.left},${this.MARGIN.top})`);
    svg
      .append('g')
      .attr('class', `x axis ${!isShowGradeCompetency ? 'no-grid' : ''}`)
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis);
    svg
      .append('g')
      .style('stroke-dasharray', '3,3')
      .attr('class', `x1 axis ${!isShowGradeCompetency ? 'hidden' : ''}`)
      .attr('transform', 'translate(0,30)')
      .call(xAxisTop);
    this.createStudentNodeCircle();
    this.createChartPlaceholders(svg);
    this.createCheckboxFilters(svg);
    this.cleanUpChart();
  }

  /**
   * @function getXAxis
   * Method to get the chart x axis
   */
  public getXAxis(xScale, competecyCounts) {
    return d3
      .axisBottom(xScale)
      .tickSizeInner(-this.height)
      .tickSizeOuter(0)
      .tickPadding(20)
      .tickValues(competecyCounts);
  }

  /**
   * @function getYAxis
   * Method to get the chart y axis
   */
  public getYAxis(yScale) {
    return d3.axisLeft(yScale).tickSizeInner(-this.width).tickSizeOuter(0).tickPadding(10);
  }

  /**
   * @function getMaxTickValue
   * Method to get the max tick value
   */
  public getMaxTickValue(gradeCounts) {
    return d3.max(gradeCounts, (competency: GradeCompetency) => {
      return competency.totalCompetencies;
    });
  }

  public parseInitialSkylineSummary(students, initialSkyline, atcPerformance) {
    const component = this;
    const gradeCompetencies = component.gradeCompetencies;
    const parsedPerformanceSummary = [];
    let totalMasteredCompetencies = 0;
    if (students && students.length) {
      students.forEach((student) => {
        const memberGradeBounds = this.classMembers.memberGradeBounds;
        const studentBound = memberGradeBounds.find((item) => item.userId === student.id);
        if (!studentBound) {
          return;
        }
        const upperBound = gradeCompetencies.find((item) => item.id === studentBound.bounds.gradeUpperBound);
        const lowerBound = gradeCompetencies.find((item) => item.id === studentBound.bounds.gradeLowerBound);
        let startLevel = lowerBound ? lowerBound.totalCompetencies : 0;
        if (lowerBound && upperBound) {
          startLevel =
            lowerBound.totalCompetencies === upperBound.totalCompetencies
              ? gradeCompetencies.find((item) => item.sequence === lowerBound.sequence - 1).totalCompetencies
              : startLevel;
        }
        const studentPerformanceData = {
          id: student.id,
          thumbnail: student.thumbnail ? student.thumbnail : DEFAULT_IMAGES.PROFILE_IMAGE,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.lastName}, ${student.firstName}`,
          percentScore: 0,
          completedCompetencies: 0,
          isActive: student.isActive,
          startPosition: startLevel,
          endPosition: upperBound ? upperBound.totalCompetencies : 0,
        };

        const studentInitialSkyline = initialSkyline.find((item) => item.userId === student.id);
        const studentAtcPerformance = atcPerformance.find((item) => item.userId === student.id);

        if (studentAtcPerformance) {
          studentPerformanceData.completedCompetencies =
            studentAtcPerformance.completedCompetencies +
            studentAtcPerformance.inferredCompetencies +
            studentAtcPerformance.masteredCompetencies +
            studentAtcPerformance.assertedCompetencies;
        }
        if (studentInitialSkyline) {
          totalMasteredCompetencies +=
            studentInitialSkyline.completedCompetencies +
            studentInitialSkyline.inferredCompetencies +
            studentInitialSkyline.masteredCompetencies +
            studentInitialSkyline.assertedCompetencies;

          const count = studentPerformanceData.completedCompetencies - studentPerformanceData.startPosition;
          studentPerformanceData.completedCompetencies = count > 0 ? count : 0;
          parsedPerformanceSummary.push(studentPerformanceData);
        }
      });
    }
    component.totalMasteredCompetencies = totalMasteredCompetencies;
    return parsedPerformanceSummary;
  }

  /**
   * @function getYScale
   * Method to get the chart y scale
   */
  public getYScale() {
    return d3.scaleLinear().domain([0, 100]).range([this.height, 0]);
  }

  /**
   * @function getXScale
   * Method to get the chart x scale
   */
  public getXScale(maxTickValue) {
    return d3.scaleLinear().domain([0, maxTickValue]).range([0, this.width]).nice();
  }

  /**
   * @function createStudentNodeCircle
   * Method to create student node circle
   */
  public createStudentNodeCircle() {
    const initialSkylineSummary = this.initialSkylineList;
    const studentNodeHeight = initialSkylineSummary?.length > 7 ? initialSkylineSummary.length * 55 : 360;
    const gradeCounts = this.gradeCompetencies;
    const maxTickValue: number = this.getMaxTickValue(gradeCounts);
    const xScale = this.getXScale(maxTickValue);
    const studentSvg = d3
      .select('.atc-chart-container')
      .append('div')
      .attr('class', 'student-section')
      .attr('width', this.svgWidth)
      .attr('height', 360)
      .append('svg')
      .attr('class', 'navigator-atc-chart-skyline')
      .attr('width', this.svgWidth)
      .attr('height', studentNodeHeight);
    const studentProfile = studentSvg
      .append('g')
      .attr('transform', `translate(${this.MARGIN.left},${this.MARGIN.top + 40})`)
      .attr('class', 'student-profile-details');
    const studentProfiles = studentProfile
      .selectAll('.bar-line')
      .data(initialSkylineSummary)
      .enter()
      .append('g')
      .attr('class', 'bar-line')
      .attr('transform', function (d: any, i: any) {
        return `translate(${xScale(d.startPosition)}, ${i * 50})`;
      });
    studentProfiles
      .append('line')
      .attr('stroke', 'white')
      .attr('stroke-width', '2px')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', function (d: any) {
        return xScale(d.endPosition - d.startPosition);
      })
      .attr('y2', '0');
    studentProfiles
      .append('rect')
      .attr('stroke', 'white')
      .attr('stroke-width', '5px')
      .attr('class', 'completed-line')
      .attr('width', 0)
      .attr('height', 0.01)
      .attr('x', 0)
      .attr('y', 0);
    studentProfiles
      .select('.completed-line')
      .transition()
      .duration(5000)
      .attr('width', function (d: any) {
        const allCompetency = Math.abs(xScale(d.completedCompetencies));
        return allCompetency;
      });
    studentProfiles.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 7).style('fill', 'white');
    studentProfiles
      .append('svg:image')
      .attr('class', 'student-profile')
      .attr('x', -15)
      .attr('y', -15)
      .attr('width', this.PROFILE_SIZE)
      .attr('height', this.PROFILE_SIZE)
      .attr('xlink:href', function (d: any) {
        return d.thumbnail;
      });
    studentProfiles
      .select('.student-profile')
      .transition()
      .duration(5000)
      .attr('x', function (d: any) {
        const allCompetency = xScale(d.completedCompetencies);
        return allCompetency - 15;
      });
    const downArrow = studentProfiles
      .append('foreignObject')
      .attr('class', 'position-arrow')
      .attr('x', -15)
      .attr('y', -20)
      .attr('width', 20)
      .attr('height', 20)
      .append('xhtml:div')
      .attr('class', 'count');
    downArrow
      .append('i')
      .attr('class', 'arrow_drop_down material-icons')
      .attr('x', 0)
      .attr('y', 0)
      .text('arrow_drop_down');
    studentProfiles
      .select('.position-arrow')
      .transition()
      .duration(5000)
      .attr('x', function (d: any) {
        const allCompetency = xScale(d.completedCompetencies);
        return allCompetency - 15;
      });
    const tag = studentProfiles
      .append('foreignObject')
      .attr('class', 'position-count')
      .attr('x', -15)
      .attr('y', -40)
      .attr('width', 30)
      .attr('height', 30)
      .append('xhtml:div')
      .attr('class', 'count');
    tag
      .append('span')
      .attr('class', 'total-count')
      .attr('x', 0)
      .attr('y', 0)
      .text(function (d: any) {
        const allCompetency = d.startPosition + d.completedCompetencies;
        return allCompetency;
      });
    studentProfiles
      .select('.position-count')
      .transition()
      .duration(5000)
      .attr('x', function (d: any) {
        const allCompetency = xScale(d.completedCompetencies);
        return allCompetency - 15;
      });
  }

  /**
   * @function createCheckboxFilters
   * Method to create chart checkbox
   */
  public createCheckboxFilters(svg) {
    const component = this;
    const yPoint = this.height + 40;
    const checkbox = svg
    .append('foreignObject')
    .attr('transform', 'translate(0, 0)')
    .attr('x', '0')
    .attr('y', yPoint)
    .attr('width', this.width)
    .attr('height', 40)
    .append('xhtml:div')
    .attr('class', 'initial-inferred');
    // Currently, We are hidden the inferred checkbox (refer ticket: https://gooru.atlassian.net/browse/NILEMOBILE-510)
  checkbox
    .append('div')
    .attr('class', 'inferred-checkbox ellipsis')
    .append('input')
    .attr('type', 'checkbox')
    .on('click', () => {
      component.isInitialSkyline = !this.isInitialSkyline;
      this.emitInitialSkyline.emit(component.isInitialSkyline);
    })
    .property('checked', component.isInitialSkyline);
  checkbox
    .select('.inferred-checkbox')
    .append('span')
    .text('Initial Skyline Location');
  checkbox
    .append('div')
    .attr('class', 'grade-grid')
    .append('input')
    .attr('type', 'checkbox')
    .attr('x', this.svgWidth)
    .on('click', () => {
      component.isShowGradeCompetency = !this.isShowGradeCompetency;
      component.drawAtcChart();
    })
    .property('checked', component.isShowGradeCompetency);
  checkbox.call(() => {
    checkbox
      .select('.grade-grid')
      .append('span')
      .attr('class', 'ellipsis')
      .text('Show Grade Grid');
    });
  }

  /**
   * @function cleanUpChart
   * Method to clean up chart views as per requirement
   */
  public cleanUpChart() {
    const axisList = ['x', 'y', 'x1'];
    const component = this;
    axisList.forEach((axis) => {
      const axisContainer = d3.selectAll(`.navigator-atc-chart .${axis}.axis .tick`);
      axisContainer.attr('style', function (d) {
        const curAxisElement = d3.select(this);
        const transformAttr = curAxisElement.attr('transform');
        const translate = transformAttr
          .substring(transformAttr.indexOf('(') + 1, transformAttr.indexOf(')'))
          .split(',');
        const curAxisXpoint = translate ? translate[0] : 0;
        const curAxisYpoint = translate ? translate[1] : 0;
        let tickClass = 'tick';
        const yPoint = component.isPortrait ? 260 : 200;
        // Here we hide the tick label when axis point reach the chart checkbox offset point
        if ((axis === 'y' && curAxisYpoint > yPoint) || (axis === 'x' && curAxisXpoint < 200)) {
          tickClass += ' no-label';
        }
        curAxisElement.attr('class', tickClass);
        return '';
      });
    });
  }

  /**
   * @function createChartPlaceholders
   * Method to create chart placeholder
   */
  public createChartPlaceholders(svg) {
    const yPoint = this.height + 30;
    const xPoint = this.isPortrait ? 130 : 200;
    svg
      .append('g')
      .attr('transform', 'translate(-460, 500) rotate(-90)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', xPoint)
      .attr('y', '445');
    svg
      .append('g')
      .attr('transform', 'translate(-50, 0)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', '50')
      .attr('y', yPoint)
      .text('Progress from Class Start');
  }
}