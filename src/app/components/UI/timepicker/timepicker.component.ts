import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getTimeInMillisec } from '@utils/global';

@Component({
  selector: 'nav-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss'],
})
export class TimepickerComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public minHour: number;
  public maxHour: number;
  public minMinute: number;
  public maxMinute: number;
  @Input() public hours: number;
  @Input() public minutes: number;
  @Output() public hoursMinutes = new EventEmitter();

  public ngOnInit() {
    this.minHour = 0;
    this.maxHour = 24;
    this.minMinute = 0;
    this.maxMinute = 59;
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function setHours
   * This method is used to set hours
   */
  public setHours(event) {
    const selectedHours = event.target.value || 0;
    this.maxMinute = selectedHours < this.maxHour ? 59 : 0;
    this.hours = selectedHours;
  }

  /**
   * @function incrementHour
   * This method is used to increment hour
   */
  public incrementHour() {
    let hour = this.hours;
    const maxHour = this.maxHour
    let minute = this.minutes;
    if (hour === maxHour) {
      hour = 0;
      minute = 0;
    } else {
      hour++;
    }
    this.hours = hour;
    this.minutes = minute;
  };

  /**
   * @function decrementHour
   * This method is used to decrement hour
   */
  public decrementHour() {
    let hour = this.hours;
    const maxHour = this.maxHour;
    let minute = this.minutes;
    hour = hour === 0 ? maxHour : hour - 1;
    minute = hour === maxHour ? 0 : minute;
    this.hours = hour;
    this.minutes = minute;
  };

  /**
   * @function incrementMinute
   * This method is used to increment minute
   */
  public incrementMinute() {
    let minute = this.minutes;
    const maxMinute = this.maxMinute;
    let hour = this.hours;
    const maxHour = this.maxHour;
    if (minute === maxMinute) {
      minute = 0;
      hour = hour === maxHour ? 0 : hour + 1;
    } else {
      hour = hour === maxHour ? 0 : hour;
      minute++;
    }
    this.minutes = minute;
    this.hours = hour;
  };

  /**
   * @function decrementMinute
   * This method is used to decrement minute
   */
  public decrementMinute() {
    let minute = this.minutes;
    const maxMinute = this.maxMinute;
    let hour = this.hours;
    minute = minute === 0 ? maxMinute : minute - 1;
    hour = minute === maxMinute && hour > 0 ? hour - 1 : hour;
    this.minutes = minute;
    this.hours = hour;
  }

  /**
   * @function setMinutes
   * This method is used to set minutes
   */
  public setMinutes(event) {
    this.minutes = event.target.value || 0;
  }

  /**
   * @function confirmTime
   * This method is used to confirm time
   */
  public confirmTime() {
    const hoursIntoMilliseconds = getTimeInMillisec(this.hours, 0);
    const minutesIntoMilliseconds = getTimeInMillisec(0, this.minutes);
    this.hoursMinutes.emit({
      hours: this.hours,
      minutes: this.minutes,
      hoursIntoMilliseconds,
      minutesIntoMilliseconds
    })
  }

  /**
   * @function isTimeValid
   * This method is used to get time valid
   */
  public get isTimeValid() {
    return this.hours < 1 && this.minutes < 1;
  }
}
