import { Component, Input } from '@angular/core';
import { GradingReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/grading-report.component';
import { ModalService } from '@providers/service/modal/modal.service';

@Component({
  selector: 'items-to-grade-list',
  templateUrl: './items-to-grade-list.component.html',
  styleUrls: ['./items-to-grade-list.component.scss'],
})

export class ItemsToGradeListComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public gradingList: any;
  @Input() public classId: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private modalService: ModalService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onToggleView
   * This method is used to toggle view
   */
  public onToggleView() {
    this.modalService.dismissModal();
  }


  /**
   * @function onGradeItem
   * This method is used to open grade item
   */
  public onGradeItem(item) {
    this.modalService.openModal(GradingReportComponent, { oaGrading: item }, 'grading-report').then(() => {
      // time out is used to wait previous modal to close
      setTimeout(() => {
        this.onToggleView();
      }, 500);
    });
  }
}
