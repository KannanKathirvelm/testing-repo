import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { ASSESTMENT_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { CORRECT_ANSWER_YES } from '@constants/helper-constants';
import { AnswerModel, ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'multiple-answer',
  templateUrl: './multiple-answer.component.html',
  styleUrls: ['./multiple-answer.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class MultipleAnswerComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public alreadyPlayed: boolean;
  @Input() public content: ContentModel;
  @Input() public isPreview: boolean;
  @Input() public isBidirectionalPlay: boolean;
  @Input() set isCurrentPlay(value: boolean) {
    this.onCurrentPlay(value);
  }
  public showCorrectAnswer: boolean;

  @Input() set isShowCorrectAnswer(value: boolean) {
    this.onShowCorrectAnswer(value);
  }
  @Input() set showLastPlayedAnswer(value: boolean) {
    this.alreadyPlayed = value;
    if (this.performance && value) {
      this.onShowLastPlayedAnswer();
    }
  }
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isDownloadPdf: boolean;

  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number
  }> = new EventEmitter();
  @Input() public disableConfirmBtn: boolean;
  public selectedAnswer: Array<AnswerModel>;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public enableConfirm: boolean;
  public answers: Array<AnswerModel>;
  public averageScore: number;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public pdfPreviewStyles: any;
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private collectionPlayerService: CollectionPlayerService,
    // tslint:disable-next-line
    private elementReference: ElementRef) {
    this.selectedAnswer = [];
    this.showAdditionalInfo = true;
    this.hideConfirmButton = false;
    this.pdfPreviewStyles = ASSESTMENT_PDF_PREVIEW_STYLES;
  }

  public ngOnInit() {
    const answers = [...this.content.answer];
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.showUserAnswer(answers);
    } else {
      this.isQuestionAnswered = false;
      this.answers = answers;
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
   * @function showUserAnswer
   * This method used to show user answer
   */
  public showUserAnswer(answers) {
    this.averageScore = this.performance ? this.performance.averageScore : null;
    const userAnswers = this.performance ? this.performance.answerObject : null;
    answers.forEach((answer) => {
      const userAnswer = userAnswers ? userAnswers.find((item) => item.order === answer.sequence) : null;
      if (userAnswer) {
        const userAnswerText = userAnswer.answer_text.toLowerCase();
        const userSelectedAnswer = userAnswerText === CORRECT_ANSWER_YES ? 1 : 0;
        answer.status = userAnswer.status;
        answer.is_correct = userSelectedAnswer;
        answer.userAnswerText = userAnswerText;
      }
    });
    this.answers = answers;
  }

  /**
   * @function selectAnswer
   * This method triggers when user selects answer
   */
  public selectAnswer(answer, answerValue, event) {
    const userValue = event.target.value;
    const tempAnswer = { ...answer };
    const answerIndex = this.selectedAnswer.findIndex((answerItem) => answerItem.sequence === answer.sequence);
    tempAnswer.is_correct = tempAnswer.is_correct === answerValue ? 1 : 0;
    tempAnswer.answer_text = userValue;
    if (answerIndex !== -1) {
      this.selectedAnswer[answerIndex] = tempAnswer;
    } else {
      this.selectedAnswer.push(tempAnswer);
    }
    if (this.selectedAnswer.length === this.content.answer.length) {
      this.enableConfirm = true;
    }
  }

  /**
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: this.selectedAnswer,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence
    });
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
      const answers = [...this.content.answer];
      this.showUserAnswer(answers);
    }
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    this.showCorrectAnswer = value;
    const answers = this.answers;
    this.checkUserAnswers(answers);
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers(answers) {
    this.answers = this.collectionPlayerService.checkUserAnswers(answers, this.performance,
      this.showCorrectAnswer);
  }
}

