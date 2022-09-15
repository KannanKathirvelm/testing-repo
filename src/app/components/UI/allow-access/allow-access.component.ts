import { Component, OnInit } from '@angular/core';
import { MEETING_TOOLS } from '@constants/helper-constants';
import { environment } from '@environment/environment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { ModalService } from '@providers/service/modal/modal.service';
import { UtilsService } from '@providers/service/utils.service';
import { VideoConferenceService } from '@providers/service/video-conference/video-conference.service';

@Component({
  selector: 'app-allow-access',
  templateUrl: './allow-access.component.html',
  styleUrls: ['./allow-access.component.scss'],
})
export class AllowAccessComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public isZoomMeetingTool: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private utilsService: UtilsService,
    private spinnerDialog: SpinnerDialog,
    private inAppBrowser: InAppBrowser,
    private videoConferenceService: VideoConferenceService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public async ngOnInit() {
    const meetingTool = await this.utilsService.preferredMeetingTool();
    this.isZoomMeetingTool = meetingTool === MEETING_TOOLS.zoom;
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal(context?) {
    this.modalService.dismissModal(context);
  }

  /**
   * @function clickAllow
   * This method is used to click allow
   */
  public clickAllow() {
    const redirectUrl = environment.API_END_POINT;
    this.authorize(redirectUrl).then((url) => {
      this.openAuthorizeWindow(url);
    });
  }

  /**
   * @function authorize
   * This method is used to authorize meeting tool
   */
  public async authorize(url) {
    if (this.isZoomMeetingTool) {
      return this.videoConferenceService.authorizeZoom(url)
    } else {
      return this.videoConferenceService.authorizeConference(url);
    }
  }

  /**
   * @function openAuthorizeWindow
   * This method is used to open authorization in inAppBrowser
   */
  public openAuthorizeWindow(redirectUrl) {
    const options = this.utilsService.getInAppBrowserOptions();
    const browser = this.inAppBrowser.create(redirectUrl, '_blank', options);
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf(environment.API_END_POINT) > -1) {
        browser.close();
        this.closeModal({ isAllow: true });
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }
}
