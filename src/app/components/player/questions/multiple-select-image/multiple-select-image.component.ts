import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { fadeAnimation } from '@app/animations';
import { ASSESTMENT_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { EvidenceModel } from '@app/models/performance/performance';
import { AnswerModel, ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'multiple-select-image',
  templateUrl: './multiple-select-image.component.html',
  styleUrls: ['./multiple-select-image.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class MultipleSelectImageComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public alreadyPlayed: boolean;
  @Input() public content: ContentModel;
  @Input() public collectionId : string;
  @Input() public isPreview: boolean;
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
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public isActive: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number
  }> = new EventEmitter();
  @Input() public disableConfirmBtn: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isDownloadPdf: boolean;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answers: Array<AnswerModel>;
  public enableConfirm: boolean;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  public evidenceFiles: Array<EvidenceModel>;
  public pdfPreviewStyles: any;
  @Input() public isShowEvidence: boolean;

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
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function onCurrentPlay
   * This method is used to initialize Properties
   */
  public onCurrentPlay(isCurrentPlay: boolean) {
    this.showAnswer = !isCurrentPlay;
    this.isDisabled = !this.isBidirectionalPlay && this.showAnswer && !this.isBidirectionalPlay;
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
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    const selectedAnswers = this.answers.filter((answer) => {
      return answer.selected;
    });
    this.onConfirmAnswer.next({
      answers: selectedAnswers,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence
    });
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
      this.answers.map((answerInput, index) => {
        const answeredObject = this.performance.answerObject.find((answer) => answer.order
          === (index + 1));
        if (answeredObject) {
          answerInput.selected = true;
        }
        return answerInput;
      });
    }
  }

  /**
   * @function answerSelect
   * This method triggers when user selects answer
   */
  public answerSelect(answer) {
    answer.selected = !answer.selected;
    const isSelected = this.answers.find((answerItem) => {
      return answerItem.selected;
    });
    this.enableConfirm = isSelected ? true : false;
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
