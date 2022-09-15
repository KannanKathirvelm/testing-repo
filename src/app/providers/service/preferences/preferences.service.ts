import { Injectable } from '@angular/core';
import { PreferencesProvider } from '@providers/apis/preferences/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private preferencesProvider: PreferencesProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function savePreferences
   * This method is used to update profile preferences.
   */
  public savePreferences(filters) {
    return this.preferencesProvider.savePreferences(filters);
  }

  /**
   * @function fetchClassificationType
   * This method is used to fetch the Classification Type
   */
  public fetchClassificationType(classificationType, filter?) {
    return this.preferencesProvider.fetchClassificationType(classificationType, filter);
  }

  /**
   * @function updateClassPreference
   * This method is used to update class preference
   */
  public updateClassPreference(classId, framework, subject) {
    return this.preferencesProvider.updateClassPreference(classId, framework, subject);
  }

  /**
   * @function serializeClassificationsList
   * This method is used to serialize Classifications List
   */
  public serializeClassificationsList(preferences, subjects) {
    return this.preferencesProvider.serializeClassificationsList(preferences, subjects);
  }
}
