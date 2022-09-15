import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OaStudentRubric } from '@models/rubric/rubric';

@Component({
  selector: 'nav-oa-student-list',
  templateUrl: './oa-student-list.component.html',
  styleUrls: ['./oa-student-list.component.scss'],
})
export class OaStudentListComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public students: Array<OaStudentRubric>;
  @Input() public activeStudentIndex: number;
  @Output() public selectedStudent = new EventEmitter();
  public searchText: string;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function selectStudent
   * This method is used to select student
   */
  public selectStudent(studentIndex) {
    this.selectedStudent.emit(studentIndex);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
