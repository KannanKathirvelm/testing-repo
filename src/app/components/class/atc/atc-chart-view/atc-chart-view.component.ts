import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DEFAULT_IMAGES } from '@app/constants/helper-constants';
import { TenantSettingsModel } from '@app/models/tenant/tenant-settings';
import { AtcPerformanceModel, ChartFilterModel, ClassMembersDetailModel, InitialPerformance } from '@models/atc/atc';
import { ClassMembersModel, ClassModel } from '@models/class/class';
import { GradeCompetency } from '@models/taxonomy/taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { TransformGradeColor } from '@pipes/transform-grade-color.pipe';
import { ATCService } from '@providers/service/atc/atc.service';
import { ClassService } from '@providers/service/class/class.service';
import { UtilsService } from '@providers/service/utils.service';
import axios from 'axios';
import * as d3 from 'd3';
import * as moment from 'moment';


@Component({
  selector: 'atc-chart-view',
  templateUrl: './atc-chart-view.component.html',
  styleUrls: ['./atc-chart-view.component.scss'],
})

export class AtcChartViewComponent implements OnDestroy, OnChanges, OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public selectedDate: string;
  @Input() public isLoaded: boolean;
  @Input() public classMembers: ClassMembersModel;
  @Input() public tenantSettings:TenantSettingsModel;
  @Output() public emitTotalMasteredCompetencies: EventEmitter<{ totalMasteredCompetencies: number, totalCompetencies: number }> = new EventEmitter();
  @Output() public emitSelectedStudent: EventEmitter<ClassMembersDetailModel> = new EventEmitter();
  @Output() public emitSelectedStudentList: EventEmitter<Array<ClassMembersDetailModel>> = new EventEmitter();
  @Output() public rotateScreen: EventEmitter<boolean> = new EventEmitter();
  public isPortrait: boolean;
  public isZoomed: boolean;
  public isChartLoaded: boolean;
  public classDetails: ClassModel;
  public totalMasteredCompetencies: number;
  public gradeCompetencies: Array<GradeCompetency>;
  public atcPerformanceSummary: Array<ClassMembersDetailModel>;
  private selectedChartFilterList: ChartFilterModel;
  private isShowGradeCompetency: boolean;
  private isExcludeInferred: boolean;
  private width: number;
  private height: number;
  private svgWidth: number;
  private svgHeight: number;
  public isInitialSkyline: boolean;
  public initialCompetencySummary: Array<InitialPerformance>;
  public chartFilterList = [
    {
      name: 'Class Journey',
      filterItems: {
        fetchClassStats: true
      },
      filterKey: 'class-competencies'
    }, {
      name: 'Overall',
      filterItems: {},
      filterKey: 'overall-competencies'
    }
  ];

  private readonly MARGIN = {
    top: 10,
    right: 30,
    bottom: 60,
    left: 50
  };
  private readonly PROFILE_OUTER_RADIUS = 18;
  private readonly PROFILE_SIZE = 30;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private transformGradeColor: TransformGradeColor,
    private utilsService: UtilsService,
    private classService: ClassService,
    private atcService: ATCService,
    private translate: TranslateService
  ) {
    this.isShowGradeCompetency = false;
    this.isExcludeInferred = false;
    this.isPortrait = true;
    this.isChartLoaded = false;
    this.selectedChartFilterList = this.chartFilterList[0];
    this.classDetails = this.classService.class;
  }


  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    if (this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings?.atcViewDefaultProgressSelection) {
      const atcViewDefaultProgressSelectionData = this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings?.atcViewDefaultProgressSelection;
      this.selectedChartFilterList = this.chartFilterList.find((filter) => { return filter.filterKey === atcViewDefaultProgressSelectionData });
    }
    this.applyChartFilter();
  }

  public ngOnDestroy() {
    this.isPortrait = true;
    this.toggleClassNavbar();
    this.utilsService.lockOrientationInPortrait();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.classMembers && changes.classMembers.currentValue) {
      this.isChartLoaded = false;
      this.applyChartFilter();
    }
    if (changes.selectedDate && !changes.selectedDate.firstChange) {
      this.isChartLoaded = false;
      this.applyChartFilter();
    }
  }

  /**
   * @function loadChartData
   * Method to used to load the chart data
   */
  public loadChartData(selectedFilter = {}) {
    const component = this;
    const month = moment(this.selectedDate).format('M');
    const year = moment(this.selectedDate).format('YYYY');
    let filters = {
      month,
      year
    };
    filters = { ...selectedFilter, ...filters };
    const classId = this.classDetails.id;
    const subjectCode = this.classDetails.preference ? this.classDetails.preference.subject : null;
    const classFramework = this.classDetails.preference ? this.classDetails.preference.framework : null;
    const params = {
      subject: subjectCode,
      fw_code: classFramework
    };
    const initialParams = {
      fwCode: classFramework,
      month,
      year
    }
    return axios.all<{}>([
      this.atcService.getAtcPerformanceSummary(classId, subjectCode, filters),
      this.atcService.getGradeCompetencyCount(params),
      this.atcService.getInitialSkylinePerformanceSummary(classId, subjectCode, initialParams)
    ]).then(axios.spread((performanceSummary: Array<AtcPerformanceModel>, competencyGrades: Array<GradeCompetency>, initialCompetency: Array<InitialPerformance>) => {
      const classMembersModel = this.classMembers ?.members || [];
      const students = classMembersModel.filter((member) => member.isActive);
      this.atcPerformanceSummary = this.parseAtcPerformanceSummary(students, performanceSummary);
      const grades = competencyGrades.sort((grade1, grade2) => grade1.sequence - grade2.sequence);
      this.parseGradeCompetencies(grades);
      component.drawAtcChart();
      this.initialCompetencySummary = initialCompetency;
    }));
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
   * @function removeChart
   * Method to remove the chart
   */
  public removeChart() {
    d3.select('.navigator-atc-chart').remove();
  }

  /**
   * @function getChartZoomConfig
   * Method to get the chart zoom config
   */
  public getChartZoomConfig() {
    return d3.zoom().scaleExtent([1, 8]);
  }

  /**
   * @function getXAxis
   * Method to get the chart x axis
   */
  public getXAxis(xScale, competecyCounts, isGradeView) {
    if (isGradeView) {
      return d3
      .axisBottom(xScale)
      .tickSizeInner(-this.height)
      .tickSizeOuter(0)
      .tickPadding(20)
     } else {
      return d3
      .axisBottom(xScale)
      .tickSizeInner(-this.height)
      .tickSizeOuter(0)
      .tickPadding(20)
      .tickValues(competecyCounts);
    }
  }

  /**
   * @function getYAxis
   * Method to get the chart y axis
   */
  public getYAxis(yScale) {
    return d3
      .axisLeft(yScale)
      .tickSizeInner(-this.width)
      .tickSizeOuter(0)
      .tickPadding(10);
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

  /**
   * @function getYScale
   * Method to get the chart y scale
   */
  public getYScale() {
    return d3.scaleLinear()
      .domain([0, 100])
      .range([this.height, 0]);
  }

  /**
   * @function getXScale
   * Method to get the chart x scale
   */
  public getXScale(maxTickValue) {
    return d3.scaleLinear()
      .domain([0, maxTickValue])
      .range([0, this.width])
      .nice();
  }

  /**
   * @function createStudentNodeCircle
   * Method to create student node circle
   */
  public createStudentNodeCircle(studentNode) {
    studentNode
      .append('circle')
      .attr('cx', 15)
      .attr('cy', 15)
      .attr('r', this.PROFILE_OUTER_RADIUS)
      .style('fill', (d: ClassMembersDetailModel) => {
        return this.transformGradeColor.transform(d.percentScore);
      });
    studentNode
      .append('svg:image')
      .attr('class', 'student-profile')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.PROFILE_SIZE)
      .attr('height', this.PROFILE_SIZE)
      .attr(
        'xlink:href', (node: ClassMembersDetailModel) => {
          if(!node.thumbnail){
            return DEFAULT_IMAGES.PROFILE_IMAGE;
          }
          return node.thumbnail;
        }
      );
  }

  /**
   * @function createChartPlaceholders
   * Method to create chart placeholder
   */
  public createChartPlaceholders(svg) {
    const yPoint = (this.height + 60);
    const xPoint = this.isPortrait ? 130 : 200;
    const tenantPoChartYaxisLabel = this.tenantSettings.uiElementVisibilitySettings &&  this.tenantSettings.uiElementVisibilitySettings.poChartYaxisLabel;
    const poChartYaxisLabel = tenantPoChartYaxisLabel ? tenantPoChartYaxisLabel : this.translate.instant('PERFORMANCE');
    svg
      .append('g')
      .attr('transform', 'translate(-460, 500) rotate(-90)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', xPoint)
      .attr('y', '445')
      .text(poChartYaxisLabel);
    svg
      .append('g')
      .attr('transform', 'translate(-50, 0)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', '50')
      .attr('y', yPoint)
      .text('Progress');
  }

  /**
   * @function createChartDropdown
   * Method to create chart dropdown
   */
  public createChartDropdown(svg) {
    const yPoint = (this.height + 44);
    const component = this;
    const xAxisDropdown = svg
      .append('foreignObject')
      .attr('transform', 'translate(0, 0)')
      .attr('x', '75')
      .attr('y', yPoint)
      .attr('width', 180)
      .attr('height', 50)
      .append('xhtml:div')
      .attr('class', 'filter-dropdown');
    xAxisDropdown
      .append('select')
      .attr('id', 'grade-list')
      .selectAll('option')
      .data(component.chartFilterList)
      .enter()
      .append('option')
      .text(d => d.name)
      .attr('value', d => d.filterKey);
    xAxisDropdown
      .select('#grade-list')
      .on('change', () => {
        const filterKey = d3.event.target.value;
        this.selectedChartFilterList = this.chartFilterList.find((filter) => filter.filterKey === filterKey);
        component.applyChartFilter();
      })
      .property('value', this.selectedChartFilterList.filterKey);
  }

  /**
   * @function createCheckboxFilters
   * Method to create chart checkbox
   */
  public createCheckboxFilters(svg) {
    const component = this;
    const yPoint = (this.height + 60);
    const checkbox = svg
      .append('foreignObject')
      .attr('transform', 'translate(0, 0)')
      .attr('x', '0')
      .attr('y', yPoint)
      .attr('width', this.width)
      .attr('height', 40)
      .append('xhtml:div')
      .attr('class', 'exclude-inferred');
    checkbox
      .append('div')
      .attr('class', 'inferred-checkbox ellipsis')
      .append('input')
      .attr('type', 'checkbox')
      .on('click', () => {
        component.isExcludeInferred = !this.isExcludeInferred;
        component.applyChartFilter();
      })
      .property('checked', component.isExcludeInferred);
    checkbox
      .append('div')
      .attr('class', `initial-checkbox ${this.selectedChartFilterList.filterKey === 'class-competencies' ? 'disable-initial-skyline' : ''}`)
      .append('input')
      .attr('type', 'checkbox')
      .on('click', () => {
          component.loadInitialSkyline();
      })
      .property('checked', component.isShowGradeCompetency);
    checkbox
      .select('.initial-checkbox')
      .append('span')
      .text('Initial Skyline Location');
    checkbox
      .select('.inferred-checkbox')
      .append('span')
      .text('Exclude Inferred');
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
   * @function drawAtcChart
   * Method to draw atc chart
   */
  public drawAtcChart() {
    const component = this;
    const dataset = component.atcPerformanceSummary;
    const selectedChartFilterList = this.selectedChartFilterList.filterKey;
    const isGradeView = !!(selectedChartFilterList === 'class-competencies');
    const gradeCounts = component.gradeCompetencies;
    const isShowGradeCompetency = component.isShowGradeCompetency;
    this.width = (window.innerWidth - 20) - this.MARGIN.left - this.MARGIN.right;
    const bottom = this.isPortrait ? this.MARGIN.bottom : 40;
    this.height = 470 - this.MARGIN.top - bottom;
    if (!this.isPortrait) {
      this.height = (window.innerHeight - 60) - this.MARGIN.top - bottom;
    }
    this.removeChart();
    const xAxisCount = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const competecyCounts = isGradeView ? xAxisCount : gradeCounts.map((count) => { return count.totalCompetencies; });
    const maxTickValue: number = isGradeView ? 100 : this.getMaxTickValue(gradeCounts);
    const xScale = this.getXScale(maxTickValue);
    const yScale = this.getYScale();
    const xAxis = this.getXAxis(xScale, competecyCounts, isGradeView);
    dataset.forEach(studentData => {
      const studentCompetencyData = studentData.completedCompetencies + studentData.masteredCompetencies;
      const xAxisData = isGradeView ? (studentCompetencyData / studentData.totalCompetencies) * 100 : studentData.completedCompetencies;
      studentData.xAxis = xScale(xAxisData)?.toFixed(2);
      studentData.yAxis = yScale(studentData.percentScore).toFixed(2);
    });
    const xAxisTop = d3
      .axisTop(xScale)
      .tickSizeOuter(0)
      .tickPadding(20)
      .tickValues(competecyCounts)
      .tickFormat((d, i) =>
        i % 2 === 0 || isGradeView ? '' : gradeCounts[i].grade
      );
    const groupedDataset = component.groupItemsByPos(dataset);
    const yAxis = this.getYAxis(yScale);
    const chartZoomConfig = this.getChartZoomConfig();
    this.svgWidth = this.width + this.MARGIN.left + 20;
    this.svgHeight = this.height + this.MARGIN.top + this.MARGIN.bottom + 50;
    const svg = d3
      .select('.atc-chart-container')
      .append('svg')
      .attr('class', 'navigator-atc-chart')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .call(chartZoomConfig)
      .append('g')
      .attr('transform', `translate(${this.MARGIN.left},${this.MARGIN.top})`);
    const studentNodes = svg.append('g').attr('class', 'student-nodes');
    svg
      .append('g')
      .attr('class', `x axis ${!isShowGradeCompetency ? 'no-grid' : ''}`)
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis);
    svg
      .append('g')
      .attr('class', `x1 axis ${!isShowGradeCompetency || component.isPortrait ? 'hidden' : ''}`)
      .attr('transform', 'translate(0,30)')
      .call(xAxisTop);
    svg
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis);
    const studentNode = studentNodes
      .selectAll('.student-nodes')
      .data(groupedDataset)
      .enter()
      .append('g')
      .attr('transform', (d: ClassMembersDetailModel) => {
        return `translate(${Number(d.xAxis)}, ${Number(d.yAxis) - 20})`;
      })
      .attr('class', (d: ClassMembersDetailModel) => {
        return `node-point node-${d.seq}`;
      }).on('click', (studentData: ClassMembersDetailModel) => {
        const groupedStudentList = groupedDataset.filter((datasetObj) => {
          return studentData.group === datasetObj.group;
        });
        if (groupedStudentList.length > 1) {
          component.emitSelectedStudentList.emit(groupedStudentList);
        } else {
          component.emitSelectedStudent.emit(studentData);
        }
      });
    this.isChartLoaded = true;
    this.createStudentNodeCircle(studentNode);
    this.createChartPlaceholders(svg);
    this.createChartDropdown(svg);
    this.cleanUpChart();
    if (!this.isPortrait) {
      this.createCheckboxFilters(svg);
      this.chartZoomHandler(chartZoomConfig, xScale, yScale, xAxis, yAxis, xAxisTop, studentNode);
    }
  }

  /**
   * @function chartZoomHandler
   * Method to used to handle the chart zoom
   */
  public chartZoomHandler(chartZoomConfig, xScale, yScale, xAxis, yAxis, xAxisTop, studentNode) {
    const component = this;
    chartZoomConfig.on('zoom', () => {
      const newX = d3.event.transform.rescaleX(xScale);
      const newY = d3.event.transform.rescaleY(yScale);
      d3.select('.x.axis').call(xAxis.scale(newX));
      d3.select('.y.axis').call(yAxis.scale(newY));
      d3.select('.x1.axis').call(xAxisTop.scale(newX));
      studentNode
        // Reposition node point based on current axis level
        .attr('transform', (d: ClassMembersDetailModel) => {
          const xPoint = newX(d.completedCompetencies);
          const yPoint = newY(d.percentScore);
          d.xAxis = xPoint;
          d.yAxis = yPoint;
          return `translate(${xPoint}, ${yPoint})`;
        })
        // Hide student node points after reach chart edge
        .attr('class', (d: ClassMembersDetailModel) => {
          const xPoint = newX(d.completedCompetencies);
          const yPoint = newY(d.percentScore);
          let className = 'node-point';
          if (
            xPoint < 5 ||
            yPoint <= 0 ||
            xPoint >= component.svgWidth - 100 ||
            yPoint >= component.svgHeight - 110
          ) {
            className += ' hidden';
          }
          return className;
        });
      component.cleanUpChart();
      this.isZoomed = true;
    });
  }

  /**
   * @function applyChartFilter
   * Method help to apply filter for the chart
   */
  public applyChartFilter() {
    const chartFilterList = this.selectedChartFilterList;
    const selectedFilter = { ...{}, ...chartFilterList.filterItems };
    if (this.isExcludeInferred) {
      selectedFilter.excludeInferred = true;
    }
    this.loadChartData(selectedFilter);
  }

  /**
   * @function cleanUpChart
   * Method to clean up chart views as per requirement
   */
  public cleanUpChart() {
    const selectedChartFilterList = this.selectedChartFilterList.filterKey;
    const isGradeView = !!(selectedChartFilterList === 'class-competencies');
    const axisList = ['x', 'y', 'x1'];
    const component = this;
    axisList.forEach((axis) => {
      const axisContainer = d3.selectAll(`.navigator-atc-chart .${axis}.axis .tick`);
      axisContainer.attr('style', function(d) {
        const curAxisElement = d3.select(this);
        const curAxisText = curAxisElement.select('text');
        const transformAttr = curAxisElement.attr('transform');
        const translate = transformAttr.substring(transformAttr.indexOf('(') + 1, transformAttr.indexOf(')')).split(',');
        const curAxisYpoint = translate ? translate[1] : 0;
        let tickClass = 'tick';
        const yPoint = component.isPortrait ? 260 : 200;
        // Here we hide the tick label when axis point reach the chart checkbox offset point
        if ((axis === 'y' && curAxisYpoint > yPoint)) {
          tickClass += ' no-label';
        }
        curAxisElement.attr('class', tickClass);
        if (axis === 'y') {
          curAxisText.text(`${curAxisText.text()}%`);
        }
        else if (axis === 'x'&& isGradeView) {
          curAxisText.text(`${curAxisText.text()}%`);
        }
        return '';
      });
    });
  }

  /**
   * @function groupItemsByPos
   * Method to used to group the items by position
   */
  public groupItemsByPos(dataset = []) {
    if (dataset.length) {
      const sortedByScoreDataset = dataset.sort((dataset1, dataset2) => dataset1.percentScore - dataset2.percentScore);
      sortedByScoreDataset.forEach((sortedDataset, index) => {
        const sourceItem = sortedDataset;
        const sourceXaxis = Number(sourceItem.xAxis);
        const sourceYaxis = Number(sourceItem.yAxis);
        if (!sourceItem.group) {
          sortedByScoreDataset.forEach((compareItem) => {
            const compareXAxis = Number(compareItem.xAxis);
            const compareYAxis = Number(compareItem.yAxis);
            const xDiff = Math.abs(sourceXaxis - compareXAxis);
            const yDiff = Math.abs(sourceYaxis - compareYAxis);
            // Here we are using x and y diff offset to group items
            const xDiffGroup = 30;
            const yDiffGroup = 16;
            if (xDiff <= xDiffGroup && yDiff <= yDiffGroup) {
              compareItem.group = index + 1;
            }
          });
        }
      });
      return sortedByScoreDataset;
    }
    return dataset;
  }

  /**
   * @function getStudenPerformanceData
   * Method to get student performance data
   */
  public getStudenPerformanceData(student): ClassMembersDetailModel {
    return {
      id: student.id,
      thumbnail: student.avatarUrl ? student.avatarUrl : null,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.lastName}, ${student.firstName}`,
      percentScore: 0,
      completedCompetencies: 0,
      isActive: student.isActive
    };
  }

  /**
   * @function parseAtcPerformanceSummary
   * Method to parse atc performance summary data
   */
  public parseAtcPerformanceSummary(students, performanceSummary) {
    const parsedPerformanceSummary = [];
    let totalMasteredCompetencies = 0;
    if (students && students.length) {
      students.forEach((student, index) => {
        const studentPerformanceData = this.getStudenPerformanceData(student);
        const studentPerformanceSummary = performanceSummary.find((summary) => {
          return summary.userId === student.id;
        });
        if (studentPerformanceSummary) {
          const inferredCompetencies = !this.isExcludeInferred ? studentPerformanceSummary.inferredCompetencies : 0;
          const assertedCompetencies = studentPerformanceSummary.assertedCompetencies ? studentPerformanceSummary.assertedCompetencies
            : 0;
          totalMasteredCompetencies += studentPerformanceSummary.completedCompetencies + inferredCompetencies +
            studentPerformanceSummary.masteredCompetencies + assertedCompetencies;
          const completedCompetency = studentPerformanceSummary.completedCompetencies + inferredCompetencies + assertedCompetencies;
          const notStartedCompetencies =  studentPerformanceSummary.totalCompetencies - (completedCompetency + studentPerformanceSummary.inprogressCompetencies);
          studentPerformanceData.totalCompetencies = studentPerformanceSummary.totalCompetencies;
          studentPerformanceData.completedCompetencies = completedCompetency;
          studentPerformanceData.inprogressCompetencies = studentPerformanceSummary.inprogressCompetencies;
          studentPerformanceData.notStartedCompetencies = notStartedCompetencies;
          studentPerformanceData.percentCompletion = studentPerformanceSummary.percentCompletion;
          studentPerformanceData.percentScore = studentPerformanceSummary.percentScore;
          studentPerformanceData.gradeId = studentPerformanceSummary.gradeId || '--';
          studentPerformanceData.grade = studentPerformanceSummary.grade || '--';
          studentPerformanceData.seq = index + 1;
          studentPerformanceData.masteredCompetencies =  studentPerformanceSummary.masteredCompetencies;
          studentPerformanceData.inferredCompetencies = inferredCompetencies;
          const competenciesNotStarted = (studentPerformanceData.completedCompetencies || studentPerformanceData.inprogressCompetencies || studentPerformanceData.totalCompetencies) ? true : false;
          studentPerformanceData.competenciesNotStarted = competenciesNotStarted;
          if (studentPerformanceData.isActive) {
            parsedPerformanceSummary.push(studentPerformanceData);
          }
        }
      });
    }
    this.totalMasteredCompetencies = totalMasteredCompetencies;
    this.emitTotalMasteredCompetencies.emit({ totalMasteredCompetencies, totalCompetencies: 0 });
    return parsedPerformanceSummary;
  }

  /**
   * @function parseGradeCompetencies
   * Method to used to parse grade competencies
   */
  public parseGradeCompetencies(grades) {
    const component = this;
    const selectedChartFilterList = this.selectedChartFilterList.filterKey;
    const isGradeView = !!(selectedChartFilterList === 'class-competencies');
    const upperBound = this.classDetails.gradeUpperBound;
    const gradeCurrent = this.classDetails.gradeCurrent;
    const destinationGrade = grades.find((grade) => {
      return grade.id === upperBound;
    });
    const currentIndex = grades.findIndex(item => item.id === gradeCurrent);
    let gradesUnderDestination = grades.filter(grade => grade.sequence <= destinationGrade.sequence);
    if (isGradeView) {
      gradesUnderDestination = grades.filter((grade, i) => i <= currentIndex && i >= currentIndex - 1);
      if (gradesUnderDestination.length > 1) {
        const prevGrade = gradesUnderDestination[0];
        prevGrade.totalCompetencies = 0;
      }
    }
    let totalCompetencies = 0;
    gradesUnderDestination.map((grade) => {
      grade.totalCompetencies = (totalCompetencies += grade.totalCompetencies);
      return grade;
    });
    component.gradeCompetencies = gradesUnderDestination;
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

  /**
   * @function loadInitialSkyline
   * Method to used to set the flag for initial skyline
   */
  public loadInitialSkyline() {
    if (this.initialCompetencySummary && this.initialCompetencySummary.length) {
      this.isInitialSkyline = true;
    }
  }

  /**
   * @function emitInitialSkyline
   * Method to used to close the initial skyline
   */
  public emitInitialSkyline(event) {
    this.isInitialSkyline = event;
    this.applyChartFilter();
  }
}