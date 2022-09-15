import { Component, OnDestroy, OnInit } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { PLAYER_EVENT_SOURCE } from '@app/constants/helper-constants';
import { CourseMapPerformanceContentModel } from '@app/models/performance/performance';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { CourseMapUnitReportComponent } from '@components/class/reports/course-map-unit-report/course-map-unit-report.component';
import { ClassModel } from '@models/class/class';
import { CourseDetailModel } from '@models/course/course';
import { MilestoneCourseParamsModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import { UnitSummaryModel } from '@models/unit/unit';
import { ClassService } from '@providers/service/class/class.service';
import { CourseMapService } from '@providers/service/course-map/course-map.service';
import { CourseService } from '@providers/service/course/course.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import * as moment from 'moment';

@Component({
  selector: 'course-map-report',
  templateUrl: './course-map-report.component.html',
  styleUrls: ['./course-map-report.component.scss']
})
export class CourseMapReportComponent implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  public units: Array<UnitSummaryModel>;
  public classDetail: ClassModel;
  public classId: string;
  public studentList: Array<ProfileModel>;
  public unitLoaded: boolean;
  public courseId: string;
  public isStudentsLoaded: boolean;
  public scoreInPercentage: number;
  public performanceLoaded: boolean;
  public isThumbnailError: boolean;
  public teacherUnitParams: MilestoneCourseParamsModel;
  public course: CourseDetailModel;
  public startTime: number;
  public courseTitle: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private courseMapService: CourseMapService,
    private courseService: CourseService,
    private performanceService: PerformanceService,
    private classService: ClassService,
    private modalService: ModalService,
    private parseService: ParseService
  ) {}

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.initialize();
  }

  /**
   * @function initialize
   * this Method is used to initialize
   */
  public initialize() {
    this.classId = this.classDetail.id;
    this.courseId = this.classDetail.courseId;
    this.studentList = this.getStudentList();
    this.teacherUnitParams = {
      classId: this.classId,
      courseId: this.courseId,
      studentList: this.studentList,
      isTeacherView: true
    };
    this.startTime = moment().valueOf();
    this.course = this.getCourse();
    this.fetchUnits();
    this.fetchClassPerformance();
  }

  public ngOnDestroy() {
    this.trackCourseMapReportEvent();
  }

  /**
   * @function trackCourseMapReportEvent
   * This method is used to track the view course map report event
   */
  public trackCourseMapReportEvent() {
    const context = this.getCourseMapReportContext();
    this.parseService.trackEvent(EVENTS.VIEW_COURSE_REPORT, context);
  }

  /**
   * @function getCourseMapReportContext
   * This method is used to get the context for course map report event
   */
  private getCourseMapReportContext() {
    const endTime = moment().valueOf();
    return {
      classId: this.classId,
      courseId: this.courseId,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      startTime: this.startTime,
      courseTitle: this.courseTitle,
      endTime
    };
  }

  /**
   * @function openCourseMapUnitReport
   * this Method is used to open course map unit report
   */
  public openCourseMapUnitReport(event, unit, unitIndex) {
    event.stopPropagation();
    const context = {
      classDetail: this.classDetail,
      unit,
      unitIndex
    };
    this.modalService.openModal(
      CourseMapUnitReportComponent,
      context,
      'course-map-unit-report'
    );
  }

  /**
   * @function fetchUnits
   * Method to fetch units
   */
  public fetchUnits() {
    this.unitLoaded = false;
    this.courseMapService
      .getUnitsByCourseId(this.teacherUnitParams)
      .then((response) => {
        this.units = response;
        this.unitLoaded = true;
      });
  }

  /**
   * @function getCourse
   * this Method is used to get the course
   */
  public getCourse() {
    return this.courseService.classCourse
      ? this.courseService.classCourse
      : null;
  }

  /**
   * @function fetchClassPerformance
   * This Method is used to fetch class performance
   */
  public fetchClassPerformance() {
    this.performanceLoaded = false;
    const classId = this.classId;
    const courseId = this.courseId;
    this.classService
      .fetchClassPerformance([
        {
          classId,
          courseId
        }
      ])
      .then((classPerformance) => {
        this.scoreInPercentage =
          classPerformance && classPerformance[0].score !== null
            ? classPerformance[0].score
            : null;
        this.performanceLoaded = true;
      });
  }

  /**
   * @function getStudentList
   * this Method is used to get the student list
   */
  public getStudentList() {
    return this.classService.activeStudentList
      ? this.classService.activeStudentList
      : [];
  }

  /**
   * @function onOpenUnitPanel
   * Method to used to open unit panel
   */
  public onOpenUnitPanel(unitIndex, unit) {
    if (!unit.studentList) {
      this.isStudentsLoaded = false;
      this.performanceService
        .getUnitsPerformance(this.teacherUnitParams)
        .then((unitPerformance: Array<CourseMapPerformanceContentModel>) => {
          const unitPerformanceData = unitPerformance.filter(
            (item) => item.unitId === unit.unitId
          );
          unit.studentList = this.getStudentList();
          if (unitPerformanceData && unitPerformanceData.length) {
            unit.studentList.map((student) => {
              const studentPerformance = unitPerformanceData.find(
                (studPerformance) => studPerformance.userUid === student.id
              );
              if (studentPerformance) {
                student.performance = studentPerformance.performance;
              }
              return student;
            });
          }
          this.isStudentsLoaded = true;
        });
    } else {
      this.isStudentsLoaded = true;
    }
  }

  /**
   * @function closeReport
   * Method to close the unit performance report
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
