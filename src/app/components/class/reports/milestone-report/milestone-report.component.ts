import { Component, OnInit } from '@angular/core';
import { MilestonePerformanceContentModel } from '@app/models/performance/performance';
import { MilestoneLessonReportComponent } from '@components/class/reports/milestone-lesson-report/milestone-lesson-report.component';
import { ClassModel } from '@models/class/class';
import { MilestoneCourseParamsModel, MilestoneModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import { ClassService } from '@providers/service/class/class.service';
import { MilestoneService } from '@providers/service/milestone/milestone.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';

@Component({
  selector: 'milestone-report',
  templateUrl: './milestone-report.component.html',
  styleUrls: ['./milestone-report.component.scss'],
})
export class MilestoneReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public milestone: MilestoneModel;
  public classDetail: ClassModel;
  public classId: string;
  public fwCode: string;
  public studentList: Array<ProfileModel>;
  public lessonLoaded: boolean;
  public courseId: string;
  public isStudentsLoaded: boolean;
  public scoreInPercentage: number;
  public performanceLoaded: boolean;
  public isThumbnailError: boolean;
  public teacherLessonParams: MilestoneCourseParamsModel;
  public milestoneIndex: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private performanceService: PerformanceService,
    private milestoneService: MilestoneService,
    private classService: ClassService,
    private modalService: ModalService
  ) { }

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
    const classPreference = this.classDetail.preference;
    this.fwCode = classPreference && classPreference.framework
      ? classPreference.framework
      : null;
    this.teacherLessonParams = {
      classId: this.classId,
      courseId: this.courseId,
      fwCode: this.fwCode,
      studentList: this.studentList,
      isTeacherView: true,
      milestoneId: this.milestone.milestoneId,
    }
    this.fetchLessons();
    this.getMilestonePerformance();
  }

  /**
   * @function openLessonReport
   * this Method is used to open milestone lesson report
   */
  public openLessonReport(event, lesson, lessonIndex) {
    event.stopPropagation();
    const context = {
      classDetail: this.classDetail,
      lesson,
      lessonIndex
    };
    this.modalService.openModal(MilestoneLessonReportComponent, context, 'milestone-lesson-report');
  }

  /**
   * @function getMilestonePerformance
   * This Method is used to fetch class performance
   */
  public getMilestonePerformance() {
    this.performanceLoaded = false;
    this.scoreInPercentage = this.milestone.performance && this.milestone.performance.averageScore !== null ?
      this.milestone.performance.averageScore : null;
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
    if (!this.milestone.lessons) {
      this.milestoneService.getMilestoneLessons(this.teacherLessonParams).then((response) => {
        this.milestone.lessons = response;
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
      this.performanceService.getMilestoneLessonPerformance(this.teacherLessonParams).then((lessonPerformance: Array<MilestonePerformanceContentModel>) => {
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
