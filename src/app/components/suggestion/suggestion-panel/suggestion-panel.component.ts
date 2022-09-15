import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SuggestionModel } from '@models/suggestion/suggestion';
import { ReportService } from '@providers/service/report/report.service';

@Component({
  selector: 'suggestion-panel',
  templateUrl: './suggestion-panel.component.html',
  styleUrls: ['./suggestion-panel.component.scss'],
})
export class SuggestionPanelComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public content: SuggestionModel;
  @Input() public showTeacherSuggestion: boolean;
  @Input() public showAddActions: boolean;
  @Output() public selectSuggestion: EventEmitter<SuggestionModel> = new EventEmitter();
  @Output() public addActivityToClass: EventEmitter<SuggestionModel> = new EventEmitter();
  @Output() public rescheduleClassActivity: EventEmitter<SuggestionModel> = new EventEmitter();
  public isActivityAdded: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private reportService: ReportService
  ){}

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onClickSuggestion
   * This Method is used to suggest the collection or assessment
   */
  public onClickSuggestion() {
    this.selectSuggestion.emit(this.content);
  }

  /**
   * @function onClickReschedule
   * This Method is used to reschedule the activity
   */
  public onClickReschedule() {
    this.rescheduleClassActivity.emit(this.content);
  }

  /**
   * @function onClickAdd
   * This Method is used to add activity
   */
  public onClickAdd() {
    this.isActivityAdded = true;
    this.addActivityToClass.emit(this.content);
  }

  /**
   * @function onPreview
   * This Method is preview collections
   */
  public onPreview(){
    const collectionType = this.content.isCollection ? 'collection' : 'assessment';
    const context = {
      collectionId: this.content.id,
      collectionType: this.content.format ? this.content.format : collectionType,
      contentId: this.content.id,
      isPreview: true
    };
    this.reportService.showReport(context);
  }

}
