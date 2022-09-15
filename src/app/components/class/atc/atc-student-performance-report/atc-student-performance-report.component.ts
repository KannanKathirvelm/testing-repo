import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ClassMembersDetailModel, NonPremiumAtcPerformance } from '@models/atc/atc';

@Component({
  selector: 'atc-student-performance-report',
  templateUrl: './atc-student-performance-report.component.html',
  styleUrls: ['./atc-student-performance-report.component.scss'],
})
export class ATCStudentPerformanceReportComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public studentPerformance: ClassMembersDetailModel;
  @Input() public nonPremiumClassStudentData: NonPremiumAtcPerformance;
  @Input() public isShowStudentAtcReport: boolean;
  @Output() public closeStudentPerformanceReport = new EventEmitter();
  public performanceBar: number;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.studentPerformance && changes.studentPerformance.currentValue) {
      this.performanceBar = this.studentPerformance.percentScore / 100;
    }
    if (changes.nonPremiumClassStudentData && changes.nonPremiumClassStudentData.currentValue) {
      this.performanceBar = this.nonPremiumClassStudentData.score / 100;
    }
  }

  /**
   * @function onCloseStudentPerformanceReport
   * Method to close the student performance report
   */
  public onCloseStudentPerformanceReport() {
    this.closeStudentPerformanceReport.emit();
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
