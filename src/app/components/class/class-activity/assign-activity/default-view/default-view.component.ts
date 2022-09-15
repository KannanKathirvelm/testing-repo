import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassModel } from '@app/models/class/class';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { SequenceModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { ContentModel } from '@models/signature-content/signature-content';

@Component({
  selector: 'nav-default-view',
  templateUrl: './default-view.component.html',
  styleUrls: ['./default-view.component.scss'],
})
export class DefaultViewComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public isLoading: boolean;
  @Output() public loadMoreData = new EventEmitter();
  @Output() public loadLessData = new EventEmitter();
  @Input() public libraryContent: {
    contentData: Array<ContentModel>;
    sequenceIndex: number;
    sequenceData: SequenceModel;
    page: number;
    totalCount: number;
    isLoading?: boolean;
  };
  @Input() public activities: Array<ClassContentModel>;
  @Output() public addActivityEvent = new EventEmitter();
  @Input() public classDetails: ClassModel;

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function showMore
   * This method is used to show more
   */
  public showMore(content) {
    this.loadMoreData.emit(content);
  }

  /**
   * @function showLess
   * This method is used to show less
   */
  public showLess(content) {
    this.loadLessData.emit(content);
  }

  /**
   * @function addActivity
   * This method is used to add activity
   */
  public addActivity(event) {
    this.addActivityEvent.emit(event);
  }
}
