import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TenantSettingsModel } from '@app/models/tenant/tenant-settings';
import { DomainModel, FwCompetenciesModel, StrugglingCompetencyModel } from '@models/competency/competency';

@Component({
  selector: 'learning-gaps-pullup',
  templateUrl: './learning-gaps-pullup.component.html',
  styleUrls: ['./learning-gaps-pullup.component.scss'],
})
export class LearningGapsPullUpComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public otherGradeCompetency: Array<StrugglingCompetencyModel>;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public fwDomains: Array<DomainModel>;
  @Input() public selectedGradeDomainIndex: number;
  @Input() public selectedGradeCompetencyIndex: number;
  @Input() public isShowLearningGapsPullUp: boolean;
  @Output() public closeLearningGapsPullUp = new EventEmitter();
  @Output() public openSuggestionContainer = new EventEmitter();
  @Input() public tenantSettings: TenantSettingsModel;
  public displayDomainLabel: boolean;

  // -------------------------------------------------------------------------
  // Methods
  public ngOnInit() {
    this.displayDomainLabel = this.tenantSettings.uiElementVisibilitySettings ? this.tenantSettings.uiElementVisibilitySettings.displayDomainLabel  : false;
  }

  /**
   * @function onCloseLearningGapsPullUp
   * Method to close the student performance report
   */
  public onCloseLearningGapsPullUp() {
    this.closeLearningGapsPullUp.emit();
  }

  /**
   * @function onClickSuggestionContainer
   * Method to open the suggestion container
   */
  public onClickSuggestionContainer() {
    this.openSuggestionContainer.emit();
  }
}
