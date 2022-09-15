import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { fadeAnimation } from '@app/animations';
import { EvidenceModel } from '@app/models/performance/performance';
import { ATTEMP_STATUS } from '@constants/helper-constants';
import { IonReorderGroup } from '@ionic/angular';
import { AnswerModel, ContentModel } from '@models/collection/collection';
import { AnswerObjectModel, SubContentModel } from '@models/portfolio/portfolio';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class DragAndDropComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @ViewChild(IonReorderGroup, { static: true })
  public reorderGroup: IonReorderGroup;
  public alreadyPlayed: boolean;
  @Input() public isPreview: boolean;
  @Input() public content: ContentModel;
  @Input() public collectionId : string;
  @Input() public isBidirectionalPlay: boolean;
  @Input() set isCurrentPlay(value: boolean) {
    this.onCurrentPlay(value);
  }
  @Input() set isShowCorrectAnswer(value: boolean) {
    this.onShowCorrectAnswer(value);
  }
  @Input() set showLastPlayedAnswer(value: boolean) {
    this.alreadyPlayed = value;
    if (this.performance && value) {
      this.onShowLastPlayedAnswer();
    }
  }
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number
  }> = new EventEmitter();
  @Input() public disableConfirmBtn: boolean;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answers: Array<AnswerModel>;
  public isAnswered: boolean;
  public averageScore: number;
  public userAnswer: Array<AnswerObjectModel>;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  public showCorrectAnswer: boolean;
  public evidenceFiles: Array<EvidenceModel>;
  @Input() public isShowEvidence: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.showAdditionalInfo = true;
    this.hideConfirmButton = false;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    const answers = [...this.content.answer];
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.evidenceFiles = this.performance ? this.performance.evidence : null;
      this.averageScore = this.performance ? this.performance.averageScore : null;
      this.checkUserAnswers(answers);
    } else {
      this.isQuestionAnswered = false;
      this.answers = this.answerShuffle(answers);
    }
  }

  /**
   * @function onClickQuestionWithFeedBack
   * This method triggers when user click on the question
   */
  public onClickQuestionWithFeedBack() {
    if (this.isNextQuestion) {
      this.onClickQuestion();
    }
  }

  /**
   * @function onClickQuestion
   * This method triggers when user click on the question
   */
  public onClickQuestion() {
    if (!this.isSubmit) {
      if (!this.isActive) {
        this.showAnswer = false;
      }
      this.onSelectQuestion.next(this.componentSequence);
    }
  }

  /**
   * @function onClickAnswer
   * This method triggers when user click on the answer
   */
  public onClickAnswer() {
    if (this.isBidirectionalPlay && !this.isActive) {
      this.onClickQuestion();
    }
  }

  /**
   * @function toggleAnswers
   * This method is used to toggle the answers
   */
  public toggleAnswers() {
    this.showAnswer = !this.showAnswer;
  }

  /**
   * @function toggleInfo
   * This method is used to toggle info
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }

  /**
   * @function onCurrentPlay
   * This method is used to initialize Properties
   */
  public onCurrentPlay(isCurrentPlay: boolean) {
    this.showAnswer = !isCurrentPlay;
    this.isDisabled = !this.isBidirectionalPlay && this.showAnswer && !this.isQuestionAnswered;
  }

  /**
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function reorderAnswer
   * This method triggers when user re-order the answer
   */
  public reorderAnswer(event) {
    this.onClickAnswer();
    this.isAnswered = true;
    event.detail.complete();
    const indexes = event.detail;
    const element = this.answers[indexes.from];
    this.answers.splice(indexes.from, 1);
    this.answers.splice(indexes.to, 0, element);
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.answers.forEach((answer, index) => {
      answer.is_correct = answer.sequence === (index + 1) ? 1 : 0;
    });
    this.onConfirmAnswer.next({
      answers: this.answers,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence
    });
  }
  /**
   * @function onConfirm
   * This method is used to emit event when user clicks on confirm button
   */
  public onConfirm() {
    this.onSubmitAnswer();
    this.afterQuestionAnswered();
  }

  /**
   * @function afterQuestionAnswered
   * This method is used to add css class for after question answered
   */
  public afterQuestionAnswered() {
    this.isQuestionAnswered = true;
    this.isDisabled = false;
    if (!this.isBidirectionalPlay) {
      this.hideConfirmButton = true;
    }
  }

  /**
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (this.performance.answerObject && this.performance.answerObject.length) {
      this.afterQuestionAnswered();
      this.checkUserAnswers(this.answers);
    }
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    const answers = this.answers;
    this.showCorrectAnswer = value;
    if (value) {
      this.answers = answers.sort(function(a, b) {
        return a.sequence - b.sequence;
      }).map((item) => {
        item.status = ATTEMP_STATUS.CORRECT;
        return item;
      });
    } else {
      this.checkUserAnswers(answers);
    }
  }

  /**
   * @function checkUserAnswers
   * This method used to user answers
   */
  public checkUserAnswers(answers) {
    answers.forEach((answer, index) => {
      const userAnswerIndex = this.performance && this.performance.answerObject && this.performance.answerObject.length ?
        this.performance.answerObject.findIndex((item) => item.order === answer.sequence) : null;
      answer.userSequence = userAnswerIndex;
      answer.status = userAnswerIndex !== null ? (userAnswerIndex === index) ?
        ATTEMP_STATUS.CORRECT : ATTEMP_STATUS.INCORRECT : ATTEMP_STATUS.SKIPPED;
      return answer;
    });
    answers.sort(function(a, b) {
      return a.userSequence - b.userSequence;
    });
    this.answers = answers;
  }

  /**
   * @function checkUserAnswers
   * This method used to user answers
   */
  public answerShuffle(answers) {
    return answers.sort(() => (0.5 - Math.random()));
  }
}
