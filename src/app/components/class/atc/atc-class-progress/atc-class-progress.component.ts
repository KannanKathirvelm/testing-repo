import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { routerPathIdReplace } from '@constants/router-constants';
import { TimespentModel } from '@models/atc/atc';

@Component({
  selector: 'atc-class-progress',
  templateUrl: './atc-class-progress.component.html',
  styleUrls: ['./atc-class-progress.component.scss'],
})
export class AtcClassProgressComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public performanceScore: number;
  @Input() public inProgressData: number;
  @Input() public gainedData: number;
  @Input() public timespentSummary: TimespentModel;
  @Input() public classId: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router,
    private parseService: ParseService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onClickNavigate
   * This method is used to navigate to class activity page
   */
  public onClickNavigate() {
    const classProgressURL = routerPathIdReplace('classProgress', this.classId);
    this.router.navigate([classProgressURL], { queryParams: { isFromATC: true } });
    this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS);
  }
}
