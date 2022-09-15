import { Component, Input } from '@angular/core';
import { OaGradeItemModel, SubmissionModel } from '@app/models/offline-activity/offline-activity';

@Component({
  selector: 'student-offline-activity-content-report',
  templateUrl: './student-offline-activity-content-report.component.html',
  styleUrls: ['./student-offline-activity-content-report.component.scss'],
})
export class StudentOfflineActivityContentReportComponent {
  @Input() public offlineActivity: OaGradeItemModel;
  @Input() public submissions: SubmissionModel;
  @Input() public classId: string;
  @Input() public contentId: number;
  @Input() public isTeacherGraded: boolean;
  @Input() public isPreview: boolean;
}
