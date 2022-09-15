import { Component, Input } from '@angular/core';
import { OaGradeItemModel, OAStudentPerformanceForReport } from '@models/offline-activity/offline-activity';

@Component({
  selector: 'offline-activity-summary-report',
  templateUrl: './offline-activity-summary-report.component.html',
  styleUrls: ['./offline-activity-summary-report.component.scss'],
})

export class OfflineActivitySummaryReportComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public offlineActivity: OaGradeItemModel;
  @Input() public performance: OAStudentPerformanceForReport;
}
