import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService } from '@app/background-workers/services/worker.service';
import { OaMultiStudentReportComponent } from '@app/components/oa-multi-student-report/oa-multi-student-report.component';
import { TASK_RESULT_STATUS } from '@app/constants/download-constants';
import { NetworkService } from '@app/providers/service/network.service';
import { SyncService } from '@app/providers/service/sync.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { ItemsToGradeListComponent } from '@components/class/items-to-grade-list/items-to-grade-list.component';
import { JourneyStudentListComponent } from '@components/class/journey-student-list/journey-student-list.component';
import { CourseMapLessonReportComponent } from '@components/class/reports/course-map-lesson-report/course-map-lesson-report.component';
import { CourseMapUnitReportComponent } from '@components/class/reports/course-map-unit-report/course-map-unit-report.component';
import { MilestoneCollectionReportComponent } from '@components/class/reports/milestone-collection-report/milestone-collection-report.component';
import { MilestoneLessonReportComponent } from '@components/class/reports/milestone-lesson-report/milestone-lesson-report.component';
import { MilestoneReportComponent } from '@components/class/reports/milestone-report/milestone-report.component';
import { StudentPullUpComponent } from '@components/UI/pull-up/student-pull-up/student-pull-up.component';
import {
  CONTENT_TYPES,
  COURSE_MAP,
  MILESTONE,
  PLAYER_EVENT_SOURCE,
} from '@constants/helper-constants';
import { routerPathIdReplace } from '@constants/router-constants';
import { IonContent } from '@ionic/angular';
import {
  ClassMembersModel,
  ClassModel,
  CourseVisibilityModel,
} from '@models/class/class';
import { CourseDetailModel, CourseStructureModel } from '@models/course/course';
import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { MilestoneModel } from '@models/milestone/milestone';
import { ProfileModel } from '@models/profile/profile';
import {
  GradeItem,
  ItemToGradeQuestions,
  RubricQuestionItem,
} from '@models/rubric/rubric';
import { TaxonomySubjectModel } from '@models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { UnitSummaryModel } from '@models/unit/unit';
import { ClassService } from '@providers/service/class/class.service';
import { CollectionService } from '@providers/service/collection/collection.service';
import { CourseMapService } from '@providers/service/course-map/course-map.service';
import { CourseService } from '@providers/service/course/course.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { MilestoneService } from '@providers/service/milestone/milestone.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { StudentModalService } from '@providers/service/modal/student-modal/student-modal.service';
import { OfflineActivityService } from '@providers/service/offline-activity/offline-activity.service';
import { RubricService } from '@providers/service/rubric/rubric.service';
import { StudentService } from '@providers/service/student/student.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { cloneObject } from '@utils/global';
import axios from 'axios';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-journey',
  templateUrl: './journey.page.html',
  styleUrls: ['./journey.page.scss'],
})
export class JourneyPage implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  public activeView: string;
  public isToggled: boolean;
  public isToggledList: boolean;
  public units: Array<UnitSummaryModel>;
  public tabs: Array<{ label: string, type: string }>;
  public isCourseMapActive: boolean;
  public unitLoaded: boolean;
  public milestoneLoaded: boolean;
  public lessonLoaded: boolean;
  public collectionLoaded: boolean;
  public milestoneLessonLoaded: boolean;
  public milestoneCollectionLoaded: boolean;
  public questions: ItemToGradeQuestions;
  public classDetail: ClassModel;
  public milestones: Array<MilestoneModel>;
  public fwCode: string;
  public showStudentList: boolean;
  public showItemsToGrade: boolean;
  public classId: string;
  public classMembers: ClassMembersModel;
  public studentList: Array<ProfileModel>;
  public course: CourseDetailModel;
  public classGrade: MilestoneModel;
  public isShowLearningJourney: boolean;
  public isPremiumClass: boolean;
  public isLoaded: boolean;
  public notificationId: number;
  public itemsToGradeList: Array<any>;
  public courseStructure: CourseStructureModel;
  public subjectDetails: TaxonomySubjectModel;
  public classDetailSubscription: AnonymousSubscription;
  public tenantSettings: TenantSettingsModel;
  public routerQueryParamsSubscription: AnonymousSubscription;
  public activeStudentId: string;
  public courseVisibilities: CourseVisibilityModel;
  public isShowToggle: boolean;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public backgroundCourseMapContentsSubscription: AnonymousSubscription;
  public backgroundMilestonesTaskSubscription: AnonymousSubscription;
  public backgroundMilestoneLessonsSubscription: AnonymousSubscription;
  public backgroundUnit0ListSubscription: AnonymousSubscription;
  public backgroundMilestonePerformanceSubscription: AnonymousSubscription;
  public backgroundUnitsPerformanceSubscription: AnonymousSubscription;
  public backgroundClassPerformanceSubscription: AnonymousSubscription;

  @ViewChild(IonContent, { static: false }) public content: IonContent;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private route: ActivatedRoute,
    private taxonomyService: TaxonomyService,
    private studentModalService: StudentModalService,
    private lookupService: LookupService,
    private courseService: CourseService,
    private courseMapService: CourseMapService,
    private classService: ClassService,
    private modalService: ModalService,
    private milestoneService: MilestoneService,
    public rubricService: RubricService,
    private offlineActivityService: OfflineActivityService,
    private collectionService: CollectionService,
    private studentService: StudentService,
    private router: Router,
    private networkService: NetworkService,
    private zone: NgZone,
    private utilsService: UtilsService,
    private syncService: SyncService,
    private workerService: WorkerService
  ) {
    this.initialize();
  }

  /**
   * @function initialize
   * this Method is used to initialize the values
   */
  public initialize() {
    this.activeView = COURSE_MAP;
    this.isToggled = false;
    this.isLoaded = false;
    this.isToggledList = false;
    this.itemsToGradeList = [];
    this.showStudentList = false;
    this.showItemsToGrade = false;
    this.milestoneLoaded = false;
    this.unitLoaded = false;
    this.lessonLoaded = false;
    this.collectionLoaded = false;
    this.milestoneLessonLoaded = false;
    this.milestoneCollectionLoaded = false;
    this.routerQueryParamsSubscription = this.route.queryParams.subscribe(
      (queryParams) => {
        this.notificationId = queryParams['notificationId'];
        this.activeStudentId = queryParams['studentId'];
        if (this.notificationId) {
          if (this.itemsToGradeList?.length) {
            this.openItemsToGradeList();
          }
        }
      }
    );
  }

  // -------------------------------------------------------------------------
  // life cycle method

  public ngOnInit() {
    this.networkSubscription = this.networkService
      .onNetworkChange()
      .subscribe(() => {
        this.zone.run(() => {
          this.isOnline = this.utilsService.isNetworkOnline();
        });
      });
  }

  public ionViewDidEnter() {
    this.fetchTenantSettings();
    this.classDetailSubscription = this.classService.fetchClassDetails.subscribe(
      (classDetail) => {
        const classPreference = classDetail.preference
          ? classDetail.preference
          : null;
        this.fwCode = classPreference?.framework || null;
        this.classDetail = classDetail;
        this.classId = classDetail.id;
        this.isShowLearningJourney = !!classDetail.courseId;
        this.isPremiumClass = classDetail.isPremiumClass;
        this.activeView = this.isPremiumClass ? MILESTONE : COURSE_MAP;
        if (this.isShowLearningJourney) {
          this.loadData();
          this.fetchContentVisibility();
          if (this.course) {
            this.segmentChanged(this.activeView);
          }
        }
      }
    );
  }

  public ngOnDestroy() {
    this.classDetailSubscription.unsubscribe();
    this.routerQueryParamsSubscription.unsubscribe();
    this.networkSubscription.unsubscribe();
  }

  public ionViewWillLeave() {
    this.activeView = null;
  }

  // -------------------------------------------------------------------------
  // actions

  /**
   * @function loadData
   * this Method is used to load the data
   */
  public loadData() {
    this.course = this.getCourse();
    this.fetchClassMembersByClassId();
    const classPreference = this.classDetail?.preference || null;
    const subject = classPreference?.subject || null;
    if (this.isOnline) {
      this.fetchItemsToGradeQuestions();
      if (subject) {
        this.fetchSubject(subject);
      }
    }
  }

  /**
   * @function syncOfflineData
   * this Method is used to sync offline data
   */
  public syncOfflineData() {
    const classDetails = this.classDetail;
    this.syncCourseMapContents(classDetails);
    this.syncUnitsPerformance(classDetails);
    this.syncClassPerformance(classDetails);
    this.syncUnit0Lists(classDetails);
    if (classDetails.milestoneViewApplicable) {
      this.syncMilestoneContents(classDetails);
      this.syncMilestonePerformance(classDetails);
    }
  }

  /**
   * @function syncCourseMapContents
   * This method is used to sync the course map contents in the background task
   */
  private syncCourseMapContents(classDetails) {
    const backgroundCourseMapContentsTask = this.syncService.syncCourseMapContentData(
      classDetails
    );
    this.backgroundCourseMapContentsSubscription = this.workerService
      .startTask(backgroundCourseMapContentsTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundCourseMapContentsTask.jobs.find(
            (job) => job.id === completedJob.id
          );
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncUnitsPerformance
   * This method is used to sync the units performance in the background task
   */
  private syncUnitsPerformance(classDetails) {
    const backgroundUnitsPerformanceTask = this.syncService.syncUnitsPerformance(
      classDetails
    );
    this.backgroundUnitsPerformanceSubscription = this.workerService
      .startTask(backgroundUnitsPerformanceTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundUnitsPerformanceTask.jobs.find(
            (job) => job.id === completedJob.id
          );
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncMilestoneContents
   * This method is used to sync the milestone contents in the background task
   */
   private syncMilestoneContents(classDetails) {
    const backgroundMilestonesTask = this.syncService.syncMilestoneList(
      classDetails
    );
    this.backgroundMilestonesTaskSubscription = this.workerService
      .startTask(backgroundMilestonesTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundMilestonesTask.jobs.find(
            (job) => job.id === completedJob.id
          );
          currentJob.callback(completedJob.result);
        } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
          const milestones = completedJob.result
            ? completedJob.result.milestones
            : [];

          const currentMilestone = milestones.length
            ? milestones.find(
                (item) => item.grade_id === classDetails.gradeCurrent
              )
            : null;
            let currentMilestoneId = currentMilestone
            ? currentMilestone.milestone_id
            : '';
           if(currentMilestone === undefined) {
             currentMilestoneId = milestones[0].milestone_id;
           }
            const backgroundMilestoneLessonsTask = this.syncService.syncMilestoneLessons(
              classDetails,
              currentMilestoneId
            );
            this.backgroundMilestoneLessonsSubscription = this.workerService
              .startTask(backgroundMilestoneLessonsTask)
              .subscribe((performanceTaskResult) => {
                const completedStudentSubjectJob =
                  performanceTaskResult.currentCompletedJob;
                if (
                  completedStudentSubjectJob &&
                  performanceTaskResult.taskStatus ===
                    TASK_RESULT_STATUS.RUNNING
                ) {
                  const currentJob = backgroundMilestoneLessonsTask.jobs.find(
                    (job) => job.id === completedStudentSubjectJob.id
                  );
                  currentJob.callback(completedStudentSubjectJob.result);
                }
              });
        }
      });
  }

  /**
   * @function syncMilestonePerformance
   * This method is used to sync the milestone performace in the background task
   */
  private syncMilestonePerformance(classDetails) {
    const backgroundMilestonePerformanceTask = this.syncService.syncMilestonePerformance(
      classDetails
    );
    this.backgroundMilestonePerformanceSubscription = this.workerService
      .startTask(backgroundMilestonePerformanceTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundMilestonePerformanceTask.jobs.find(
            (job) => job.id === completedJob.id
          );
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function syncUnit0Lists
   * This method is used to sync the unit0 list in the background task
   */
  private syncUnit0Lists(classDetails) {
    const backgroundUnit0ListTask = this.syncService.syncUnit0List(
      classDetails
    );
    this.backgroundUnit0ListSubscription = this.workerService
      .startTask(backgroundUnit0ListTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundUnit0ListTask.jobs.find(
            (job) => job.id === completedJob.id
          );
          currentJob.callback(completedJob.result);
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
   * @function fetchSubject
   * This method is used to fetch subject
   */
  public fetchSubject(subject) {
    this.taxonomyService
      .fetchSubjectById(subject)
      .then((details) => {
        this.subjectDetails = details;
      })
      .catch(() => {
        this.subjectDetails = null;
      });
  }

  /**
   * @function scrollToContent
   * This method is used to scroll to the view
   */
  public scrollToContent(offsetTop) {
    this.content.scrollToPoint(0, offsetTop, 1000);
  }

  /**
   * @function onOpenCollectionReport
   * this Method is used to open collection report
   */
  public onOpenCollectionReport(event) {
    const collection = event.collection;
    const isOfflineActivity =
      collection.format === CONTENT_TYPES.OFFLINE_ACTIVITY;
    const context = {
      classDetail: this.classDetail,
      collection: event.collection,
      lesson: event.lesson
    };
    if (isOfflineActivity) {
      this.openOaReport(context);
    } else {
      this.openCollectionReport(context);
    }
  }

  /**
   * @function openCollectionReport
   * this Method is used to open collection report
   */
  public openCollectionReport(context) {
    this.modalService.openModal(
      MilestoneCollectionReportComponent,
      context,
      'milestone-collection-report'
    );
  }

  /**
   * @function openOaReport
   * this Method is used to open Oa report
   */
  public openOaReport(context) {
    this.modalService.openModal(
      OaMultiStudentReportComponent,
      context,
      'oa-multi-student-report'
    );
  }

  /**
   * @function openCourseMapCollectionReport
   * this Method is used to open collection report
   */
  public openCourseMapCollectionReport(event) {
    const unit = this.units[event.unitIndex];
    const lesson = event.lesson;
    lesson.unitId = unit.unitId;
    const collection = event.collection;
    const isOfflineActivity =
      collection.format === CONTENT_TYPES.OFFLINE_ACTIVITY;
    const context = {
      classDetail: this.classDetail,
      collection: event.collection,
      lesson
    };
    if (isOfflineActivity) {
      this.openOaReport(context);
    } else {
      this.openCollectionReport(context);
    }
  }

  /**
   * @function openMilestoneReport
   * this Method is used to open milestone report
   */
  public openMilestoneReport(event) {
    const context = {
      classDetail: this.classDetail,
      milestone: event.milestone,
      milestoneIndex: event.milestoneIndex,
    };
    this.modalService.openModal(
      MilestoneReportComponent,
      context,
      'milestone-report'
    );
  }

  /**
   * @function syncClassPerformance
   * This method is used to sync the class performance background task
   */
  private syncClassPerformance(classDetails) {
    const backgrounClassPerformanceTask = this.syncService.syncClassPerformance(
      classDetails
    );
    this.backgroundClassPerformanceSubscription = this.workerService
      .startTask(backgrounClassPerformanceTask)
      .subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgrounClassPerformanceTask.jobs.find(
            (job) => job.id === completedJob.id
          );
          currentJob.callback(completedJob.result);
        }
      });
  }

  /**
   * @function openLessonReport
   * this Method is used to open milestone lesson report
   */
  public openLessonReport(event) {
    const context = {
      classDetail: this.classDetail,
      lesson: event.lesson,
      lessonIndex: event.lessonIndex,
    };
    this.modalService.openModal(
      MilestoneLessonReportComponent,
      context,
      'milestone-lesson-report'
    );
  }

  /**
   * @function openCourseMapLessonReport
   * this Method is used to open milestone course map lesson report
   */
  public openCourseMapLessonReport(event) {
    const unit = this.units[event.unitIndex];
    const context = {
      classDetail: this.classDetail,
      lesson: event.lesson,
      unitId: unit.unitId,
      lessonIndex: event.lessonIndex,
      tenantSettings: this.tenantSettings,
    };
    this.modalService.openModal(
      CourseMapLessonReportComponent,
      context,
      'course-map-lesson-report'
    );
  }

  /**
   * @function openCourseMapUnitReport
   * this Method is used to open course map unit report
   */
  public openCourseMapUnitReport(item) {
    const context = {
      classDetail: this.classDetail,
      unit: item.unit,
      unitIndex: item.unitIndex,
    };
    this.modalService.openModal(
      CourseMapUnitReportComponent,
      context,
      'course-map-unit-report'
    );
  }

  /**
   * @function segmentChanged
   * this Method is used to change event of segment from child
   */
  public segmentChanged(tabType) {
    this.isCourseMapActive = tabType === COURSE_MAP;
    if (this.isCourseMapActive) {
      this.showStudentList = !this.isPremiumClass;
      this.fetchUnits();
    } else {
      const studentList = this.getStudentList();
      this.showStudentList = studentList && studentList.length > 0;
      this.fetchMilestones();
    }
  }

  /**
   * @function getCourse
   * this Method is used to get the course
   */
  public getCourse() {
    return this.courseService.classCourse
      ? cloneObject(this.courseService.classCourse)
      : null;
  }

  /**
   * @function getStudentList
   * this Method is used to get the student list
   */
  public getStudentList() {
    return this.classService.activeStudentList
      ? cloneObject(this.classService.activeStudentList)
      : [];
  }

  /**
   * @function toggleLesson
   * this Method is used to lesson panel toggle
   */
  public toggleLesson(isToggled) {
    this.isToggled = isToggled;
  }

  /**
   * @function openStudentList
   * this Method is used to open student list
   */
  public openStudentList() {
    const classMembers = this.sortStudentList(this.studentList);
    const context = {
      classMembers,
      classDetail: this.classDetail,
      courseId: this.course.id,
      fwCode: this.fwCode,
      showItemsToGrade: this.showItemsToGrade,
    };
    this.modalService
      .openModal(JourneyStudentListComponent, context, 'journey-student-list')
      .then((response) => {
        if (response) {
          this.openStudentMilestone(response);
        }
      });
  }

  /**
   * @function openStudentMilestone
   * This method is used to open student milestone
   */
  public openStudentMilestone(item) {
    const context = item.context;
    const className = item.className;
    context.courseVisibilities = this.courseVisibilities;
    this.studentModalService
      .openModal(StudentPullUpComponent, context, className)
      .then((response: { isClose: boolean }) => {
        if (response && response.isClose) {
          if (this.activeStudentId) {
            this.navigateToDataByMilestonePage();
          } else {
            this.openStudentList();
          }
        }
      });
  }

  /**
   * @function sortStudentList
   * This method is used to sort student list
   */
  public sortStudentList(studentList) {
    return studentList.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }

  /**
   * @function openItemsToGradeList
   * this Method is used to open items to grade list
   */
  public openItemsToGradeList() {
    const context = {
      gradingList: this.itemsToGradeList,
    };
    this.notificationId = null;
    this.modalService
      .openModal(ItemsToGradeListComponent, context, 'journey-items-grade-list')
      .then(() => {
        this.fetchItemsToGradeQuestions();
      });
  }

  /**
   * @function onToggleList
   * this Method is used to toggle list
   */
  public onToggleList() {
    this.isToggledList = !this.isToggledList;
  }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function fetchUnits
   * Method to fetch units
   */
  public fetchUnits() {
    this.unitLoaded = false;
    const requestParams = {
      classId: this.classId,
      courseId: this.course.id,
      isTeacherView: true,
      studentList: this.studentList
    };
    this.courseMapService.getUnitsByCourseId(requestParams).then((response) => {
      this.units = response;
      this.unitLoaded = true;
    });
  }

  /**
   * @function fetchMilestones
   * Method to fetch milestones
   */
  public fetchMilestones() {
    this.milestoneLoaded = false;
    const requestParams = {
      classId: this.classId,
      courseId: this.course.id,
      fwCode: this.fwCode,
      studentList: this.studentList,
      isTeacherView: true
    };
    this.milestoneService.getMilestones(requestParams).then((milestones) => {
      this.milestoneLoaded = true;
      this.isShowToggle = !!milestones.length;
      if (!milestones.length) {
        this.activeView = COURSE_MAP;
        this.segmentChanged(this.activeView);
      }
      this.milestones = milestones;
      this.classGrade = milestones.find((milestone) => {
        return milestone.gradeId === this.classDetail.gradeCurrent;
      });
    });
  }

  /**
   * @function fetchItemsToGradeQuestions
   * Method to fetch the items to grade questions
   */
  public fetchItemsToGradeQuestions() {
    this.itemsToGradeList = [];
    const rubricItemContext = this.getRubricItemContext();
    const rubricQuestionItemContext = this.getRubricQuestionItemContext();
    return axios
      .all<{}>([
        this.rubricService.fetchRubricItems(rubricItemContext),
        this.rubricService.fetchRubricQuestionsItems(
          rubricQuestionItemContext,
          false
        ),
      ])
      .then(
        axios.spread(
          (
            oaGradeItems: Array<GradeItem> = [],
            gradeItems: Array<RubricQuestionItem> = []
          ) => {
            let oaGradeItemsPromises = [];
            let gradeItemPromises = [];
            if (oaGradeItems.length) {
              oaGradeItemsPromises = oaGradeItems.map((oaItem) => {
                return this.createOaGradeItemObject(oaItem);
              });
            }
            if (gradeItems.length) {
              gradeItemPromises = gradeItems.map((item) => {
                const customPromise = this.createGradeItemObject(item);
                return customPromise;
              });
            }
            Promise.all([...gradeItemPromises, ...oaGradeItemsPromises]).then(
              (gradeList) => {
                this.itemsToGradeList = gradeList;
                if (this.notificationId && this.itemsToGradeList?.length) {
                  this.openItemsToGradeList();
                }
              }
            );
          }
        )
      );
  }

  /**
   * @function createGradeItemObject
   * Method to create grade item object
   */
  public createGradeItemObject(item) {
    const unitId = item.unitId;
    const lessonId = item.lessonId;
    const collectionId = item.collectionId;
    const collectionType = item.collectionType;
    const isAssessment =
      !collectionType || collectionType === CONTENT_TYPES.ASSESSMENT;
    const resourceId = item.resourceId;
    const studentCount = item.studentCount;
    let collectionPromise;
    if (isAssessment) {
      collectionPromise = this.collectionService.fetchCollectionById(
        collectionId,
        CONTENT_TYPES.ASSESSMENT
      );
    } else {
      collectionPromise = this.collectionService.fetchCollectionById(
        collectionId,
        CONTENT_TYPES.COLLECTION
      );
    }
    if (collectionPromise) {
      return collectionPromise.then((collection) => {
        const content = collection.content.find(
          (contentItem) => contentItem.id === resourceId
        );
        return {
          classId: this.classId,
          courseId: this.course.id,
          dcaContentId: collectionId,
          content,
          collection,
          studentCount,
          contentType: collectionType,
          activityDate: null,
          isAssessmentGrading: true,
          isDCAContext: false,
          unitId,
          lessonId,
        };
      });
    }
    return;
  }

  /**
   * @function createOaGradeItemObject
   * Method to create oa grade item object
   */
  public createOaGradeItemObject(item) {
    const activityId = item.collectionId;
    const contentType = item.contentType;
    const studentCount = item.studentCount;
    return this.offlineActivityService
      .readActivity(activityId)
      .then((content) => {
        return {
          classId: this.classId,
          courseId: this.course.id,
          dcaContentId: content.id,
          content,
          contentType,
          studentCount,
          collection: content,
          activityDate: null,
          isAssessmentGrading: false,
          isDCAContext: false,
          unitId: item.unitId,
          lessonId: item.lessonId,
        };
      });
  }

  /**
   * @function getRubricItemContext
   * Method to fetch rubric item context
   */
  public getRubricItemContext() {
    return {
      classId: this.classId,
      courseId: this.course.id,
      type: 'oa',
      source: PLAYER_EVENT_SOURCE.COURSE_MAP,
    };
  }

  /**
   * @function getRubricQuestionItemContext
   * Method to get rubric question item context
   */
  public getRubricQuestionItemContext() {
    return {
      classId: this.classId,
      courseId: this.course.id,
    };
  }

  /**
   * @function fetchClassMembersByClassId
   * Method to fetch the class members by id
   */
  public async fetchClassMembersByClassId() {
    this.classService
      .fetchClassMembersByClassId(this.classId)
      .then((classMembersResponse: ClassMembersModel) => {
        this.classMembers = classMembersResponse;
        this.studentList = this.getStudentList();
        this.isLoaded = true;
        if (this.activeStudentId) {
          const studentList = this.sortStudentList(this.studentList);
          const user = studentList.find(
            (item) => item.id === this.activeStudentId
          );
          if (user) {
            this.studentService.setSelectedStudent(user);
            const context = {
              classDetail: this.classDetail,
              courseId: this.course.id,
              fwCode: this.fwCode,
              user,
            };
            const className = this.showItemsToGrade
              ? 'student-and-grade-milestone-modal'
              : 'student-milestone-modal';
            this.openStudentMilestone({
              context,
              className
            });
          }
        }
      });
  }

  // -------------------------------------------------------------------------
  // output emitter methods

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
        courseId: this.course.id,
        unitId: event.unitId,
        studentList: this.studentList,
        isTeacherView: true,
        lessons: unit.lessons
      };
      this.courseMapService
        .getUnitLessons(reqParams)
        .then((lessonSummary: Array<UnitLessonSummaryModel>) => {
          unit.lessons = lessonSummary;
          this.lessonLoaded = true;
        });
    } else {
      this.lessonLoaded = true;
    }
  }

  /**
   * @function onOpenLessonPanel
   * this Method is used to open lesson panel
   */
  public onOpenLessonPanel(event) {
    if (this.isOnline) {
      const unit = this.units[event.unitIndex];
      const lesson = unit.lessons[event.lessonIndex];
      if (!lesson.collections || unit.isUnit0) {
        this.collectionLoaded = false;
        const reqParams = {
          classId: this.classId,
          courseId: this.course.id,
          unitId: unit.unitId,
          lessonId: event.lessonId,
          studentList: this.studentList,
          isTeacherView: true,
          collections: lesson.collections,
        };
        this.courseMapService
          .getUnitCollections(reqParams)
          .then((collectionSummary) => {
            this.courseMapService.assignVisibilitySettings(
              reqParams.unitId,
              reqParams.lessonId,
              collectionSummary,
              this.courseVisibilities
            );
            lesson.collections = collectionSummary;
            this.collectionLoaded = true;
          });
      } else {
        this.collectionLoaded = true;
      }
    }
  }

  /**
   * @function onOpenMilestonePanel
   * Method to open milestone and fetch lessons
   */
  public onOpenMilestonePanel(event) {
    const milestone = this.milestones[event.milestoneIndex];
    if (!milestone.lessons || milestone.isUnit0) {
      this.milestoneLessonLoaded = false;
      const reqParams = {
        classId: this.classId,
        courseId: this.course.id,
        fwCode: this.fwCode,
        milestoneId: event.milestoneId,
        studentList: this.studentList,
        isTeacherView: true,
        lessons: milestone.lessons || null
      };
      this.milestoneService.getMilestoneLessons(reqParams).then((response) => {
        milestone.lessons = response;
        this.milestoneLessonLoaded = true;
      });
    } else {
      this.milestoneLessonLoaded = true;
    }
  }

  /**
   * @function onOpenMilestoneLessonPanel
   * Method to open milestone lesson panel
   */
  public onOpenMilestoneLessonPanel(event) {
    const milestone = this.milestones[event.milestoneIndex];
    const lesson = milestone.lessons[event.lessonIndex];
    if (!lesson.collections || milestone.isUnit0) {
      this.milestoneCollectionLoaded = false;
      const reqParams = {
        classId: this.classId,
        courseId: this.course.id,
        unitId: lesson.unitId,
        lessonId: event.lessonId,
        studentList: this.studentList,
        isTeacherView: true,
        collections: lesson.collections || null,
      };
      this.courseMapService
        .getUnitCollections(reqParams)
        .then((collectionSummary) => {
          lesson.collections = collectionSummary;
          this.milestoneCollectionLoaded = true;
        });
    } else {
      this.milestoneCollectionLoaded = true;
    }
  }

  /**
   * @function navigateToDataByMilestonePage
   * This method is used to navigate to data by milestone page
   */
  public navigateToDataByMilestonePage() {
    const dataByMilestone = routerPathIdReplace(
      'dataByMilestone',
      this.classId
    );
    this.router.navigate([dataByMilestone]);
  }

  /**
   * @function fetchContentVisibility
   * This method is used to fetch content visibility
   */
  public fetchContentVisibility() {
    const classId = this.classId;
    this.classService
      .fetchCourseMapContents(classId)
      .then((visibilityContents: CourseVisibilityModel) => {
        this.courseVisibilities = visibilityContents;
      });
  }

  /**
   * @function onToggleVisibility
   * This method is used to assign the visiblity settings
   */
  public onToggleVisibility(event) {
    const classId = this.classId;
    if (event.collection) {
      const collection = event.collection;
      collection.isVisible = !collection.isVisible;
      const visibilityObj = {
        id: collection.id,
        visible: collection.isVisible ? 'on' : 'off'
      };
      const params = {
        classId,
        contents: [visibilityObj],
        type:'collection'
      };
      this.classService.updateContentVisibility(params);
    }
    else if (event.units) {
      const unit = event.units;
      unit.isVisible = !unit.isVisible;
      const visibilityObj = {
        id: unit.unitId,
        visible: unit.isVisible ? 'on' : 'off'
      };
      const params = {
        classId,
        contents: [visibilityObj],
        type:'unit'
      };
      this.classService.updateContentVisibility(params);
    }
    else {
      const lesson = event.lesson;
      lesson.isVisible = !lesson.isVisible;
      const visibilityObj = {
        id: lesson.lessonId,
        visible: lesson.isVisible ? 'on' : 'off'
      };
      const params = {
        classId,
        contents: [visibilityObj],
        type:'lesson'
      };
      this.classService.updateContentVisibility(params);
    }
  }
}
