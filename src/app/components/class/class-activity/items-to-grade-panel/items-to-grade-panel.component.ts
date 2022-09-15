import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { GradingReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/grading-report.component';
import { CONTENT_TYPES } from '@constants/helper-constants';
import { CollectionsModel, ContentModel } from '@models/collection/collection';
import { OaGradeItemModel } from '@models/offline-activity/offline-activity';
import { RubricGroupingModel } from '@models/rubric/rubric';
import { CollectionService } from '@providers/service/collection/collection.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { OfflineActivityService } from '@providers/service/offline-activity/offline-activity.service';

@Component({
  selector: 'nav-items-to-grade-panel',
  templateUrl: './items-to-grade-panel.component.html',
  styleUrls: ['./items-to-grade-panel.component.scss'],
})

export class ItemsToGradePanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public grade: RubricGroupingModel;
  @Input() public classId: string;
  @Output() public reloadItemsToGrade = new EventEmitter();
  public isAssessmentGrading: boolean;
  public assessmentGradingContent: ContentModel;
  public assessmentContent: CollectionsModel;
  public oaGradingContent: OaGradeItemModel;
  public oaContent: OaGradeItemModel;
  public studentCount: number;
  public questionCount: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private offlineActivityService: OfflineActivityService,
    private modalService: ModalService,
    private collectionService: CollectionService,
    private parseService: ParseService
  ) {
  }

  // -------------------------------------------------------------------------
  // life cycle methods

  public ngOnInit() {
    this.isAssessmentGrading = this.grade.contentType === CONTENT_TYPES.ASSESSMENT;
    if (this.isAssessmentGrading) {
      this.loadAssessmentData();
    } else {
      this.loadOfflineActivityData();
    }
    this.parseService.trackEvent(EVENTS.CLICK_CA_ITEM_GRADE);
  }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function loadAssessmentData
   * This method is used to load assessment data
   */
  public loadAssessmentData() {
    const assessmentId = this.grade.contentId;
    const questionId = this.grade.resourceId;
    const subQuestionId = this.grade.subQuestionId;
    this.collectionService.fetchCollectionById(assessmentId, CONTENT_TYPES.ASSESSMENT).then((assessmentResponse) => {
      const questions = assessmentResponse.content;
      let question = questions.find((questionItem) => questionItem.id === questionId);
      if (subQuestionId) {
        question = question.subQuestions.find((item) => item.id === subQuestionId);
      }
      this.assessmentGradingContent = question;
      this.assessmentContent = assessmentResponse;
      this.questionCount = this.assessmentContent.content ? this.assessmentContent.content.length : null;
    });
  }

  /**
   * @function loadOfflineActivityData
   * This method is used to load offline activity data
   */
  public loadOfflineActivityData() {
    this.offlineActivityService.readActivity(this.grade.contentId).then((response) => {
      this.oaGradingContent = response;
      this.oaContent = response;
    })
  }

  /**
   * @function onGradeItem
   * This method is used to grade item
   */
  public onGradeItem(item) {
    const gradingItem = {
      classId: item.id,
      dcaContentId: this.grade.activityId,
      collection: this.isAssessmentGrading ? this.assessmentContent : this.oaContent,
      content: this.isAssessmentGrading ? this.assessmentGradingContent : this.oaGradingContent,
      contentType: this.grade.contentType,
      studentCount: item.studentCount,
      activityDate: item.activityDate,
      isAssessmentGrading: this.isAssessmentGrading,
      isDCAContext: true
    };
    this.modalService.openModal(GradingReportComponent, { oaGrading: gradingItem }, 'grading-report').then(() => {
      this.reloadItemsToGrade.emit();
    });
    this.parseService.trackEvent(EVENTS.CLICK_CA_ITEM_GRADE_SCORE);
  }
}
