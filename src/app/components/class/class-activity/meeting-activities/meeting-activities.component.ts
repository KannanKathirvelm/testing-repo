import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClassContentModel } from '@models/class-activity/class-activity';

@Component({
  selector: 'nav-meeting-activities',
  templateUrl: './meeting-activities.component.html',
  styleUrls: ['./meeting-activities.component.scss'],
})
export class MeetingActivitiesComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public meetingSlideOpts: { initialSlide: number, slidesPerView: number, speed: number };
  public meetingSlider: { isBeginningSlide: boolean; isEndSlide: boolean; };
  @Input() public meetingClassContents: Array<ClassContentModel>;
  @Output() public openVideoConferenceEvent = new EventEmitter();
  @Output() public enableMeetingActivityEvent = new EventEmitter();
  @Output() public deleteMeetingActivityEvent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.meetingSlideOpts = {
      initialSlide: 0,
      slidesPerView: 1,
      speed: 400
    };
    this.meetingSlider = {
      isBeginningSlide: true,
      isEndSlide: true
    };
    this.meetingSlider.isEndSlide = this.meetingClassContents.length <= 1;
  }

  /**
   * @function openVideoConference
   * This method is used to open video conference
   */
  public openVideoConference(activity) {
    this.openVideoConferenceEvent.emit(activity);
  }

  /**
   * @function enableMeetingActivity
   * This method is used to enable meeting activity
   */
  public enableMeetingActivity(activity) {
    this.enableMeetingActivityEvent.emit(activity);
  }

  /**
   * @function deleteMeetingActivity
   * This method is used to delete meeting activity
   */
  public deleteMeetingActivity(activity) {
    this.deleteMeetingActivityEvent.emit(activity);
  }

  // Method called when slide is changed by drag or navigation
  public SlideDidChange(object, slideView) {
    this.checkIfNavDisabled(object, slideView);
  }

  // Move to previous slide
  public async slidePrev(object, slideView) {
    slideView.slidePrev(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
  }

  // Move to Next slide
  public async slideNext(object, slideView) {
    slideView.slideNext(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
  }

  // Call methods to check if slide is first or last to enable disbale navigation
  public checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }

  // Call methods to check if slide is Beginning
  public checkisBeginning(object, slideView) {
    slideView.isBeginning().then((istrue) => {
      object.isBeginningSlide = istrue;
    });
  }

  // Call methods to check if slide is end
  public checkisEnd(object, slideView) {
    slideView.isEnd().then((istrue) => {
      object.isEndSlide = istrue;
    });
  }
}
