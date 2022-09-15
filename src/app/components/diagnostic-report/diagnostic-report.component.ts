import { Component, Input, OnInit } from '@angular/core';
import { ATTEMP_STATUS, SCORE_LEVEL } from '@app/constants/helper-constants';
import { CAStudentList, ClassContentModel } from '@app/models/class-activity/class-activity';
import { AnswerModel, CollectionsModel, ContentModel } from '@app/models/collection/collection';
import { CollectionProvider } from '@app/providers/apis/collection/collection';
import { PerformanceProvider } from '@app/providers/apis/performance/performance';
import { ClassActivityService } from '@app/providers/service/class-activity/class-activity.service';
import { ModalService } from '@app/providers/service/modal/modal.service';
import { ReportService } from '@app/providers/service/report/report.service';
import { convertNumberIntoChar, getObjectCopy } from '@app/utils/global';
import { CaStudentsAggregatedReportComponent } from '../class/reports/ca-students-aggregated-report/ca-students-aggregated-report.component';

@Component({
  selector: 'nav-diagnostic-report',
  templateUrl: './diagnostic-report.component.html',
  styleUrls: ['./diagnostic-report.component.scss'],
})
export class DiagnosticReportComponent implements OnInit {
  @Input() public activity: ClassContentModel;
  @Input() public courseId: string;
  @Input() public isCaBaselineWorkflow: boolean;
  public caStudentList: Array<CAStudentList>;
  public collection: CollectionsModel;
  public studenstReport: Array<CAStudentList>;
  public isShowUpdateData: boolean;
  public isThumbnailError: boolean;

  constructor(
    private modalService: ModalService,
    private classActivityService: ClassActivityService,
    private performanceProvider: PerformanceProvider,
    private collectionProvider: CollectionProvider,
    private reportService: ReportService
  ) { }

  public ngOnInit() {
    this.fetchClassActivityUserList();
  }

  /**
   * @function fetchClassActivityUserList
   * This Method is used to get list of students in class activity
   */
  public fetchClassActivityUserList() {
    this.classActivityService.fetchClassActivityUserList(this.activity.classId, this.activity.id).then((response) => {
      this.caStudentList = response;
      this.fetchReportCollection();
    });
  }

  /**
   * @function fetchReportCollection
   * This method is used to fetch collection
   */
  public fetchReportCollection() {
    this.collectionProvider.fetchCollectionById(this.activity.contentId, this.activity.contentType).then((assessmentResponse) => {
      this.collection = assessmentResponse;
      this.collection.content.forEach((content, index) => {
        if (content.taxonomy) {
          const key = Object.keys(content.taxonomy)[0];
          const taxonomy = content.taxonomy[key];
          const standard = {
            code: taxonomy.code,
            domainCode: taxonomy.domainCode,
            title: taxonomy.title,
            id: key
          }
          this.collection.content[index].standard = standard;
        }
      });
      this.fetchCAStudentsPerformance();
    });
  }

  /**
   * @function fetchCAStudentsPerformance
   * This Method is used to get performance of students in class activity
   */
  public fetchCAStudentsPerformance() {
    this.performanceProvider.fetchCAStudentsPerformance(
      this.activity.classId,
      this.activity.contentType,
      this.activity.contentId,
      this.activity.id,
      this.activity.activationDate || this.activity.dcaAddedDate,
      this.activity.endDate
    ).then((result) => {
      const questions = this.collection.content;
      const studentPerformances = result;
      this.isShowUpdateData = studentPerformances.length === this.caStudentList.length ? false : true;
      this.studenstReport = this.caStudentList.map((caStudent) => {
        const studentId = caStudent.id;
        const studentPerformanceData = studentPerformances.find((studentPerformance) => studentPerformance.userUid === studentId);
        caStudent.performance = studentPerformanceData;
        const studentPerformanceUsageData = studentPerformanceData?.usageData || [];
        caStudent.questions = questions.map((question) => {
          const questionCopy: ContentModel = getObjectCopy(question);
          const questionId = questionCopy.id;
          const studentQuestionPerformance = studentPerformanceUsageData.find((item) => {
            return item.gooruOId === questionId;
          });
          const studentAnswerObject = studentQuestionPerformance?.answerObject || [];
          // When student is not performed
          if (!studentQuestionPerformance) {
            questionCopy.isPerformed = false;
            return questionCopy;
          }
          questionCopy.isPerformed = true;
          const studentScore = studentQuestionPerformance.score;
          // When student performance is added by teacher
          if (!studentAnswerObject.length) {
            questionCopy.performByAddData = true;
            const optionCopy: AnswerModel = {};
            const score = studentScore > 100 ? (studentScore / 100) : studentScore;
            optionCopy.answer_text = `${score}%`;
            optionCopy.answerStatus = score > 0 ? ATTEMP_STATUS.CORRECT : ATTEMP_STATUS.INCORRECT;
            questionCopy.answer = [optionCopy];
          } else {
            questionCopy.answer = question.answer.map((answerItem) => {
              const answerCopy: AnswerModel = getObjectCopy(answerItem);
              const answerSeq = answerCopy.sequence;
              const studentAnswerItem = studentAnswerObject.find((answerObjectItem) => {
                return answerObjectItem.order === answerSeq;
              });
              answerCopy.answer_text = studentAnswerItem?.answer_text;
              answerCopy.answerStatus = studentAnswerItem?.status || null;
              return answerCopy;
            });
          }
          questionCopy.scoreStatus = (studentScore <= 0) ? SCORE_LEVEL.INCORRECT : (studentScore >= 100) ? SCORE_LEVEL.CORRECT : SCORE_LEVEL.PARTIALLY_CORRECT;
          return questionCopy;
        });
        return caStudent;
      });
    });
  }

  /**
   * @function onOpenAggregateReport
   * This Method is used to open modal for aggregated report
   */
  public onOpenAggregateReport(content) {
    const competency = {
      id: content.id,
      standard: content.standard
    };
    const context = {
      activity: this.activity,
      courseId: this.courseId,
      isCaBaselineWorkflow: this.isCaBaselineWorkflow,
      competency
    };
    this.modalService.openModal(CaStudentsAggregatedReportComponent, context, 'students-aggregated-report').then(() => {
      this.studenstReport = [];
      this.collection.content = [];
      this.fetchClassActivityUserList();
    });
  }

  /**
   * @function updateData
   * This method is used to update data
   */
  public updateData() {
    const nonPerformedStudent = this.caStudentList.filter(item => !item.performance);
    this.activity['students'] = nonPerformedStudent;
    this.reportService.openAddDataReport(this.activity).then(() => {
      this.studenstReport = [];
      this.collection.content = [];
      this.fetchClassActivityUserList();
    });
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function convertNumberToChar
   * This method is used to convert number into character
   */
  public convertNumberToChar(number) {
    return convertNumberIntoChar(number);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
