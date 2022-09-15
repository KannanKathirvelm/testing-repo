import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DEFAULT_IMAGES } from '@app/constants/helper-constants';
import { NonPremiumAtcPerformance } from '@models/atc/atc';
import { ClassMembersModel, ClassModel } from '@models/class/class';
import { TransformGradeColor } from '@pipes/transform-grade-color.pipe';
import { ATCService } from '@providers/service/atc/atc.service';
import { ClassService } from '@providers/service/class/class.service';
import { UtilsService } from '@providers/service/utils.service';
import axios from 'axios';
import * as d3 from 'd3';

@Component({
  selector: 'non-premium-atc-chart-view',
  templateUrl: './non-premium-atc-chart-view.component.html',
  styleUrls: ['./non-premium-atc-chart-view.component.scss'],
})

export class NonPremiumAtcChartViewComponent implements OnInit, OnDestroy, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classMembers: ClassMembersModel;
  @Output() public selectStudent: EventEmitter<NonPremiumAtcPerformance> = new EventEmitter();
  @Output() public rotateScreen: EventEmitter<boolean> = new EventEmitter();
  public isPortrait: boolean;
  public isZoomed: boolean;
  public isChartLoaded: boolean;
  public classDetails: ClassModel;
  public isPremiumClass: boolean;
  private chartData: Array<NonPremiumAtcPerformance>;
  private width: number;
  private height: number;
  private svgWidth: number;
  private svgHeight: number;
  private readonly MARGIN = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 65
  };
  private readonly PROFILE_OUTER_RADIUS = 18;
  private readonly PROFILE_SIZE = 30;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private transformGradeColor: TransformGradeColor,
    private utilsService: UtilsService,
    private classService: ClassService,
    private atcService: ATCService
  ) { }


  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.isZoomed = false;
    this.isPortrait = true;
    this.isChartLoaded = false;
    this.classDetails = this.classService.class;
    this.isPremiumClass = this.findIsPremiumClass();
    this.loadChartData()
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.classMembers && !changes.classMembers.firstChange) {
      this.isChartLoaded = false;
      this.loadChartData()
    }
  }

  public ngOnDestroy() {
    this.isPortrait = true;
    this.utilsService.lockOrientationInPortrait();
  }

  /**
   * @function findIsPremiumClass
   * Method to check whether premium or non-premium
   */
  private findIsPremiumClass() {
    const classSetting = this.classDetails.setting;
    return classSetting ? classSetting['course.premium'] === true : false;
  }

  /**
   * @function loadChartData
   * Method to used to load the chart data
   */
  public loadChartData() {
    const component = this;
    const classId = this.classDetails.id;
    const courseId = this.classDetails.courseId;
    return axios.all<{}>([
      this.atcService.getAtcPerformanceForNonPremiumClass(classId, courseId)
    ]).then(axios.spread((performanceSummary: Array<NonPremiumAtcPerformance>) => {
      const classMembersModel = this.classMembers?.members || [];
      const students = classMembersModel.filter((member) => member.isActive);
      this.chartData = this.getStudentWisePerformance(students, performanceSummary);
      component.drawAtcChart();
    }));
  }

  /**
   * @function getStudentWisePerformance
   * Method to organize student wise performance data
   */
  public getStudentWisePerformance(students, performances) {
    const studentsPerformanceData = [];
    if (students && students.length) {
      students.map(student => {
        const studentPerformance = performances.find((performance) => performance.userId === student.id);
        const studentData = {
          id: student.id,
          thumbnail: student.avatarUrl,
          score: 0,
          progress: 0,
          fullName: `${student.lastName}, ${student.firstName}`,
          firstName: student.firstName
        };
        if (studentPerformance) {
          studentData.progress =
            Math.round(studentPerformance.progress * 100) / 100 || 0;
          studentData.score =
            Math.round(studentPerformance.score * 100) / 100 || 0;
        }
        studentsPerformanceData.push(studentData);
      });
    }
    return studentsPerformanceData;
  }

  /**
   * @function onResetZoom
   * Method to used to reset zoom
   */
  public onResetZoom() {
    this.drawAtcChart();
    this.isZoomed = false;
  }

  /**
   * @function getXScale
   * Method to get the chart x scale
   */
  public getXScale(xAxisDomain) {
    return d3.scaleLinear()
      .domain(xAxisDomain)
      .range([0, this.width])
      .nice();
  }

  /**
   * @function getYScale
   * Method to get the chart y scale
   */
  public getYScale(yAxisDomain) {
    return d3.scaleLinear()
      .domain(yAxisDomain)
      .range([this.height, 0]);
  }

  /**
   * @function getXAxis
   * Method to get the chart x axis
   */
  public getXAxis(xScale, count) {
    return d3
      .axisBottom(xScale)
      .tickSizeInner(-this.height)
      .tickSizeOuter(-380)
      .tickPadding(10)
      .tickValues(count);
  }

  /**
   * @function getYAxis
   * Method to get the chart y axis
   */
  public getYAxis(yScale, count) {
    return d3
      .axisLeft(yScale)
      .tickSizeInner(-this.width)
      .tickSizeOuter(-760)
      .tickValues(count)
      .tickPadding(10);
  }

  /**
   * @function getChartZoomConfig
   * Method to get the chart zoom config
   */
  public getChartZoomConfig() {
    return d3.zoom().scaleExtent([1, 8]);
  }

  /**
   * @function removeChart
   * Method to remove the chart
   */
  public removeChart() {
    d3.select('.navigator-atc-chart').remove();
  }

  /**
   * @function drawAtcChart
   * Method to draw ATC view chart
   */
  public drawAtcChart() {
    const component = this;
    this.width = (window.innerWidth - 20) - this.MARGIN.left - this.MARGIN.right;
    const bottom = this.isPortrait ? this.MARGIN.bottom : 40;
    this.height = 470 - this.MARGIN.top - bottom;
    if (!this.isPortrait) {
      this.height = (window.innerHeight - 50) - this.MARGIN.top - bottom;
    }
    const chartZoomConfig = this.getChartZoomConfig();
    this.svgWidth = this.width + this.MARGIN.left;
    this.svgHeight = this.height + this.MARGIN.top + this.MARGIN.bottom + 20;
    const dataset = component.chartData;
    const maxScore = d3.max(dataset, (d: NonPremiumAtcPerformance) => {
      return Number(d.score);
    });
    const maxProgress = d3.max(dataset, (d: NonPremiumAtcPerformance) => {
      return Number(d.progress);
    });
    const minScore = d3.min(dataset, (d: NonPremiumAtcPerformance) => {
      return Number(d.score);
    });
    const minProgress = d3.min(dataset, (d: NonPremiumAtcPerformance) => {
      return Number(d.progress);
    });
    let xAxisDomain = [0, 100];
    let yAxisDomain = [0, 100];
    if (maxProgress === 100 || minProgress === 0) {
      xAxisDomain = [-10, 110];
    }
    if (maxScore === 100 || minScore === 0) {
      yAxisDomain = [-10, 110];
    }
    const xScale = this.getXScale(xAxisDomain);
    const yScale = this.getYScale(yAxisDomain);
    const xAxis = this.getXAxis(xScale, d3.range(xAxisDomain[0], xAxisDomain[1], 10));
    const yAxis = this.getYAxis(yScale, d3.range(yAxisDomain[0], yAxisDomain[1], 10));
    dataset.forEach((studentData) => {
      studentData.xAxis = xScale(studentData.progress);
      studentData.yAxis = yScale(studentData.score);
    });
    this.removeChart();
    const svg = d3
      .select('.non-premium-atc-chart-view')
      .append('svg')
      .attr('class', 'navigator-atc-chart')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .call(chartZoomConfig)
      .append('g')
      .attr('transform', `translate(${this.MARGIN.left},${this.MARGIN.top})`);
    this.drawChartAxis(xAxis, yAxis, svg);
    this.drawStudentNode(dataset, svg);
    this.isChartLoaded = true;
    const params = { chartZoomConfig, xScale, yScale, xAxis, yAxis, svg }
    this.chartZoomHandler(params);
    component.cleanUpChart();
  }

  /**
   * @function chartZoomHandler
   * Method to used to handle the chart zoom
   */
  public chartZoomHandler(params) {
    const component = this;
    params.chartZoomConfig.on('zoom', () => {
      const newX = d3.event.transform.rescaleX(params.xScale);
      const newY = d3.event.transform.rescaleY(params.yScale);
      d3.select('.x.axis').call(params.xAxis.scale(newX));
      d3.select('.y.axis').call(params.yAxis.scale(newY));
      params.svg.selectAll('.node-point').attr('transform', (d: NonPremiumAtcPerformance) => {
        const xPoint = newX(d.progress);
        const yPoint = newY(d.score);
        d.xAxis = xPoint;
        d.yAxis = yPoint;
        return `translate(${xPoint}, ${yPoint})`;
      });
      component.cleanUpChart();
      this.isZoomed = true;
    })
  }

  /**
   * @function drawChartAxis
   * Method to draw student node
   */
  public drawChartAxis(xAxis, yAxis, svg) {
    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    svg
      .append('g')
      .attr('transform', 'translate(-498, 270) rotate(-90)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', '50')
      .attr('y', '445')
      .text('Performance');

    svg
      .append('g')
      .attr('transform', 'translate(100, 40) rotate(0)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', '0')
      .attr('y', this.height)
      .text('Progress');
  }

  /**
   * @function drawStudentNode
   * Method to draw student node
   */
  public drawStudentNode(dataset, svg) {
    const studentNodes = svg
      .selectAll('.student-nodes')
      .data(dataset)
      .enter()
      .append('g')
      .attr('transform', (d: NonPremiumAtcPerformance) => {
        return `translate(${Number(d.xAxis)}, ${Number(d.yAxis) - 20})`;
      })
      .attr('class', 'node-point');

    studentNodes
      .append('circle')
      .attr('cx', 15)
      .attr('cy', 15)
      .attr('r', this.PROFILE_OUTER_RADIUS)
      .style('fill', (d: NonPremiumAtcPerformance) => {
        return this.transformGradeColor.transform(d.score);
      });

    studentNodes
      .append('svg:image')
      .attr('class', 'student-profile')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.PROFILE_SIZE)
      .attr('height', this.PROFILE_SIZE)
      .attr(
        'xlink:href', (node: NonPremiumAtcPerformance) => {
          if(!node.thumbnail){
            return DEFAULT_IMAGES.PROFILE_IMAGE;
          }
          return node.thumbnail;
        }
      ).on('click', (d: NonPremiumAtcPerformance) => {
        this.selectStudent.emit(d);
      });
  }

  /**
   * @function cleanUpChart
   * Method to clean up chart views as per requirement
   */
  public cleanUpChart() {
    const axisList = ['x', 'y'];
    axisList.map((axis) => {
      const axisContainer = d3.selectAll(`.${axis}.axis .tick`);
      axisContainer.attr('style', function(d) {
        const curAxisElement = d3.select(this);
        const curAxisText = curAxisElement.select('text');
        if (axis === 'y') {
          curAxisText.text(`${curAxisText.text()}%`);
        }
        return '';
      });
    });
  }


  /**
   * @function onRotateLandscape
   * Method to used to rotate landscape
   */
  public onRotateLandscape() {
    this.isPortrait = false;
    this.toggleClassNavbar();
    this.utilsService.lockOrientationInLandscape();
    this.loadAtcChart();
  }

  /**
   * @function onRotatePortrait
   * Method to used to rotate to portrait
   */
  public onRotatePortrait() {
    this.isPortrait = true;
    this.toggleClassNavbar();
    this.utilsService.lockOrientationInPortrait();
    this.loadAtcChart();
  }

  /**
   * @function toggleClassNavbar
   * Method to used toggle class navbar
   */
  public toggleClassNavbar() {
    const navbarElement = this.utilsService.getGlobalElementByClassName('class-header');
    this.rotateScreen.emit(this.isPortrait);
    if (this.isPortrait) {
      navbarElement.classList.remove('hidden');
    } else {
      navbarElement.classList.add('hidden');
    }
  }

  /**
   * @function loadAtcChart
   * Method to used to load atc chart
   */
  public loadAtcChart() {
    setTimeout(() => {
      this.drawAtcChart();
    }, 500);
  }
}
