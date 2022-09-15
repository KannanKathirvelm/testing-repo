import { Component, Input, OnInit } from '@angular/core';
import { CLASSREPORTS, PREFERENCE } from '@constants/helper-constants';
import { StandardPreferenceModel } from '@models/preferences/preferences';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from '@providers/service/preferences/preferences.service';

@Component({
  selector: 'general-preference',
  templateUrl: './general-preference.component.html',
  styleUrls: ['./general-preference.component.scss'],
})
export class GeneralPreferenceComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public preferences: StandardPreferenceModel;
  public sortPreferences: Array<{ name: string, key: string }>;
  public reportDefaultLanding: Array<{ name: string, key: string }>;
  public sortPreferenceHeader: { header: string };
  public defaultLandingHeader: { header: string };
  public updatedSortPreference: string;
  public updatedLandingRoute: string;
  public sortPreferenceValue: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private preferencesService: PreferencesService,
    private translate: TranslateService
  ) {
    this.sortPreferenceHeader = {
      header: this.translate.instant('SORT_PREFERENCE')
    };
    this.defaultLandingHeader = {
      header: this.translate.instant('DEFAULT_LANDING_ROUTE')
    };
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.sortPreferences = PREFERENCE;
    this.reportDefaultLanding = CLASSREPORTS;
    this.updatedSortPreference = this.preferences ?.class_sort_preference;
    this.updatedLandingRoute = this.preferences ?.class_report_default_landing_route;
  }

  /**
   * @function onChangeSortPreference
   * This Method is used to set sort by general preference
   */
  public onChangeSortPreference(event) {
    const filters = { ...this.preferences };
    filters.class_sort_preference = event.detail.value;
    this.preferencesService.savePreferences(filters);
  }

  /**
   * @function onChangeDefaultLandingRoute
   * This Method is used to set default landing route
   */
  public onChangeDefaultLandingRoute(event) {
    const filters = { ...this.preferences };
    filters.class_report_default_landing_route = event.detail.value;
    this.preferencesService.savePreferences(filters);
  }
}
