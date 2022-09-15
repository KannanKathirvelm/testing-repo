import { Component } from '@angular/core';
import { ClassificationTypeModel, StandardPreferenceModel } from '@models/preferences/preferences';
import { LanguageModel } from '@models/profile/profile';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { PreferencesService } from '@providers/service/preferences/preferences.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';

@Component({
  selector: 'preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage {
  // -------------------------------------------------------------------------
  // Properties
  public classificationType: Array<ClassificationTypeModel>;
  public preferences: StandardPreferenceModel;
  public languages: Array<LanguageModel>;
  public isLoaded: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private lookupService: LookupService,
    private taxonomyService: TaxonomyService,
    private profileService: ProfileService,
    private preferencesService: PreferencesService
  ) { }

  // -------------------------------------------------------------------------
  // Hooks

  public ionViewDidEnter() {
    this.classificationType = [];
    this.fetchPreferences();
    this.fetchLanguages();
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function fetchPreferences
   * This method is used to fetch Preferences
   */
  public fetchPreferences() {
    this.preferences = this.profileService.profilePreferences;
    if (this.preferences) {
      this.isLoaded = false;
      this.fetchClassifications().then((classifications) => {
        this.isLoaded = true;
        const serializeData = this.preferencesService.serializeClassificationsList(
          this.preferences.standard_preference,
          classifications
        );
        serializeData.classificationData.map((value) => {
          this.fetchClassificationType(value.id, value.title);
        });
      });
    }
  }

  /**
   * @function fetchLanguages
   * This Method is used to fetch languages
   */
  public fetchLanguages() {
    this.lookupService.fetchLanguages().then((language) => {
      this.languages = language;
    });
  }

  /**
   * @function fetchClassifications
   * @param {Array} preferences
   * This method is used to fetch fetch Classifications
   */
  public fetchClassifications() {
    return new Promise((resolve, reject) => {
      return this.taxonomyService
        .fetchCategories()
        .then((response) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @function onSelectFramework
   * Method to set the selected framework
   */
  public async onSelectFramework(selectedSubject) {
    const filters = { preferences: this.preferences.standard_preference };
    await this.preferencesService.savePreferences(filters);
    this.profileService.fetchProfilePreference();
  }

  /**
   * @function fetchClassificationType
   * This method is used to fetch fetch Classification Type
   */
  public fetchClassificationType(type, title) {
    const preferences = this.preferences.standard_preference;
    this.preferencesService
      .fetchClassificationType(type)
      .then((response) => {
        const subjectDetails = response;
        const classificationsDetails = [];
        Object.keys(preferences).forEach((item) => {
          const classificationsData = subjectDetails.find(
            (classifications) => item === classifications.id
          );
          if (classificationsData) {
            classificationsData.value = preferences[item];
            classificationsDetails.push(classificationsData);
          }
        });
        const data = {
          title,
          subjects: classificationsDetails,
        };
        this.classificationType.push(data);
      });
  }

  /**
   * @function onDeleteCategory
   * This method is used to delete Category
   */
  public onDeleteCategory(data) {
    const preferences = this.preferences;
    const filters = { preferences: this.preferences }
    data.category.forEach((item) => {
      delete preferences[item.id];
    });
    this.classificationType.splice(data.classificationIndex, 1);
    this.preferencesService.savePreferences(filters);
  }
}
