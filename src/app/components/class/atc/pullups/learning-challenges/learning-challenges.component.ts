import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TenantSettingsModel } from '@app/models/tenant/tenant-settings';
import { DomainModel, FwCompetenciesModel, StrugglingCompetencyModel, StrugglingDomainCompetencyModel } from '@models/competency/competency';

@Component({
  selector: 'learning-challenges',
  templateUrl: './learning-challenges.component.html',
  styleUrls: ['./learning-challenges.component.scss'],
})
export class LearningChallengesPullUpComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public gradeCompetencyDomainList: Array<StrugglingDomainCompetencyModel>;
  @Input() public otherGradeCompetency: Array<StrugglingCompetencyModel>;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public selectedDomainIndex: number;
  @Input() public selectedGradeCompetencyIndex: number;
  @Input() public isShowLearningChallengesPullUp: boolean;
  @Input() public selectedGradeDomainIndex: number;
  @Input() public fwDomains: Array<DomainModel>;
  @Output() public closeLearningChallengesPullUp = new EventEmitter();
  @Output() public openSuggestionContainer = new EventEmitter();
  public performanceBar: number;
  @Input() public tenantSettings: TenantSettingsModel;
  public displayDomainLabel: boolean;

  // -------------------------------------------------------------------------
  // Methods
  public ngOnInit() {
    this.displayDomainLabel = this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings ? this.tenantSettings.uiElementVisibilitySettings.displayDomainLabel  : false;
  }

  /**
   * @function onCloseLearningChallengesPullUp
   * Method to close the student performance report
   */
  public onCloseLearningChallengesPullUp() {
    this.closeLearningChallengesPullUp.emit();
  }

  /**
   * @function onClickSuggestionContainer
   * Method to open the suggestion container
   */
  public onClickSuggestionContainer(competency) {
    this.openSuggestionContainer.emit(competency);
  }
}
