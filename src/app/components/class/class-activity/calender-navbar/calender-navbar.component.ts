import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ClassService } from '@app/providers/service/class/class.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { CALENDAR_VIEW } from '@constants/helper-constants';
import * as moment from 'moment';

@Component({
  selector: 'nav-calender-navbar',
  templateUrl: './calender-navbar.component.html',
  styleUrls: ['./calender-navbar.component.scss'],
})

export class CalenderNavbarComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public isWeeklyView: boolean;
  public isDailyView: boolean;
  public isMonthlyView: boolean;
  public noActivities: boolean;
  public calendarViewMode: string;
  public dailyViewDate: string;
  public monthlyViewStartDate: string;
  public monthlyViewEndDate: string;
  public weeklyViewStartDate: string;
  public weeklyViewEndDate: string;
  public showCalendar: boolean;
  public isLoading: boolean;
  public weeklyViewCurrentMonthDate: string;
  public dailyViewCurrentMonthDate: string;
  public currentMonthDate: string;
  public selectedDate: string;
  @Output() public selectView = new EventEmitter<string>();
  @Input() public highlightDates: Array<string>;
  @Input() public disabledDates: Array<Date>;
  @Output() public selectedCalenderDate = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private parseService: ParseService,
    private classService: ClassService,
  ) {
    this.initialize();
  }

  // -------------------------------------------------------------------------
  // life cycle methods

  public ngOnInit() {
    this.loadData();
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public async onRefresh(event) {
    await this.loadData(true);
    event.target.complete();
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  public loadData(isReload?) {
    return Promise.all([this.onSelectView(CALENDAR_VIEW.DAILY, isReload), this.fetchMonthActiviyList(this.dailyViewDate)]);
  }

  /**
   * @function initialize
   * Initialize the property
   */
  public initialize() {
    const todayDate = moment();
    this.dailyViewDate = todayDate.format(CALENDAR_VIEW.DATE_FORMAT);
    this.selectedDate = this.dailyViewDate;
    this.weeklyViewStartDate = todayDate.weekday(0).format(CALENDAR_VIEW.DATE_FORMAT);
    this.weeklyViewEndDate = todayDate.weekday(6).format(CALENDAR_VIEW.DATE_FORMAT);
    this.monthlyViewStartDate = todayDate.startOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
    this.monthlyViewEndDate = todayDate.endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
  }

  /**
   * @function onToggleCalendar
   * This method is triggered when user click on the icon
   */
  public onToggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  /**
   * @function onSelectView
   * This method is triggered when user choose calendar views
   */
  public onSelectView(view, isReload?) {
    const context = this.getCaEventContext();
    this.selectView.emit(view);
    if (view === CALENDAR_VIEW.DAILY) {
      this.isDailyView = true;
      this.isWeeklyView = false;
      this.isMonthlyView = false;
      this.fetchClassActivityList(this.dailyViewDate, null);
      this.selectedDate = this.dailyViewDate;
      if (this.currentMonthDate !== this.dailyViewCurrentMonthDate) {
        this.fetchMonthActiviyList(this.dailyViewCurrentMonthDate);
      }
      this.parseService.trackEvent(EVENTS.CLICK_DAILY_VIEW, context);
    } else if (view === CALENDAR_VIEW.WEEKLY) {
      this.isWeeklyView = true;
      this.isMonthlyView = false;
      this.isDailyView = false;
      this.fetchClassActivityList(this.weeklyViewStartDate,
        this.weeklyViewEndDate);
      this.selectedDate = this.weeklyViewStartDate;
      if (this.currentMonthDate !== this.weeklyViewCurrentMonthDate) {
        this.fetchMonthActiviyList(this.weeklyViewCurrentMonthDate);
      }
      this.parseService.trackEvent(EVENTS.CLICK_WEEKLY_VIEW, context);
    } else {
      this.isMonthlyView = true;
      this.isWeeklyView = false;
      this.isDailyView = false;
      this.fetchClassActivityList(this.monthlyViewStartDate,
        this.monthlyViewEndDate);
      this.selectedDate = this.monthlyViewStartDate;
      this.parseService.trackEvent(EVENTS.CLICK_MONTHLY_VIEW, context);
    }
    return;
  }

  /**
   * @function onPreviousDate
   * This method is triggered when user clicks on previous icon
   */
  public onPreviousDate() {
    if (this.isDailyView) {
      this.dailyViewDate = moment(this.dailyViewDate).add(-1, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.dailyViewDate;
      this.fetchClassActivityList(this.dailyViewDate);
    } else if (this.isWeeklyView) {
      const previousWeek = moment(this.weeklyViewStartDate).add(-1, 'weeks');
      this.weeklyViewStartDate = previousWeek.format(CALENDAR_VIEW.DATE_FORMAT);
      this.weeklyViewEndDate = previousWeek.add(6, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.weeklyViewStartDate;
      this.fetchClassActivityList(this.weeklyViewStartDate, this.weeklyViewEndDate);
    } else {
      const previousMonth = moment(this.monthlyViewStartDate).add(-1, 'months');
      this.monthlyViewStartDate = previousMonth.format(CALENDAR_VIEW.DATE_FORMAT);
      this.monthlyViewEndDate = moment(previousMonth).endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.monthlyViewStartDate;
      this.fetchClassActivityList(this.monthlyViewStartDate, this.monthlyViewEndDate);
    }
  }

  /**
   * @function onNextDate
   * This method is triggered when user clicks on next icon
   */
  public onNextDate() {
    if (this.isDailyView) {
      this.dailyViewDate = moment(this.dailyViewDate).add(1, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.dailyViewDate;
      this.fetchClassActivityList(this.dailyViewDate);
    } else if (this.isWeeklyView) {
      const nextWeek = moment(this.weeklyViewStartDate).add(1, 'weeks');
      this.weeklyViewStartDate = nextWeek.format(CALENDAR_VIEW.DATE_FORMAT);
      this.weeklyViewEndDate = nextWeek.add(6, 'days').format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.weeklyViewStartDate;
      this.fetchClassActivityList(this.weeklyViewStartDate, this.weeklyViewEndDate);
    } else {
      const nextMonth = moment(this.monthlyViewStartDate).add(1, 'months');
      this.monthlyViewStartDate = nextMonth.format(CALENDAR_VIEW.DATE_FORMAT);
      this.selectedDate = this.monthlyViewStartDate;
      this.monthlyViewEndDate = nextMonth.endOf('month').format(CALENDAR_VIEW.DATE_FORMAT);
      this.fetchClassActivityList(this.monthlyViewStartDate, this.monthlyViewEndDate);
    }
  }

  /**
   * @function dailyViewDateChanged
   * This method is triggered when user select date on daily view
   */
  public dailyViewDateChanged(date) {
    this.dailyViewDate = date.startDate;
    this.selectedDate = this.dailyViewDate;
    this.fetchClassActivityList(date.startDate);
    this.showCalendar = true;
    this.isDailyView = true;
    this.isWeeklyView = false;
    this.isMonthlyView = false;
  }

  /**
   * @function weeklyViewDateChanged
   * This method is triggered when user select date on weekly view
   */
  public weeklyViewDateChanged(date) {
    this.weeklyViewStartDate = date.startDate;
    this.selectedDate = this.weeklyViewStartDate;
    this.weeklyViewEndDate = date.endDate;
    this.fetchClassActivityList(date.startDate, date.endDate);
  }

  /**
   * @function dailyViewMonthChanged
   * This method is triggered when user change month on daily view
   */
  public dailyViewMonthChanged(date) {
    this.dailyViewCurrentMonthDate = date;
    this.selectedDate = this.dailyViewCurrentMonthDate;
    this.fetchMonthActiviyList(date);
  }

  /**
   * @function weeklyViewMonthChanged
   * This method is triggered when user change month on weekly view
   */
  public weeklyViewMonthChanged(date) {
    this.weeklyViewCurrentMonthDate = date;
    this.selectedDate = this.weeklyViewCurrentMonthDate;
    this.fetchMonthActiviyList(date);
  }

  /**
   * @function monthlyViewMonthChanged
   * This method is triggered when user select month on monthly view
   */
  public monthlyViewMonthChanged(date) {
    this.monthlyViewStartDate = date.startDate;
    this.monthlyViewEndDate = date.endDate;
    this.selectedDate = this.monthlyViewStartDate;
    this.fetchClassActivityList(date.startDate, date.endDate);
    this.showCalendar = true;
  }

  /**
   * @function fetchClassActivityList
   * This method is used to fetch activities for given date
   */
  public fetchClassActivityList(startDate, endDate = null) {
    this.selectedCalenderDate.emit({
      startDate,
      endDate,
      calenderView: CALENDAR_VIEW.DAILY
    });
  }

  /**
   * @function fetchMonthActiviyList
   * This method is used to fetch activities for given month
   */
  private fetchMonthActiviyList(date) {
    this.selectedCalenderDate.emit({
      startDate: date,
      calenderView: CALENDAR_VIEW.MONTHLY
    });
  }

  /**
   * @function getCaEventContext
   * This method is used to get the context for ca event
   */
  public getCaEventContext() {
    const classDetails = this.classService.class;
    return {
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.courseId,
      premiumClass: classDetails.isPremiumClass,
      publicClass: classDetails.isPublic
    };
}
}
