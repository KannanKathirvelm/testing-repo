import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ProfileModel } from '@models/profile/profile';

@Component({
  selector: 'nav-student-list-popover',
  templateUrl: './student-list-popover.component.html',
  styleUrls: ['./student-list-popover.component.scss'],
})
export class StudentListPopoverComponent {

  // -------------------------------------------------------------------------
  // Properties

  public studentList: Array<ProfileModel>;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private navParams: NavParams) {
    this.studentList = this.navParams.get('studentList');
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
