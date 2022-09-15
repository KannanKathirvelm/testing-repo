import { Component, ComponentFactoryResolver, ComponentRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { TenantSettingsModel } from '@app/models/tenant/tenant-settings';
import { ClassService } from '@app/providers/service/class/class.service';
import { CollectionPlayerService } from '@app/providers/service/player/collection-player.service';
import { UtilsService } from '@providers/service/utils.service';
import { QUESTION_TYPES } from '@components/player/questions/questions.import';
import { UpcomingQuestionComponent } from '@components/player/questions/serp/upcoming-question/upcoming-question.component';
import { RESOURCE_TYPES } from '@components/player/resources/resources.import';
import { ASSESSMENT, COLLECTION, COLLECTION_SUB_FORMAT_TYPES, SUPPORTED_SERP_QUESTION_TYPES } from '@constants/helper-constants';
import { CollectionsModel, CompetencyModel, ContentModel } from '@models/collection/collection';
import { PortfolioPerformanceSummaryModel, SubContentModel } from '@models/portfolio/portfolio';

@Component({
  selector: 'content-report',
  templateUrl: './content-report.component.html',
  styleUrls: ['./content-report.component.scss'],
})
export class ContentReportComponent implements OnInit, OnChanges, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public collection: CollectionsModel;
  @Input() public performance: PortfolioPerformanceSummaryModel;
  @Input() public collectionType: string;
  @Input() public isPreview: boolean;
  @Input() public isDownloadPdf: boolean;
  @Input() public competency: CompetencyModel;
  @ViewChild('report_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;
  public isShowAnswerToggle: number;
  public componentRefList: Array<ComponentRef<any>>;
  @Input() public tenantSettings: TenantSettingsModel;
  public isAndroid: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private playerService: CollectionPlayerService,
    private classService: ClassService,
    private utilsService: UtilsService
  ) {
    this.componentRefList = [];
  }

  // -------------------------------------------------------------------------
  // Methods
  public ngOnInit() {
    if (this.collectionType === COLLECTION || this.collectionType === ASSESSMENT) {
      const questionContent = this.collection.content.filter((item) => item.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION);
      this.isShowAnswerToggle = questionContent.length;
    }
    this.renderContents();
    this.isAndroid = this.utilsService.isAndroid();
  }


  public ngOnChanges(changes: SimpleChanges) {
    if (changes.isDownloadPdf && changes.isDownloadPdf.isFirstChange) {
      this.componentRefList.forEach((componentRef) => {
        componentRef.instance.isDownloadPdf = this.isDownloadPdf;
      });
    }
    if (changes.performance && changes.performance.previousValue) {
      this.clearComponentRef();
      this.componentRefList = [];
      this.renderContents();
    }
  }

  /**
   * @function renderContents
   * This method is used to render the contents
   */
  public renderContents() {
    if (this.competency && this.competency.standard.code) {
      const content = this.collection.content && this.collection.content.find((item) => {
        const key = Object.keys(item.taxonomy)[0];
        return this.competency.standard.code === item.taxonomy[key].code;
      });
      const contentFormatTypes = content && content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION ? QUESTION_TYPES : RESOURCE_TYPES;
      this.componentCreator(contentFormatTypes, content, 0);
    } else {
      this.collection.content.forEach((content, index) => {
        const contentFormatTypes = content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION ? QUESTION_TYPES : RESOURCE_TYPES;
        this.componentCreator(contentFormatTypes, content, index);
      });
    }
  }

  /**
   * @function componentCreator
   * This method is used to to create dynamic components
   */
  public componentCreator(contentFormatTypes, content, index) {
    let componentType = contentFormatTypes[content.contentSubformat];
    if (componentType) {
      const subformat = content.contentSubformat;
      const regex = new RegExp('serp');
      if (regex.test(subformat)) {
        const isSupportedQuestion = SUPPORTED_SERP_QUESTION_TYPES.includes(subformat);
        if (!isSupportedQuestion) {
          componentType = UpcomingQuestionComponent;
        }
      }
    } else {
      componentType = UpcomingQuestionComponent;
    }
    const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const componentRef = this.contentViewRef.createComponent(factory);
    this.onContentInstance(componentRef, content, index);
    this.componentRefList.push(componentRef);
  }

  /**
   * @function onContentInstance
   * This method is used to pass instance to dynamic components
   */
  public onContentInstance(componentRef, content, index) {
    const isBidirectionalPlay = true;
    const instance = componentRef.instance as {
      content: ContentModel;
      collectionId: string;
      isBidirectionalPlay: boolean;
      reportViewMode: boolean;
      performance: SubContentModel;
      showCorrectAnswer: boolean;
      componentSequence: number;
      isPreview: boolean;
      showResourcePreview: boolean;
      isShowEvidence: boolean;
      isDownloadPdf: boolean;
    };
    const classDetails = this.classService.class;
    instance.componentSequence = (index + 1);
    instance.isBidirectionalPlay = isBidirectionalPlay;
    instance.reportViewMode = true;
    instance.isPreview = this.isPreview;
    instance.isDownloadPdf = this.isDownloadPdf;
    instance.showResourcePreview = true;
    const contentKey = this.collectionType === ASSESSMENT ? 'questions' : 'resources';
    if (this.performance) {
      const summaryPerformance = this.performance[contentKey].find((item) => item.id === content.id);
      instance.performance = summaryPerformance;
    }
    instance.showCorrectAnswer = false;
    instance.content = content;
    instance.collectionId = this.collection.id;
    instance.isShowEvidence = this.playerService.checkEvidenceIsEnabled(classDetails, this.tenantSettings, content);
  }

  /**
   * @function toggleShowCorrectAnswer
   * This method is used to start question play event
   */
  public toggleShowCorrectAnswer(event) {
    this.componentRefList.forEach((component) => {
      component.instance.isShowCorrectAnswer = event.target.checked;
    });
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
