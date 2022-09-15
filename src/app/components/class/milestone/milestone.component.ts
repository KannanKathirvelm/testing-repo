import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { UnitCollectionSummaryModel } from '@models/collection/collection';
import { LessonModel } from '@models/lesson/lesson';
import { MilestoneModel } from '@models/milestone/milestone';
import { TaxonomySubjectModel } from '@models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { ReportService } from '@providers/service/report/report.service';

@Component({
  selector: 'milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss'],
})
export class MilestoneComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public milestoneList: Array<MilestoneModel>;
  @Input() public isToggled: boolean;
  @Input() public tenantSettings: TenantSettingsModel;
  @Input() public milestones: Array<MilestoneModel>;
  @Input() public isLessonLoaded: boolean;
  @Input() public classGrade: MilestoneModel;
  @Input() public isCollectionLoaded: boolean;
  @Input() public subjectDetails: TaxonomySubjectModel;
  @Input() public isOnline: boolean;
  @Output() public openMilestonePanel: EventEmitter<{
    milestoneIndex: number;
    milestoneId: string
  }> = new EventEmitter();
  @Output() public openMilestoneLessonPanel: EventEmitter<{
    milestoneIndex: number;
    lessonIndex: number;
    lessonId: string
  }> = new EventEmitter();
  @Output() public openMilestoneReport: EventEmitter<{ milestone: MilestoneModel, milestoneIndex: number }> = new EventEmitter();
  @Output() public openLessonReport: EventEmitter<{ lesson: LessonModel, lessonIndex: number }> = new EventEmitter();
  @Output() public openCollectionReport: EventEmitter<{ collection: UnitCollectionSummaryModel, lesson: LessonModel }> = new EventEmitter();
  public currentLessonExpandedIndex: number;
  @Output() public scrollToCollection: EventEmitter<number> = new EventEmitter();
  public hasUnit0 = false;
  @Output() public toggleVisibility: EventEmitter<{ collection?: UnitCollectionSummaryModel, lesson?: UnitCollectionSummaryModel, units?: UnitCollectionSummaryModel }> = new EventEmitter();

  constructor(
    private elementRef: ElementRef,
    private reportService: ReportService,
    private parseService: ParseService
  ) { }

  // -------------------------------------------------------------------------
  // Life cycle Methods

  public ngOnInit() {
    this.milestoneList = [...this.milestones];
    this.hasUnit0 = !!this.milestoneList.find((milestone: any) => milestone.isUnit0);
  }

  // -------------------------------------------------------------------------
  // Methods

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
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM);
  }

  /**
   * @function onOpenCollectionReport
   * this Method is used to open collection report
   */
  public onOpenCollectionReport(event, collection, lesson) {
    event.stopPropagation();
    this.openCollectionReport.emit({
      collection,
      lesson
    });
  }

  /**
   * @function onOpenMilestoneReport
   * this Method is used to open milestone report
   */
  public onOpenMilestoneReport(event, milestone, milestoneIndex) {
    this.parseService.trackEvent(EVENTS.CLICK_LJ_IS_MILESTONE_USER);
    if (this.isOnline) {
      event.stopPropagation();
      this.openMilestoneReport.emit({ milestone, milestoneIndex });
    }
  }

  /**
   * @function onOpenLessonReport
   * this Method is used to open milestone lesson report
   */
  public onOpenLessonReport(event, lesson, lessonIndex) {
    event.stopPropagation();
    this.openLessonReport.emit({ lesson, lessonIndex });
    this.parseService.trackEvent(EVENTS.CLICK_LJ_IS_MILESTONE_LESSON);

  }

  /**
   * @function onOpenMilestonePanel
   * this Method is used to open milestone panel
   */
  public onOpenMilestonePanel(milestoneIndex, milestone) {
    this.parseService.trackEvent(EVENTS.CLICK_LJ_IS_MILESTONE_CARD);
    this.openMilestonePanel.emit({
      milestoneIndex,
      milestoneId: milestone.milestoneId
    });
  }

  /**
   * @function onCloseLessonPanel
   * This method will trigger when user close lesson panel
   */
  public onCloseLessonPanel(lessonIndex) {
    if (lessonIndex === this.currentLessonExpandedIndex) {
      this.currentLessonExpandedIndex = null;
    }
  }

  /**
   * @function onOpenLessonPanel
   * this Method is used to open milestone panel
   */
  public onOpenLessonPanel(milestoneIndex, lessonIndex, lesson) {
    this.currentLessonExpandedIndex = lessonIndex;
    this.openMilestoneLessonPanel.emit({
      milestoneIndex,
      lessonIndex,
      lessonId: lesson.lessonId
    });
    this.onExpandLesson(milestoneIndex, lessonIndex);
    this.parseService.trackEvent(EVENTS.CLICK_LJ_IS_LESSON_CARD);
  }

  /**
   * @function onPreview
   * This method used to preview the student report by guardian
   */
  public onPreview(event, collection, lesson) {
    this.parseService.trackEvent(EVENTS.CLICK_LJ_IS_COLLECTION_PREVIEW);
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
      isPreview
    };
    this.reportService.showReport(context);
  }

  /**
   * @function onToggleVisibility
   * This method used to toggle visibility
   */
  public onToggleVisibility(content) {
    if (content.lessonId) {
      this.toggleVisibility.emit({lesson: content});
    } else if (content.unitId) {
      this.toggleVisibility.emit({units: content});
    } else {
      this.toggleVisibility.emit({collection: content});
    }
  }
}
