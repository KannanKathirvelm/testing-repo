import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ContentModel } from '@models/signature-content/signature-content';
import { SuggestionModel } from '@models/suggestion/suggestion';

@Component({
  selector: 'learning-map-activity-pull-up',
  templateUrl: './learning-map-activity-pull-up.component.html',
  styleUrls: ['./learning-map-activity-pull-up.component.scss'],
})
export class LearningMapActivityPullUpComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public learningMapContent: Array<ContentModel>;
  @Input() public activityType: string;
  @Input() public activitiesCount: number;
  @Input() public totalHitCount: number;
  @Input() public isLoaded: boolean;
  @Output() public closePullUp = new EventEmitter();
  @Output() public selectSuggestion: EventEmitter<SuggestionModel> = new EventEmitter();
  @Output() public showMore = new EventEmitter();
  public isShowMore: boolean;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.activitiesCount && changes.activitiesCount.currentValue) {
      this.isShowMore = this.activitiesCount === this.totalHitCount;
    }
  }

  /**
   * @function onClickShowMore
   * This method is used to show more activity
   */
  public onClickShowMore() {
    this.showMore.emit();
  }

  /**
   * @function onClickSuggestion
   * This method trrigers when user clik the suggestion
   */
  public onClickSuggestion(content) {
    this.selectSuggestion.emit(content);
  }

  /**
   * @function onClose
   * This method is used to close the pullup
   */
  public onClose() {
    this.closePullUp.emit();
  }
}
