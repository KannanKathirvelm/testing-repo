import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { routerPathIdReplace } from '@constants/router-constants';
import { ClassModel } from '@models/class/class';
import { TranslateService } from '@ngx-translate/core';
import { MilestoneService } from '@providers/service/milestone/milestone.service';
import * as d3 from 'd3';
import * as moment from 'moment';

@Component({
  selector: 'atc-data-by-milestone',
  templateUrl: './atc-data-by-milestone.component.html',
  styleUrls: ['./atc-data-by-milestone.component.scss'],
})
export class AtcDataByMilestoneComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classDetail: ClassModel;
  @ViewChild('barChart') public barChart: ElementRef;
  public isChartLoaded: boolean;
  public isShowMilestoneChart: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private milestoneService: MilestoneService,
    private translate: TranslateService,
    private router: Router,
    private parseService: ParseService
  ) { }

  // -------------------------------------------------------------------------
  // Lifecycle Methods

  public ngOnInit() {
    this.fetchPerformanceData();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchPerformanceData
   * This method is used to fetch performance data
   */
  public fetchPerformanceData() {
    const classDetail = this.classDetail;
    const startDate = moment(classDetail.createdAt).format('YYYY-MM-DD');
    let endDate;
    const activeMonth = moment().format('MM');
    const activeYear = moment().format('YYYY');
    const currentDate = moment().format('YYYY-MM');
    const activeYM = `${activeYear}-${activeMonth}`;
    if (activeYM === currentDate) {
      endDate = moment().format('YYYY-MM-DD');
    } else {
      const days = moment(activeYM, 'YYYY-MM').daysInMonth();
      endDate = `${activeYM}-${days}`;
    }
    if (startDate < endDate) {
      this.milestoneService.fetchMilestoneByDate(classDetail.id, startDate, endDate).then((milestoneList) => {
        this.loadMilestoneChart(milestoneList);
      });
    } else {
      this.loadMilestoneChart();
    }
  }

  /**
   * @function loadMilestoneChart
   * This method is used to load milestone chart
   */
  public loadMilestoneChart(milestones = []) {
    const data = [];
    let maxValue = 0;
    if (milestones && milestones.length) {
      const milestoneChart = milestones.filter((milestone) => {
        return milestone.students && milestone.students.length;
      });
      milestoneChart.forEach((milestone) => {
        if (maxValue < milestone.students.length) {
          maxValue = milestone.students.length;
        }
        let dataValue;
        dataValue = {
          label: milestone.gradeName,
          value: milestone.students.length
        }
        data.push(dataValue);
      });
    }
    const setTick = maxValue >= 5 ? 5 : maxValue;
    const parentElement = this.barChart?.nativeElement;
    d3.select('.bar_charts').remove();
    if (data && data.length) {
      let parentWidth = parentElement.clientWidth;
      const parentHeight = parentElement.clientHeight;
      if (data.length > 5) {
        parentWidth = data.length * 20 + parentWidth;
      }
      // used to add margin top and left
      const margin = {
        top: 20,
        right: 0,
        bottom: 20,
        left: 40
      };
      const width = parentWidth - margin.left - margin.right;
      const height = parentHeight - margin.top - margin.bottom;
      let barWidth = parentWidth / (3 + data.length);
      barWidth = barWidth < 20 ? 20 : barWidth;
      const chart = d3
        .select('.chart')
        .attr('width', parentWidth)
        .attr('height', parentHeight)
        .append('g')
        .attr('class', 'bar_charts')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      // Scales
      const x = d3
        .scaleBand()
        .domain(
          data.map(function(d) {
            return (d.label =
              d.label.length > 7
                ? d.label.includes('Integrated')
                  ? d.label.substring(d.label.length - 7)
                  : `${d.label.substring(0, 7)}...`
                : d.label);
          })
        )
        .range([0, width]);
      const y = d3.scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);
      // Axis
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y).ticks(setTick);
      const yAxisText = this.translate.instant('STUDENTS');
      chart
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
      chart
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis);
      chart
        .append('text')
        .attr('class', 'y-axis-student')
        .attr('transform', 'rotate(-90)')
        .attr('y', 2)
        .attr('x', '-35')
        .attr('dy', '-2.5em')
        .attr('text-anchor', 'end')
        .text(yAxisText);
      chart
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('text')
        .data(data)
        .attr('x', function(d) {
          return (
            x(d.label) +
            x.bandwidth() / 2 -
            barWidth / 2 +
            (data.length === 1 ? 15 : -2)
          );
        })
        .attr('y', function(d) {
          return y(d.value);
        })
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('width', barWidth)
        .attr('transform', 'translate(20, -20)')
        .text(function(d) {
          return d.value;
        });
      // Bars
      const bar = chart
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
          return x(d.label) + x.bandwidth() / 2 - barWidth / 2;
        })
        .attr('y', height)
        .attr('width', barWidth)
        .attr('height', 0);
      bar
        .transition()
        .duration(1500)
        .ease(d3.easeElastic)
        .attr('y', function(d) {
          return y(d.value);
        })
        .attr('height', function(d) {
          return height - y(d.value);
        });
      this.isChartLoaded = true;
    } else {
      this.isShowMilestoneChart = true;
    }
  }

  /**
   * @function navigateToDataByMilestonePage
   * This method is used to navigate to data by milestone page
   */
  public navigateToDataByMilestonePage(){
    const dataByMilestoneURL = routerPathIdReplace('dataByMilestone', this.classDetail.id);
    this.router.navigate([dataByMilestoneURL]);
    this.parseService.trackEvent(EVENTS.CLICK_PO_DATA_BY_MILESTONE);
  }
}
