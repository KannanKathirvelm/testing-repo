import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@constants/router-constants';
import { ClassModel } from '@models/class/class';
import { CourseModel } from '@models/course/course';
@Component({
  selector: 'nav-premium-class',
  templateUrl: './premium-class.component.html',
  styleUrls: ['./premium-class.component.scss']
})
export class PremiumClassComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public class: ClassModel;
  @Input() public course: CourseModel;
  @Input() public isOnline: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private router: Router
  ) { }

  /**
   * @function onClickCard
   * This method is used to redirect to journey page when user clicks on card
   */
  public onClickJourney() {
    if (this.isOnline && !this.course.id) {
      const addCourseURL = routerPathIdReplace('addCourse', this.class.id);
      this.router.navigate([addCourseURL]);
    } else {
      const journeyURL = routerPathIdReplace('journey', this.class.id);
      this.router.navigate([journeyURL]);
    }
  }


  /**
   * @function onClickCard
   * This method is used to redirect to class activity page when user clicks on card
   */
  public onClickCard() {
    const classActivityURL = routerPathIdReplace('scheduledActivitiesWithFullPath', this.class.id);
    this.router.navigate([classActivityURL]);
  }


  /**
   * @function redirectToProficiency
   * This method is used to redirect to proficiency
   */
  public redirectToProficiency() {
    const proficiencyURL = routerPathIdReplace('classProficiency', this.class.id);
    this.router.navigate([proficiencyURL]);
  }
}
