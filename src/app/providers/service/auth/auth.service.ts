import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TOOLBAR_OPTIONS } from '@constants/helper-constants';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { environment } from '@environment/environment';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AuthProvider } from '@providers/apis/auth/auth';
import { AppService } from '@providers/service/app.service';
import { LoadingService } from '@providers/service/loader.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { SessionService } from '@providers/service/session/session.service';
import { ToastService } from '@providers/service/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(
    private authProvider: AuthProvider,
    private appService: AppService,
    private sessionService: SessionService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translate: TranslateService,
    private router: Router,
    private inAppBrowser: InAppBrowser,
    private spinnerDialog: SpinnerDialog,
    private dialogs: Dialogs,
    private profileService: ProfileService
  ) { }


  /**
   * @function tenantLogin
   * This method used to do tenant login
   */
  public tenantLogin(tenantUrl: string, emailId?: string, isDeeplinkUrl?: boolean, queryParams?) {
    let url = `${tenantUrl}?long_lived_access=true`;
    if (queryParams) {
      url = `${url}&${queryParams}`;
    }
    this.loginViaInAppBrowser(url, isDeeplinkUrl, emailId);
  }

  /*
   * This method is used to display the error message
   */
  public displayMessage(errorMessageKey) {
    this.translate.get(errorMessageKey).subscribe((value) => {
      this.toastService.presentToast(value);
    });
  }

  /**
   * @function nonceBasedAuthentication
   * this method used to authenticate signInAnonymousUsingNonce login
   */
  public nonceTokenAuthentication(nonceToken: string, emailId?: string, isDeeplinkUrl?: boolean) {
    this.authProvider.signInAnonymousUsingNonce(nonceToken).then((sessionModel) => {
      this.loadingService.dismissLoader();
      this.sessionService.setSession(sessionModel);
      const tenantDetail = sessionModel.tenant;
      this.router.navigate([routerPath('loginWithTenantUsername')],
        {
          queryParams: {
            image: tenantDetail.image_url,
            'short-name': tenantDetail.short_name,
            tenantId: tenantDetail.tenantId,
            emailId,
            isDeeplinkUrl
          }
        });
    });
  }

  /**
   * @function signInWithCredential
   * This method is used to sign in with username and password
   */
  public signInWithCredential(usernameOrEmail, password, accessToken = null) {
    return this.authProvider.signInWithCredential(usernameOrEmail, password, accessToken)
      .then((sessionModel) => {
        this.sessionService.setSession(sessionModel);
      });
  }

  /**
   * @function signUpWithCredential
   * This method is used to sign up with credential
   */
  public signUpWithCredential(signUpFormContent, profileDetails) {
    return this.authProvider.signUpWithCredential(signUpFormContent).then((response) => {
      const emailId = response.email;
      const token = response.access_token;
      return this.authProvider.updateUserProfile(profileDetails, token).then(() => {
        return this.profileService.verifyUserEmail(emailId, token);
      });
    });
  }

  /**
   * @function updateUserProfile
   * This method is used to update profile details
   */
  public updateUserProfile(userDetails) {
    return this.authProvider.updateUserProfile(userDetails);
  }

  /**
   * @function loginViaInAppBrowser
   * this method used to login via in app browser
   */
  public loginViaInAppBrowser(tenantUrl, isDeeplinkUrl, emailId) {
    const options = this.getInAppBrowserOptions();
    const browser = this.inAppBrowser.create(tenantUrl, '_blank', options);
    const alertMessage = this.translate.instant('IN_APP_BROWSER_ALERT_MSG');
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
      this.dialogs.alert(alertMessage).then(() => {
        browser.hide();
      });
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
      this.loadingService.dismissLoader();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('nonce') > -1) {
        browser.close();
        const nonceToken = event.url.split('nonce=')[1];
        this.nonceTokenAuthentication(nonceToken, emailId, isDeeplinkUrl);
      } else if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
  }

  /**
   * @function accessTokenAuthentication
   * this method used to authenticate signInWithToken login
   */
  public accessTokenAuthentication(accessToken: string, isDeeplinkUrl?: boolean) {
    this.authProvider.signInWithToken(accessToken).then((sessionModel) => {
      this.sessionService.setSession(sessionModel);
      this.appService.checkDeeplinkUrl(isDeeplinkUrl);
      this.loadingService.dismissLoader();
      this.sessionService.navigateToHome();
    });
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
      closebuttoncolor: TOOLBAR_OPTIONS.FONT_COLOR,
    };
    return options;
  }

  /**
   * @function googleLogin
   * This method used to do google login
   */
  public googleLogin(isDeeplinkUrl) {
    const options = this.getInAppBrowserOptions();
    const googleAPI = `${environment.API_END_POINT}/api/nucleus-auth-idp/v1/google`;
    const browser = this.inAppBrowser.create(googleAPI, '_blank', options);
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        this.loadingService.displayLoader();
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }

  /**
   * @function appleLogin
   * This method used to do apple login
   */
  public appleLogin(isDeeplinkUrl) {
    const options = this.getInAppBrowserOptions();
    const appleAPI = `${environment.API_END_POINT}/api/nucleus-auth-idp/v1/apple`;
    const browser = this.inAppBrowser.create(appleAPI, '_blank', options);
    browser.on('loadstart').subscribe(() => {
      this.spinnerDialog.show();
    });
    browser.on('loadstop').subscribe(event => {
      this.spinnerDialog.hide();
      if (event.url != null && event.url.indexOf('access_token') > -1) {
        browser.close();
        let accessToken = event.url.split('access_token=')[1];
        this.loadingService.displayLoader();
        // adding # for first time login in access token, to remove that
        accessToken = accessToken.replace('#', '');
        this.accessTokenAuthentication(accessToken, isDeeplinkUrl);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
    });
  }

  /**
   * @function getAccessToken
   * This Method is used to get the basic session details from the ionic storage
   */
  public getAccessToken() {
    return this.sessionService.getSession().then((session) => {
      if (session === null) {
        return this.authProvider.signInAsAnonymous().then((sessionModel) => {
          this.sessionService.setSession(sessionModel);
          return sessionModel.access_token;
        });
      } else {
        return session.access_token;
      }
    });
  }

  /**
   * @function refreshToken
   * This Method is used to call refresh token
   */
  public refreshToken() {
    this.sessionService.getRefreshToken().then((token) => {
      this.authProvider.getAccessTokenByRefreshToken(token).then((response) => {
        this.sessionService.setRefreshToken(response);
        const navigationExtras: NavigationExtras = {
          queryParams: { isReload: true }
        };
        this.sessionService.navigateToHome(navigationExtras);
      }, () => {
        this.sessionService.sessionInValidate();
      });
    });
  }
}
