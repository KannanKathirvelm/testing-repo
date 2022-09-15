import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { COURSE_MAP, MILESTONE } from '@constants/helper-constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'nav-milestone-header',
  templateUrl: './milestone-header.component.html',
  styleUrls: ['./milestone-header.component.scss'],
})
export class MilestoneHeaderComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public tabs: Array<{ label: string, type: string }>;
  @Input() public activeView: string;
  @Input() public isPremiumClass: boolean;
  @Output() public segmentEventChanged: EventEmitter<string> = new EventEmitter();
  @Output() public toggleLessonEvent: EventEmitter<boolean> = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private translate: TranslateService
  ) { }

  // -------------------------------------------------------------------------
  // life cycle method

  public ngOnInit() {
    const translateCourseMap = this.translate.instant('COURSE_MAP');
    const translateMilestone = this.translate.instant('MILESTONE');
    this.tabs = [{
      label: translateCourseMap,
      type: COURSE_MAP
    }, {
      label: translateMilestone,
      type: MILESTONE
    }];
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function segmentChanged
   * this Method is used to change event of segment
   */
  public segmentChanged(event) {
    const tabType = event.detail.value;
    this.segmentEventChanged.emit(tabType);
  }

  /**
   * @function toggleLesson
   * this Method is used to on/off event of lesson plan
   */
  public toggleLesson(event) {
    const toggleStatus = event.detail.checked;
    this.toggleLessonEvent.emit(toggleStatus);
  }
}
