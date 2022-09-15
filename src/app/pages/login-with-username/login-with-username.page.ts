import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { APP_CONFIG } from '@config/app.config';
import { API_ERROR_MSG } from '@constants/helper-constants';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { environment } from '@environment/environment';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@providers/service/app.service';
import { AuthService } from '@providers/service/auth/auth.service';
import { LoadingService } from '@providers/service/loader.service';
import { SessionService } from '@providers/service/session/session.service';
import { ToastService } from '@providers/service/toast.service';
import { UtilsService } from '@providers/service/utils.service';

@Component({
  selector: 'app-login-with-username',
  templateUrl: './login-with-username.page.html',
  styleUrls: ['./login-with-username.page.scss'],
})
export class LoginWithUsernamePage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public signInForm: FormGroup;
  public submitted: boolean;
  public loading: HTMLIonLoadingElement;
  public usernameVal: string;
  public isDeeplinkUrl: boolean;
  public isIosDevice: boolean;
  public fromSignUp: boolean;
  public productName: string;
  public appLogo: string;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private appService: AppService,
    private utilsService: UtilsService,
    private navCtrl: NavController,
    private translate: TranslateService,
    protected formBuilder: FormBuilder,
    private toastService: ToastService,
    private sessionService: SessionService,
    public loader: LoadingService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private parseService: ParseService
  ) {
    this.signInForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.productName = APP_CONFIG.productName;
    this.appLogo = APP_CONFIG.appLogo;
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.isIosDevice = !this.utilsService.isAndroid();
  }

  public ionViewDidEnter() {
    const emailId = this.activatedRoute.snapshot.queryParams.email;
    this.isDeeplinkUrl = this.activatedRoute.snapshot.queryParams.isDeeplinkUrl;
    this.fromSignUp = this.activatedRoute.snapshot.queryParams.fromSignUp;
    if (emailId) {
      this.usernameVal = emailId;
    }
  }

  /**
   * @function login
   * login method used to login by using username and password
   */
  public login() {
    this.submitted = true;
    if (this.signInForm.valid) {
      this.loader.displayLoader();
      this.authService
        .signInWithCredential(this.signInForm.value.username.trim(), this.signInForm.value.password)
        .then((sessionModel) => {
          this.loader.dismissLoader();
          this.sessionService.navigateToHome();
          this.appService.checkDeeplinkUrl(this.isDeeplinkUrl);
          this.trackNewUserEvent();

        }).catch((error) => {
          if (error.data) {
            const errorMsg = error.data.message;
            if (errorMsg === API_ERROR_MSG.EMAIL_NOT_VERIFIED_MSG) {
              this.goToEmailVerification();
            } else {
              // tslint:disable-next-line
              console.error(errorMsg);
              this.displayToast('SIGN_IN_CREDENTIALS_NOT_VALID');
            }
            this.loader.dismissLoader();
          }
        });
    }
  }

  /**
   * @function doGoogleLogin
   * This method triggers when user try to do login by using google account
   */
  public doGoogleLogin() {
    this.authService.googleLogin(this.isDeeplinkUrl);
  }

  /**
   * @function doAppleLogin
   * This method triggers when user try to do login by using apple account
   */
  public doAppleLogin() {
    this.authService.appleLogin(this.isDeeplinkUrl);
  }

  /**
   * @function gotoLoginTenant
   * Method to navigate to the tenant login page
   */
  public gotoLoginTenant() {
    this.navCtrl.navigateForward([routerPath('loginWithTenantUrl')], {
      queryParams: { isDeeplinkUrl: this.isDeeplinkUrl }
    });
  }

  /**
   * @function goToEmailVerification
   * Method to navigate to the email verification
   */
  public goToEmailVerification() {
    this.navCtrl.navigateForward([routerPath('emailVerify')], {
      queryParams: { not_verified: true }
    });
  }

  /**
   * @function forgotPassword
   * Method to navigate to the forgotPassword page
   */
  public forgotPassword() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        tenantId: environment.GOORU_TENANT_ID
      }
    };
    this.navCtrl.navigateForward(routerPath('forgotPassword'), navigationExtras);
  }

  /**
   * @function displayToast
   * This method is used to display toast
   */
  private displayToast(errorMessage) {
    this.translate
      .get(errorMessage)
      .subscribe(value => {
        this.toastService.presentToast(value);
      });
  }

  /**
   * @function validateForm
   * validateForm method used to check the basic form validation
   */
  public get validateForm() {
    return this.signInForm.controls;
  }

  /**
   * @function onClickSignUp
   * This Method is used to navigate to the sign up page
   */
  public onClickSignUp() {
    this.navCtrl.navigateForward(routerPath('signUp'));
  }
  /**
   * @function trackNewUserEvent
   * This method is used to track the new user signed up
   */
  private trackNewUserEvent() {
    this.parseService.trackEvent(EVENTS.LOGIN);
  }
}
