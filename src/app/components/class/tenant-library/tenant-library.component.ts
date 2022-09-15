import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SuggestionModel } from '@models/suggestion/suggestion';
import { TenantLibraryContentModel } from '@models/tenant/tenant-settings';

@Component({
  selector: 'tenant-library',
  templateUrl: './tenant-library.component.html',
  styleUrls: ['./tenant-library.component.scss'],
})
export class TenantLibraryComponent {

  // -------------------------------------------------------------------------
  // Properties

  public suggestions: Array<SuggestionModel>;
  @Input() public tenantLibraryContent: Array<TenantLibraryContentModel>;
  @Output() public closeLearningGapsPullUp = new EventEmitter();
  @Output() public selectLibraryContent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onCloseLearningGapsPullUp
   * Method to close the student performance report
   */
  public onCloseLearningGapsPullUp() {
    this.closeLearningGapsPullUp.emit();
  }

  /**
   * @function onSelectLibraryContents
   * This method is used to get the tenant library data.
   */
  public onSelectLibraryContents(content) {
    this.selectLibraryContent.emit(content);
  }
}
