import { Component, Input, OnInit } from '@angular/core';
import { ClassContentModel } from '@models/class-activity/class-activity';

@Component({
  selector: 'aggregated-score-panel',
  templateUrl: './aggregated-score-panel.component.html',
  styleUrls: ['./aggregated-score-panel.component.scss'],
})
export class AggregatedScorePanelComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public activity: ClassContentModel;
  @Input() public totalScore: number;
  @Input() public totalTimespent: number;
  public isCollection: boolean;
  public isAssessment: boolean;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.isCollection = this.activity.isCollection || this.activity.isExternalCollection;
    this.isAssessment = this.activity.isAssessment || this.activity.isExternalAssessment;
  }
}
