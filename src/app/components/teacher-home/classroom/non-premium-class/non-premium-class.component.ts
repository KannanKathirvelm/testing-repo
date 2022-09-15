import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@constants/router-constants';
import { environment } from '@environment/environment';
import { ClassModel } from '@models/class/class';
import { CourseModel } from '@models/course/course';
@Component({
  selector: 'nav-non-premium-class',
  templateUrl: './non-premium-class.component.html',
  styleUrls: ['./non-premium-class.component.scss'],
})
export class NonPremiumClassComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public class: ClassModel;
  @Input() public course: CourseModel;
  @Input() public isOnline: boolean;
  public hasCMStarted: boolean;
  public isPublicClassShow: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private router: Router
  ) {
    this.isPublicClassShow = environment.SHOW_PUBLIC_CLASS;
  }

  /**
   * @function getCAPerformance
   * This method is used to get ca performance
   */
  public getCAPerformance(performance) {
    return performance ? performance.scoreInPercentage : null;
  }

  /**
   * @function getCMPerformance
   * This method is used to get course map performance
   */
  public getCMPerformance(performance) {
    return performance ? performance.score : null;
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function navigateToCourseMap
   * This method is used to redirect to course map page
   */
  public navigateToCourseMap() {
    const courseMapURL = routerPathIdReplace('classJourneyFullPath', this.class.id);
    if (this.class.isPublic && this.isPublicClassShow) {
      this.router.navigate([courseMapURL], { queryParams: { isPublic: true } });
    } else {
      this.router.navigate([courseMapURL]);
    }
  }

  /**
   * @function navigateToProficiency
   * This method is used to redirect to proficiency page
   */
  public navigateToProficiency() {
    const proficiencyURL = routerPathIdReplace('StudentProficiency', this.class.id);
    if (this.class.isPublic && this.isPublicClassShow) {
      this.router.navigate([proficiencyURL], { queryParams: { isPublic: true } });
    } else {
      this.router.navigate([proficiencyURL]);
    }
  }

  /**
   * @function onClickCard
   * This method is used to redirect to journey page when user clicks on card
   */
  public onClickCard() {
    const classActivityURL = routerPathIdReplace('scheduledActivitiesWithFullPath', this.class.id);
    this.router.navigate([classActivityURL]);
  }

  /**
   * @function onClickJourney
   * This method is used to redirect to journey page
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
}
