import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { TaxonomyGrades } from '@models/taxonomy/taxonomy';

@Component({
  selector: 'student-grade-select',
  templateUrl: './student-grade-select.component.html',
  styleUrls: ['./student-grade-select.component.scss'],
})
export class StudentGradeSelectComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public grades: Array<TaxonomyGrades>;
  @Input() public defaultGrade: string;
  @Input() public title: string;
  @Input() public selectHeaderOptions: { header: string };
  @Input() public studentId: string;
  @Output() public gradeLevelChange = new EventEmitter();
  public selectedValue: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private parseService: ParseService) {}

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.selectedValue = this.defaultGrade;
  }

  /**
   * @function onChangeGradeBound
   * This method is used to emit the selected grade
   */
  public onChangeGradeBound(event) {
    const gradeLevel = event.detail.value;
    const grade = this.grades.find((item) =>  item.id === gradeLevel);
    const lowerBoundId = grade.parentGradeId || gradeLevel;
    this.gradeLevelChange.emit({
      studentId: this.studentId,
      gradeLevelId: grade.parentGradeId ? gradeLevel : undefined,
      lowerBoundId
    });
    this.selectedValue = gradeLevel;
    this.parseService.trackEvent(EVENTS.CLICK_CS_CHOOSE_COLUMNS);
  }

  /**
   * @function compareWithCategoriesCode
   * This method is used to check the categories code
   */
  public compareWithCategoriesCode(item1, item2) {
    return item1 && item2 ? item1 === item2 : false;
  }
}
