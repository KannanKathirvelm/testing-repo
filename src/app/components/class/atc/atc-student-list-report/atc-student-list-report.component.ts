import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassMembersDetailModel } from '@models/atc/atc';

@Component({
  selector: 'atc-student-list-report',
  templateUrl: './atc-student-list-report.component.html',
  styleUrls: ['./atc-student-list-report.component.scss'],
})
export class ATCStudentListReportComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public studentList: Array<ClassMembersDetailModel>;
  @Input() public isShowStudentListAtcReport: boolean;
  @Output() public closeStudentListReport = new EventEmitter();
  @Output() public selectStudent: EventEmitter<ClassMembersDetailModel> = new EventEmitter();
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onCloseStudentListReport
   * Method to close the student list report
   */
  public onCloseStudentListReport() {
    this.closeStudentListReport.emit();
  }

  /**
   * @function onSelectStudent
   * Method to select the student list report
   */
  public onSelectStudent(student) {
    this.selectStudent.emit(student);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
