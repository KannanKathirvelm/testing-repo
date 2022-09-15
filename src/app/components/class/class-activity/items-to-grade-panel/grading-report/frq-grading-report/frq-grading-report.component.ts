import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OaStudentRubric } from '@models/rubric/rubric';

@Component({
  selector: 'nav-frq-grading-report',
  templateUrl: './frq-grading-report.component.html',
  styleUrls: ['./frq-grading-report.component.scss'],
})
export class FrqGradingReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public student: OaStudentRubric;
  @Input() public showTeacherTab: boolean;
  @Input() public showStudentTab: boolean;
  @Input() public maxScore: number;
  @Output() public fetchFrqQuestion = new EventEmitter();
  @Output() public updateCategoryLevels = new EventEmitter();
  @Output() public fetchStudentAnswers = new EventEmitter();
  @Output() public submitAssessmentGradeEvent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.fetchFrqQuestion.emit();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function updateCategory
   * This method is used to update category level
   */
  public updateCategory(event) {
    this.updateCategoryLevels.emit(event);
  }

  /**
   * @function submitGrade
   * This method is used to submit assessment grade
   */
  public submitGrade(event) {
    this.submitAssessmentGradeEvent.emit();
  }
}
