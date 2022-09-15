import { Component, Input, OnInit } from '@angular/core';
import { StandardPreferenceModel } from '@models/preferences/preferences';
import { LanguageModel } from '@models/profile/profile';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from '@providers/service/preferences/preferences.service';
import { ProfileService } from '@providers/service/profile/profile.service';

@Component({
  selector: 'language-preference',
  templateUrl: './language-preference.component.html',
  styleUrls: ['./language-preference.component.scss'],
})
export class LanguagePreferenceComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public languages: Array<LanguageModel>;
  public preferences: StandardPreferenceModel;
  public updatedLanguage: number;
  public selectedOtherLanguage: Array<LanguageModel>;
  public defaultSelectedOtherLang: Array<number>;
  public languageSelectHeader: { header: string };

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileService: ProfileService,
    private preferencesService: PreferencesService,
    private translate: TranslateService
  ) {
    this.languageSelectHeader = {
      header: this.translate.instant('LANGUAGES')
    };
    this.defaultSelectedOtherLang = [];
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.initialize();
  }

  public initialize() {
    this.selectedOtherLanguage = [];
    this.profileService.fetchProfilePreference().then((preferences: any) => {
      this.preferences = preferences;
      const languagePreference = preferences ?.language_preference ?.length ? preferences.language_preference[0] : null;
      this.updatedLanguage = languagePreference;
      if (preferences && preferences.language_preference?.length) {
        preferences.language_preference.forEach((item, index) => {
          const otherLanguage = this.languages.find((languageItem) => languageItem.id === item);
          if (otherLanguage && index > 0) {
            this.selectedOtherLanguage.push(otherLanguage);
          }
        });
        this.defaultSelectedOtherLang = this.selectedOtherLanguage.map((item) => item.id);
      }
    });
  }

  /**
   * @function onChangeLanguage
   * This Method is used to change the language of app
   */
  public onChangeLanguage(event) {
    this.updatedLanguage = event;
    const isPrimaryLanguageExists = this.defaultSelectedOtherLang.includes(this.updatedLanguage);
    if (isPrimaryLanguageExists) {
      const selectedLanguageIndex = this.defaultSelectedOtherLang.indexOf(this.updatedLanguage);
      this.defaultSelectedOtherLang.splice(selectedLanguageIndex, 1);
    }
    this.updateProfilePreference();
  }

  /**
   * @function onAddOtherLang
   * This Method is to add other languages
   */
  public onAddOtherLang(event) {
    this.updateProfilePreference()
  }

  /**
   * @function onClickClose
   * This Method is to add other languages
   */
  public onClickClose(language) {
    const deSelectIndexValue = this.defaultSelectedOtherLang.indexOf(language.id);
    this.defaultSelectedOtherLang.splice(deSelectIndexValue, 1);
    this.updateProfilePreference();
  }

  /**
   * @function updateProfilePreference
   * Method to set the selected framework
   */
  public updateProfilePreference() {
    const languagePreferenceFilter = [this.updatedLanguage].concat(this.defaultSelectedOtherLang);
    const filters = {
      class_report_default_landing_route: this.preferences.class_report_default_landing_route,
      class_sort_preference: this.preferences.class_sort_preference,
      language_preference: languagePreferenceFilter,
      learner_data_visibilty_pref: this.preferences.learner_data_visibilty_pref,
      standard_preference: this.preferences.standard_preference ? this.preferences.standard_preference : null
    };
    this.preferencesService.savePreferences(filters).then(() => {
      this.initialize();
    });
  }
}
