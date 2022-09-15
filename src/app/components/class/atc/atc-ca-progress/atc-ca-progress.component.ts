import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@constants/router-constants';

@Component({
  selector: 'atc-ca-progress',
  templateUrl: './atc-ca-progress.component.html',
  styleUrls: ['./atc-ca-progress.component.scss'],
})
export class AtcCaProgressComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activitiesCount: { scheduled: number, unscheduled: number };
  @Input() public classId: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onClickNavigate
   * This method is used to navigate to class activity page
   */
  public onClickNavigate() {
    const classActivityURL = routerPathIdReplace('scheduledActivitiesWithFullPath', this.classId);
    this.router.navigate([classActivityURL]);
  }
}
