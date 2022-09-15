import { Injectable } from '@angular/core';
import { AppConfigModel } from '@app/models/config/config';
import { LocationModel } from '@models/analytics/analytics';
import { CountryModel, LanguageModel, SearchFilterContextModel } from '@models/lookup/lookup';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { Store } from '@ngrx/store';
import { LookupProvider } from '@providers/apis/lookup/lookup';
import { setCountries, setLanguages, setTenantSettings } from '@stores/actions/lookup.action';
import { getCountries, getLanguages, getTenantSettings } from '@stores/reducers/lookup.reducer';
import { cloneObject } from '@utils/global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  // -------------------------------------------------------------------------
  // Properties

  public searchFilterContextSubject: BehaviorSubject<SearchFilterContextModel>;
  public appConfigSubject: BehaviorSubject<AppConfigModel>;
  private locationInfoSubject: BehaviorSubject<LocationModel>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private lookupProvider: LookupProvider, private store: Store) {
    this.searchFilterContextSubject = new BehaviorSubject<SearchFilterContextModel>(null);
    this.appConfigSubject = new BehaviorSubject<AppConfigModel>(null);
    this.locationInfoSubject = new BehaviorSubject<LocationModel>(null);
  }

  get searchFilterContext() {
    return this.searchFilterContextSubject ? cloneObject(this.searchFilterContextSubject.value) : null;
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  public fetchTenantSettings(): Promise<TenantSettingsModel> {
    return new Promise((resolve, reject) => {
      this.getTenantSettings().then((tenantSettings: TenantSettingsModel) => {
        if (!tenantSettings) {
          this.lookupProvider.fetchTenantSettings().then((result) => {
            this.store.dispatch(setTenantSettings({ data: result }));
            resolve(result);
          }, reject);
        } else {
          resolve(tenantSettings);
        }
      });
    });
  }

  /**
   * @function getTenantSettings
   * This method used to get the tenant settings
   */
  public getTenantSettings() {
    return new Promise((resolve, reject) => {
      const tenantSettingSubscription = this.store.select(getTenantSettings())
        .subscribe((tenantSettings) => {
          resolve(cloneObject(tenantSettings));
        }, (error) => {
          reject(error);
        });
      tenantSettingSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchAudiences
   * This method is used to fetch audiences
   */
  public fetchAudiences() {
    return this.lookupProvider.fetchAudiences();
  }

  /**
   * @function fetchLanguages
   * This method is used to fetch languages
   */
  public fetchLanguages(): Promise<Array<LanguageModel>> {
    return new Promise((resolve) => {
      const languagesStoreSubscription = this.store.select(getLanguages()).subscribe((languages) => {
        if (!languages) {
          this.lookupProvider.fetchLanguages().then((result) => {
            this.store.dispatch(setLanguages({ data: result }));
            resolve(cloneObject(result));
          });
        } else {
          resolve(cloneObject(languages));
        }
      });
      languagesStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchEducationalUse
   * This method is used to fetch languages
   */
  public fetchEducationalUse() {
    return this.lookupProvider.fetchEducationalUse();
  }

  /**
   * @function storeSearchFilterContext
   * This method is used to store search filter context
   */
  public storeSearchFilterContext(context) {
    this.searchFilterContextSubject.next(context);
  }

  /**
   * @function fetchLocationInfo
   * This method used to get the location info
   */
  public fetchLocationInfo() {
    return new Promise((resolve, reject) => {
      const location = this.locationInfo;
      if (location) {
        resolve(location);
      } else {
        this.lookupProvider.fetchLocationInfo().then((response: LocationModel) => {
          this.locationInfoSubject.next(response);
          resolve(response);
        }, reject);
      }
    });
  }

  get locationInfo() {
    return this.locationInfoSubject ? cloneObject(this.locationInfoSubject.value) : null;
  }

  /**
   * @function fetchCountries
   * This method used to fetch countries
   */
  public fetchCountries(): Promise<Array<CountryModel>> {
    return new Promise((resolve, reject) => {
      const countriesStoreSubscription = this.store.select(getCountries()).subscribe((countries) => {
        if (!countries) {
          this.lookupProvider.fetchCountries().then((result) => {
            this.store.dispatch(setCountries({ data: result }));
            resolve(result);
          }, reject);
        } else {
          resolve(countries);
        }
      });
      countriesStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchAppConfig
   * This method used to get the app config
   */
  public async fetchAppConfig(): Promise<AppConfigModel> {
    const appConfig = await this.lookupProvider.fetchAppConfig();
    this.appConfigSubject.next(appConfig);
    return appConfig;
  }

  get appConfig() {
    return this.appConfigSubject ? this.appConfigSubject.value : null;
  }
}
