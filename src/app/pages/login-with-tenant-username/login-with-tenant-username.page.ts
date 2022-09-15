import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@providers/service/app.service';
import { AuthService } from '@providers/service/auth/auth.service';
import { LoadingService } from '@providers/service/loader.service';
import { SessionService } from '@providers/service/session/session.service';
import { ToastService } from '@providers/service/toast.service';

@Component({
  selector: 'login-with-tenant-username',
  templateUrl: './login-with-tenant-username.page.html',
  styleUrls: ['./login-with-tenant-username.page.scss'],
})
export class LoginWithTenantUsernamePage implements OnInit {

  public signInForm: FormGroup;
  public tenantImage: string;
  public tenantName: string;
  public avatarInitialCount: number;
  public avatarSize: number;
  public submitted: boolean;
  public tenantId: string;
  public usernameVal: string;

  constructor(
    private appService: AppService,
    private navCtrl: NavController,
    private translate: TranslateService,
    protected formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    public loader: LoadingService,
    private activatedRoute: ActivatedRoute,
    private sessionService: SessionService
  ) {
    this.signInForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  public ngOnInit() {
    this.avatarInitialCount = 1;
    this.avatarSize = 80;
    this.tenantImage = this.activatedRoute.snapshot.queryParams.image;
    this.tenantName = this.activatedRoute.snapshot.queryParams['short-name'];
    this.tenantId = this.activatedRoute.snapshot.queryParams.tenantId;
    const emailId = this.activatedRoute.snapshot.queryParams.emailId;
    if (emailId) {
      this.usernameVal = emailId;
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function login
   * login method used to login by using username and password
   */
  public login() {
    this.submitted = true;
    if (this.signInForm.valid) {
      this.loader.displayLoader();
      const userSession = this.sessionService.userSession;
      const accessToken = userSession.access_token;
      this.credentialAuthentication(this.signInForm.value.username,
        this.signInForm.value.password, accessToken);
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function validateForm
   * validateForm method used to check the basic form validation
   */
  public get validateForm() {
    return this.signInForm.controls;
  }

  /**
   * @function credentialAuthentication
   * credentialAuthentication method used to check the login via credential
   */
  public credentialAuthentication(username: string, password: string, accessToken: string) {
    const isDeeplinkUrl = this.activatedRoute.snapshot.queryParams.isDeeplinkUrl;
    this.authService
      .signInWithCredential(username.trim(), password, accessToken)
      .then((sessionModel) => {
        this.loader.dismissLoader();
        this.sessionService.navigateToHome();
        this.sessionService.setSession(sessionModel);
        this.appService.checkDeeplinkUrl(isDeeplinkUrl);
      }, (onerror) => {
        this.loader.dismissLoader();
        this.displayToast('SIGN_IN_CREDENTIALS_NOT_VALID');
      }).finally(() => {
        this.loader.dismissLoader();
      });
  }


  /**
   * @function forgotPassword
   * Method to navigate to the forgotPassword page
   */
  public forgotPassword() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        tenantId: this.tenantId,
        tenantImage: this.tenantImage ? this.tenantImage : null
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
}
