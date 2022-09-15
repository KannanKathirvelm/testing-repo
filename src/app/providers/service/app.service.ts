import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigModel } from '@app/models/config/config';
import { Capacitor } from '@capacitor/core';
import { deeplinkRoutes } from '@constants/deeplink-constants';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { environment } from '@environment/environment';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Market } from '@ionic-native/market/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { NetworkService } from '@providers/service/network.service';
import { cloneObject, compareVersions } from '@utils/global';
import { BehaviorSubject } from 'rxjs';
import { LookupService } from './lookup/lookup.service';
import { ToastService } from './toast.service';

export interface DeeplinkModel {
  $link: any;
  $args: any;
  $route: any;
}

@Injectable()
export class AppService {
  // -------------------------------------------------------------------------
  // Properties

  private deeplinkSubject: BehaviorSubject<DeeplinkModel>;
  private readonly APP_NOTIFICATION_KEY = 'app_notification';
  private appNotificationCount: number;


  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private router: Router,
    private network: NetworkService,
    private storage: Storage,
    private toastService: ToastService,
    private lookupService: LookupService,
    private alertController: AlertController,
    private translate: TranslateService,
    private market: Market,
    private deeplinks: Deeplinks,
    private zone: NgZone
  ) {
    this.deeplinkSubject = new BehaviorSubject<DeeplinkModel>(null);
    this.appNotificationCount = 0;
  }

  /**
   * @property deeplink
   * This property is used to get deeplinks
   */
  get deeplink() {
    return this.deeplinkSubject
      ? cloneObject(this.deeplinkSubject.value)
      : null;
  }

  /**
   * @function handleStatusBar
   * This Method is used to handle the status bar
   */
  public handleStatusBar() {
    const isAndroid = this.isAndroid();
    if (isAndroid) {
      this.statusBar.styleLightContent();
    } else {
      this.statusBar.styleDefault();
    }
  }


  /**
   * @function isAndroid
   * This Method is used to find out the device is Android
   */
  public isAndroid() {
    return Capacitor.getPlatform() === 'android';
  }

  /**
   * @function isIosDevice
   * This Method is used to find out the device is desktop
   */
  public isIosDevice() {
    return Capacitor.getPlatform() === 'ios';
  }

  /**
   * @function isCordova
   * This Method is used to find out the device is mobile or browser
   */
  public isCordova() {
    return this.isAndroid() || this.isIosDevice();
  }

  /**
   * @function getDeviceDimension
   * This Method is used to get device dimension
   */
  public getDeviceDimension() {
    const width = this.platform.width();
    const height = this.platform.height();
    return {
      width,
      height
    };
  }

  /**
   * @function checkDeeplinkUrl
   * This Method is used to check the deeplink url
   */
  public checkDeeplinkUrl(isDeeplinkUrl) {
    if (isDeeplinkUrl) {
      this.handleDeeplinkUrl();
    } else {
      this.navCtrl.navigateRoot(routerPath('teacherHome'));
    }
  }

  /**
   * @function handleDeeplinkUrl
   * This Method is used to handle deeplink urls
   */
  public handleDeeplinkUrl() {
    const deeplink = this.deeplink;
    const deeplinkId = deeplink.$args.id;
    const deeplinkPath = deeplink.$link.path;
    this.navigateDeeplinkUrl(deeplinkId, deeplinkPath);
  }

  /**
   * @function navigateDeeplinkUrl
   * This Method is used to navigate to deeplink url
   */
  public navigateDeeplinkUrl(id, path) {
    const params = {
      id
    };
    this.router.navigate([path], {
      queryParams: params
    });
  }

  /**
   * @function networkInitialize
   * This Method is used to intilaize network
   */
  public networkInitialize() {
    this.network.initializeNetworkEvents();
  }

  /**
   * @function handleAppNotification
   * This Method is used to handle app notification
   */
  public handleAppNotification() {
    this.lookupService
      .fetchAppConfig()
      .then(async (appConfig: AppConfigModel) => {
        if (appConfig) {
          const isEnableMaintenanceMode = appConfig.enable_maintenance_mode;
          const isEnableNotification = appConfig.enable_notification;
          if (isEnableNotification && isEnableNotification.value.option) {
            const isNotified = await this.storage.get(
              this.APP_NOTIFICATION_KEY
            );
            if (!isNotified) {
              const notificationMessage =
                appConfig.notification_message.value.message;
              this.toastService.presentToast(notificationMessage);
              this.appNotificationCount += 1;
              if (this.appNotificationCount === 2) {
                this.storage.set(this.APP_NOTIFICATION_KEY, true);
              }
            }
          } else {
            this.storage.set(this.APP_NOTIFICATION_KEY, false);
          }
          if (isEnableMaintenanceMode && isEnableMaintenanceMode.value.option) {
            const message = appConfig.maintenance_message.value.message;
            this.displayMaintenanceAlert(message);
          }
        }
      });
  }

  /**
   * @function displayMaintenanceAlert
   * This Method is used to display the maintenance break alert
   */
  public async displayMaintenanceAlert(message) {
    const isAndroid = this.isAndroid();
    const translateMsg = isAndroid ? 'CLOSE_APP' : 'OKAY';
    const alert = await this.alertController.create({
      header: this.translate.instant('MAINTENANCE_ALERT'),
      message,
      buttons: [
        {
          text: this.translate.instant(translateMsg),
          handler: () => {
            navigator['app'].exitApp();
          },
        },
      ],
      backdropDismiss: false,
      cssClass: 'maintenance-alert'
    });
    await alert.present();
  }

  /**
   * @function initialize
   * This Method is used to initialize update
   */
  public async initialize() {
    const appConfig = await this.lookupService.fetchAppConfig();
    if (appConfig) {
      const isReleaseInfo = appConfig && appConfig.release_info;
      if (isReleaseInfo) {
        const releaseInfo = appConfig.release_info;
        const minVersion = releaseInfo.value.minVersion;
        const appVersion = environment.APP_VERSION;
        const showAlert = compareVersions(minVersion, '>', appVersion);
        if (showAlert) {
          this.displayUpdateAlert();
        }
      }
    }
    return;
  }

  /**
   * @function displayUpdateAlert
   * This Method is used to display the alert update
   */
  public async displayUpdateAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('ALERT'),
      message: this.translate.instant('NAVIGATOR_UPDATE'),
      buttons: [
        {
          text: this.translate.instant('UPDATE'),
          handler: () => {
            this.market.open(environment.PACKAGE_NAME);
            return false;
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  /**
   * @function registerDeeplinks
   * This Method is used to register deeplinks
   * We are facing issue with latest deeplink version so currently we are using stable version 1.0.20.
   * Also, check out {@link https://github.com/ionic-team/ionic-plugin-deeplinks/pull/191#issuecomment-619795962}
   */
   public async registerDeeplinks() {
    this.deeplinks.route(deeplinkRoutes()).subscribe((match) => {
      this.zone.run(() => {
        this.navCtrl.navigateRoot([match.$link.path], { queryParams: match.$args });
      });
    }, nomatch => {
      const error = `Got a deeplink that didn\'t match ${JSON.stringify(nomatch)}`;
      // tslint:disable-next-line
      console.error(error);
    });
  }
}
