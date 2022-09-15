import { Component, NgZone, OnDestroy } from '@angular/core';
import { CONTENT_TYPES, SORTING_TYPES } from '@constants/helper-constants';
import { ClassModel } from '@models/class/class';
import { GradeItem, RubricGroupingModel, RubricQuestionItem } from '@models/rubric/rubric';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { NetworkService } from '@providers/service/network.service';
import { RubricService } from '@providers/service/rubric/rubric.service';
import { UtilsService } from '@providers/service/utils.service';
import { sortBy, sortByDate, sortByNumber } from '@utils/global';
import axios from 'axios';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-grading',
  templateUrl: './grading.page.html',
  styleUrls: ['./grading.page.scss'],
})

export class GradingPage  implements  OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public class: ClassModel;
  public gradingItemsList: Array<GradeItem>;
  public gradingItems: Array<RubricGroupingModel>;
  public isGradeItemLoaded: boolean;
  public secondaryClasses: Array<ClassModel>;
  public sortSlideOpts: { initialSlide: number, slidesPerView: number, speed: number };
  public sortSlider: { isBeginningSlide: boolean; isEndSlide: boolean; };
  public sortList: Array<{ label: string; icon: string; sortingKey: string; }>;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    public classService: ClassService,
    public classActivityService: ClassActivityService,
    private rubricService: RubricService,
    private translate: TranslateService,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
  ) { }

  // -------------------------------------------------------------------------
  // Events
  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  // -------------------------------------------------------------------------
  // Methods

  public ionViewDidEnter() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        if (this.isOnline) {
          this.class = this.classService.class;
          this.secondaryClasses = this.classService.secondaryClasses;
          this.sortSlideOpts = {
            initialSlide: 0,
            slidesPerView: 1,
            speed: 400
          };
          this.sortSlider = {
            isBeginningSlide: true,
            isEndSlide: false
          };
          this.sortList = [{
            label: this.translate.instant('ACTIVITY'),
            icon: 'local_library',
            sortingKey: 'contentType'
          }, {
            label: this.translate.instant('DATE'),
            icon: 'calendar_today',
            sortingKey: 'activationDate'
          }, {
            label: this.translate.instant('STUDENT'),
            icon: 'account_circle',
            sortingKey: 'studentCount'
          }];
          this.loadItemsToGrade();
        }
      });
    });
  }

  /**
   * @function loadItemsToGrade
   * This method is used to load items to grade
   */
  public loadItemsToGrade() {
    this.isGradeItemLoaded = false;
    this.gradingItemsList = [];
    const classIds = [this.class.id].concat(this.secondaryClasses.map((item) => item.id));
    const promiseList = classIds.map((classId) => {
      return new Promise((resolve, reject) => {
        return axios.all<{}>([
          this.rubricService.fetchRubricItems({ classId }),
          this.rubricService.fetchRubricQuestionsItems({ classId })
        ]).then(axios.spread((oaItems: Array<GradeItem>, questionRubricItem: Array<RubricQuestionItem>) => {
          const questionItems = questionRubricItem.filter((item) => item.collectionType === CONTENT_TYPES.ASSESSMENT);
          const gradableItems = [...questionItems, ...oaItems];
          if (gradableItems && gradableItems.length) {
            gradableItems.map((gradableItem) => {
              gradableItem.classId = classId;
              this.gradingItemsList.push(gradableItem);
            })
          }
          resolve();
        }), reject);
      });
    });
    Promise.all(promiseList).then(() => {
      this.groupGradingItems();
    });
  }

  /**
   * @function groupGradingItems
   * This method is used to group grading items
   */
  public groupGradingItems() {
    const groupedGradingItems = [];
    this.gradingItemsList.forEach((gradingItem) => {
      let existingGradingItem = groupedGradingItems.find(groupedGradingItem => {
        return (
          (groupedGradingItem.contentType === CONTENT_TYPES.ASSESSMENT &&
            groupedGradingItem.resourceId ===
            gradingItem.resourceId) ||
          (groupedGradingItem.contentType ===
            CONTENT_TYPES.OFFLINE_ACTIVITY &&
            (groupedGradingItem.contentId === gradingItem.collectionId) &&
            (groupedGradingItem.activityId === gradingItem.dcaContentId))
        );
      });
      const classObject = {
        title: this.class.title,
        id: this.class.id,
        code: this.class.code,
        activityDate: gradingItem.activityDate || gradingItem.activationDate || null,
        studentCount: gradingItem.studentCount
      };
      if (existingGradingItem) {
        const gradingClasses = existingGradingItem.gradingClasses;
        gradingClasses.push(classObject);
      } else {
        existingGradingItem = {
          contentId: gradingItem.collectionId,
          contentType: gradingItem.collectionType,
          resourceId: gradingItem.resourceId,
          resourceTitle: gradingItem.title,
          classId: this.class.id,
          activityDate: gradingItem.activityDate || null,
          activityId: Number(gradingItem.dcaContentId) || null,
          gradingClasses: [classObject],
          subQuestionId: gradingItem.subQuestionId || null,
          studentCount: gradingItem.studentCount,
          activationDate: gradingItem.activationDate,
          students: gradingItem.students
        }
        groupedGradingItems.push(existingGradingItem);
      }
    });

    const groups = [];
    groupedGradingItems.map((gradeItem) => {
      const alreadyExistActivity = groups.find((group) => {
        return (group.activityId === gradeItem.activityId) && (group.contentId === gradeItem.contentId);
      })
      if (alreadyExistActivity) {
        alreadyExistActivity.questions.push(gradeItem);
      } else {
        const assessment = {
          contentId: gradeItem.contentId,
          activationDate: gradeItem.activationDate,
          resourceId: gradeItem.resourceId,
          contentType: gradeItem.contentType,
          activityId: Number(gradeItem.activityId) || undefined,
          questions: [gradeItem],
          studentCount: gradeItem.studentCount
        }
        groups.push(assessment);
      }
    });
    this.gradingItems = groups;
    this.isGradeItemLoaded = true;
    this.sortGradingList(0);
  }

  /**
   * @function reloadItemsToGrade
   * This method is used to reload items to grade
   */
  public reloadItemsToGrade() {
    this.loadItemsToGrade();
  }

  // Method called when slide is changed by drag or navigation
  public SlideDidChange(object, slideView) {
    this.checkIfNavDisabled(object, slideView);
  }

  // Move to previous slide
  public async slidePrev(object, slideView) {
    const activeIndex = await slideView.getActiveIndex();
    slideView.slidePrev(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
    const prevIndex = activeIndex - 1;
    this.sortGradingList(prevIndex);
  }

  // Move to Next slide
  public async slideNext(object, slideView) {
    const activeIndex = await slideView.getActiveIndex();
    slideView.slideNext(500).then(() => {
      this.checkIfNavDisabled(object, slideView);
    });
    const nextIndex = activeIndex + 1;
    this.sortGradingList(nextIndex);
  }

  // Call methods to check if slide is first or last to enable disbale navigation
  public checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }

  // Call methods to check if slide is Beginning
  public checkisBeginning(object, slideView) {
    slideView.isBeginning().then((istrue) => {
      object.isBeginningSlide = istrue;
    });
  }

  // Call methods to check if slide is end
  public checkisEnd(object, slideView) {
    slideView.isEnd().then((istrue) => {
      object.isEndSlide = istrue;
    });
  }

  /**
   * @function sortGradingList
   * This method is used to sort grading list
   */
  public sortGradingList(sortIndex) {
    const activeSort = this.sortList[sortIndex];
    switch (sortIndex) {
      case 0: {
        sortBy(this.gradingItems, activeSort.sortingKey, SORTING_TYPES.ascending);
        break;
      }
      case 1: {
        sortByDate(this.gradingItems, activeSort.sortingKey, SORTING_TYPES.descending);
        break;
      }
      case 2: {
        sortByNumber(this.gradingItems, activeSort.sortingKey, SORTING_TYPES.ascending);
        break;
      }
    }
  }
}
