import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OaStudentRubric } from '@models/rubric/rubric';

@Component({
  selector: 'nav-oa-grading-report',
  templateUrl: './oa-grading-report.component.html',
  styleUrls: ['./oa-grading-report.component.scss'],
})
export class OaGradingReportComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public student: OaStudentRubric;
  @Output() public fetchStudentSubmissionData = new EventEmitter();
  @Output() public updateCategoryLevels = new EventEmitter();
  @Output() public submitGradeEvent = new EventEmitter();
  @Input() public showOaAnswerTab: boolean;
  @Input() public showTeacherTab: boolean;
  @Input() public showStudentTab: boolean;
  @Input() public maxScore: number;

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function updateCategory
   * This method is used to update category
   */
  public updateCategory(event) {
    this.updateCategoryLevels.emit(event);
  }

  /**
   * @function submitGrade
   * This method is used to submit grade
   */
  public submitGrade(event) {
    this.submitGradeEvent.emit();
  }
}
