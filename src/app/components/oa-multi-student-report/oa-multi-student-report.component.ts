import { Component, OnInit } from '@angular/core';
import { OfflineActivityProvider } from '@app/providers/apis/offline-activity/offline-activity';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { ClassModel } from '@models/class/class';
import { CollectionsModel, UnitCollectionSummaryModel } from '@models/collection/collection';
import { LessonModel } from '@models/lesson/lesson';
import { MilestoneCourseParamsModel } from '@models/milestone/milestone';
import { OaGradeItemModel } from '@models/offline-activity/offline-activity';
import { ProfileModel } from '@models/profile/profile';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ReportService } from '@providers/service/report/report.service';

@Component({
  selector: 'oa-multi-student-report',
  templateUrl: './oa-multi-student-report.component.html',
  styleUrls: ['./oa-multi-student-report.component.scss'],
})
export class OaMultiStudentReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public lesson: LessonModel;
  public collection: UnitCollectionSummaryModel;
  public collectionContent: CollectionsModel;
  public classDetail: ClassModel;
  public classId: string;
  public fwCode: string;
  public studentList: Array<ProfileModel>;
  public collectionLoaded: boolean;
  public courseId: string;
  public timeSpent: number;
  public isStudentsLoaded: boolean;
  public scoreInPercentage: number;
  public performanceLoaded: boolean;
  public isThumbnailError: boolean;
  public teacherCollectionParams: MilestoneCourseParamsModel;
  public oaContent: OaGradeItemModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService,
    private classService: ClassService,
    private modalService: ModalService,
    private offlineActivityProvider: OfflineActivityProvider,
    private performanceProvider: PerformanceProvider
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
    this.teacherCollectionParams = {
      classId: this.classId,
      courseId: this.courseId,
      fwCode: this.fwCode,
      studentList: this.studentList,
      lessonId: this.lesson.lessonId,
      unitId: this.lesson.unitId,
      contentType: this.collection.format
    }
    this.fetchCollections();
    this.getCollectionPerformance();
  }

  /**
   * @function getCollectionPerformance
   * This Method is used to fetch class performance
   */
  public getCollectionPerformance() {
    this.performanceLoaded = false;
    this.scoreInPercentage = this.collection.performance && this.collection.performance.scoreInPercentage !== null ?
    this.collection.performance.scoreInPercentage : null;
    this.timeSpent = this.collection.performance && this.collection.performance.timespent;
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
    this.offlineActivityProvider.readActivity(this.collection.id).then((OAResponse) => {
      this.oaContent = OAResponse;
      this.collectionLoaded = true;
    });
    const classId = this.classId;
    const lessonId = this.lesson.lessonId;
    const unitId = this.lesson.unitId;
    const courseId = this.courseId;
    const contentType = CONTENT_TYPES.ASSESSMENT;
    const contentId = this.collection.id;
    const studentList = this.studentList;
    this.performanceProvider.fetchUnitCollectionPerformance(classId, courseId, unitId, lessonId, contentType,true, studentList).then(performance => {
     const usersPerformed = performance.filter(content => content.assessmentId === contentId);
     studentList.forEach(student => {
       const currentUser = usersPerformed.find(user => user.userUid === student.id);
       if(currentUser) {
        student.performance = currentUser.performance;
       }
     });
     this.isStudentsLoaded = true;
    });
  }

  /**
   * @function closeReport
   * Method to close the milestone performance report
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function onClickStudentReport
   * This method used to call report function based on type
   */
  public onClickStudentReport(studentId) {
    const collection = this.collection;
    const context = {
      classId: this.classId,
      collectionType: this.collection.format,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      contentId: collection.id,
      studentId,
      collectionId: collection.id,
      courseId: this.courseId,
      unitId: this.lesson.unitId,
      lessonId: this.lesson.lessonId
    };
    this.reportService.showReport(context);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
