import { Component, Input } from '@angular/core';
import { ClassModel } from '@app/models/class/class';
import { SearchResultsModel } from '@app/models/search/search';
import { ClassProvider } from '@app/providers/apis/class/class';
import { ClassService } from '@app/providers/service/class/class.service';
import { ModalService } from '@app/providers/service/modal/modal.service';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { TranslateService } from '@ngx-translate/core';
import { CourseService } from '@app/providers/service/course/course.service';

@Component({
  selector: 'app-add-course-card',
  templateUrl: './add-course-card.component.html',
  styleUrls: ['./add-course-card.component.scss'],
})
export class AddCourseCardComponent {

  @Input() public content: SearchResultsModel;
  @Input() public classDetail: ClassModel;
  public isLoading: boolean;
  public isShowMore: boolean;

  constructor(
    private classProvider: ClassProvider,
    private classService: ClassService,
    private translate: TranslateService,
    private modalService: ModalService,
    private dialogs: Dialogs,
    private courseService: CourseService
  ) { }

  /**
   * @function addCourse
   * This method used to add a course
   */
  public addCourse() {
    const courseId = this.content.id;
    const classId = this.classDetail.id;
    const isPremiumClass = this.classDetail.isPremiumClass;
    const alertMessage = this.translate.instant(
      'INCORRECT_CARD_SELECT_MSG'
    );
    if (!this.isLoading) {
      this.isLoading = true;
      this.classProvider.assignCourse(classId, courseId).then((response) => {
        if (isPremiumClass) {
          this.updateGapProfile();
        }
        this.courseService.updateCourseSubject.next(courseId);
        this.modalService.dismissModal();
      }).catch((error) => {
        this.isLoading = false;
        if (error && error.status === 400) {
          this.dialogs.alert(alertMessage)
        }
      })
    }
  }

  /**
   * @function updateGapProfile
   * This method used to update gap profile
   */
  public updateGapProfile() {
    const classDetail = this.classDetail;
    const classId = classDetail.id;
    const updateDeatils = {
      grade_current: classDetail.gradeCurrent,
      grade_lower_bound: classDetail.gradeLowerBound,
      grade_upper_bound: classDetail.gradeUpperBound,
      preference: classDetail.preference,
      route0: true
    };
    this.classService.updateRerouteSettings(classId, updateDeatils);
  }

  /**
   * @function showMoreContent
   * This method is used to show more content
   */
  public showMoreContent() {
    this.isShowMore = !this.isShowMore;
  }
}
