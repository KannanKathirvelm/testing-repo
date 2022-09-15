import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { YoutubePlayerFullscreenComponent } from '@components/UI/youtube-player-fullscreen/youtube-player-fullscreen.component';
import { environment } from '@environment/environment';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ModalController } from '@ionic/angular';
import { ModalService } from '@providers/service/modal/modal.service';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import { UtilsService } from '@providers/service/utils.service';
import Player from '@vimeo/player';

@Component({
  selector: 'youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss'],
})
export class YoutubePlayerComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public videoId: string;
  @Output() public playYoutubeVideo: EventEmitter<number> = new EventEmitter();
  @Output() public ready: EventEmitter<Player> = new EventEmitter();
  public video: string;
  public player: Player;
  public isLoading: boolean;
  public isAndroid: boolean;

  constructor(
    private modalService: ModalService,
    private utilsService: UtilsService,
    private screenOrientation: ScreenOrientation,
    private modalCtrl: ModalController,
    private collectionPlayerService: CollectionPlayerService
  ) { }

  public ngOnInit() {
    this.isAndroid = this.utilsService.isAndroid();
    this.init();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function init
   * This method is used to initialize the youtube player
   */
  public init() {
    this.isLoading = true;
    const doc = document;
    const tag = doc.createElement('script');
    tag.src = environment.YOUTUBE_IFRAME_API;
    const firstScriptTag = doc.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.startVideo();
  }

  /**
   * @function startVideo
   * This method triggered when the youTube api is ready
   */
  public startVideo() {
    this.collectionPlayerService.getYoutubePlayer().then((YT) => {
      this.player = new YT['Player'](this.videoId, {
        videoId: this.videoId,
        playerVars: {
          playsinline: 1,
          fs: 0,
          rel: 0,
          controls: 0,
          showinfo: 0
        },
        events: {
          onStateChange: this.onPlayerStateChange.bind(this),
          onReady: this.onPlayerReady.bind(this),
        }
      });
    });
  }

  /**
   * @function onPlayerReady
   * This method triggered when the youTube player is ready
   */
  public onPlayerReady(event) {
    this.isLoading = false;
    this.ready.emit(this.player);
  }

  /**
   * @function onClickFullScreen
   * This method triggered when the click the fullscreen
   */
  public onClickFullScreen() {
    const currentPlayTime = Math.round(this.player.getCurrentTime());
    this.screenOrientation.unlock();
    this.modalCtrl.create({
      component: YoutubePlayerFullscreenComponent,
      enterAnimation: this.modalService.enterAnimation(),
      leaveAnimation: this.modalService.leaveAnimation(),
      componentProps: {
        currentPlayTime,
        videoId: this.videoId,
      }
    }).then((modal) => {
      this.playYoutubeVideo.emit(1);
      modal.onDidDismiss().then((dismissContent) => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        this.playYoutubeVideo.emit(2);
      });
      modal.present();
    });
  }

  /**
   * @function onPlayerStateChange
   * This method triggered when the youTube player state changes
   */
  public onPlayerStateChange(event) {
    this.playYoutubeVideo.emit(event.data);
  }
}
