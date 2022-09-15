import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { fadeAnimation } from '@app/animations';
import { ASSESTMENT_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { AnswerModel, ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';

@Component({
  selector: 'serp-silent-reading',
  templateUrl: './serp-silent-reading.component.html',
  styleUrls: ['./serp-silent-reading.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class SerpSilentReadingComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public alreadyPlayed: boolean;
  @Input() public isPreview: boolean;
  @Input() public content: ContentModel;
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
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public componentSequence: number;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isSubmit: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isDownloadPdf: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number
  }> = new EventEmitter();
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answers: Array<AnswerModel>;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  private questionStartTime: number;
  public pdfPreviewStyles: any;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private collectionPlayerService: CollectionPlayerService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.showAdditionalInfo = true;
    this.hideConfirmButton = false;
    this.pdfPreviewStyles = ASSESTMENT_PDF_PREVIEW_STYLES;
  }

  public ngOnInit() {
    const answers = [...this.content.answer];
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.averageScore = this.performance ? this.performance.averageScore : null;
      this.checkUserAnswers(answers);
    } else {
      this.isQuestionAnswered = false;
      this.parseAnswers(answers);
    }
  }

  /**
   * @function toggleCheckbox
   * This method triggers when user click in checkbox
   */
  public toggleCheckbox(event) {
    this.disableConfirmBtn = !event.detail.checked;
  }

  /**
   * @function parseAnswers
   * This method is used to set the answers
   */
  public parseAnswers(answers) {
    this.answers = answers.map((answer) => {
      answer.is_correct = true;
      answer.text = answer.answer_text;
      return answer;
    });
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
   * @function onCurrentPlay
   * This method is used to initialize Properties
   */
  public onCurrentPlay(isCurrentPlay: boolean) {
    this.questionStartTime = moment().valueOf();
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
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.setSelectAnswers();
    this.onConfirmAnswer.next({
      answers: this.answers,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence
    });
  }

  /**
   * @function setSelectAnswers
   * This method is used to set answers
   */
  public setSelectAnswers() {
    const questionEndTime = moment().valueOf();
    this.answers.map((answer) => {
      const timespent = this.getTimeSpent(questionEndTime);
      answer.answer_text = `${timespent}`;
    });
  }

  /**
   * @function getTimeSpent
   * This method is used to get the question time spent
   */
  public getTimeSpent(endTime) {
    return endTime - this.questionStartTime;
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
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    this.showCorrectAnswer = value;
    const answers = this.answers;
    this.checkUserAnswers(answers);
  }

  /**
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    const lastAnswer = this.performance.answerObject && this.performance.answerObject.length ?
      this.performance.answerObject[0] : null;
    if (lastAnswer) {
      this.afterQuestionAnswered();
    }
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers(answers) {
    this.answers = this.collectionPlayerService.checkUserAnswers(answers, this.performance, this.showCorrectAnswer);
  }
}
