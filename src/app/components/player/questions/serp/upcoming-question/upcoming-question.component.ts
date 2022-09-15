import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { fadeAnimation } from '@app/animations';
import { ASSESTMENT_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { AnswerModel, ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'upcoming-question',
  templateUrl: './upcoming-question.component.html',
  styleUrls: ['./upcoming-question.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class UpcomingQuestionComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public alreadyPlayed: boolean;
  @Input() public isPreview: boolean;
  @Input() public content: ContentModel;
  @Input() public isBidirectionalPlay: boolean;
  @Input() public isCurrentPlay: boolean;
  @Input() public showLastPlayedAnswer: boolean;
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isDownloadPdf: boolean;
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number
  }> = new EventEmitter();
  public questionTitle: string;
  public pdfPreviewStyles: any;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.pdfPreviewStyles = ASSESTMENT_PDF_PREVIEW_STYLES;

  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.questionTitle = this.content.contentSubformat.replace(/[_]/g, ' ');
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
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: [],
      reaction: 0,
      componentSequence: this.componentSequence
    });
  }

  /**
   * @function onConfirm
   * This method is used to emit event when user clicks on confirm button
   */
  public onConfirm() {
    this.onSubmitAnswer();
  }

  /**
   * @function onClickQuestion
   * This method triggers when user click on the question
   */
  public onClickQuestion() {
    if (!this.isSubmit) {
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
}
