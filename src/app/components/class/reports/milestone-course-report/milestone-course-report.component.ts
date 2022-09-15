import { Component, OnInit } from '@angular/core';
import { MilestonePerformanceContentModel } from '@app/models/performance/performance';
import { MilestoneReportComponent } from '@components/class/reports/milestone-report/milestone-report.component';
import { ClassModel } from '@models/class/class';
import { CourseDetailModel } from '@models/course/course';
import { MilestoneCourseParamsModel, MilestoneModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import { ClassService } from '@providers/service/class/class.service';
import { CourseService } from '@providers/service/course/course.service';
import { MilestoneService } from '@providers/service/milestone/milestone.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';

@Component({
  selector: 'milestone-course-report',
  templateUrl: './milestone-course-report.component.html',
  styleUrls: ['./milestone-course-report.component.scss'],
})
export class MilestoneCourseReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public milestones: Array<MilestoneModel>;
  public classDetail: ClassModel;
  public classId: string;
  public fwCode: string;
  public studentList: Array<ProfileModel>;
  public milestoneLoaded: boolean;
  public courseId: string;
  public isStudentsLoaded: boolean;
  public scoreInPercentage: number;
  public performanceLoaded: boolean;
  public isThumbnailError: boolean;
  public teacherMilestoneParams: MilestoneCourseParamsModel;
  public course: CourseDetailModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private courseService: CourseService,
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
    this.teacherMilestoneParams = {
      classId: this.classId,
      courseId: this.courseId,
      fwCode: this.fwCode,
      studentList: this.studentList,
      isTeacherView: true
    }
    this.course = this.getCourse();
    this.fetchMilestones();
    this.fetchClassPerformance();
  }

  /**
   * @function openMilestoneReport
   * this Method is used to open milestone report
   */
  public openMilestoneReport(event, milestone, milestoneIndex) {
    event.stopPropagation();
    const context = {
      classDetail: this.classDetail,
      milestone,
      milestoneIndex
    };
    this.modalService.openModal(MilestoneReportComponent, context, 'milestone-report');
  }

  /**
   * @function getCourse
   * this Method is used to get the course
   */
  public getCourse() {
    return this.courseService.classCourse ? this.courseService.classCourse : null;
  }

  /**
   * @function fetchClassPerformance
   * This Method is used to fetch class performance
   */
  public fetchClassPerformance() {
    this.performanceLoaded = false;
    const classId = this.classId;
    const courseId = this.courseId;
    this.classService.fetchClassPerformance([{
      classId,
      courseId
    }]).then((classPerformance) => {
      this.scoreInPercentage = classPerformance && classPerformance[0].score !== null ?
        classPerformance[0].score : null;
      this.performanceLoaded = true;
    });
  }

  /**
   * @function getStudentList
   * this Method is used to get the student list
   */
  public getStudentList() {
    return this.classService.activeStudentList ? this.classService.activeStudentList : [];
  }

  /**
   * @function fetchMilestones
   * Method to fetch milestones
   */
  public fetchMilestones() {
    this.milestoneLoaded = false;
    this.milestoneService.getMilestones(this.teacherMilestoneParams).then((response) => {
      this.milestones = response;
      this.milestoneLoaded = true;
    });
  }

  /**
   * @function onOpenMilestonePanel
   * Method to used to open milestone panel
   */
  public onOpenMilestonePanel(milestoneIndex, milestone) {
    if (!milestone.studentList) {
      this.isStudentsLoaded = false;
      this.performanceService.getMilestonePerformance(this.teacherMilestoneParams).then((milestonePerformance: Array<MilestonePerformanceContentModel>) => {
        const milestonePerformanceData = milestonePerformance.filter((item) => item.milestoneId === milestone.milestoneId);
        milestone.studentList = this.getStudentList();
        if (milestonePerformanceData && milestonePerformanceData.length) {
          milestone.studentList.map((student) => {
            const studentPerformance = milestonePerformanceData.find((studPerformance) => studPerformance.userUid === student.id)
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
