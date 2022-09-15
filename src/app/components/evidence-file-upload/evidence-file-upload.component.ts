import { Component, Input } from '@angular/core';
import { TOOLBAR_OPTIONS } from '@app/constants/helper-constants';
import { EvidenceModel } from '@app/models/performance/performance';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'nav-evidence-file-upload',
  templateUrl: './evidence-file-upload.component.html',
  styleUrls: ['./evidence-file-upload.component.scss'],
})
export class EvidenceFileUploadComponent {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public evidenceFiles: Array<EvidenceModel>;

  constructor(
    private inAppBrowser: InAppBrowser
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function openEvidenceImage
   * This method is open evidence image in inappbrowser
   */
  public openEvidenceImage(url) {
    const target = '_blank';
    const options = this.getInAppBrowserOptions();
    this.inAppBrowser.create(
      url,
      target,
      options
    );
  }

  /**
   * @function getInAppBrowserOptions
   * This method is used to get the in app browser options
   */
  public getInAppBrowserOptions() {
    const options: InAppBrowserOptions = {
      location: 'yes',
      hidden: 'no',
      zoom: 'yes',
      hideurlbar: 'yes',
      toolbarcolor: TOOLBAR_OPTIONS.BACKGROUND_COLOR,
      navigationbuttoncolor: TOOLBAR_OPTIONS.FONT_COLOR,
      closebuttoncolor: TOOLBAR_OPTIONS.FONT_COLOR
    };
    return options;
  }
}
