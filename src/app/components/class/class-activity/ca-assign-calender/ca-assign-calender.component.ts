import { Component, OnInit } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ClassContentModel } from '@app/models/class-activity/class-activity';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { AllowAccessComponent } from '@components/UI/allow-access/allow-access.component';
import { MEETING_TOOLS } from '@constants/helper-constants';
import { NavParams } from '@ionic/angular';
import { ModalService } from '@providers/service/modal/modal.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import { generateArraysOfTime } from '@utils/global';
import { ContentModel } from '@models/signature-content/signature-content';
import * as moment from 'moment';

@Component({
  selector: 'nav-ca-assign-calender',
  templateUrl: './ca-assign-calender.component.html',
  styleUrls: ['./ca-assign-calender.component.scss'],
})
export class CaAssignCalenderComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public startDate: Date;
  public endDate: Date;
  public dateValue: Array<Date>;
  public showApplyFilter: boolean;
  public filterStartDate: string;
  public filterEndDate: string;
  public startDay: string;
  public startMonth: string;
  public startYear: string;
  public startDayInText: string;
  public endDay: string;
  public endMonth: string;
  public endYear: string;
  public endDayInText: string;
  public selectedDates: Array<Date>;
  public selectionType: boolean;
  public selectedDate: Date;
  public selectedStartDate: Date;
  public selectedEndDate: Date;
  public isStartDateSelected: boolean;
  public minDate: Date;
  public isEnableConference: boolean;
  public isInvalidTime: boolean;
  public timeList: Array<string>;
  public startTime: string;
  public endTime: string;
  public activity: ClassContentModel;
  public content: ContentModel;
  public isActivityAssigned: boolean;
  public studentCount: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navParams: NavParams,
    public modalService: ModalService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private parseService: ParseService,
    private classService: ClassService,

  ) {
    const startDate = this.navParams.get('startDate');
    const endDate = this.navParams.get('endDate');
    this.selectedDates = this.navParams.get('selectedDates');
    this.activity = this.navParams.get('activity');
    this.startDate = new Date(startDate);
    this.endDate = endDate;
    this.isStartDateSelected = true;
    this.minDate = new Date(startDate);
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.startDay = moment(this.startDate).format('DD');
    this.startMonth = moment(this.startDate).format('MMM');
    this.startYear = moment(this.startDate).format('YYYY');
    this.startDayInText = moment(this.startDate).format('dddd');
    this.initializeStartEndTime();
    const classMembers = this.classService.classMembers;
    this.studentCount = classMembers && classMembers.members?.length;
  }

  /**
   * @function initializeStartEndTime
   * This method is used to initialize start end time
   */
  public initializeStartEndTime() {
    this.isInvalidTime = false;
    const currentTime = moment().format('h:mma');
    const currentDate = moment().format('YYYY-MM-DD');
    this.timeList = generateArraysOfTime();
    const timeListWithCurrent = this.timeList.filter((time) => moment(time, 'h:mm A').isSameOrAfter(moment(currentTime, 'h:mm A')))[0];
    this.startTime = timeListWithCurrent;
    const oneHourFromCurrentTime = moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').add(1, 'hours').format('h:mma');
    this.endTime = oneHourFromCurrentTime;
  }

  /**
   * @function onSelectDate
   * This method is used to set the selected date
   */
  public onSelectDate() {
    if (this.isStartDateSelected) {
      this.selectedStartDate = this.selectedDate;
      this.startDay = moment(this.selectedStartDate).format('DD');
      this.startMonth = moment(this.selectedStartDate).format('MMM');
      this.startYear = moment(this.selectedStartDate).format('YYYY');
      this.startDayInText = moment(this.selectedStartDate).format('dddd');
      this.selectedEndDate = this.selectedStartDate;
      this.selectEndDate();
    }
    this.normalizeEndDate();
    if (this.activity) {
      this.checkActivityAssinged();
    }
  }

  /**
   * @function normalizeEndDate
   * This method is used to normalize end date
   */
  public normalizeEndDate() {
    this.selectedEndDate = this.selectedDate;
    this.endDay = moment(this.selectedEndDate).format('DD');
    this.endMonth = moment(this.selectedEndDate).format('MMM');
    this.endYear = moment(this.selectedEndDate).format('YYYY');
    this.endDayInText = moment(this.selectedEndDate).format('dddd');
  }

  /**
   * @function onCloseModel
   * This method triggered when the user close the model
   */
  public onCloseModel(params?) {
    this.modalService.dismissModal(params);
  }

  /**
   * @function selectStartDate
   * This method is used to set the start date
   */
  public selectStartDate() {
    this.minDate = new Date();
    this.selectedDate = this.selectedStartDate;
    this.isStartDateSelected = true;
  }

  /**
   * @function selectStartDate
   * This method is used to set the end date
   */
  public selectEndDate() {
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_CA_SCOPE_SCHEDULE, context);
    this.minDate = this.selectedStartDate;
    this.selectedDate = this.selectedEndDate;
    this.isStartDateSelected = false;
  }

  /**
   * @function onClickDone
   * This method triggered when the user click the done.
   */
  public onAddActivity() {
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_CA_SCOPE_SCHEDULE_ADD_ACTIVITY, context);
    this.onCloseModel({
      startDate: moment(this.selectedStartDate).format('YYYY-MM-DD'),
      endDate: moment(this.selectedEndDate).format('YYYY-MM-DD'),
      startTime: this.isEnableConference ? this.startTime : null,
      endTime: this.isEnableConference ? this.endTime : null
    });
    this.parseService.trackEvent(EVENTS.ASSIGN_ACTIVITY);
  }

  /**
   * @function toggleEnableConference
   * This method is used to enable toggle enable conference.
   */
  public toggleEnableConference(event) {
    this.isEnableConference = event.target.checked;
    if (!this.isEnableConference) {
      this.initializeStartEndTime();
    } else {
      this.checkConferenceToken();
    }
  }

  /**
   * @function changeStartTime
   * This method is used to change start Time.
   */
  public changeStartTime(event) {
    this.startTime = event.detail.value;
    const currentDate = moment().format('YYYY-MM-DD');
    const oneHourFromCurrentTime = moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').add(1, 'hours').format('h:mma');
    this.endTime = oneHourFromCurrentTime;
  }

  /**
   * @function changeEndTime
   * This method is used to change end Time.
   */
  public changeEndTime(event) {
    this.endTime = event.detail.value;
    this.isInvalidTime = moment(this.endTime, 'h:mma').diff(moment(this.startTime, 'h:mma'), 'minutes') < 1;
  }

  /**
   * @function checkConferenceToken
   * This method is used to check conference token.
   */
  public async checkConferenceToken() {
    const meetingTool = await this.utilsService.preferredMeetingTool();
    const videoConferenceType = meetingTool === MEETING_TOOLS.zoom ? 'getZoomTokenFromSession' : 'getConferenceTokenFromSession';
    this.sessionService[videoConferenceType]().then((token) => {
      if (!token) {
        this.modalService.openModal(AllowAccessComponent, {}, 'allow-access', true).then((context: { isAllow: boolean }) => {
          if (context && context.isAllow) {
            this.onCloseModel();
          } else {
            this.isEnableConference = false;
          }
        });
      }
    });
  }

  /**
   * @function checkActivityAssinged
   * This method is used to check the existing activity
   */
  public checkActivityAssinged(){
    const startDate = moment(this.selectedStartDate, 'YYYY-MM-DD');
    const activityStart = moment(this.activity.dcaAddedDate, 'YYYY-MM-DD');
    const activityEnd = moment(this.activity.endDate, 'YYYY-MM-DD');
    this.isActivityAssigned = startDate.isBetween(activityStart, activityEnd,'days', '[]');
  }

  /**
   * @function getEventContext
   * This method is used to get the context for activity assigned event
   */
  public getEventContext() {
    const classDetails = this.classService.class
    return {
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.courseId
    };
  }
}
