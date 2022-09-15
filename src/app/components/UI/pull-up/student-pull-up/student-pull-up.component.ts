import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NetworkService } from '@app/providers/service/network.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { COURSE_MAP, MILESTONE, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { IonContent, NavParams } from '@ionic/angular';
import { ClassModel, CourseVisibilityModel } from '@models/class/class';
import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { MilestoneLocationModel } from '@models/location/location';
import { MilestoneModel, SkippedContentModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { UnitSummaryModel } from '@models/unit/unit';
import { CourseMapService } from '@providers/service/course-map/course-map.service';
import { LocationService } from '@providers/service/location/location.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { MilestoneService } from '@providers/service/milestone/milestone.service';
import { StudentModalService } from '@providers/service/modal/student-modal/student-modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { StudentService } from '@providers/service/student/student.service';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'nav-student-pull-up',
  templateUrl: './student-pull-up.component.html',
  styleUrls: ['./student-pull-up.component.scss'],
})
export class StudentPullUpComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public userDetail: ProfileModel;
  public avatarSize: number;
  public classDetail: ClassModel;
  public classId: string;
  public courseId: string;
  public fwCode: string;
  public subject: string;
  public isMilestoneView: boolean;
  public units: Array<UnitSummaryModel>;
  public unitLoaded: boolean;
  public milestoneLoaded: boolean;
  public lessonLoaded: boolean;
  public collectionLoaded: boolean;
  public isPremiumClass: boolean;
  public route0Applicable: boolean;
  public isPublicClass: boolean;
  public isThumbnailError: boolean;
  public isOnline: boolean;
  public milestoneViewApplicable: boolean;
  public milestones: Array<MilestoneModel>;
  public userId: string;
  public skippedContents: SkippedContentModel
  public tenantSettings: TenantSettingsModel;
  public currentLocation: MilestoneLocationModel;
  public selectedStudentSubscription: AnonymousSubscription;
  public networkSubscription: AnonymousSubscription;
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  public courseVisibilities: CourseVisibilityModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navParams: NavParams,
    private courseMapService: CourseMapService,
    private studentService: StudentService,
    private studentModalService: StudentModalService,
    private milestoneService: MilestoneService,
    private lookupService: LookupService,
    private locationService: LocationService,
    private reportService: ReportService,
    private networkService: NetworkService,
    private zone: NgZone,
    private utilsService: UtilsService
  ) {
    this.avatarSize = 48;
    this.userDetail = this.navParams.get('user');
    this.classDetail = this.navParams.get('classDetail');
    this.courseId = this.navParams.get('courseId');
    this.fwCode = this.navParams.get('fwCode');
    this.courseVisibilities = this.navParams.get('courseVisibilities');
  }

  // -------------------------------------------------------------------------
  // life cycle methods

  public ngOnInit() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
    this.loadData();
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    this.fetchTenantSettings();
    this.subject = this.classDetail.preference ? this.classDetail.preference.subject : null;
    this.isPremiumClass = this.classDetail.isPremiumClass;
    this.milestoneViewApplicable = this.classDetail.milestoneViewApplicable;
    this.classId = this.classDetail.id;
    this.userId = this.userDetail.id;
    this.selectedStudentSubscription = this.studentService.onSelectedStudent.subscribe((student) => {
      if (student) {
        this.userDetail = student;
        this.userId = student.id;
        const toggleType = this.isPremiumClass ? MILESTONE : COURSE_MAP;
        this.fetchCurrentLocation();
        this.segmentChanged(toggleType);
      }
    });
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public async fetchTenantSettings() {
    this.tenantSettings = await this.lookupService.fetchTenantSettings();
  }

  /**
   * @function fetchCurrentLocation
   * This method is used to get current location list
   */
  public async fetchCurrentLocation() {
    if (this.fwCode) {
      this.currentLocation = await this.locationService.getStudentCurrentLocation(this.classId, this.courseId, this.fwCode, this.userId) as MilestoneLocationModel;
    }
  }

  /**
   * @function fetchRescopeContents
   * This method is used to trigger rescoped contents
   */
  public async fetchRescopeContents() {
    this.skippedContents = await this.milestoneService.fetchSkippedContents(this.classId, this.courseId, this.userId);
  }

  /**
   * @function fetchStudentMilestones
   * This method is used to fetch student milestones
   */
  public fetchMilestones() {
    this.milestoneLoaded = false;
    if (this.fwCode) {
      return this.milestoneService.fetchStudentMilestone(this.userId).then((milestones) => {
        this.milestones = milestones;
        this.milestoneLoaded = true;
      });
    } else {
      this.milestoneLoaded = true;
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function segmentChanged
   * this Method is used to change event of segment from child
   */
  public segmentChanged(tabType) {
    this.isMilestoneView = tabType === MILESTONE;
    if (this.isMilestoneView) {
      if (this.milestoneViewApplicable) {
        this.fetchRescopeContents();
        this.fetchMilestones();
      }
    } else {
      this.fetchStudentCourseMap();
    }
  }

  /**
   * @function fetchStudentCourseMap
   * this Method is used to fetch student course map
   */
  public fetchStudentCourseMap() {
    this.unitLoaded = false;
    const reqParams = {
      classId: this.classId,
      courseId: this.courseId,
      studentId: this.userId,
      isTeacherView: false
    };
    this.courseMapService.getUnitsByCourseId(reqParams).then((response) => {
      this.units = response;
      this.unitLoaded = true;
    });
  }

  /**
   * @function onOpenUnitPanel
   * this Method is used to open unit panel
   */
  public onOpenUnitPanel(event) {
    const unit = this.units[event.unitIndex];
    if (!unit.lessons || unit.isUnit0) {
      this.lessonLoaded = false;
      const reqParams = {
        classId: this.classId,
        courseId: this.courseId,
        unitId: event.unitId,
        studentId: this.userId,
        isTeacherView: false,
        lessons: unit.lessons
      };
      this.courseMapService.getUnitLessons(reqParams).then((lessonSummary: Array<UnitLessonSummaryModel>) => {
        unit.lessons = lessonSummary;
        this.lessonLoaded = true;
      });
    }
  }

  /**
   * @function onOpenLessonPanel
   * this Method is used to open lesson panel
   */
  public onOpenLessonPanel(event) {
    const unit = this.units[event.unitIndex];
    const lesson = unit.lessons[event.lessonIndex];
    if (!lesson.collections || unit.isUnit0) {
      this.collectionLoaded = false;
      const requestParams = {
        classId: this.classId,
        courseId: this.courseId,
        unitId: unit.unitId,
        lessonId: event.lessonId,
        studentId: this.userId,
        isTeacherView: false,
        isCourseMap: true,
        skippedContents: this.skippedContents,
        collections: lesson.collections
      };
      this.courseMapService.getUnitCollections(requestParams)
        .then((collectionSummary) => {
          this.courseMapService.assignVisibilitySettings(requestParams.unitId, requestParams.lessonId, collectionSummary, this.courseVisibilities)
          lesson.collections = collectionSummary;
          this.collectionLoaded = true;
        });
    }
  }

  /**
   * @function toggleLesson
   * this Method is used to lesson panel toggle
   */
  public toggleLesson(event) {
    // this.isToggled = event.detail.checked;
  }

  /**
   * @function closePullUp
   * This method is used to close pull up
   */
  public closePullUp() {
    this.studentModalService.dismissModal({ isClose: true });
    this.studentService.clearState();
    this.selectedStudentSubscription.unsubscribe();
  }

  /**
   * @function scrollToCollection
   * This method is used to scroll to the view
   */
  public scrollToCollection(offsetTop) {
    this.content.scrollToPoint(0, offsetTop, 1000);
  }

  /**
   * @function onScroll
   * This method is used after scrolls
   */
  public onScroll() {
    if (this.isMilestoneView) {
      const contentElement = this.content['el'];
      const currentMilestoneElement = contentElement.querySelector(
        '.milestone-panel .mat-expanded'
      );
      if (currentMilestoneElement) {
        const firstLessonElement = currentMilestoneElement.querySelector(
          '.lesson-panel:first-child'
        );
        if (firstLessonElement) {
          const lessonElementScrollPosition = firstLessonElement.getBoundingClientRect()
            .top;
          const svgElement = currentMilestoneElement.querySelector<HTMLElement>(
            '.milestone-icon-downward-line svg'
          );
          const calculatedElementHeight = 134;
          if (lessonElementScrollPosition < calculatedElementHeight) {
            svgElement.style.display = 'none';
          } else {
            svgElement.style.display = 'block';
          }
        }
      }
    }
  }

  /**
   * @function onClickStudentReport
   * This method used to call report function based on type
   */
  public onClickStudentReport(event) {
    const collection = event.collection;
    const lesson = event.lesson;
    const unit = this.units[event.unitIndex] || null;
    const context = {
      classId: this.classId,
      collectionType: collection.format,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      contentId: collection.id,
      studentId: this.userDetail.id,
      collectionId: collection.id,
      courseId: this.courseId,
      unitId: !unit ? lesson.unitId : unit.unitId,
      lessonId: lesson.lessonId
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
