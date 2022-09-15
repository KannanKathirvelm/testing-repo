import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { COLLECTION_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'text-resource',
  templateUrl: './text-resource.component.html',
  styleUrls: ['./text-resource.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class TextResourceComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public content: ContentModel;
  @Input() public collectionId: string;
  public onStart: EventEmitter<string> = new EventEmitter();
  public onSelectResource: EventEmitter<number> = new EventEmitter();
  public onStopResource: EventEmitter<number> = new EventEmitter();
  public showAdditionalInfo: boolean;
  @Input() public reportViewMode: string;
  @Input() public performance: SubContentModel;
  @Input() public showResourcePreview: boolean;
  @Input() public componentSequence: number;
  @Input() public disableConfirmBtn: boolean;
  @Input() public readonlyMode: boolean;
  @Input() public isActive: boolean;
  @Input() public isPreview: boolean;
  @Input() public isSubmit: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isRelatedContent: boolean;
  @Input() public isDownloadPdf: boolean;
  public isQuestionAnswered: boolean;
  public showDefaultImage: boolean;
  public showResourseContent: boolean;
  public pdfPreviewStyles: any;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    // tslint:disable-next-line
    private elementReference: ElementRef,
    private collectionPlayerService: CollectionPlayerService
  ) {
    this.showAdditionalInfo = true;
    this.showDefaultImage = true;
    this.pdfPreviewStyles = COLLECTION_PDF_PREVIEW_STYLES;
  }

  public ngOnInit() {
    this.showResourseContent = !this.readonlyMode;
  }

  /**
   * @function onPlay
   * This method triggered when user play resource
   */
  public onPlay(event?) {
    if (event) {
      event.stopPropagation();
    }
    this.onStart.next(this.content.id);
    this.isQuestionAnswered = true;
    if (this.isNextQuestion) {
      this.onClickResource();
    }
    this.onStopResource.next(this.componentSequence);
  }

  /**
   * @function onClickResource
   * This method triggers when user click on the resourse
   */
  public onClickResource() {
    if (!this.isSubmit) {
      this.onSelectResource.next(this.componentSequence);
    }
  }

  /**
   * @function onClickResourceIcon
   * This method is used to open resource while clicking on the resource icon
   */
  public onClickResourceIcon() {
    this.collectionPlayerService.openResourceContent(this.collectionId, this.content);
  }

  /**
   * @function onClickToView
   * This method used to call when user click the content
   */
  public onClickToView() {
    if (!this.isActive && !this.isRelatedContent) {
      this.onClickResource();
    }
  }

  /**
   * @function onPlayContent
   * This method used to call when user click the related content
   */
  public onPlayContent() {
    if (this.isRelatedContent) {
      this.onPlay();
    }
  }

  /**
   * @function toggleResourseContent
   * This method used to show the resource content
   */
  public toggleResourseContent() {
    if (!this.isRelatedContent) {
      this.showResourseContent = this.readonlyMode ? !this.showResourseContent : true;
    }
  }

  /**
   * @function toggleInfo
   * This method triggered when user click on toggle icon
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }
}
