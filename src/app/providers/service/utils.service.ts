import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Capacitor, Plugins } from '@capacitor/core';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import { EXTERNAL_APP_PACKAGES, MEETING_TOOLS, PLAYER_TOOLBAR_OPTIONS } from '@constants/helper-constants';
import { environment } from '@environment/environment';
import { AppLauncher, AppLauncherOptions } from '@ionic-native/app-launcher/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Market } from '@ionic-native/market/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '@providers/service/database.service';
import { NetworkService } from '@providers/service/network.service';
import { ToastService } from '@providers/service/toast.service';
import { generateUUID } from '@utils/global';
import CryptoJS from 'crypto-js';
import { BehaviorSubject, Observable } from 'rxjs';
const { Device } = Plugins;

@Injectable()
export class UtilsService {

  private sessionIdSubject: BehaviorSubject<string>;
  public onSessionId: Observable<string>;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private screenOrientation: ScreenOrientation,
    private file: File,
    private diagnostic: Diagnostic,
    private fileOpener: FileOpener,
    private clipboard: Clipboard,
    private toastService: ToastService,
    private translate: TranslateService,
    private appLauncher: AppLauncher,
    private market: Market,
    @Inject(DOCUMENT) private document: Document,
    private networkService: NetworkService,
    private databaseService: DatabaseService
  ) {
    this.sessionIdSubject = new BehaviorSubject<string>(null);
    this.onSessionId = this.sessionIdSubject.asObservable();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function downloadPdf
   * Method to download pdf based on device or browser
   */
  public downloadPdf(pdfCollection, fileName) {
    if (this.isNative()) {
      return pdfCollection.getBuffer((buffer) => {
        const blob = new Blob([buffer], { type: 'application/pdf' });
        // Save the PDF to the data Directory of our App
        this.file.writeFile(this.file.dataDirectory, fileName, blob, { replace: true }).then(fileEntry => {
          // Open the PDf with the correct OS tools
          this.fileOpener.open(this.file.dataDirectory + fileName, 'application/pdf');
        });
      });
    } else {
      // On a browser simply use download!
      return pdfCollection.download();
    }
  }

  /**
   * @function addClassForModals
   * Method to add new class for modal
   */
  public addClassForModals(modalClass, newClass, removeLast?) {
    if (removeLast) {
      this.document.querySelector(`.${modalClass} .modal-wrapper`).classList.remove(newClass);
    } else {
      this.document.querySelector(`.${modalClass} .modal-wrapper`).classList.add(newClass);
    }
  }

  /**
   * @function openPDFLink
   * This method used to open the chrome
   */
  public openPDFLink(link) {
    const options: AppLauncherOptions = {};
    if (this.isAndroid()) {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP;
    } else {
      options.packageName = EXTERNAL_APP_PACKAGES.SAFARI_APP;
    }
    options.uri = link;
    this.launchApp(options, EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP,
      EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_IOS_APP);
  }

  /**
   * @function checkMicrophoneAndStoragePermission
   * This method is used to check permissions
   */
  public checkMicrophoneAndStoragePermission() {
    this.diagnostic.requestRuntimePermissions([
      this.diagnostic.permission.RECORD_AUDIO,
      this.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
      this.diagnostic.permission.READ_EXTERNAL_STORAGE
    ]).catch((error) => {
      // tslint:disable-next-line
      console.error("error in permission request", error);
    });
  }

  /**
   * @function lockOrientationInPortrait
   * Method to used to rotate portrait
   */
  public lockOrientationInPortrait() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  /**
   * @function isAndroid
   * This Method is used to find out the device is Android
   */
  public isAndroid() {
    return Capacitor.getPlatform() === 'android';
  }

  /**
   * @function isIOS
   * This Method is used to find out the device is iOS
   */
  public isIOS() {
    return Capacitor.getPlatform() === 'ios';
  }

  /**
   * @function isNative
   * This Method is used to find out the device is native
   */
   public isNative() {
    return Capacitor.isNative;
  }

  /**
   * @function isIOS
   * This Method is used to find out the device is iOS
   */
   public isBrowser() {
    return !Capacitor.isNative;
  }


  /**
   * @function lockOrientationInLandscape
   * Method to used to rotate to landscape
   */
  public lockOrientationInLandscape() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

  /**
   * @function getGlobalElementByClassName
   * Method to get global element by className
   */
  public getGlobalElementByClassName(elementClass) {
    return this.document.querySelector(`.${elementClass}`);
  }

  /**
   * @function copyToClipBoard
   * This method used to copy the content to clipboard
   */
  public copyToClipBoard(content) {
    this.clipboard.copy(content);
    const copiedText = this.translate.instant('COPIED_TO_CLIPBOARD');
    this.toastService.presentToast(copiedText);
  }

  /**
   * @function launchApp
   * This Method is used to launch the external app
   */
  public launchApp(options: AppLauncherOptions, defaultAndroidURI, defaultIOSURI) {
    this.appLauncher.launch(options).catch(() => {
      const packageName = this.isAndroid() ? defaultAndroidURI : defaultIOSURI;
      this.market.open(packageName);
    });
  }

  /**
   * @function preferredMeetingTool
   * This Method is used to return meeting tool based on tenant settings
   */
  public async preferredMeetingTool() {
    const tenantSettings = await this.databaseService.getDocument(DOCUMENT_KEYS.TENANT_SETTINGS);
    const meetingTool = tenantSettings && tenantSettings['preferredMeetingTool'] || MEETING_TOOLS.hangout;
    return Promise.resolve(meetingTool);
  }

  /**
   * @function openMeetingLink
   * This method used to open the meeting link
   */
  public openMeetingLink(link) {
    const options: AppLauncherOptions = {};
    if (this.isAndroid()) {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP;
    } else {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_IOS_APP;
    }
    options.uri = link;
    this.launchApp(options, EXTERNAL_APP_PACKAGES.GOOGLE_MEET_ANDROID_APP,
      EXTERNAL_APP_PACKAGES.GOOGLE_MEET_IOS_APP);
  }

  /**
   * @function openZoomLink
   * This method used to open zoom link
   */
  public openZoomLink(link) {
    const options: AppLauncherOptions = {};
    if (this.isAndroid()) {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_ANDROID_APP;
    } else {
      options.packageName = EXTERNAL_APP_PACKAGES.GOOGLE_CHROME_IOS_APP;
    }
    options.uri = link;
    this.launchApp(options, EXTERNAL_APP_PACKAGES.ZOOM_APP,
      EXTERNAL_APP_PACKAGES.ZOOM_APP);
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
      toolbarcolor: PLAYER_TOOLBAR_OPTIONS.BACKGROUND_COLOR,
      navigationbuttoncolor: PLAYER_TOOLBAR_OPTIONS.FONT_COLOR,
      closebuttoncolor: PLAYER_TOOLBAR_OPTIONS.FONT_COLOR,
    };
    return options;
  }

  /**
   * @function isNetworkOnline
   * This Method is used to get network online
   */
   public isNetworkOnline() {
    return this.isBrowser() ? environment.IS_ONLINE : this.networkService.isNetworkInOnline;
  }

  /**
   * @function deviceInfo
   * This Method is used to find out the device information
   */
  public async deviceInfo() {
    const info = await Device.getInfo();
    const deviceInfo = {
      platform: info.platform,
      deviceName: info.manufacturer,
      deviceId: info.model,
      version: info.osVersion,
    };
    return deviceInfo;
  }

  /**
   * @function getSessionId
   * This method used to get the session id
   */
  public getSessionId() {
    if (this.sessionId) {
      return this.sessionId;
    }
    const sessionId = generateUUID();
    this.sessionIdSubject.next(sessionId);
    return sessionId;
  }

  get sessionId() {
    return this.sessionIdSubject ? this.sessionIdSubject.value : null;
  }

  /**
   * @function findUrlExtension
   * This Method is used to find URL extension
   */
   public findUrlExtension(url) {
    return url && url.split(/[#?]/)[0].split('.').pop().trim();
  }

  /**
   * @function encryptByMd5
   * This Method is used to encrypt the value
   */
  public encryptByMd5(value) {
    return CryptoJS.MD5(value).toString();
  }
}
