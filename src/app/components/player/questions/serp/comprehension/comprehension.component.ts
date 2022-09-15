import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef, EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { fadeAnimation } from '@app/animations';
import { ASSESTMENT_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { QUESTION_TYPES } from '@components/player/questions/serp/serp-questions.import';
import { RESOURCE_TYPES } from '@components/player/resources/resources.import';
import { COLLECTION_SUB_FORMAT_TYPES } from '@constants/helper-constants';
import { AnswerModel, ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'comprehension',
  templateUrl: './comprehension.component.html',
  styleUrls: ['./comprehension.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class ComprehensionComponent implements OnInit, OnDestroy {

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
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isDownloadPdf: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    subQuestion?: Array<AnswerModel>
  }> = new EventEmitter();
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  @ViewChild('comprehension_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;
  @Input() public isAnswerKeyHidden: boolean;
  public isShowAnswerToggle: number;
  public componentRefList: Array<ComponentRef<any>>;
  public pdfPreviewStyles: any;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    // tslint:disable-next-line
    private elementReference: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.hideConfirmButton = false;
    this.showAdditionalInfo = true;
    this.componentRefList = [];
    this.pdfPreviewStyles = ASSESTMENT_PDF_PREVIEW_STYLES;
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.averageScore = this.performance ? this.performance.averageScore : null;
      this.checkUserAnswers();
    } else {
      this.isQuestionAnswered = false;
    }
    this.renderContents();
  }

  public ngOnDestroy() {
    this.clearComponentRef();
  }

  /**
   * @function renderContents
   * This method is used to create dyanamic component
   */
  public renderContents() {
    if (this.content && this.content.subQuestions) {
      this.content.subQuestions.forEach((content, index) => {
        const contentFormatTypes = content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION ? QUESTION_TYPES : RESOURCE_TYPES;
        const componentType = contentFormatTypes[content.contentSubformat];
        if (componentType) {
          const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
          const componentRef = this.contentViewRef.createComponent(factory);
          this.onContentInstance(componentRef, content, index);
          this.componentRefList.push(componentRef);
        }
      });
    }
  }

  /**
   * @function onContentInstance
   * This method is used to pass instance to dynamic components
   */
  public onContentInstance(componentRef, content, index) {
    const instance = componentRef.instance as {
      content: ContentModel;
      isBidirectionalPlay: boolean;
      reportViewMode: boolean;
      performance: SubContentModel;
      showCorrectAnswer: boolean;
      componentSequence: number;
      showResourcePreview: boolean;
      isPreview: boolean;
      disableConfirmBtn: boolean;
      isComprehension: boolean;
      onConfirmAnswer: EventEmitter<{
        answers: Array<AnswerModel>;
        reaction: number;
        componentSequence: number;
      }>;
    };
    instance.componentSequence = (index + 1);
    instance.isBidirectionalPlay = this.isBidirectionalPlay;
    instance.reportViewMode = this.reportViewMode;
    instance.isPreview = this.isPreview;
    instance.disableConfirmBtn = this.disableConfirmBtn;
    instance.isComprehension = true;
    instance.onConfirmAnswer.subscribe((data) => {
      this.onConfirmAnswer.next({
        answers: data.answers,
        reaction: 0,
        componentSequence: data.componentSequence,
        subQuestion: content
      });
    });
    if (this.performance && this.performance.subQuestions) {
      const summaryPerformance = this.performance.subQuestions.find((item) => item.id === content.id);
      instance.performance = summaryPerformance;
    }
    instance.showCorrectAnswer = false;
    instance.content = content;
  }

  /**
   * @function toggleShowCorrectAnswer
   * This method is used to start question play event
   */
  public toggleShowCorrectAnswer(value) {
    this.componentRefList.forEach((component) => {
      component.instance.isShowCorrectAnswer = value;
    });
  }

  /**
   * @function clearComponentRef
   * This method is used to clear dynamic components
   */
  public clearComponentRef() {
    this.componentRefList.forEach((component) => {
      component.destroy();
    });
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
    this.isDisabled = !this.isBidirectionalPlay && this.showAnswer && !this.isQuestionAnswered;
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: [],
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
    this.componentRefList.forEach((component) => {
      component.instance.questionAnswered = true;
    });
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    this.showCorrectAnswer = value;
    this.checkUserAnswers();
    this.toggleShowCorrectAnswer(value);
  }

  /**
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (this.performance.subQuestions && this.performance.subQuestions.length) {
      this.afterQuestionAnswered();
      this.setSubQuestionPerformance(true);
    }
  }

  /**
   * @function setSubQuestionPerformance
   * This method used to set sub questions performance
   */
  public setSubQuestionPerformance(isLastPlayed?) {
    this.componentRefList.forEach((component) => {
      const componentInstance = component.instance;
      const performance = this.performance.subQuestions.find((question) => {
        return question.id === componentInstance.content.id;
      });
      if (performance) {
        componentInstance.performance = performance;
        if (isLastPlayed) {
          componentInstance.showLastPlayedAnswer = true;
        }
      }
    });
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers() {
    if (this.performance?.subQuestions && this.performance?.subQuestions.length) {
      this.setSubQuestionPerformance();
    }
  }
}
