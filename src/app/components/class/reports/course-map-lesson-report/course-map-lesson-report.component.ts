import { Component, OnInit } from '@angular/core';
import { MilestoneCollectionReportComponent } from '@components/class/reports/milestone-collection-report/milestone-collection-report.component';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { ClassModel } from '@models/class/class';
import { LessonModel } from '@models/lesson/lesson';
import { MilestoneCourseParamsModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { ClassService } from '@providers/service/class/class.service';
import { CourseMapService } from '@providers/service/course-map/course-map.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { ReportService } from '@providers/service/report/report.service';

@Component({
  selector: 'course-map-lesson-report',
  templateUrl: './course-map-lesson-report.component.html',
  styleUrls: ['./course-map-lesson-report.component.scss'],
})
export class CourseMapLessonReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public lesson: LessonModel;
  public classDetail: ClassModel;
  public classId: string;
  public unitId: string;
  public fwCode: string;
  public studentList: Array<ProfileModel>;
  public collectionLoaded: boolean;
  public courseId: string;
  public isStudentsLoaded: boolean;
  public scoreInPercentage: number;
  public lessonIndex: number;
  public performanceLoaded: boolean;
  public tenantSettings: TenantSettingsModel;
  public teacherCollectionParams: MilestoneCourseParamsModel;
  public lessonLabelValue: boolean;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService,
    private performanceService: PerformanceService,
    private courseMapService: CourseMapService,
    private classService: ClassService,
    private modalService: ModalService
  ) {
    this.lessonLabelValue = false;
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.lessonLabelValue = this.tenantSettings ?.uiElementVisibilitySettings ?.lessonLabelCourseMap ? true : false;
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
    const classPreference = this.classDetail.preference;
    this.fwCode = classPreference && classPreference.framework
      ? classPreference.framework
      : null;
    this.teacherCollectionParams = {
      classId: this.classId,
      courseId: this.courseId,
      fwCode: this.fwCode,
      studentList: this.studentList,
      isTeacherView: true,
      lessonId: this.lesson.lessonId,
      unitId: this.unitId,
      contentType: CONTENT_TYPES.ASSESSMENT,
    }
    this.fetchCollections();
    this.getMilestonePerformance();
  }

  /**
   * @function openCollectionReport
   * this Method is used to open collection report
   */
  public openCollectionReport(event, collection) {
    event.stopPropagation();
    this.lesson.unitId = this.unitId;
    const context = {
      classDetail: this.classDetail,
      collection,
      lesson: this.lesson
    };
    this.modalService.openModal(MilestoneCollectionReportComponent, context, 'milestone-collection-report');
  }

  /**
   * @function onClickStudentReport
   * This method used to call report function based on type
   */
  public onClickStudentReport(student, collection) {
    const context = {
      classId: this.classId,
      collectionType: collection.format,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      contentId: collection.id,
      studentId: student.id,
      collectionId: collection.id,
      courseId: this.courseId,
      unitId: this.lesson.unitId,
      lessonId: this.lesson.lessonId
    };
    this.reportService.showReport(context);
  }

  /**
   * @function getMilestonePerformance
   * This Method is used to fetch class performance
   */
  public getMilestonePerformance() {
    this.performanceLoaded = false;
    this.scoreInPercentage = this.lesson.performance && this.lesson.performance.scoreInPercentage !== null ?
      this.lesson.performance.scoreInPercentage : null;
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
   * @function fetchCollections
   * Method to fetch milestones
   */
  public fetchCollections() {
    this.collectionLoaded = false;
    if (!this.lesson.collections) {
      this.courseMapService.getUnitCollections(this.teacherCollectionParams).then((response) => {
        this.lesson.collections = response;
        this.collectionLoaded = true;
      });
    } else {
      this.collectionLoaded = true;
    }
  }

  /**
   * @function onOpenCollectionPanel
   * Method to used to open collection panel
   */
  public onOpenCollectionPanel(collection) {
    if (!collection.studentList) {
      this.isStudentsLoaded = false;
      this.teacherCollectionParams.contentType = collection.format;
      this.performanceService.getCollectionPerformance(this.teacherCollectionParams).then((collectionPerformance) => {
        const idKey = `${collection.format}Id`;
        const collectionPerformanceData = collectionPerformance.filter((item) => item[idKey] === collection.id);
        collection.studentList = this.getStudentList();
        if (collectionPerformanceData && collectionPerformanceData.length) {
          collection.studentList.map((student) => {
            const studentPerformance = collectionPerformanceData.find((studPerformance) => studPerformance.userUid === student.id)
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
