import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassModel } from '@app/models/class/class';
import { CaAssignCalenderComponent } from '@components/class/class-activity/ca-assign-calender/ca-assign-calender.component';
import { ClassContentModel } from '@models/class-activity/class-activity';
import { ModalService } from '@providers/service/modal/modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { ContentModel } from '@models/signature-content/signature-content';
import * as moment from 'moment';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';

@Component({
  selector: 'nav-assign-activity-card',
  templateUrl: './assign-activity-card.component.html',
  styleUrls: ['./assign-activity-card.component.scss'],
})
export class AssignActivityCardComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public content: ContentModel;
  @Output() public addActivityEvent = new EventEmitter();
  @Input() public activities: Array<ClassContentModel> = [];
  @Input() public classDetails: ClassModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private reportService: ReportService,
    private parseService: ParseService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function openCalender
   * This method is used to open calender
   */
  public openCalender() {
    const activity = this.activities.find((item) => item.contentId === this.content.id);
    const content = this.content;
    const startDate = activity
      ? moment(activity.endDate).add(1, 'days')
      : moment();
    this.modalService.openModal(CaAssignCalenderComponent, {
      startDate,
      activity,
      content,
      selectedDates: null,
      endDate: null
    }, 'ca-assign-calender').then((context) => {
      if (context) {
        this.addActivityEvent.emit({
          content: this.content,
          context
        });
      }
    });
    this.parseService.trackEvent(EVENTS.CLICK_CA_SHOW_SCOPE_SEQUENCE_SCHEDULE);
  }

  /**
   * @function onClickStudentReport
   * This method used to call report function based on type
   */
  public onPreview() {
    const context = {
      collectionId: this.content.id,
      collectionType: this.content.format,
      contentId: this.content.contentId || this.content.id,
      isPreview: true
    };
    this.reportService.showReport(context);
    this.parseService.trackEvent(EVENTS.CLICK_CA_PREVIEW_SHOW_SCOPE_SEQUENCE_CARD);
   }
}
