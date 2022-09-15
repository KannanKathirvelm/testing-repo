import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { DomainModel, FwCompetenciesModel, StrugglingDomainCompetencyModel } from '@models/competency/competency';

@Component({
  selector: 'atc-opportunities-for-growth',
  templateUrl: './atc-opportunities-for-growth.component.html',
  styleUrls: ['./atc-opportunities-for-growth.component.scss'],
})
export class AtcOpportunitiesForGrowthComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public opportunitiesForGrowthList: Array<StrugglingDomainCompetencyModel>;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public currentGradeName: string;
  @Input() public fwDomains: Array<DomainModel>;
  @Output() public openLearningGaps: EventEmitter<StrugglingDomainCompetencyModel> = new EventEmitter();
  @Output() public openLearningChallenges: EventEmitter<StrugglingDomainCompetencyModel> = new EventEmitter();
  @Output() public navigateLearningChallenges = new EventEmitter();
  public isShowAll: boolean;
  public isToggleOption: boolean;
  public filteredDomainList: Array<StrugglingDomainCompetencyModel>;

  constructor(
    private parseService: ParseService,
    private classService: ClassService
  ) {}

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.handleDomainList();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.opportunitiesForGrowthList && changes.opportunitiesForGrowthList.currentValue) {
      this.handleDomainList();
    }
  }

  /**
   * @function onClickLearningChallenges
   * Method used to open learning challenges
   */
  public onClickLearningChallenges(competency) {
    this.openLearningChallenges.emit(competency);
    this.trackGrowthEvent();
    this.parseService.trackEvent(EVENTS.CLICK_GROWTH_PROFILE);
  }

  /**
   * @function onClickNavigate
   * This method is used to navigate to class activity page
   */
  public onClickNavigate() {
    this.navigateLearningChallenges.emit();
    this.trackGrowthEvent();
  }

  /**
   * @function trackGrowthEvent
   * This method is used to track the opportunities growth event
   */
  public trackGrowthEvent() {
    const context = this.getTrackGrowthEvent();
    this.parseService.trackEvent(EVENTS.CLICK_GROWTH_LEARNING_CHALLENGES, context);
  }

  /**
   * @function getTrackGrowthEvent
   * This method is used to get the track the opportunities growth event
   */
  public getTrackGrowthEvent() {
    const classDetails = this.classService.class;
    return {
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.courseId,
      publicClass: classDetails.isPublic
    };
}

  /**
   * @function handleDomainList
   * Method used to handle class list
   */
  public handleDomainList() {
    if (this.opportunitiesForGrowthList && this.opportunitiesForGrowthList.length) {
      this.isShowAll = this.opportunitiesForGrowthList.length > 2;
      this.isToggleOption = this.opportunitiesForGrowthList.length > 2;
      this.filteredDomainList = this.opportunitiesForGrowthList && this.isShowAll ? this.filterDomainList(2) : this.opportunitiesForGrowthList;
    }
  }

  /**
   * @function filterDomainList
   * Method is to get domain list
   */
  public filterDomainList(index) {
    return this.opportunitiesForGrowthList.slice(0, index);
  }

  /**
   * @function clickShowAll
   * Method to show all domains
   */
  public clickShowAll() {
    this.isShowAll = !this.isShowAll;
    this.filteredDomainList = !this.isShowAll ? this.opportunitiesForGrowthList : this.filterDomainList(2);
  }
}
