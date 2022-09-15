import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CONTENT_TYPES, MEETING_TOOLS } from '@constants/helper-constants';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ModalService } from '@providers/service/modal/modal.service';
import { UtilsService } from '@providers/service/utils.service';
import { generateArraysOfTime } from '@utils/global';
import * as moment from 'moment';

@Component({
  selector: 'app-ca-video-conference',
  templateUrl: './ca-video-conference.component.html',
  styleUrls: ['./ca-video-conference.component.scss'],
})
export class CaVideoConferenceComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public isEnableConference: boolean;
  public isInvalidTime: boolean;
  public isTimeChanged: boolean;
  public localMeetingStartTime: string;
  public localMeetingEndTime: string;
  public timeList: Array<string>;
  public startTime: string;
  public endTime: string;
  public isFutureActivity: boolean;
  public isZoomMeetingTool: boolean;
  @Input() public activity: ClassContentModel;
  @Output() public conferenceTimeEvent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public async ngOnInit() {
    this.isEnableConference = true;
    this.timeList = generateArraysOfTime();
    const currentDate = moment().format('YYYY-MM-DD')
    const currentTime = moment().format('h:mma');
    const timeListWithCurrent = this.timeList.filter((time) => moment(time, 'h:mm A').isSameOrAfter(moment(currentTime, 'h:mm A')))[0];
    this.localMeetingStartTime = moment.utc(this.activity.meetingStartTime).local().format('h:mma');
    this.localMeetingEndTime = moment.utc(this.activity.meetingEndTime).local().format('h:mma');
    this.startTime = this.activity.meetingStartTime ? this.localMeetingStartTime : timeListWithCurrent;
    const oneHourFromCurrentTime = moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').add(1, 'hours').format('h:mma')
    this.endTime = this.activity.meetingEndTime ? this.localMeetingEndTime : oneHourFromCurrentTime;
    const activityDate = this.activity.contentType === CONTENT_TYPES.OFFLINE_ACTIVITY
      ? this.activity.dcaAddedDate
      : this.activity.endDate || this.activity.dcaAddedDate;
    this.isFutureActivity = moment(activityDate).isAfter(currentDate);
    const meetingTool = await this.utilsService.preferredMeetingTool();
    this.isZoomMeetingTool = meetingTool === MEETING_TOOLS.zoom;
  }

  /**
   * @function changeStartTime
   * This method is used to change start time
   */
  public changeStartTime(event) {
    this.startTime = event.detail.value;
    const currentDate = moment().format('YYYY-MM-DD');
    const oneHourFromCurrentTime = moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').add(1, 'hours').format('h:mma');
    this.endTime = oneHourFromCurrentTime;
  }

  /**
   * @function changeEndTime
   * This method is used to change end time
   */
  public changeEndTime(event) {
    this.endTime = event.detail.value;
    this.isInvalidTime = moment(this.endTime, 'h:mma').diff(moment(this.startTime, 'h:mma'), 'minutes') < 1;
  }

  /**
   * @function isTimeSame
   * This method is used to check is existing meet time and selected meeting time
   */
  public get isTimeSame() {
    return moment(this.endTime, 'h:mma').isSame(moment(this.localMeetingEndTime, 'h:mma')) &&
      moment(this.startTime, 'h:mma').isSame(moment(this.localMeetingStartTime, 'h:mma'))
  }

  /**
   * @function toggleEnableConference
   * This method is used to toggle conference
   */
  public toggleEnableConference(event) {
    this.isEnableConference = event.target.checked;
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal(context?) {
    this.modalService.dismissModal(context);
  }

  /**
   * @function createVideoConference
   * This method is used to create video conference
   */
  public createVideoConference() {
    this.closeModal({
      startTime: this.startTime,
      endTime: this.endTime
    });
  }

  /**
   * @function updateMeeting
   * This method is used to update meeting
   */
  public updateMeeting() {
    this.closeModal({
      startTime: this.startTime,
      endTime: this.endTime
    });
  }

  /**
   * @function openMeeting
   * This method is used to open meeting
   */
  public openMeeting() {
    if (this.isZoomMeetingTool) {
      this.utilsService.openZoomLink(this.activity.meetingUrl);
    } else {
      this.utilsService.openMeetingLink(this.activity.meetingUrl);
    }
  }
}
