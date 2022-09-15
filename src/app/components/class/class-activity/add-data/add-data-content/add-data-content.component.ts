import { Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { QUESTION_TYPES } from '@components/player/questions/questions.import';
import { AssessmentQuestionContentForAddData } from '@models/collection/collection';

@Component({
  selector: 'nav-add-data-content',
  templateUrl: './add-data-content.component.html',
  styleUrls: ['./add-data-content.component.scss'],
})
export class AddDataContentComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public componentRefList: Array<ComponentRef<any>>;
  @Input() public content: AssessmentQuestionContentForAddData;
  @Input() public contentIndex: number;
  @ViewChild('content_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.componentRefList = [];
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.renderContents();
  }

  /**
   * @function renderContents
   * This method is used to render contents
   */
  public renderContents() {
    const contentFormatTypes = QUESTION_TYPES;
    const componentType = contentFormatTypes[this.content.questionType];
    if (componentType) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      const componentRef = this.contentViewRef.createComponent(factory);
      this.onContentInstance(componentRef, this.content, this.contentIndex);
      this.componentRefList.push(componentRef);
    }
  }

  /**
   * @function onContentInstance
   * This method is used to pass instance to dynamic components
   */
  public onContentInstance(componentRef, content, index) {
    const isBidirectionalPlay = true;
    const instance = componentRef.instance as {
      content: any;
      isBidirectionalPlay: boolean;
      reportViewMode: boolean;
      showCorrectAnswer: boolean;
      componentSequence: number;
    };
    instance.componentSequence = (index + 1);
    instance.isBidirectionalPlay = isBidirectionalPlay;
    instance.reportViewMode = true;
    instance.showCorrectAnswer = false;
    instance.content = content;
  }

  public clearComponentRef() {
    this.componentRefList.forEach((component) => {
      component.destroy();
    });
  }

  public ngOnDestroy() {
    this.clearComponentRef();
  }
}
