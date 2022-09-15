import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'delete-or-archive-class',
  templateUrl: './delete-or-archive-class.component.html',
  styleUrls: ['./delete-or-archive-class.component.scss'],
})
export class DeleteOrArchiveClassComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public isShowDeleteOrArchiveClass: boolean;
  @Input() public className: string;
  @Input() public isDeleteClass: boolean;
  @Output() public closePopup = new EventEmitter();
  @Output() public selectConfirm = new EventEmitter();
  public allLinks: boolean;
  public students: boolean;
  public studentsData: boolean;
  public enableConfirm: boolean;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.isShowDeleteOrArchiveClass) {
      this.allLinks = false;
      this.students = false;
      this.studentsData = false;
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
    this.enableConfirm = this.allLinks && this.students && this.studentsData;
  }

  /**
   * @function onConfirm
   * Method to confirm the delete or archive
   */
  public onConfirm() {
    this.selectConfirm.emit();
  }
}
