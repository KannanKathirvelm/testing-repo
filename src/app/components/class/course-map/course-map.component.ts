import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { UnitCollectionSummaryModel } from '@models/collection/collection';
import { UnitLessonSummaryModel } from '@models/lesson/lesson';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { UnitSummaryModel } from '@models/unit/unit';
import { ReportService } from '@providers/service/report/report.service';

@Component({
  selector: 'course-map',
  templateUrl: './course-map.component.html',
  styleUrls: ['./course-map.component.scss'],
})
export class CourseMapComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public units: Array<UnitSummaryModel>;
  @Input() public isUnitLoaded: boolean;
  @Input() public isLessonLoaded: boolean;
  @Input() public tenantSettings: TenantSettingsModel;
  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public isOnline: boolean;
  @Input() public isCollectionLoaded: boolean;
  @Input() public isStudentCourseMap: boolean;
  @Output() public openUnitPanel: EventEmitter<{
    unitIndex: number;
    unitId: string
  }> = new EventEmitter();
  @Output() public openLessonPanel: EventEmitter<{
    unitIndex: number;
    lessonIndex: number;
    lessonId: string
  }> = new EventEmitter();
  @Output() public openUnitReport: EventEmitter<{ unit: UnitSummaryModel, unitIndex: number }> = new EventEmitter();
  @Output() public openLessonReport: EventEmitter<{ lessonIndex: number, unitIndex: number, lesson: UnitLessonSummaryModel }> = new EventEmitter();
  @Output() public scrollToView: EventEmitter<number> = new EventEmitter();
  @Output() public openCollectionReport: EventEmitter<{ collection: UnitCollectionSummaryModel, lesson: UnitLessonSummaryModel, unitIndex: number }> = new EventEmitter();
  @Output() public toggleVisibility: EventEmitter<{ collection?: UnitCollectionSummaryModel,lesson?: UnitCollectionSummaryModel ,units?: UnitCollectionSummaryModel }> = new EventEmitter();
  public hasUnit0: boolean;
  public lessonLabelValue: boolean;
  public showVisibilityToggle: boolean;
  public isHideSeqNumber: boolean;

  constructor(
    private elementRef: ElementRef,
    private reportService: ReportService,
    private parseService: ParseService
  ) {
    this.lessonLabelValue = false;
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.lessonLabelValue = this.tenantSettings ?.uiElementVisibilitySettings ?.lessonLabelCourseMap ? true : false;
    this.hasUnit0 = !!this.units.filter((item) => item.isUnit0).length;
    this.showVisibilityToggle = this.tenantSettings.courseContentVisibility;
    this.isHideSeqNumber = this.tenantSettings ?.uiElementVisibilitySettings ?.hideCourseMapViewContentLabelSeq;
  }

  /**
   * @function onOpenUnitPanel
   * this Method is used to open unit panel
   */
  public onOpenUnitPanel(unitIndex, unit) {
    this.openUnitPanel.emit({
      unitIndex,
      unitId: unit.unitId
    });
    this.parseService.trackEvent(EVENTS.CLICK_LJ_UNIT);
  }

  /**
   * @function onOpenCollectionReport
   * this Method is used to open collection report
   */
  public onOpenCollectionReport(event, collection, lesson, unitIndex) {
    event.stopPropagation();
    this.openCollectionReport.emit({
      collection,
      lesson,
      unitIndex
    });
  }

  /**
   * @function onExpandUnit
   * This method is trigger when unit expands
   */
  public onExpandUnit(unitIndex) {
    const containerElement = this.elementRef.nativeElement.querySelector(
      `.coursemap-container`
    );
    const unitElement = this.elementRef.nativeElement.querySelector(
      `.unit-${unitIndex}`
    );
    const unitElementPostions = unitElement.getBoundingClientRect();
    const offsetTop =
      unitElementPostions.top -
      containerElement.getBoundingClientRect().top -
      unitElement.clientHeight;
    this.scrollToView.emit(offsetTop);
  }

  /**
   * @function onExpandLesson
   * This method is trigger when lesson expands
   */
  public onExpandLesson(unitIndex, lessonIndex) {
    const containerElement = this.elementRef.nativeElement.querySelector(
      `.coursemap-container`
    );
    const unitElement = this.elementRef.nativeElement.querySelector(
      `.unit-${unitIndex}`
    );
    const lessonElement = unitElement.querySelector(
      `.lesson-${lessonIndex}`
    );
    const lessonElementPositions = lessonElement.getBoundingClientRect();
    const offsetTop = (lessonElementPositions.top - lessonElement.clientHeight
      - containerElement.getBoundingClientRect().top);
    this.scrollToView.emit(offsetTop);
  }

  /**
   * @function onOpenUnitReport
   * this Method is used to open unit panel
   */
  public onOpenUnitReport(event, unit, unitIndex) {
    event.stopPropagation();
    this.openUnitReport.emit({ unit, unitIndex });
  }

  /**
   * @function onOpenLessonReport
   * this Method is used to open unit report
   */
  public onOpenLessonReport(event, lesson, unitIndex, lessonIndex) {
    event.stopPropagation();
    this.openLessonReport.emit({
      unitIndex,
      lesson,
      lessonIndex
    });
  }

  /**
   * @function onOpenLessonPanel
   * this Method is used to open lesson panel
   */
  public onOpenLessonPanel(unitIndex, lessonIndex, lesson) {
    this.openLessonPanel.emit({
      unitIndex,
      lessonIndex,
      lessonId: lesson.lessonId
    });
    this.onExpandLesson(unitIndex, lessonIndex);
    this.parseService.trackEvent(EVENTS.CLICK_LJ_LESSON);
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
      isPreview,
      isStudent: this.isStudentCourseMap
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
