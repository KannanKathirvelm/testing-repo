import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { UnitCollectionSummaryModel } from '@app/models/collection/collection';
import { UnitLessonSummaryModel } from '@app/models/lesson/lesson';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { ReportService } from '@app/providers/service/report/report.service';
import { ASSESSMENT, COLLECTION, PATH_TYPES, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { MilestoneLocationModel } from '@models/location/location';
import { MilestoneModel, SkippedContentModel } from '@models/milestone/milestone';
import { TranslateService } from '@ngx-translate/core';
import { PortfolioProvider } from '@providers/apis/portfolio/portfolio';
import { CollectionService } from '@providers/service/collection/collection.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { MilestoneService } from '@providers/service/milestone/milestone.service';
import { Route0Service } from '@providers/service/route0/route0.service';
import { collapseAnimation } from 'angular-animations';
import axios from 'axios';

@Component({
  selector: 'nav-student-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class StudentMilestoneComponent implements OnInit, OnChanges {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public userId: string;
  @Input() public milestones: Array<MilestoneModel>;
  @Input() public currentLocation: MilestoneLocationModel;
  @Input() public frameworkCode: string;
  @Input() public disablePlay: boolean;
  @Input() public disableDefaultLessonToggle: boolean;
  @Input() public subjectCode: string;
  @Input() public isOnline: boolean;
  @Input() public skippedContents: SkippedContentModel;
  @Output() public scrollToCollection: EventEmitter<number> = new EventEmitter();
  @Output() public openCollectionReport: EventEmitter<{ collection: UnitCollectionSummaryModel, lesson: UnitLessonSummaryModel}> = new EventEmitter();
  public isToggleRescopedInfo: boolean;
  public isLessonLoading: boolean;
  public isCollectionLoading: boolean;
  public showAttempt: boolean;
  public milestoneList: Array<MilestoneModel>;
  public isCurrentMilestoneLoaded: boolean;
  public isCurrentCollectionLoaded: boolean;
  public lastPlayedCollectionId: string;
  public showFullCourse: boolean;
  public currentLessonExpandedIndex: number;
  public isAllContentsAreRescoped: boolean;
  public isMilestoneNotReady: boolean;
  public initialPerformance: number;
  public showDefaultExpanded: boolean;
  public milestoneRescopedMsg: string;
  private readonly STATUS_OPEN = 'open';
  private readonly STATUS_CLOSE = 'close';
  public hasUnit0 = false;

  constructor(
    private route0Service: Route0Service,
    private milestoneService: MilestoneService,
    private collectionService: CollectionService,
    private elementRef: ElementRef,
    private translate: TranslateService,
    private competencyService: CompetencyService,
    private portfolioProvider: PortfolioProvider,
    private reportService: ReportService,
    private parseService: ParseService
  ) {
    this.showFullCourse = false;
    this.showAttempt = false;
    this.isCurrentCollectionLoaded = false;
    this.isToggleRescopedInfo = false;
    this.initialPerformance = 0;
    this.milestoneRescopedMsg = this.translate.instant('MILESTONE_RESCOPED_CONTENT_MSG');
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    if (this.milestones) {
      this.milestoneList = [...this.milestones];
      const nonRescopedMilestoneList = this.milestoneList.filter((milestone) => {
        return !milestone.isRescoped;
      });
      nonRescopedMilestoneList.forEach((milestone, index) => {
        milestone.sequenceId = index + 1;
        return milestone;
      });
      this.hasUnit0 = !!this.milestoneList.find((milestone: any) => milestone.isUnit0);
      this.isToggleRescopedInfo = true;
      this.handleRescopedMilestone();
    }
    this.parseService.trackEvent(EVENTS.VIEW_MILESTONE);
  }

  public ngOnChanges(changes: SimpleChanges) {
    const milestones = this.milestones || [];
    if (changes.currentLocation && changes.currentLocation.currentValue && milestones) {
      const currentMilestoneId = changes.currentLocation.currentValue.milestoneId;
      const currentLessonId = changes.currentLocation.currentValue.lessonId;
      const currentUnitId = changes.currentLocation.currentValue.unitId;
      const currentItemIsRoute0 = changes.currentLocation.currentValue.pathType === PATH_TYPES.ROUTE;
      const currentMilestone = currentItemIsRoute0 ? this.findRoute0CurrentMilestone(currentUnitId, currentLessonId)
        : this.milestones.find((milestone) => {
          return milestone.milestoneId === currentMilestoneId;
        });
      if (currentMilestone) {
        this.showDefaultExpanded = false;
        currentMilestone.isCurrentMilestone = true;
        this.lastPlayedCollectionId =
          changes.currentLocation.currentValue.collectionId;
      }
    } else if (changes.milestones && changes.milestones.currentValue && !changes.milestones.firstChange) {
      this.milestoneList = [...this.milestones];
    } else {
      this.showDefaultExpanded = true;
    }
  }

  /**
   * @function onShowAttemptInfo
   * This method is used to show no. of attempts made by the student
   */
  public onShowAttemptInfo(event, collection, lesson, milestone) {
    event.stopPropagation();
    collection.isInfoOpen = !collection.isInfoOpen;
    if (!collection.activityAttempts) {
      this.portfolioProvider.fetchAllAttemptsByItem(collection.id, this.userId).then((attemptsListResponse) => {
        collection.activityAttempts = attemptsListResponse.usageData;
      });
    }
  }

  /**
   * @function toggleRescopedInfo
   * This method is used to toggle the rescoped info
   */
  public toggleRescopedInfo() {
    this.isToggleRescopedInfo = !this.isToggleRescopedInfo;
  }

  /**
   * @function handleRescopedMilestone
   * This method is used to handle the rescoped milestone
   */
  private handleRescopedMilestone() {
    if (this.milestoneList && this.milestoneList.length) {
      const rescopedContent = this.milestoneList.filter((milestone) => {
        return milestone.isRescoped;
      });
      this.isAllContentsAreRescoped = rescopedContent.length === this.milestoneList.length;
    } else {
      this.isAllContentsAreRescoped = false;
      this.isMilestoneNotReady = true;
    }
  }

  /**
   * @function onToggleToShowFullCourse
   * This method is used to toggle the full course
   */
  public async onToggleToShowFullCourse(event) {
    this.showFullCourse = event.detail.checked;
    if (this.showFullCourse) {
      this.handleFullCourse();
    }
  }

  /**
   * @function handleFullCourse
   * This method is used to handle the full course
   */
  private handleFullCourse() {
    this.milestones.forEach((milestone, milestoneIndex) => {
      const lessons = milestone.lessons || [];
      lessons.forEach((lesson, lessonIndex) => {
        if (lesson.collections) {
          this.handleCollectionPath(milestoneIndex, lessons, lessonIndex, lesson.collections);
        }
      });
      this.handleLessonsPath(lessons, milestoneIndex);
    });
  }

  /**
   * @function findRoute0CurrentMilestone
   * This method is used to find out milestone based on unit and lesson ids
   */
  private findRoute0CurrentMilestone(unitId, lessonId) {
    return this.milestones.find((milestone) => {
      const lesson = milestone.lessons.find((lessonItem) => {
        return lessonItem.unitId === unitId && lessonItem.lessonId === lessonId;
      });
      return lesson !== null;
    });
  }

  /**
   * @function onOpenMilestonePanel
   * This method is trigger when user clicks on milestone
   */
  public onOpenMilestonePanel(milestoneIndex, isRoute0) {
    const milestone = this.milestoneList[milestoneIndex];
    if ((isRoute0 && !milestone.isLessonLoaded) || milestone.isUnit0) {
      this.isLessonLoading = true;
      this.milestoneService.fetchLessonsPerformance(this.classId,
        milestone.milestoneId,
        this.courseId,
        this.frameworkCode,
        milestone.lessons,
        this.userId
      ).then(() => {
        milestone.isLessonLoaded = true;
        this.handleLessonsPath(milestone.lessons, milestoneIndex);
        this.isLessonLoading = false;
      });
    } else {
      if (!milestone.lessons) {
        this.isLessonLoading = true;
        this.fetchLessons(milestone, milestoneIndex).then((lessons) => {
          milestone.lessons = lessons;
          this.handleLessonsPath(lessons, milestoneIndex);
          this.isLessonLoading = false;
        });
      }
    }
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM);
  }

  /**
   * @function onOpenLessonPanel
   * This method is trigger when user clicks on lesson
   */
  public onOpenLessonPanel(milestoneIndex, lessonIndex, lesson, isRoute0) {
    const firstCollection = lesson.collections ? lesson.collections[0] : null;
    lesson.isFirstSuggestedCollection =
      firstCollection && firstCollection.isSuggestedContent;
    this.currentLessonExpandedIndex = lessonIndex;
    const milestone = this.milestoneList[milestoneIndex];
    const lessons = this.milestoneList[milestoneIndex].lessons;
    this.updateLessonPath(milestoneIndex, lessonIndex, this.STATUS_OPEN);
    if ((isRoute0 && !lesson.isCollectionLoaded) ||  milestone.isUnit0) {
      this.isCollectionLoading = true;
      axios.all([
        this.collectionService.fetchCollectionPerformance(
          this.classId,
          this.courseId,
          lesson.lessonId,
          lesson.unitId,
          ASSESSMENT,
          lesson.collections,
          this.userId
        ),
        this.collectionService.fetchCollectionPerformance(
          this.classId,
          this.courseId,
          lesson.lessonId,
          lesson.unitId,
          COLLECTION,
          lesson.collections,
          this.userId
        ),
        !milestone.isUnit0 ?  this.route0Service.fetchRoute0Suggestions(
          this.classId,
          this.courseId,
          lesson.unitId,
          lesson.lessonId,
          lesson.collections,
          this.userId
        ) : []
      ]).then(axios.spread(() => {
        lesson.isCollectionLoaded = true;
        this.handleCollectionPath(milestoneIndex, lessons, lessonIndex, lesson.collections);
        this.isCollectionLoading = false;
      }));
    } else {
      if (!lesson.collections) {
        this.isCollectionLoading = true;
        this.fetchCollections(lesson.lessonId, lesson.unitId).then((collections) => {
          lesson.collections = collections;
          this.handleCollectionPath(milestoneIndex, lessons, lessonIndex, lesson.collections);
          this.isCollectionLoading = false;
        });
      }
    }
  }

  /**
   * @function onCloseMilestonePanel
   * This method is trigger when panel closed
   */
  public onCloseMilestonePanel() {
    this.showMilestonePath();
  }

  /**
   * @function showMilestonePath
   * This method is used to show milestone path line
   */
  public showMilestonePath() {
    const milestoneElements = this.elementRef.nativeElement.querySelectorAll(
      '.milestone-panel'
    );
    milestoneElements.forEach((milestoneElement) => {
      const svgElement = milestoneElement.querySelector(
        '.milestone-icon-downward-line svg'
      );
      svgElement.style.display = 'block';
    });
  }

  /**
   * @function onExpandLesson
   * This method is trigger when lesson expands
   */
  public onExpandLesson(milestoneIndex, lessonIndex) {
    const milestoneElement = this.elementRef.nativeElement.querySelector(
      `.milestone-${milestoneIndex}`
    );
    const lessonElement = milestoneElement.querySelector(
      `.lesson-${lessonIndex}`
    );
    if (lessonElement) {
      const lessonElementPositions = lessonElement.getBoundingClientRect();
      const offsetTop =
        lessonElementPositions.top -
        milestoneElement.getBoundingClientRect().top -
        lessonElement.clientHeight;
      this.scrollToCollection.emit(offsetTop);
    }
  }

  /**
   * @function onCloseLessonPanel
   * This method will trigger when user close lesson panel
   */
  public onCloseLessonPanel(milestoneIndex, lessonIndex, lesson) {
    lesson.isFirstSuggestedCollection = false;
    this.updateLessonPath(milestoneIndex, lessonIndex, this.STATUS_CLOSE);
    if (lessonIndex === this.currentLessonExpandedIndex) {
      this.currentLessonExpandedIndex = null;
    }
  }

  /**
   * @function fetchLessons
   * This method is used to get lessons of milestone
   */
  public fetchLessons(milestone, milestoneIndex) {
    const reqParams = {
      classId: this.classId,
      milestoneId: milestone.milestoneId,
      courseId: this.courseId,
      fwCode: this.frameworkCode,
      studentId: this.userId,
      skippedContents: this.skippedContents
    }
    return this.milestoneService.getMilestoneLessons(
      reqParams
    );
  }

  /**
   * @function handleLessonsPath
   * This method is used to handle the lesson path
   */
  private handleLessonsPath(lessons, milestoneIndex) {
    const allLessons = lessons;
    lessons = this.showFullCourse ? lessons : lessons.filter(lesson => !lesson.isRescoped);
    const milestoneList = this.showFullCourse ? this.milestoneList : this.milestoneList.filter(milestone => !milestone.isRescoped);
    if (lessons && lessons.length) {
      if (milestoneIndex === milestoneList.length - 1) {
        const lastIndex = lessons.length - 1;
        const lastLesson = lessons[lastIndex];
        lastLesson.isLastLesson = true;
      }
      if (this.currentLocation) {
        const currentLessonId = this.currentLocation.lessonId;
        const currentLesson = lessons.find(
          (lesson) => lesson.lessonId === currentLessonId
        );
        if (currentLesson) {
          currentLesson.isCurrentLesson = true;
        }
      }
      this.findLessonCompetencyStats(allLessons);
    }
  }

  /**
   * @function findLessonCompetencyStats
   * This method is used to find lesson competency status
   */
  public findLessonCompetencyStats(lessons) {
    if(this.isOnline) {
      const lessonCompCodes = lessons.map((lesson) => {
        return lesson.txCompCode;
      }).filter(lesson => lesson);
      if(lessonCompCodes.length){
        this.competencyService.fetchCompletionStatus({
          classId: this.classId,
          competencyCodes: lessonCompCodes,
          subject: this.subjectCode,
          userId: this.userId
        }).then((statusResponse) => {
          lessons.forEach((lessonItem) => {
            const statusCode = statusResponse.find((item) => (item.competencyCode === lessonItem.txCompCode));
            if (statusCode) {
              lessonItem.status = statusCode.status;
            }
          });
        });
      }
    }
  }

  /**
   * @function findCollectionCompetencyStats
   * This method is used to find collection competency status
   */
  public findCollectionCompetencyStats(collections) {
    let gutCodes = [];
    const collectionIds = collections.map((collection) => {
      return collection.id;
    });
    collections.forEach((collection) => {
      gutCodes = gutCodes.concat(collection.gutCodes || []);
    });
    gutCodes = gutCodes.filter(item => !item);
    if (gutCodes && gutCodes.length) {
      axios.all([
        this.competencyService.fetchCompletionStatus({
          classId: this.classId,
          competencyCodes: gutCodes,
          subject: this.subjectCode,
          userId: this.userId
        }),
        this.portfolioProvider.fetchItemsExits(collectionIds, this.userId)
      ]).then(axios.spread((competencyStatus, itemExists) => {
        collections.find((collection) => {
          const competencyItem = competencyStatus.find((statusItem) => {
            return collection.gutCodes && collection.gutCodes.includes(statusItem.competencyCode);
          });
          if (competencyItem && itemExists[collection.id]) {
            collection.status = competencyItem.status;
            collection.isShowAttempts = itemExists[collection.id];
          }
        });
      }));
    }
  }

  /**
   * @function handleCollectionPath
   * This method is used to handle the collection path
   */
  private handleCollectionPath(milestoneIndex, lessons, lessonIndex, collections) {
    const milestone = this.milestoneList[milestoneIndex];
    const lesson = lessons[lessonIndex];
    lessons = this.showFullCourse ? lessons : lessons.filter(lessonList => !lessonList.isRescoped);
    collections = this.showFullCourse ? collections : collections.filter(collection => !collection.isRescoped);
    lessonIndex = lessons.indexOf(lesson);
    if (collections && collections.length) {
      this.findLastCollectionInMilestone(
        milestoneIndex,
        lessons,
        lessonIndex,
        collections
      );
      this.findLastCollectionInLesson(collections);
      this.findNextCollectionIsSuggestion(collections);
      if(!milestone.isUnit0){
        this.findFirstCollectionInLessonIsSuggestion(collections, lesson);
      }

      this.findCollectionCompetencyStats(collections);
      if (!this.isCurrentCollectionLoaded && this.currentLocation) {
        const currentCollectionId = this.currentLocation.collectionId;
        const currentCollection = collections.find(
          (collection) => collection.id === currentCollectionId
        );
        if (currentCollection) {
          currentCollection.isCurrentCollection = true;
          this.isCurrentCollectionLoaded = true;
          this.onExpandLesson(milestoneIndex, lessonIndex);
        }
      }
    }
  }

  /**
   * @function fetchCollections
   * This method is used to get collection list
   */
  public fetchCollections(lessonId, unitId) {
    return this.collectionService
      .fetchCollectionList(
        this.classId,
        this.courseId,
        lessonId,
        unitId,
        this.userId,
        this.skippedContents
      );
  }

  /**
   * @function updateLessonPath
   * This method is used to update the svg position based on accordion toggle
   */
  public updateLessonPath(milestoneIndex, lessonIndex, accordionStatus) {
    if (lessonIndex) {
      const prevLessonElement = this.elementRef.nativeElement.querySelector(
        `.milestone-${milestoneIndex} .lesson-${lessonIndex - 1}`
      );
      const prevSvgElement = prevLessonElement.querySelector(
        '.lesson-icon .lesson-icon-downward-line svg'
      );
      if (accordionStatus === this.STATUS_OPEN) {
        prevSvgElement.classList.add('next-lesson-expanded');
      } else {
        prevSvgElement.classList.remove('next-lesson-expanded');
      }
    } else {
      const currentMilestoneElement = this.elementRef.nativeElement.querySelector(
        `.milestone-${milestoneIndex}`
      );
      const currentSvgElement = currentMilestoneElement.querySelector(
        '.milestone-icon .milestone-icon-downward-line svg'
      );
      if (accordionStatus === this.STATUS_OPEN) {
        currentSvgElement.classList.add('lesson-expanded');
      } else {
        currentSvgElement.classList.remove('lesson-expanded');
      }
    }
  }

  /**
   * @function findLastCollectionInMilestone
   * This method is used to find last collection in the milestone
   */
  public findLastCollectionInMilestone(
    milestoneIndex,
    lessons,
    lessonIndex,
    collections
  ) {
    const milestoneList = this.showFullCourse ? this.milestoneList : this.milestoneList.filter(milestone => !milestone.isRescoped);
    if (milestoneIndex === milestoneList.length - 1) {
      const lastLessonIndex = lessons.length - 1;
      if (lastLessonIndex === lessonIndex) {
        const lastCollectionIndex = collections.length - 1;
        const lastCollection = collections[lastCollectionIndex];
        lastCollection.isLastCollectionInMilestone = true;
      }
    }
  }

  /**
   * @function findLastCollectionInLesson
   * This method is used to find last collection in the lesson
   */
  public findLastCollectionInLesson(collections) {
    const lastCollectionIndex = collections.length - 1;
    const lastCollection = collections[lastCollectionIndex];
    lastCollection.isLastCollectionInLesson = true;
  }

  /**
   * @function findNextCollectionIsSuggestion
   * This method is used to find next collection is suggested item
   */
  public findNextCollectionIsSuggestion(collections) {
    collections.map((collection, index) => {
      const nextIndex = index + 1;
      const nextCollection = collections[nextIndex];
      if (nextIndex <= collections.length - 1) {
        if (nextCollection.isSuggestedContent) {
          collection.isNextSuggestedCollection = true;
          collection.isNextSystemSuggested =
            nextCollection.pathType === PATH_TYPES.SYSTEM;
          collection.isNextTeacherSuggested =
            nextCollection.pathType === PATH_TYPES.TEACHER;
        }
        collection.nextCollectionPathType = nextCollection.pathType;
      } else {
        collection.nextCollectionPathType = collection.isSuggestedContent ? null : collection.pathType;
      }
      if (collection.isSuggestedContent) {
        collection.isSystemSuggested = collection.pathType === PATH_TYPES.SYSTEM;
        collection.isTeacherSuggested =
          collection.pathType === PATH_TYPES.TEACHER;
      }
      return collection;
    });
  }

  /**
   * @function findFirstCollectionInLessonIsSuggestion
   * This method is used to find first collection in lesson is suggested item
   */
  public findFirstCollectionInLessonIsSuggestion(collections, lesson) {
    const firstCollection = collections[0];
    if (firstCollection.isSuggestedContent) {
      lesson.isFirstSuggestedCollection =
        firstCollection.isSuggestedContent || true;
      lesson.isFirstSystemSuggested =
        firstCollection.pathType === PATH_TYPES.SYSTEM;
      lesson.isFirstTeacherSuggested =
        firstCollection.pathType === PATH_TYPES.TEACHER;
      lesson.firstSuggestedPathType = firstCollection.pathType;
    }
  }

  /**
   * @function onOpenCollectionReport
   * this Method is used to open collection report
   */
  public onOpenCollectionReport(event, collection, lesson) {
    event.stopPropagation();
    this.showPreview(false,collection, lesson)
  }

  /**
   * @function onPreview
   * This method used to preview the student report by guardian
   */
  public onPreview(event, collection, lesson) {
    event.stopPropagation();
    this.showPreview(true, collection, lesson);
  }

  /**
   * @function showPreview
   * This method used to call report function based on type
   */
  public showPreview(isPreview, collection, lesson) {
    const context = {
      collectionType: collection.format,
      collectionId: collection.id,
      contentId: collection.id,
      performance: collection.performance,
      isPreview,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: lesson.unitId,
      lessonId: lesson.lessonId
    };
    if (!isPreview) {
      context['studentId'] = this.userId
    }
    this.reportService.showReport(context);
  }
}
