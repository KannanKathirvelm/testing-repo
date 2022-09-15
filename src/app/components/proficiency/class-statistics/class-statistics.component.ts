import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomainCompetencyCoverageModel } from '@models/competency/competency';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'nav-class-statistics',
  templateUrl: './class-statistics.component.html',
  styleUrls: ['./class-statistics.component.scss'],
  animations: [collapseAnimation()]
})
export class ClassStatisticsComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public courseCoverageCount: {
    notStarted: number;
    inProgress: number;
    mastered: number;
    totalCoverage: number;
  };
  @Input() public domainCoverageCount: Array<DomainCompetencyCoverageModel>;
  @Input() public numberOfStudents: number;
  @Input() public showClassCount: boolean;
  @Output() public toggleClassStatisticsCount = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onToggleClassCount
   * Method triggers when toggle the class count
   */
  public onToggleClassCount() {
    this.showClassCount = !this.showClassCount;
    this.toggleClassStatisticsCount.emit();
  }
}
