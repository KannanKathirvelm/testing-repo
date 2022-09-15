import { Component, OnInit } from '@angular/core';
import { CourseMapLessonReportComponent } from '@components/class/reports/course-map-lesson-report/course-map-lesson-report.component';
import { ClassModel } from '@models/class/class';
import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { MilestoneCourseParamsModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { UnitSummaryModel } from '@models/unit/unit';
import { ClassService } from '@providers/service/class/class.service';
import { CourseMapService } from '@providers/service/course-map/course-map.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';

@Component({
  selector: 'course-map-unit-report',
  templateUrl: './course-map-unit-report.component.html',
  styleUrls: ['./course-map-unit-report.component.scss'],
})
export class CourseMapUnitReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public unit: UnitSummaryModel;
  public classDetail: ClassModel;
  public classId: string;
  public fwCode: string;
  public studentList: Array<ProfileModel>;
  public lessonLoaded: boolean;
  public courseId: string;
  public isStudentsLoaded: boolean;
  public scoreInPercentage: number;
  public unitIndex: number;
  public performanceLoaded: boolean;
  public teacherLessonParams: MilestoneCourseParamsModel;
  public tenantSettings: TenantSettingsModel;
  public lessonLabelValue: boolean;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private performanceService: PerformanceService,
    private courseMapService: CourseMapService,
    private classService: ClassService,
    private modalService: ModalService,
    private lookupService: LookupService
  ) {
    this.lessonLabelValue = false;
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.initialize();
    this.fetchTenantSettings();
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public async fetchTenantSettings() {
    this.tenantSettings = await this.lookupService.fetchTenantSettings();
    this.lessonLabelValue = this.tenantSettings ?.uiElementVisibilitySettings ?.lessonLabelCourseMap ? true : false;
  }

  /**
   * @function initialize
   * this Method is used to initialize
   */
  public initialize() {
    this.classId = this.classDetail.id;
    this.courseId = this.classDetail.courseId;
    this.studentList = this.getStudentList();
    this.teacherLessonParams = {
      classId: this.classId,
      courseId: this.courseId,
      studentList: this.studentList,
      isTeacherView: true,
      unitId: this.unit.unitId,
    }
    this.fetchLessons();
    this.getMilestonePerformance();
  }

  /**
   * @function openCourseMapLessonReport
   * this Method is used to open milestone course map lesson report
   */
  public openCourseMapLessonReport(event, lesson, lessonIndex) {
    event.stopPropagation();
    const context = {
      classDetail: this.classDetail,
      lesson,
      lessonIndex,
      unitId: this.unit.unitId
    };
    this.modalService.openModal(CourseMapLessonReportComponent, context, 'course-map-lesson-report');
  }

  /**
   * @function getMilestonePerformance
   * This Method is used to fetch class performance
   */
  public getMilestonePerformance() {
    this.performanceLoaded = false;
    this.scoreInPercentage = this.unit.performance && this.unit.performance.scoreInPercentage !== null ?
      this.unit.performance.scoreInPercentage : null;
    this.performanceLoaded = true;
  }

  /**
   * @function getStudentList
   * this Method is used to get the student list
   */
  public getStudentList() {
    return this.classService.activeStudentList ? this.classService.activeStudentList : [];
  }

  /**
   * @function fetchLessons
   * Method to fetch milestones
   */
  public fetchLessons() {
    this.lessonLoaded = false;
    if (!this.unit.lessons) {
      this.courseMapService.getUnitLessons(this.teacherLessonParams).then((lessonSummary: Array<UnitLessonSummaryModel>) => {
        this.unit.lessons = lessonSummary;
        this.lessonLoaded = true;
      });
    } else {
      this.lessonLoaded = true;
    }
  }

  /**
   * @function onOpenlessonPanel
   * Method to used to open lesson panel
   */
  public onOpenlessonPanel(lesson) {
    if (!lesson.studentList) {
      this.isStudentsLoaded = false;
      this.performanceService.getUnitLessonPerformance(this.teacherLessonParams).then((lessonPerformance) => {
        const lessonPerformanceData = lessonPerformance.filter((item) => item.lessonId === lesson.lessonId);
        lesson.studentList = this.getStudentList();
        if (lessonPerformanceData && lessonPerformanceData.length) {
          lesson.studentList.map((student) => {
            const studentPerformance = lessonPerformanceData.find((studPerformance) => studPerformance.userUid === student.id)
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
   * Method to close the milestone performance report
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
