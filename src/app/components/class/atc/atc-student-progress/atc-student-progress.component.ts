import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { STUDENT_PROGRESS_COLOR } from '@constants/helper-constants';
import { routerPathIdReplace } from '@constants/router-constants';
import { ClassModel } from '@models/class/class';
import { StudentsReportModel } from '@models/proficiency-report/proficiency-report';
import { ProfileModel } from '@models/profile/profile';
import { ReportService } from '@providers/service/report/report.service';
import * as d3 from 'd3';
import * as moment from 'moment';

@Component({
  selector: 'atc-student-progress',
  templateUrl: './atc-student-progress.component.html',
  styleUrls: ['./atc-student-progress.component.scss'],
})
export class AtcStudentProgressComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classMembers: Array<ProfileModel>;
  @Input() public classDetail: ClassModel;
  @ViewChild('pieChart') public pieChart: ElementRef;
  public classMemberCount: number;
  public mostGainedCompetency: number;
  public isChartLoaded: boolean;
  public totalMaxGained: Array<{ label: string; value: string; }>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService,
    private router: Router
  ) { }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.mostGainedCompetency = 0;
    const studentCount = this.classMembers.filter((member) => member.isActive);
    this.classMemberCount = studentCount.length;
    this.isChartLoaded = false;
    this.fetchPerformanceData();
  }

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
    const activeYM = `${activeYear}-${activeMonth}`;
    const days = moment(activeYM, 'YYYY-MM').daysInMonth();
    endDate = `${activeYM}-${days}`;
    if (startDate < endDate) {
      const dataParam = {
        fromDate: startDate,
        toDate: endDate,
        subjectCode: classDetail.preference.subject
      };
      this.reportService.fetchStudentsSummaryReport(classDetail.id, dataParam).then((studentProgressData: StudentsReportModel) => {
        const parsedStudentsSummaryReportData = [];
        const studentsSummaryReportData = studentProgressData.studentsSummaryData;
        studentsSummaryReportData.forEach(studentSummaryReportData => {
          const summaryData = studentSummaryReportData['summaryData'];
          const weeklySummaryData = summaryData || null;
          if (weeklySummaryData) {
            parsedStudentsSummaryReportData.push(weeklySummaryData);
          }
        });
        this.loadStudentProgressChart(parsedStudentsSummaryReportData);
      });
    } else {
      this.loadStudentProgressChart();
    }
  }

  /**
   * @function loadStudentProgressChart
   * This method is used to load student progress chart
   */
  public loadStudentProgressChart(atcPerformance?) {
    const keys = {};
    if (atcPerformance && atcPerformance.length) {
      atcPerformance.forEach(performanceData => {
        const totalCounts =
          performanceData.completedCompetencies.length +
          performanceData.masteredCompetencies.length;
        if (!keys[totalCounts]) {
          keys[totalCounts] = 0;
        }
        keys[totalCounts]++;
      });
    } else {
      keys[0] = 1;
    }
    const maxGained = Object.keys(keys)
      .map((item) => Number(item))
      .reduce((a, b) => Math.max(a, b));
    this.mostGainedCompetency = Number(maxGained);
    const maxValue = this.findMaxValue(keys);
    let finalParseValue;
    if (maxValue > 5) {
      finalParseValue = this.getParseData(keys, maxValue);
    } else {
      finalParseValue = keys;
    }
    const totalMaxGained = [];
    Object.keys(finalParseValue).map((items) => {
      const totalPercentsge = (
        (finalParseValue[items] /
          (atcPerformance ? atcPerformance.length : 1)) *
        100
      ).toFixed(1);
      const total = {
        label: items,
        value: `${totalPercentsge}%`
      };
      totalMaxGained.push(total);
    });
    if (this.totalMaxGained && this.totalMaxGained.length > 1) {
      const currentLabel = Number(this.totalMaxGained[0].label);
      const nextGainedLabel = Number(this.totalMaxGained[1].label) - 1;
      if (nextGainedLabel > 1) {
        this.totalMaxGained[0].label = `${currentLabel} - ${nextGainedLabel}`;
      }
    }
    this.totalMaxGained = totalMaxGained;
    const parentElement = this.pieChart?.nativeElement;
    const width = parentElement?.clientWidth || 180;
    const height = parentElement?.clientHeight || 190;
    const radius = Math.min(width, height) / 2;
    d3.select('.donut_chart').remove();
    const arc = d3
      .arc()
      .outerRadius(radius * 0.6)
      .innerRadius(radius * 0.3);
    const pie = d3
      .pie()
      .sort(null)
      .value((d: any) => d.value);
    const svg = d3
      .select('#pie-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    const key = (d: any) => {
      return d.data.label;
    };
    const color = d3
      .scaleOrdinal()
      .domain(Object.keys(finalParseValue))
      .range(STUDENT_PROGRESS_COLOR);
    const percentage = Object.values(finalParseValue).map((items: number) =>
      ((items / (atcPerformance ? atcPerformance.length : 1)) * 100).toFixed(1)
    );
    const data = this.randomData(color, percentage);
    const g = svg
      .selectAll('.arc')
      .data(pie(data), key)
      .enter()
      .append('g');
    g.append('path')
      .attr('d', arc as any)
      .style('fill', (d: any): any => color(d.data.label));
    g.append('text')
      .attr('transform', function(d: any) {
        const _d = arc.centroid(d);
        _d[0] *= 1.6;
        _d[1] *= 1.6;
        return `translate(${_d})`;
      })
      .attr('dy', '.50em')
      .style('text-anchor', 'middle')
      .text((d: any) => d.data.text);
    this.isChartLoaded = true;
  }


  /**
   * @function findMaxValue
   * This method is used to find max value
   */
  public findMaxValue(keys) {
    const maxValue = Object.keys(keys)
      .map((item) => Number(item))
      .reduce((a, b) => Math.max(a, b));
    if (maxValue % 5 === 0) {
      return Math.floor(Number(maxValue) / 5) * 5;
    } else {
      return Math.floor(Number(maxValue) / 5) * 5 + 5;
    }
  }

  /**
   * @function getParseData
   * This method is used to get parse data
   */
  public getParseData(keys, maxValue) {
    const one = 1;
    const first = 0;
    const percentage = 100;
    const parseObj = {};
    const fifth = maxValue;
    const second = Math.round((5 / percentage) * maxValue);
    const third = Math.round((20 / percentage) * maxValue);
    const fourth = Math.round((50 / percentage) * maxValue);
    const second2 =
      first + one === second ? second : `${first + one} - ${second}`;
    const third3 = second + one === third ? third : `${second + one} - ${third}`;
    const fourth4 =
      third + one === fourth ? fourth : `${third + one} - ${fourth}`;
    const fifth5 = fourth + one === fifth ? fifth : `${fourth + one} - ${fifth}`;
    Object.keys(keys).map((item) => {
      const items = Number(item);
      if (first === items) {
        if (!parseObj[first]) {
          parseObj[first] = first;
        }
        parseObj[first] += keys[items];
      } else if (first + one <= items && second >= items) {
        if (!parseObj[second2]) {
          parseObj[second2] = first;
        }
        parseObj[second2] += keys[items];
      } else if (second + one <= items && third >= items) {
        if (!parseObj[third3]) {
          parseObj[third3] = first;
        }
        parseObj[third3] += keys[items];
      } else if (third + one <= items && fourth >= items) {
        if (!parseObj[fourth4]) {
          parseObj[fourth4] = first;
        }
        parseObj[fourth4] += keys[items];
      } else if (fourth + one <= items) {
        if (!parseObj[fifth5]) {
          parseObj[fifth5] = first;
        }
        parseObj[fifth5] += keys[items];
      }
    });
    return parseObj;
  }

  /**
   * @function randomData
   * This method is used to get random data
   */
  public randomData(color, percentage) {
    const labels = color.domain();
    return labels.map((label, index) => {
      return {
        label,
        value: percentage[index],
        text: index + 1
      };
    });
  }

  /**
   * @function getTransition
   * This method is used to get transition
   */
  public getTransition(text, outerArc, radius, labels) {
    text
      .transition()
      .duration(1000)
      .attrTween('dx', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          return d2.startAngle + (d2.endAngle - d2.startAngle) / 2 < Math.PI
            ? '-1.5em'
            : '1em';
        };
      })
      .attrTween('transform', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          const pos = outerArc.centroid(d2);
          pos[0] =
            radius *
            (d2.startAngle + (d2.endAngle - d2.startAngle) / 2 < Math.PI
              ? 1
              : -1);
          return `translate(${pos})`;
        };
      })
      .styleTween('text-anchor', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          return d2.startAngle + (d2.endAngle - d2.startAngle) / 2 < Math.PI
            ? 'start'
            : 'end';
        };
      });

    labels
      .transition()
      .duration(1000)
      .attrTween('x', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          return d2.startAngle + (d2.endAngle - d2.startAngle) / 2 < Math.PI
            ? '1.5em'
            : '-3.6em';
        };
      })
      .attrTween('transform', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          const pos = outerArc.centroid(d2);
          pos[0] =
            radius *
            (d2.startAngle + (d2.endAngle - d2.startAngle) / 2 < Math.PI
              ? 1
              : -1);
          return `translate(${pos})`;
        };
      })
      .styleTween('text-anchor', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          return d2.startAngle + (d2.endAngle - d2.startAngle) / 2 < Math.PI
            ? 'start'
            : 'end';
        };
      });
  }

  /**
   * @function navigateToDataByMilestonePage
   * This method is used to navigate to data by milestone page
   */
  public navigateToStudentsProficiency() {
    const studentsProficiencyURL = routerPathIdReplace('studentsProficiency', this.classDetail.id);
    this.router.navigate([studentsProficiencyURL], { queryParams: { isFromATC: true } });
  }
}
