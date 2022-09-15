import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaStudentListComponent } from '@components/class/class-activity/ca-student-list/ca-student-list.component';
import { CaStudentListModel } from '@models/profile/profile';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { generateArraysOfTime } from '@utils/global';
import * as moment from 'moment';

@Component({
  selector: 'nav-create-meeting-activity',
  templateUrl: './create-meeting-activity.component.html',
  styleUrls: ['./create-meeting-activity.component.scss'],
})
export class CreateMeetingActivityComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public meetingStudentIds: Array<string>;
  public isMeetingSubmitted: boolean;
  public meetingName: string;
  public meetingSelectedDate: Date;
  public startTime: string;
  public endTime: string;
  public isInvalidTime: boolean;
  public timeList: Array<string>;
  public meetingMinDate: Date;
  @Input() public classId: string;
  @Output() public createActivityEvent = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private classService: ClassService
  ) { }

  // -------------------------------------------------------------------------
  // methods

  public ngOnInit() {
    const currentDate = moment().format('YYYY-MM-DD')
    const currentTime = moment().format('h:mma'); this.timeList = generateArraysOfTime();
    const timeListFromCurrentTime = this.timeList.filter((time) => moment(time, 'h:mm A').isSameOrAfter(moment(currentTime, 'h:mm A')))[0];
    this.startTime = timeListFromCurrentTime;
    const oneHourFromCurrentTime = moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').add(1, 'hours').format('h:mma');
    this.endTime = oneHourFromCurrentTime;
    this.meetingMinDate = new Date();
    this.isMeetingSubmitted = false;
    this.meetingSelectedDate = new Date();
    const classMember = this.classService.classMembers;
    this.meetingStudentIds = classMember && classMember.members.map((item) => item.email) || [];
  }

  /**
   * @function openStudentList
   * methods to open student list
   */
  public openStudentList() {
    this.modalService.openModal(CaStudentListComponent, { classId: this.classId }, 'ca-student-list').then((context: Array<CaStudentListModel>) => {
      if (context) {
        this.meetingStudentIds = context.map((item) => item.email);
      }
    });
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
   * @function createMeetingActivity
   * methods to create meeting activity
   */
  public createMeetingActivity() {
    this.isMeetingSubmitted = true;
    if (!this.isInvalidTime && this.meetingName) {
      const meetingContext = {
        startTime: this.startTime,
        endTime: this.endTime,
        studentIds: this.meetingStudentIds,
        selectedDate: this.meetingSelectedDate,
        meetingName: this.meetingName
      };
      this.createActivityEvent.emit(meetingContext);
    }
  }
}
