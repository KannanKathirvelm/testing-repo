import { Component } from '@angular/core';
import { CONTENT_TYPES } from '@constants/helper-constants';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ClassModel } from '@models/class/class';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import * as moment from 'moment';

@Component({
  selector: 'app-unscheduled-activities',
  templateUrl: './unscheduled-activities.page.html',
  styleUrls: ['./unscheduled-activities.page.scss'],
})
export class UnscheduledActivitiesPage {

  // -------------------------------------------------------------------------
  // Properties

  public class: ClassModel;
  public contentTypes: Array<string>;
  public classContents: Array<ClassContentModel>;
  public showCalendar: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classActivityService: ClassActivityService
  ) {
    this.contentTypes = [CONTENT_TYPES.ASSESSMENT, CONTENT_TYPES.COLLECTION, CONTENT_TYPES.OFFLINE_ACTIVITY];
  }

  /**
   * This method is triggered when user click on the icon
   */
  public onToggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  /**
   * @function fetchUnScheduledActivity
   * This method is used to fetch unscheduled activity
   */
  public fetchUnScheduledActivity() {
    const context = {
      classId: this.class.id,
      month: moment().format('MM'),
      year: moment().format('YYYY'),
      contentType: this.contentTypes.join(','),
      secondaryClasses: undefined
    };
    this.classActivityService.fetchUnScheduledActivityByContentType(context).then((classContentsRes) => {
      this.classContents = classContentsRes;
    });
  }
}