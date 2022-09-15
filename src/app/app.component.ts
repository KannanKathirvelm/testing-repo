import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router, RoutesRecognized } from '@angular/router';
import { AppLogout } from '@app/app.logout';
import { EVENTS } from '@constants/events-constants';
import { routerEventPath } from '@constants/router-constants';
import { LANGUAGES } from '@constants/translate-constants';
import { environment } from '@environment/environment';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MenuController, Platform } from '@ionic/angular';
import { SessionModel } from '@models/auth/session';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@providers/service/app.service';
import { DatabaseService } from '@providers/service/database.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ParseService } from '@providers/service/parse/parse.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { SessionService } from '@providers/service/session/session.service';
import { TranslationService } from '@providers/service/translation.service';
import { UtilsService } from '@providers/service/utils.service';
import { getRouteFromUrl } from '@utils/global';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { NetworkService } from './providers/service/network.service';
import { SyncService } from './providers/service/sync.service';
declare var cordova: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public isAuthenticated: boolean;
  public userSession: SessionModel;
  public showNgxAvatar: boolean;
  public languageList: Array<{ label: string, value: string }>;
  public defaultLanguage: string;
  public profileUpdateSubscription: AnonymousSubscription;
  public routerSubscription: AnonymousSubscription;
  private isLangLoaded: boolean;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public activeRouterPath: string;
  public startTime: number;
  public isLogOut: boolean;

  /*This method used to get the app version from environment*/
  get appVersion() {
    return environment.APP_VERSION;
  }

  constructor(
    private profileService: ProfileService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translationService: TranslationService,
    private appLogoutService: AppLogout,
    private menuCtrl: MenuController,
    private sessionService: SessionService,
    private appService: AppService,
    private lookupService: LookupService,
    private translate: TranslateService,
    private databaseService: DatabaseService,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
    private syncService: SyncService,
    private parseService: ParseService,
    private router: Router
  ) {
    this.initializeApp();
    this.languageList = [];
    this.isAuthenticated = false;
    this.isLangLoaded = false;
  }

  public initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.initTranslate();
      this.showSplashScreen();
      this.appService.handleStatusBar();
      this.appService.registerDeeplinks();
      this.lookupService.fetchLocationInfo();
      this.appService.networkInitialize();
      this.requestAppTrackingTransparency();
    });
  }

  public ngOnInit() {
    this.startTime = moment().valueOf();
    this.sessionService.currentSession.subscribe(async (session) => {
      this.isAuthenticated = this.sessionService.isLoggedInUser(session);
      this.userSession = session;
      this.showNgxAvatar = this.userSession && !this.userSession.thumbnail;
      if (this.isAuthenticated && !this.isLangLoaded) {
        this.isLangLoaded = true;
        const lang = await this.translationService.getLanguage();
        this.translate.reloadLang(lang);
      }
      if (this.isAuthenticated) {
        await this.databaseService.createPouchDB();
        this.watchNetworkStatus();
      }
    });
    this.getLanguage();
    this.subscribeToUpdateProfileImage();
    this.handlePageViewEvent();
  }

  public ngOnDestroy() {
    this.profileUpdateSubscription.unsubscribe();
    this.networkSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  /**
   * @function watchNetworkStatus
   * This Method is used to watch the network status
   */
  public watchNetworkStatus() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        if (this.isOnline) {
          this.syncService.processOfflineEvents();
        }
      });
    });
  }

  /**
   * @function getLanguage
   * This Method is used to get language
   */
  public async getLanguage() {
    this.defaultLanguage = await this.translationService.getLanguage();
    this.languageList = LANGUAGES;
  }

  /**
   * @function subscribeToUpdateProfileImage
   * This method is used to subscribe to update profile image
   */
  public subscribeToUpdateProfileImage() {
    this.profileUpdateSubscription = this.profileService.userProfileUpdate.subscribe((state) => {
      if (state) {
        this.showNgxAvatar = false;
      }
    });
  }

  /**
   * @function initTranslate
   * This Method is used to init translation
   */
  private async initTranslate() {
    await this.translationService.initTranslate();
  }

  /**
   * @function showSplashScreen
   * This Method is used to show splash screen
   */
  private showSplashScreen() {
    this.splashScreen.hide();
  }


  /**
   * @function closeMenu
   * This Method is used to close the side menu
   */
  public closeMenu() {
    this.menuCtrl.close();
  }

  /**
   * @function onLogout
   * This Method is used to logout from the app
   */
  public onLogout() {
    this.isLangLoaded = false;
    this.menuCtrl.close().then(() => {
      this.isAuthenticated = false;
      this.appLogoutService.execute();
      this.trackLogoutEvent();
    });
  }

  /**
   * @function trackLogoutEvent
   * This Method is used to logout from the app
   */
  public trackLogoutEvent() {
    return this.parseService.trackEvent(EVENTS.APP_LOGOUT);
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = true;
  }

  /**
   * @function changeLanguage
   * This Method is used to change the language of app
   */
  public changeLanguage(event) {
    const selectedLanguage = event.detail.value;
    this.translationService.setLanguage(selectedLanguage);
  }

  /**
   * @function handlePageViewEvent
   * This Method is used to handle the page view event
   */
  public handlePageViewEvent() {
    this.routerSubscription = this.router.events.subscribe((route) => {
      if (route instanceof RoutesRecognized && !this.activeRouterPath) {
        this.activeRouterPath = getRouteFromUrl(route.url);
      }
      if (route instanceof NavigationStart) {
        const routerPath = getRouteFromUrl(route.url);
        if (this.activeRouterPath !== routerPath) {
          if (!this.isLogOut) {
            this.trackPageViewEvent();
          } else {
            this.isLogOut = false;
          }
          this.activeRouterPath = routerPath;
        }
      }
    });
  }

  /**
   * @function trackPageViewEvent
   * This Method is used to track the page view event
   */
  public trackPageViewEvent() {
    const context = this.getPageViewEventContext();
    this.parseService.trackEvent(EVENTS.PAGE_VIEW, context).then(() => {
      this.startTime = moment().valueOf();
    });
  }

  /**
   * @function getPageViewEventContext
   * This method is used to get the context of page view event
   */
  private getPageViewEventContext() {
    const endTime = moment().valueOf();
    const pageName = this.activeRouterPath ? routerEventPath(this.activeRouterPath) : null;
    return {
      pageName,
      startTime: this.startTime,
      endTime
    };
  }

  /**
   * @function requestAppTrackingTransparency
   * This Method is used to request the app tracking transparency
   */
  private requestAppTrackingTransparency() {
    if (this.utilsService.isIOS()) {
      const idfaPlugin = cordova.plugins.idfa;
      idfaPlugin.getInfo().then((info) => {
        if (info.trackingPermission !== idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
          idfaPlugin.requestPermission();
        }
      });
    }
  }
}
