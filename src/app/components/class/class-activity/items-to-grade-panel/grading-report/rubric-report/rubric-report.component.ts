import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nav-rubric-report',
  templateUrl: './rubric-report.component.html',
  styleUrls: ['./rubric-report.component.scss'],
})
export class RubricReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public totalRubricPoints: number;
  @Input() public rubric: any;
  @Input() public isReadonly: boolean;
  @Input() public maxScore: number;
  @Input() public isReport: boolean;
  @Input() public isTeacherRubric: boolean;
  @Output() public updateCategoryLevels = new EventEmitter();
  @Output() public submitGrade = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.fetchTotalRubricPoints();
  }

  /**
   * @function fetchTotalRubricPoints
   * This method is used to fetch total rubric points
   */
  public fetchTotalRubricPoints() {
    let totalRubricPoints = 0;
    const categories = this.rubric && this.rubric.categories && this.rubric.categories || null;
    if (categories) {
      categories.forEach((category) => {
        if (category.allowsLevels && category.allowsScoring) {
          totalRubricPoints += category.maxScore;
        }
      });
    }
    this.totalRubricPoints = totalRubricPoints;
  }

  /**
   * @function updateCategory
   * This method is used to update cetegory
   */
  public updateCategory(event) {
    this.updateCategoryLevels.emit(event);
  }

  /**
   * @function submitOAGrade
   * This method is used to submit oa grade
   */
  public submitOAGrade() {
    this.submitGrade.emit();
  }

  /**
   * @function scoreIncrement
   * This method is used to submit score in increment
   */
  public scoreIncrement(event) {
    this.updateCategory(event);
  }
}
