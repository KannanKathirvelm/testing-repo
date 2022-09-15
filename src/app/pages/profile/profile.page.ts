import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AppLogout } from '@app/app.logout';
import { ChangePasswordComponent } from '@app/components/change-password/change-password.component';
import { ProfileProvider } from '@app/providers/apis/profile/profile';
import { ToastService } from '@app/providers/service/toast.service';
import { SelectWithSearchBarComponent } from '@components/UI/inputs/select-with-search-bar/select-with-search-bar.component';
import { SETTINGS } from '@constants/helper-constants';
import { AlertController } from '@ionic/angular';
import { SessionModel } from '@models/auth/session';
import { CountryModel } from '@models/lookup/lookup';
import { ProfileModel } from '@models/profile/profile';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@providers/service/auth/auth.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { MediaService } from '@providers/service/media/media.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { NetworkService } from '@providers/service/network.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';

export interface SearchSelectModel {
  id: string;
  name: string;
}

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  public userSession: SessionModel;
  public userDetails: ProfileModel;
  public year: string;
  public tenantValue: string;
  public deletionTriggerDate: string;
  public showNgxAvatar: boolean;
  public isSaving: boolean;
  public countries: Array<CountryModel>;
  public selectedCountryDetail: SearchSelectModel;
  public isEditMode: boolean;
  public schoolDistrict: string;
  public userCountry: string;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private sessionService: SessionService,
    private lookupService: LookupService,
    private mediaService: MediaService,
    private profileService: ProfileService,
    private authService: AuthService,
    private utilsService: UtilsService,
    private networkService: NetworkService,
    private zone: NgZone,
    public alertController: AlertController,
    private translate: TranslateService,
    private profileProvider: ProfileProvider,
    private toastService: ToastService,
    private appLogoutService: AppLogout
  ) {
    this.userSession = this.sessionService.userSession;
    this.tenantValue = SETTINGS.ON;
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
        if (this.isOnline) {
          this.showNgxAvatar = this.userSession && !this.userSession.thumbnail;
          this.fetchTenantSettings();
          this.loadData();
        }
      });
    });
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  /**
   * @function togglePullUp
   * Method to open the search list model
   */
  public togglePullUp() {
    const props = {
      dataList: this.countries,
      selectedValue: this.selectedCountryDetail
    };
    this.modalService.openModal(SelectWithSearchBarComponent, props, 'country-list-modal').then((dismissContent: { selectedValue: SearchSelectModel }) => {
      if (dismissContent && dismissContent.selectedValue) {
        this.selectedCountryDetail = dismissContent.selectedValue;
      }
    });
  }

  /**
   * @function loadData
   * This method is used to load  the data
   */
  public loadData() {
    this.profileService.fetchUserProfile(this.userSession.user_id).then((profile) => {
      this.userDetails = profile[0];
      const deletionDate = this.userDetails.deletionTriggerDate;
      if (this.userDetails.birthDate) {
        this.year = this.userDetails.birthDate;
      }
      if (this.userDetails) {
        this.schoolDistrict = this.userDetails.schoolDistrict;
        this.userCountry = this.userDetails.country;
        this.fetchCountries();
      }
      if (deletionDate) {
        this.deletionTriggerDate = moment(deletionDate).format('MMMM DD, YYYY');
      }
    });
  }

  /**
   * @function onSubmit
   * This method is used to submit the info
   */
  public async onSubmit() {
    this.isEditMode = false;
    const postData = {
      country: this.selectedCountryDetail.name,
      school_district: this.schoolDistrict,
      state: this.userDetails.state
    };
    await this.authService.updateUserProfile(postData);
    this.userCountry = this.selectedCountryDetail.name;
  }

  /**
   * @function fetchCountries
   * This method is used to fetch countries
   */
  public fetchCountries() {
    this.lookupService.fetchCountries().then((countriesModel) => {
      this.countries = countriesModel;
      if (this.userDetails && this.userDetails.country) {
        const country = this.userDetails.country;
        this.selectedCountryDetail = this.countries.find((countryModel) => {
          return countryModel.name === country;
        });
      }
    });
  }

  /**
   * @function onClickUpdate
   * This method is used to update the user profile
   */
  public async onClickUpdate(event) {
    this.isSaving = true;
    const image = event.target.files[0];
    if (image) {
      const thumbnail = await this.mediaService.uploadContentFile(image, 'user');
      const postData = {
        thumbnail
      };
      this.authService.updateUserProfile(postData).then(() => {
        this.userSession.thumbnail = `${this.userSession.cdn_urls.user_cdn_url}${thumbnail}`;
        this.sessionService.setSession(this.userSession);
        this.profileService.updateUserProfileEvent(true);
        this.showNgxAvatar = false;
        this.isSaving = false;
      });
    }
  }


  /**
   * @function onClickEdit
   * This method is used to change the condition based on data
   */
  public onClickEdit() {
    this.isEditMode = true;
  }

  /**
   * @function imageErrorHandler
   * This method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function onDeleteAlert
   * This method is used to delete the profile
   */
   public async onDeleteAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alert-popup-container',
      message: this.translate.instant('DELETE_PROFILE_MSG'),
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel',
          cssClass: 'cancel-button'
        }, {
          text: this.translate.instant('CONFIRM'),
          role: 'confirm',
          cssClass: 'confirm-button',
          handler: () => {
            this.onConfirmDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * @function onConfirmDelete
   * This method is used to confirm the deletion
   */
   public onConfirmDelete() {
    this.profileProvider.deleteProfile().then(() => {
      const successMessage = this.translate.instant('DELETE_SUCCESSFULLY');
      this.toastService.presentToast(successMessage, true);
      this.appLogoutService.execute();
    });
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings value
   */
  public fetchTenantSettings() {
    this.lookupService.getTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      if (tenantSettings) {
        this.tenantValue = tenantSettings.useLearnerDataVisibiltyPref;
      }
    });
  }

  /**
   * @function onChangePassword
   * This method is used to change password value
   */
  public onChangePassword() {
    this.modalService.openModal(ChangePasswordComponent, 'change-password');
  }
}
