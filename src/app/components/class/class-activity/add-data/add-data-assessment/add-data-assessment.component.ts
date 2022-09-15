import { Component, OnInit } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { ToastService } from '@app/providers/service/toast.service';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { AlertController, NavParams } from '@ionic/angular';
import { CAStudentPerformance } from '@models/class-activity/class-activity';
import { ClassModel } from '@models/class/class';
import { AssessmentAnswerContentForAddData, AssessmentQuestionContentForAddData, AssessmentStudentAddDataModel } from '@models/collection/collection';
import { TaxonomyKeyModel } from '@models/taxonomy/taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { CollectionService } from '@providers/service/collection/collection.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { SessionService } from '@providers/service/session/session.service';
import { calculateAverageScore, generateUUID } from '@utils/global';
import * as moment from 'moment';

@Component({
  selector: 'nav-add-data-assessment',
  templateUrl: './add-data-assessment.component.html',
  styleUrls: ['./add-data-assessment.component.scss'],
})
export class AddDataAssessmentComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public activationDate: string;
  public classId: string;
  public contentId: string;
  public contentType: string;
  public thumbnail: string;
  public activityId: string;
  public title: string;
  public isAssessment: boolean;
  public searchText: string;
  public taxonomy: TaxonomyKeyModel;
  public hoursInMs: number;
  public minutesInMs: number;
  public students: Array<AssessmentStudentAddDataModel>;
  public class: ClassModel;
  public questionTimespent: number;
  public performance: Array<CAStudentPerformance>;
  public isTimespentAdd: boolean;
  public isThumbnailError: boolean;
  public isDiagnostic: boolean;
  public maxScore: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navParams: NavParams,
    private modalService: ModalService,
    private classActivityService: ClassActivityService,
    private collectionService: CollectionService,
    private sessionService: SessionService,
    private classService: ClassService,
    private performanceService: PerformanceService,
    private alertController: AlertController,
    private toastService: ToastService,
    private translate: TranslateService,
    private parseService: ParseService
  ) {

  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.initialize();
    if (!this.students) {
      this.fetchStudentListForAddData();
    } else {
      this.fetchAssessmentDetails();
    }
  }

  /**
   * @function initialize
   * This method is used to initialize data
   */
  private initialize() {
    this.class = this.classService.class;
    const todayDate = moment().format('YYYY-MM-DD');
    const activationDate = this.navParams.get('activationDate');
    this.activationDate = activationDate ? activationDate : todayDate;
    this.classId = this.navParams.get('classId');
    this.contentId = this.navParams.get('contentId');
    this.contentType = this.navParams.get('contentType');
    this.thumbnail = this.navParams.get('thumbnail');
    this.activityId = this.navParams.get('activityId');
    this.taxonomy = this.navParams.get('taxonomy');
    this.performance = this.navParams.get('performance');
    this.isAssessment = this.contentType === CONTENT_TYPES.ASSESSMENT;
    this.searchText = '';
    this.questionTimespent = this.findAssessmentTimeSpent();
    this.isTimespentAdd = this.isAssessment ? !this.performance : true;
    this.maxScore = 0;
  }

  /**
   * @function fetchAssessmentDetails
   * This method is used to fetch assessment details
   */
  public fetchAssessmentDetails() {
    this.collectionService.fetchCollectionById(this.contentId, this.contentType).then((response) => {
      this.title = response.title;
      this.students.map((student) => {
        student.content = this.parseQuestionContent(response.content);
        if (this.performance) {
          student.performance = this.performance.find((item) => item.userUid === student.id);
          student.isSubmitted = this.isAssessment && !!student.performance;
        }
      });
      // Open panel on default for first student
      if (this.students[0]) {
        this.openStudent(0);
      }
    });
  }

  /**
   * @function parseQuestionContent
   * This method is used to parse question content
   */
  public parseQuestionContent(questionContent) {
    const newQuestionContents = [];
    questionContent.forEach((content) => {
      const newQuestion = new AssessmentQuestionContentForAddData();
      newQuestion.answer = this.parseAnswerContent(content.answer);
      newQuestion.contentFormat = content.contentFormat;
      newQuestion.questionType = content.contentSubformat;
      newQuestion.description = content.description;
      newQuestion.id = content.id;
      newQuestion.title = content.title;
      newQuestion.sequenceId = content.sequenceId;
      newQuestion.taxonomy = content.taxonomy;
      newQuestion.maxScore = 1;
      newQuestionContents.push(newQuestion);
    });
    return newQuestionContents;
  }

  /**
   * @function parseAnswerContent
   * This method is used to parse answer content
   */
  public parseAnswerContent(answerContent) {
    const newAnswerContents = [];
    answerContent.forEach((content) => {
      const newAnswer = new AssessmentAnswerContentForAddData();
      newAnswer.answer_text = content.answer_text;
      newAnswer.answerType = content.answer_type;
      newAnswer.highlightType = content.highlight_type;
      newAnswer.isCorrect = content.is_correct;
      newAnswer.sequence = content.sequence;
      newAnswerContents.push(newAnswer);
    });
    return newAnswerContents;
  }

  /**
   * @function fetchStudentListForAddData
   * This method is used to fetch student list for add data
   */
  public fetchStudentListForAddData() {
    this.classActivityService.fetchClassActivityUserList(this.classId, this.activityId).then((studentListResponse) => {
      this.students = [];
      studentListResponse.forEach((studentItem) => {
        if (studentItem.isActive) {
          const student = new AssessmentStudentAddDataModel();
          student.username = studentItem.username;
          student.isActive = studentItem.isActive;
          student.id = studentItem.id;
          student.thumbnail = studentItem.thumbnail;
          student.isExpanded = false;
          student.firstName = studentItem.firstName;
          student.lastName = studentItem.lastName;
          this.students.push(student);
          this.students = this.students.sort((a, b) => {
            if (a.firstName < b.firstName) { return -1; }
            if (a.firstName > b.firstName) { return 1; }
            return 0;
          });
        };
      });
      this.fetchAssessmentDetails();
    });
  }

  /**
   * @function closeReport
   * This method is used to close report
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function submitAssessmentTimeSpent
   * This method is used to submit assessment timespent
   */
  public submitAssessmentTimeSpent(event) {
    this.hoursInMs = event.hoursIntoMilliseconds;
    this.minutesInMs = event.minutesIntoMilliseconds;
    this.questionTimespent = this.hoursInMs + this.minutesInMs;
    this.isTimespentAdd = false;
  }

  /**
   * @function addScoreForQuestion
   * This method is used to add score for question
   */
  public addScoreForQuestion(studentIndex, questionIndex, score) {
    const selectedStudent = this.students[studentIndex];
    selectedStudent.isSavePending = true;
    const selectedContent = selectedStudent.content[questionIndex];
    const contentCount = selectedStudent.content.length;
    const nextContentIndex = questionIndex + 1;
    selectedContent.score = score;
    selectedContent.isExpanded = false;
    selectedContent.scoreInPercentage = calculateAverageScore(score, selectedContent.maxScore);
    if (nextContentIndex < contentCount) {
      // setTimeout used to avoid transition animation delay
      setTimeout(() => {
        selectedStudent.content[nextContentIndex].isExpanded = true;
      }, 500);
    } else {
      selectedContent.isExpanded = false
    }
  }

  /**
   * @function openedContent
   * This method is trigger when open content and set isExpanded true
   */
  public openedContent(content) {
    content.isExpanded = true;
  }

  /**
   * @function onAcceptSaveAndNext
   * This method is used to save and next
   */
  public onAcceptSaveAndNext(studentIndex) {
    this.parseService.trackEvent(EVENTS.CLICK_CS_ACTIVITY_REPORT_UPLOAD_DATA_NEXT);
    this.submitQuestionDataSelectNextStudent(studentIndex);
  }

  /**
   * @function onAcceptUpdate
   * This method is used to update and next
   */
  public onAcceptUpdate(studentIndex) {
    this.updateQuestionDataSelectNextStudent(studentIndex);
  }

  /**
   * @function submitQuestionDataSelectNextStudent
   * This method is used to submit question data select
   */
  public submitQuestionDataSelectNextStudent(studentIndex) {
    const selectedStudent = this.students[studentIndex];
    const studentCount = this.students.length;
    const nextStudentIndex = studentIndex + 1;
    const assessmentContext = this.getAssessmentDataParams(studentIndex);
    if (!assessmentContext.resources.length) {
      return;
    }
    this.performanceService.updateCollectionOfflinePerformance(assessmentContext).then(() => {
      this.showSuccessMessage(this.translateValue('SAVED_SUCCESSFULLY'));
      selectedStudent.isSubmitted = true;
      selectedStudent.isSavePending = false;
      selectedStudent.isExpanded = false;
      this.openStudent(studentIndex, assessmentContext.session_id);
      if (nextStudentIndex < studentCount) {
        // setTimeout used to avoid transition animation delay
        setTimeout(() => {
          this.students[nextStudentIndex].isExpanded = true;
        }, 500);
      }
    });
  }

  /**
   * @function updateQuestionDataSelectNextStudent
   * This method is used to update question data select
   */
  public updateQuestionDataSelectNextStudent(studentIndex) {
    const selectedStudent = this.students[studentIndex];
    const studentCount = this.students.length;
    const nextStudentIndex = studentIndex + 1;
    selectedStudent.isSavePending = false;
    selectedStudent.isExpanded = false;
    const assessmentContext = this.getAssessmentDataParamsForUpdate(studentIndex);
    this.performanceService.updateAssessmentOfflineScoreUpdate(assessmentContext).then(() => {
      this.showSuccessMessage(this.translateValue('UPDATED_SUCCESSFULLY'));
      selectedStudent.isSubmitted = true;
      this.openStudent(studentIndex, assessmentContext.session_id);
      selectedStudent.isExpanded = false;
      if (nextStudentIndex < studentCount) {
        // setTimeout used to avoid transition animation delay
        setTimeout(() => {
          this.students[nextStudentIndex].isExpanded = true;
        }, 500);
      }
    });
  }

  /**
   * @function getAssessmentDataParamsForUpdate
   * This method is used to get assessment data params for update
   */
  public getAssessmentDataParamsForUpdate(studentIndex) {
    const assessmentResources = [];
    const activeStudent = this.students[studentIndex];
    const usageData = activeStudent.performance.usageData;
    const sessionId = usageData && usageData[0]?.sessionId || activeStudent.performance['assessment'].lastSessionId;
    const questions = activeStudent.content;
    // splited the selected time spent for each question.
    const timeSpentForQuestion = this.questionTimespent / questions.length;
    questions.forEach((question) => {
      const resourceData = {
        resource_id: question.id,
        score: question.score,
        resource_type: question.contentFormat,
        question_type: question.questionType,
        max_score: question.maxScore,
        time_spent: timeSpentForQuestion
      };
      assessmentResources.push(resourceData);
    });
    return {
      class_id: this.classId,
      collection_id: this.contentId,
      collection_type: CONTENT_TYPES.ASSESSMENT,
      content_source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      conducted_on: this.activationDate,
      resources: assessmentResources,
      student_id: activeStudent.id,
      session_id: sessionId,
      additional_context: btoa(
        JSON.stringify({
          dcaContentId: this.activityId
        })
      )
    }
  }

  /**
   * @function getAssessmentDataParams
   * This method is used to get assessment data params
   */
  public getAssessmentDataParams(studentIndex) {
    const assessmentResources = [];
    const activeStudent = this.students[studentIndex];
    const questions = activeStudent.content;
    // splited the selected time spent for each question.
    const timeSpentForQuestion = this.questionTimespent / questions.length;
    questions.forEach((question) => {
      const resourceData = {
        resource_id: question.id,
        resource_type: question.contentFormat,
        question_type: question.questionType,
        score: question.score,
        max_score: question.maxScore,
        time_spent: timeSpentForQuestion
      };
      if (this.isDiagnostic) {
        if (question.taxonomy) {
          resourceData['standard'] = Object.keys(question.taxonomy)[0];
          assessmentResources.push(resourceData);
        } else {
          const message = this.translate.instant('TAXONOMY_MISSING');
          this.toastService.presentToast(message);
        }
      } else {
        assessmentResources.push(resourceData);
      }
    });
    const userSession = this.sessionService.userSession;
    const studentPerformanceData = {
      tenant_id: userSession.tenant.tenantId || null,
      student_id: activeStudent.id,
      session_id: generateUUID(),
      class_id: this.classId,
      collection_id: this.contentId,
      collection_type: CONTENT_TYPES.ASSESSMENT,
      content_source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      time_zone: moment.tz.guess() || null,
      conducted_on: this.activationDate,
      path_id: 0,
      path_type: null,
      course_id: this.class.courseId,
      resources: assessmentResources,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: this.activityId
        })
      )
    };
    if(this.isDiagnostic){
      studentPerformanceData['isDiagnostic'] = this.isDiagnostic;
    }
    return studentPerformanceData;
  }

  /**
   * @function openStudent
   * This method is used to open student
   */
  public openStudent(studentIndex, existingSessionId?) {
    const toggledStudent = this.students[studentIndex];
    toggledStudent.isExpanded = true;
    if (toggledStudent.isSubmitted) {
      const sessionId = existingSessionId || toggledStudent.performance.usageData[0].sessionId || toggledStudent.performance['assessment'].lastSessionId;
      const startDate = this.navParams.get('startDate');
      const endDate = this.navParams.get('endDate');
      this.performanceService.fetchAssessmentPerformanceBySession(this.classId,
        this.contentId, sessionId,
        toggledStudent.id, startDate, endDate)
        .then((studentPerformance) => {
          if (studentPerformance && studentPerformance.length) {
            toggledStudent.performance = studentPerformance[0];
            const studentContent = toggledStudent.content;
            const studentContentPerformance = studentPerformance[0].usageData;
            studentContent.map((content) => {
              const contentPerformance = studentContentPerformance.find((performance) => performance.gooruOId === content.id);
              if (contentPerformance) {
                content.score = contentPerformance.rawScore;
                content.scoreInPercentage = contentPerformance.score;
              }
            });
          }
        });
    }
  }

  /**
   * @function closedStudent
   * This method is used to close student
   */
  public closedStudent(studentIndex) {
    const closedStudent = this.students[studentIndex];
    if (closedStudent.isSavePending) {
      this.showWarningAlert(studentIndex);
    }
  }

  /**
   * @function onMaxScore
   * This method is used to get max score
   */
  public onOverallMaxScore(score) {
    this.maxScore = score;
    this.isTimespentAdd = false;
  }

  /**
   * @function onStudentScore
   * This method is used to get student score
   */
  public onStudentScore(score, studentIndex) {
    const selectedStudent = this.students[studentIndex];
    const nextStudentIndex = studentIndex + 1;
    const studentCount = this.students.length;
    const assessmentContext = this.getExternalAssessmentDataParams(score, selectedStudent.id);
    this.performanceService.updateCollectionOfflinePerformance(assessmentContext).then(() => {
      selectedStudent.isSubmitted = true;
      selectedStudent.isExpanded = false;
      this.openStudent(studentIndex, assessmentContext.session_id);
      if (nextStudentIndex < studentCount) {
        // setTimeout used to avoid transition animation delay
        setTimeout(() => {
          this.students[nextStudentIndex].isExpanded = true;
        }, 500);
      }
    });
  }

  /**
   * @function getExternalAssessmentDataParams
   * This method is used to get external assessment
   */
  public getExternalAssessmentDataParams(score, studentId) {
    const userSession = this.sessionService.userSession;
    return {
      class_id: this.classId,
      collection_id: this.contentId,
      collection_type: CONTENT_TYPES.ASSESSMENT_EXTERNAL,
      content_source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      conducted_on: this.activationDate,
      max_score: this.maxScore,
      partner_id: null,
      score,
      session_id: generateUUID(),
      student_id: studentId,
      tenant_id: userSession.tenant.tenantId || null,
      time_spent: 0,
      time_zone: moment.tz.guess() || null,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: this.activityId
        })
      )
    }
  }

  /**
   * @function getExternalAssessmentDataParams
   * This method is used to get external assessment
   */
  public async showWarningAlert(studentIndex) {
    const studentUsername = this.students[studentIndex];
    const alert = await this.alertController.create({
      cssClass: 'add-data-alert-warning',
      message: `<ion-icon name="alert-circle-outline"></ion-icon><strong>Warning</strong>You have entered data for ${studentUsername.username}, but have not saved it. Do you want to save before continuing?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Yes',
          handler: () => {
            if (this.isAssessment) {
              this.submitQuestionDataSelectNextStudent(studentIndex)
            } else {
              this.onStudentScore(0, studentIndex);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * @function onCancelSave
   * This method is used to cancel save
   */
  public onCancelSave(studentIndex) {
    this.students[studentIndex].isExpanded = false;
  }

  /**
   * @function showSuccessMessage
   * This method used to show success toast message
   */
  private showSuccessMessage(message) {
    this.toastService.presentToast(message, true);
  }

  /**
   * @function translateValue
   * This method used to translate value
   */
  private translateValue(value) {
    return this.translate.instant(value);
  }

  /**
   * @function findAssessmentTimeSpent
   * This method used to find assessment time spent
   */
  private findAssessmentTimeSpent() {
    let performanceItem;
    if (this.performance) {
      performanceItem = this.performance.find((item) => {
        return item['assessment'].timespent > 0;
      });
    }
    return performanceItem ? performanceItem['assessment'].timespent : 0;
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
