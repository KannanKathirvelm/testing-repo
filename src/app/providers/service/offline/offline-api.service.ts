import { Injectable } from '@angular/core';
import { OfflineAPI } from '@app/providers/apis/offline/offline';
import { BehaviorSubject } from 'rxjs';
import { cloneObject } from '@app/utils/global';
import { OfflineClassSettingsModel } from '@app/models/offline/offline';
@Injectable({
  providedIn: 'root'
})
export class OfflineApiService {

  public offlineSettingsSubject: BehaviorSubject<Array<OfflineClassSettingsModel>>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private offlineAPI: OfflineAPI
  ) {
    this.offlineSettingsSubject = new BehaviorSubject<Array<OfflineClassSettingsModel>>(null);
  }

  // -------------------------------------------------------------------------
  // Actions

  get offlineSettings(): Array<OfflineClassSettingsModel> {
    return this.offlineSettingsSubject ? cloneObject(this.offlineSettingsSubject.value) : null;
  }

  /**
   * @function uploadOfflineEvents
   * This method is used to upload offline events
   */
  public uploadOfflineEvents(file, fileName) {
    return this.offlineAPI.uploadOfflineEvents(file, fileName);
  }

  /**
   * @function getOfflineClassSettings
   * This method is used to get offline class settings
   */
  public getOfflineClassSettings() {
    return this.offlineAPI.getOfflineClassSettings();
  }

  /**
   * @function updateClassSettings
   * This method is used to update offline class settings
   */
  public updateClassSettings(params) {
    this.updateClassOfflineSettingsSubject({
      classId: params.classId,
      settings: {
        is_offline_access_enabled: params.checked
      }
    });
    return this.offlineAPI.updateClassSettings([{
      class_id: params.classId,
      settings: {
        is_offline_access_enabled: params.checked
      }
    }]);
  }

  /**
   * @function fetchUploadSyncStatus
   * This Method is used to fetch the sync status data
   */
  public fetchUploadSyncStatus(status) {
    return this.offlineAPI.fetchUploadSyncStatus(status);
  }

  /**
   * @function fetchOfflineClassesSettings
   * This Method to fetch offline active classes
   */
  public fetchOfflineClassesSettings() {
    return new Promise((resolve, reject) => {
      if (this.offlineSettings !== null) {
        resolve(this.offlineSettings);
      } else {
        this.offlineAPI.getOfflineClassSettings().then((result) => {
          this.offlineSettingsSubject.next(result);
          resolve(result);
        }, reject);
      }
    });
  }

  /**
   * @function updateClassOfflineSettingsSubject
   * This Method is used to update the class offline subject
   */
  public updateClassOfflineSettingsSubject(params) {
    const offlineSettings = this.offlineSettings;
    const classOfflineSettingsIndex = offlineSettings.findIndex((offlineSetting) => {
      return offlineSetting.classId === params.classId;
    });
    if (classOfflineSettingsIndex > -1) {
      offlineSettings[classOfflineSettingsIndex].settings.isOfflineAccessEnabled = params.settings.is_offline_access_enabled;
    } else {
      offlineSettings.push(params);
    }
    this.offlineSettingsSubject.next(offlineSettings);
  }

  /**
   * @function findClassOfflineSettings
   * This Method is used to find class settings using id
   */
  public findClassOfflineSettings(classId) {
    return this.offlineSettings ? this.offlineSettings.find((settings) => {
      return settings.classId === classId || settings['class_id'] === classId;
    }) : null;
  }
}
