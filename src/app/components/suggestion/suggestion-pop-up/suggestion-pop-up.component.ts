import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StudentListPopoverComponent } from '@components/UI/popover/student-list-popover/student-list-popover.component';
import { PopoverController } from '@ionic/angular';
import { ProfileModel } from '@models/profile/profile';
import { SuggestionModel } from '@models/suggestion/suggestion';

@Component({
  selector: 'suggestion-pop-up',
  templateUrl: './suggestion-pop-up.component.html',
  styleUrls: ['./suggestion-pop-up.component.scss'],
})
export class SuggestionPopUpComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public content: SuggestionModel;
  @Input() public showSuggestionPopup: boolean;
  @Input() public studentList: Array<ProfileModel>;
  @Output() public confirmSuggestion = new EventEmitter();
  @Output() public cancelSuggestion = new EventEmitter();
  public studentCount: number;
  public isThumbnailError: boolean;
  public moreItems: Array<ProfileModel>;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private popoverController: PopoverController) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.moreItems = [];
    this.studentCount = 3;
    if (this.studentList && this.studentCount) {
      Object.keys(this.studentList).forEach((key, index) => {
        if (index >= Number(this.studentCount)) {
          const item = this.studentList[key];
          this.moreItems.push(item);
        }
      });
    }
  }

  /**
   * @function showStudentListPopover
   * This Method used to show student list popover
   */
  public async showStudentListPopover(event) {
    const popover = await this.popoverController.create({
      component: StudentListPopoverComponent,
      event,
      componentProps: { studentList: this.moreItems },
      translucent: true,
      cssClass: 'student-list-popover'
    });
    return await popover.present();
  }

  /**
   * @function onClickConfirm
   * This Method will trigger when user click the confirm
   */
  public onClickConfirm() {
    this.confirmSuggestion.emit();
  }

  /**
   * @function onCancelCancel
   * This Method will trigger when user click the cancel
   */
  public onCancelCancel() {
    this.cancelSuggestion.emit();
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
