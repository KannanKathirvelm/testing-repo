import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomainModel, FwCompetenciesModel, StrugglingDomainCompetencyModel } from '@models/competency/competency';

@Component({
  selector: 'atc-learning-struggles-panel',
  templateUrl: './atc-learning-struggles-panel.component.html',
  styleUrls: ['./atc-learning-struggles-panel.component.scss'],
})

export class AtcLearningStrugglesPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public gradeCompetencyDomainList: Array<StrugglingDomainCompetencyModel>;;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public currentGradeName: string;
  @Input() public fwDomains: Array<DomainModel>;
  @Output() public openLearningChallenges: EventEmitter<StrugglingDomainCompetencyModel> = new EventEmitter();
  public isShowAll: boolean;
  public isToggleOption: boolean;
  public filteredDomainList: Array<StrugglingDomainCompetencyModel>;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.handleDomainList();
  }

  /**
   * @function onClickLearningChallenges
   * Method used to open learning challenges
   */
  public onClickLearningChallenges(competency) {
    this.openLearningChallenges.emit(competency);
  }

  /**
   * @function handleDomainList
   * Method used to handle class list
   */
  public handleDomainList() {
    if (this.gradeCompetencyDomainList && this.gradeCompetencyDomainList.length) {
      this.isShowAll = this.gradeCompetencyDomainList.length > 2;
      this.isToggleOption = this.gradeCompetencyDomainList.length > 2;
      this.filteredDomainList = this.gradeCompetencyDomainList && this.isShowAll ? this.filterDomainList(2) : this.gradeCompetencyDomainList;
    }
  }

  /**
   * @function filterDomainList
   * Method is to get domain list
   */
  public filterDomainList(index) {
    return this.gradeCompetencyDomainList.slice(0, index);
  }

  /**
   * @function clickShowAll
   * Method to show all domains
   */
  public clickShowAll() {
    this.isShowAll = !this.isShowAll;
    this.filteredDomainList = !this.isShowAll ? this.gradeCompetencyDomainList : this.filterDomainList(2);
  }
}
