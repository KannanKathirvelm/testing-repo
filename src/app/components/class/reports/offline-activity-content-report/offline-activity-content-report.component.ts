import { Component, Input } from '@angular/core';
import { OaGradeItemModel, TaskModel } from '@models/offline-activity/offline-activity';
import { OaStudentRubricModel } from '@models/rubric/rubric';

@Component({
  selector: 'offline-activity-content-report',
  templateUrl: './offline-activity-content-report.component.html',
  styleUrls: ['./offline-activity-content-report.component.scss'],
})
export class OfflineActivityContentReportComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public offlineActivity: OaGradeItemModel;
  @Input() public activityTasks: TaskModel;
  @Input() public studentRubric: OaStudentRubricModel;
  @Input() public teacherRubric: OaStudentRubricModel;
  @Input() public isPreview: boolean;
  @Input() public isStudent: boolean;
  public showMore: boolean;
}
