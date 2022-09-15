import { Component, Input, OnInit } from '@angular/core';
import { StudentDomainCompetenciesModel } from '@models/competency/competency';

@Component({
  selector: 'nav-student-class-proficiency-card',
  templateUrl: './student-class-proficiency-card.component.html',
  styleUrls: ['./student-class-proficiency-card.component.scss']
})
export class StudentClassProficiencyCardComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public studentDomainPerformance: StudentDomainCompetenciesModel;
  @Input() public maxNumberOfCompetencies: number;
  @Input() public studentSeq: number;
  @Input() public source: string;
  public skeletonViewCount: number;
  public isThumbnailError: boolean;

  public ngOnInit() {
    this.skeletonViewCount = 10;
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
