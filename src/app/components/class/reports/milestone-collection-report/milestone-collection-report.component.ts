import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CompetenciesStrugglingPerformanceModel } from '@app/models/competency/competency';
import { NetworkService } from '@app/providers/service/network.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { ClassModel } from '@models/class/class';
import {
  CollectionsModel,
  UnitCollectionSummaryModel
} from '@models/collection/collection';
import { LessonModel } from '@models/lesson/lesson';
import { MilestoneCourseParamsModel } from '@models/milestone/milestone';
import { OaGradeItemModel } from '@models/offline-activity/offline-activity';
import { ProfileModel } from '@models/profile/profile';
import { CollectionProvider } from '@providers/apis/collection/collection';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { ReportService } from '@providers/service/report/report.service';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { SearchSuggestionsComponent } from '../../search-suggestions/search-suggestions.component';

@Component({
  selector: 'milestone-collection-report',
  templateUrl: './milestone-collection-report.component.html',
  styleUrls: ['./milestone-collection-report.component.scss']
})
export class MilestoneCollectionReportComponent implements OnInit, OnDestroy {
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
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public studentPerformance: Array<CompetenciesStrugglingPerformanceModel> = [];

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private collectionProvider: CollectionProvider,
    private reportService: ReportService,
    private performanceService: PerformanceService,
    private classService: ClassService,
    private modalService: ModalService,
    private networkService: NetworkService,
    private zone: NgZone,
    private utilsService: UtilsService
  ) {}

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.networkSubscription = this.networkService
      .onNetworkChange()
      .subscribe(() => {
        this.zone.run(() => {
          this.isOnline = this.utilsService.isNetworkOnline();
        });
      });
    this.initialize();
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
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
    this.fwCode =
      classPreference && classPreference.framework
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
    };
    this.fetchCollections();
    this.getCollectionPerformance();
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
      collectionId: collection.id
    };
    this.reportService.showReport(context);
  }

  /**
   * @function getCollectionPerformance
   * This Method is used to fetch class performance
   */
  public getCollectionPerformance() {
    this.performanceLoaded = false;
    this.scoreInPercentage =
      this.collection.performance &&
      this.collection.performance.scoreInPercentage !== null
        ? this.collection.performance.scoreInPercentage
        : null;
    this.timeSpent =
      this.collection.performance && this.collection.performance.timespent;
    this.performanceLoaded = true;
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
   * @function fetchCollections
   * Method to fetch milestones
   */
  public fetchCollections() {
    this.collectionLoaded = false;
    this.collectionProvider
      .fetchCollectionById(this.collection.id, this.collection.format)
      .then((assessmentResponse) => {
        this.collectionContent = assessmentResponse;
        this.collectionLoaded = true;
      });
  }

  /**
   * @function onOpenCollectionPanel
   * Method to used to open collection panel
   */
  public onOpenCollectionPanel(content) {
    if (!content.studentList && this.isOnline) {
      this.isStudentsLoaded = false;
      this.teacherCollectionParams.contentId = this.collection.id;
      this.performanceService
        .getMilestonesCollectionPerformance(this.teacherCollectionParams)
        .then((collectionPerformance) => {
          const collectionPerformanceData = collectionPerformance.filter(
            (item) => item.contenId === content.id
          );
          content.studentList = this.getStudentList();
          if (collectionPerformanceData && collectionPerformanceData.length) {
            content.studentList.map((student) => {
              const studentPerformance = collectionPerformanceData.find(
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

  /**
   * @function onSelectStudent
   * This method help to select the students to suggest
   */
  public onSelectStudent(student: ProfileModel, content){
    if (student.performance && student.performance.timespent) {
      student.isSelected = !student.isSelected;
      const selectedStudents = content.studentList.filter(item => item.isSelected);
      content.isSelected = selectedStudents.length === content.studentList.length;
      this.studentPerformance = selectedStudents.map(this.parseStudentPerformance);
    }
  }

  /**
   * @function onSelectAll
   * This method help to select all the student
   */
  public onSelectAll(content) {
    content.isSelected = !content.isSelected;
    const selectedStudents = content.studentList.map(item => {
      if(item.performance && item.performance.timespent) {
        item.isSelected = content.isSelected
      }
      return item;
    }).filter(item => item.isSelected);
    this.studentPerformance = selectedStudents.map(this.parseStudentPerformance);
  }

  /**
   * @function parseStudentPerformance
   * This method help to make the student performance object
   */
  public parseStudentPerformance(student: ProfileModel) {
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        displayName: student.fullName,
        thumbnail: student.thumbnail,
        username: student.username,
        performanceScore: student.performance ? student.performance.scoreInPercentage : null
      }
  }

  /**
   * @function onClickSuggestion
   * This Method is used to get suggestion data
   */
   public onClickSuggestion() {
    const params = {
      studentsPerfomance: this.studentPerformance,
      classId: this.classId,
      selectedCompetency: {
        code: this.collectionContent.gutCodes[0]
      }
    };
    this.modalService.openModal(SearchSuggestionsComponent,params,'suggstion-pullup');
  }
}
