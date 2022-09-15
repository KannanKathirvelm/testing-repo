import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { NavController } from '@ionic/angular';
import { ProfileModel } from '@models/profile/profile';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@providers/service/auth/auth.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { ToastService } from '@providers/service/toast.service';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.page.html',
  styleUrls: ['./email-verify.page.scss'],
})
export class EmailVerifyPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public showSuccessAlert: boolean;
  public token: string;
  public resendEmailForm: FormGroup;
  public submitted: boolean;
  public userId: string;
  public userDetail: ProfileModel;
  public showResendEmailForm: boolean;
  public successMessage: string;
  public isEmailverified: boolean;
  public isLoaded: boolean;
  public isEmailNotVerified: boolean;
  public message: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private modalService: ModalService,
    private navCtrl: NavController,
    protected formBuilder: FormBuilder,
    private translate: TranslateService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.token = this.activatedRoute.snapshot.queryParams.token;
    this.userId = this.activatedRoute.snapshot.queryParams.user_id;
    this.isEmailNotVerified = this.activatedRoute.snapshot.queryParams.not_verified;
    this.resendEmailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    if (this.isEmailNotVerified) {
      this.message = this.translate.instant('ACCOUNT_NOT_VERIFIED_MSG');
      this.isLoaded = true;
      this.showResendEmailForm = true;
    } else {
      this.emailVerification();
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchUserDetail
   * method used to fetch user detail
   */
  public fetchUserDetail() {
    this.profileService.fetchUserProfile(this.userId).then((userDetailRes) => {
      this.userDetail = userDetailRes;
    });
  }

  /**
   * @function emailVerification
   * method is used tp verify email id
   */
  public emailVerification() {
    this.profileService.updateEmailVerification(this.token).then((response) => {
      this.isEmailverified = true;
    }).catch((error) => {
      if (error.response) {
        if (error.response.status === 410) {
          this.displayToast('EMAIL_VERIFY_TOKEN_EXPIRED_TOAST_MSG');
          this.fetchUserDetail();
          this.message = this.translate.instant('EMAIL_VERIFY_TOKEN_EXPIRED_MSG');
          this.showResendEmailForm = true;
        }
      }
    }).finally(() => {
      this.isLoaded = true;
    });
  }

  /**
   * @function resendEmail
   * method is run after submit resend form
   */
  public resendEmail() {
    this.submitted = true;
    if (this.resendEmailForm.valid) {
      const emailId = this.resendEmailForm.value.email;
      this.authService.getAccessToken().then((token) => {
        this.profileService.verifyUserEmail(emailId, token).then((response) => {
          this.successMessage = this.translate.instant('RESEND_EMAIL_MSG');
          this.showSuccessAlert = true;
        });
      }).catch((error) => {
        if (error.response) {
          if (error.response.status === 400) {
            this.displayToast(error.response.data.message);
          }
        }
      });
    }
  }

  /**
   * @function validateForm
   * validateForm method used to check the basic form validation
   */
  public get validateForm() {
    return this.resendEmailForm.controls;
  }

  /**
   * @function dismissAlert
   * Method to close alert
   */
  public dismissAlert(value) {
    if (value) {
      this.redirectToLogin();
      this.modalService.dismissModal();
      this.showSuccessAlert = false;
    }
  }

  /**
   * @function redirectToLogin
   * this Method is used to navigate to the username login page
   */
  public redirectToLogin() {
    this.navCtrl.navigateForward([routerPath('loginWithUsername')]);
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
