import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { COLLECTION_PDF_PREVIEW_STYLES } from '@app/constants/pdf-preview-styles';
import { VIDEO_RESOURCE_TYPES } from '@constants/helper-constants';
import { ContentModel } from '@models/collection/collection';
import { SubContentModel } from '@models/portfolio/portfolio';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import Player from '@vimeo/player';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'video-resource',
  templateUrl: './video-resource.component.html',
  styleUrls: ['./video-resource.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class VideoResourceComponent implements OnInit, OnDestroy, AfterViewInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public content: ContentModel;
  @Input() public collectionId: string;
  @Input() public performance: SubContentModel;
  @Input() public reportViewMode: string;
  @Input() set isSubmited(isSubmited: boolean) {
    if (isSubmited) {
      this.stopVideoPlayer();
    }
  }
  @Input() set isActiveResource(isActiveResource: boolean) {
    if (!isActiveResource) {
      this.stopVideoPlayer();
    }
    this.tempActiveResource = isActiveResource;
  }
  get isActiveResource(): boolean {
    return this.tempActiveResource;
  }
  @Input() public componentSequence: number;
  @Input() public readonlyMode: boolean;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isSubmit: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isRelatedContent: boolean;
  public onStart: EventEmitter<string> = new EventEmitter();
  public onPlayResource: EventEmitter<number> = new EventEmitter();
  public onStopResource: EventEmitter<number> = new EventEmitter();
  public onSelectResource: EventEmitter<number> = new EventEmitter();
  public onStartInlineVideo: EventEmitter<string> = new EventEmitter();
  @Input() public showResourcePreview: boolean;
  @Input() public isPreview: boolean;
  @Input() public isDownloadPdf: boolean;
  @ViewChild('vimeoPlayercontainer', { static: true }) public vimeoPlayercontainer;
  public isYoutubeResource: boolean;
  public isVimeoResource: boolean;
  public showAdditionalInfo: boolean;
  public videoId: string;
  public isInlineVideo: boolean;
  private vimeoPlayer: Player;
  private youTubePlayer: Player;
  public isQuestionAnswered: boolean;
  public showDefaultImage: boolean;
  public showResourseContent: boolean;
  public tempActiveResource: boolean;
  public pdfPreviewStyles: any;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private collectionPlayerService: CollectionPlayerService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.showAdditionalInfo = true;
    this.isInlineVideo = true;
    this.showDefaultImage = true;
    this.pdfPreviewStyles = COLLECTION_PDF_PREVIEW_STYLES;
  }

  public ngOnInit() {
    this.tempActiveResource = false;
    if (!this.reportViewMode) {
      const inlineVideoType = this.collectionPlayerService.getInlineVideoResourceType(this.content.url);
      if (inlineVideoType) {
        this.isYoutubeResource = inlineVideoType === VIDEO_RESOURCE_TYPES.YOUTUBE;
        this.isVimeoResource = inlineVideoType === VIDEO_RESOURCE_TYPES.VIMEO;
      }
      if (this.isYoutubeResource) {
        this.videoId = this.collectionPlayerService.getYoutubeVideoId(this.content.url);
      }
      if (this.isVimeoResource) {
        this.videoId = this.collectionPlayerService.getVimeoVideoId(this.content.url);
      }
    }
    this.showResourseContent = !this.readonlyMode;
  }

  public ngAfterViewInit() {
    const component = this;
    if (!component.reportViewMode && component.isVimeoResource) {
      component.vimeoPlayer = new Player(component.vimeoPlayercontainer.nativeElement, {
        id: component.videoId,
        controls: 1
      });
      component.vimeoPlayer.on('play', function() {
        component.startResourcePlayEvent();
      });
      component.vimeoPlayer.on('pause', function() {
        component.stopResourcePlayEvent();
      });
    }
  }

  /**
   * @function clickToViewResource
   * This method triggered when user play resource
   */
  public clickToViewResource() {
    if (!this.isActive && !this.isRelatedContent) {
      this.onClickResource();
    }
  }

  /**
   * @function onClickResourceIcon
   * This method is used to open resource while clicking on the resource icon
   */
  public onClickResourceIcon() {
    this.collectionPlayerService.openResourceContent(this.collectionId, this.content);
  }

  public ngOnDestroy() {
    if (this.vimeoPlayer) {
      this.vimeoPlayer.off('stop');
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
   * @function onClickResource
   * This method triggers when user click on the resourse
   */
  public onClickResource() {
    if (!this.isSubmit) {
      this.onSelectResource.next(this.componentSequence);
    }
  }

  /**
   * @function playResource
   * This method triggered when user play video
   */
  public playResource() {
    this.onPlayResource.next(this.componentSequence);
  }

  /**
   * @function stopResource
   * This method triggered when user stop video
   */
  public stopResource() {
    this.onStopResource.next(this.componentSequence);
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
    if (!this.isYoutubeResource && !this.isVimeoResource) {
      if (this.isNextQuestion) {
        this.onClickResource();
      }
      this.onStopResource.next(this.componentSequence);
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
   * @function stopVideoPlayer
   * This method used to stop the video player
   */
  private stopVideoPlayer() {
    if (this.youTubePlayer) {
      this.youTubePlayer.pauseVideo();
    }
    if (this.vimeoPlayer) {
      this.vimeoPlayer.pause();
    }
  }

  /**
   * @function savePlayer
   * This method triggered when player is ready
   */
  public savePlayer(player) {
    this.youTubePlayer = player;
  }

  /**
   * @function onPlayYoutubeVideo
   * This method triggered when user play youtube video
   */
  public onPlayYoutubeVideo(event) {
    if (event === 1) {
      // Here we call the player start event
      this.startResourcePlayEvent();
    }
    if (event === 2) {
      // Here we call the player stop event
      this.isQuestionAnswered = true;
      this.stopResourcePlayEvent();
    }
  }

  /**
   * @function startResourcePlayEvent
   * This method triggered when user play youtube video
   */
  private startResourcePlayEvent() {
    this.playResource();
    this.onStartInlineVideo.next(this.content.id);
  }

  /**
   * @function stopResourcePlayEvent
   * This method triggered when user stop youtube video
   */
  private stopResourcePlayEvent() {
    if (this.isActiveResource) {
      this.stopResource();
    }
    this.collectionPlayerService.stopResourcePlayEvent();
  }
  /**
   * @function toggleInfo
   * This method triggered when user click on toggle icon
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }

}
