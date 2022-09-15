import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';


@Component({
  selector: 'delete-student-alert',
  templateUrl: './delete-student-alert.component.html',
  styleUrls: ['./delete-student-alert.component.scss'],
})
export class DeleteStudentAlertComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties
  @Output() public closePopup = new EventEmitter();
  @Output() public selectConfirm = new EventEmitter();
  @Input() public studentFullName: string;
  public dataAccess: boolean;
  public classAccess: boolean;
  public lostData: boolean;
  public enableConfirm: boolean;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.studentFullName) {
      this.dataAccess = false;
      this.classAccess = false;
      this.lostData = false;
    }
  }

  /**
   * @function onClosePopUp
   * Method to close the popup
   */
  public onClosePopUp() {
    this.closePopup.emit();
  }

  /**
   * @function onChangeCheckbox
   * Method to close the popup
   */
  public onChangeCheckbox() {
    this.enableConfirm = this.dataAccess && this.classAccess && this.lostData;
  }

  /**
   * @function onConfirm
   * Method to confirm the delete or archive
   */
  public onConfirm() {
    this.selectConfirm.emit();
  }
}
