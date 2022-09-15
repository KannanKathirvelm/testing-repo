import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CALENDAR_VIEW } from '@constants/helper-constants';
import * as moment from 'moment';

@Component({
  selector: 'atc-calendar',
  templateUrl: './atc-calendar.component.html',
  styleUrls: ['./atc-calendar.component.scss'],
})
export class AtcCalendarComponent implements OnChanges, OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public selectedMonth: Date;
  public maxDate: Date;
  public years: string;
  @Input() public showCalendar: boolean;
  @Input() public currentMonth: Date;
  @Output() public selectedCalendarDate = new EventEmitter();
  @Output() public closeCalendar = new EventEmitter<string>();

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    this.maxDate = new Date();
    this.maxDate.setMonth(month);
    const startYear = moment(this.currentMonth).add(-10, 'year').format('YYYY');
    const currentYear = moment(this.currentMonth).format('YYYY');
    this.years = `${startYear} : ${currentYear}`;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.currentMonth && changes.currentMonth.currentValue) {
      this.selectedMonth = new Date(this.currentMonth);
    }
  }

  /**
   * @function onMonthChange
   * This method is triggered when user select month on monthly view
   */
  public onMonthChange(date) {
    const selectedDate = moment(new Date(date)).format(CALENDAR_VIEW.DATE_FORMAT);
    this.selectedCalendarDate.emit(selectedDate);
    this.onToggleCalendar();
  }

  /**
   * @function onToggleCalendar
   * This method is triggered when user click on the icon
   */
  public onToggleCalendar() {
    this.closeCalendar.emit();
  }
}
