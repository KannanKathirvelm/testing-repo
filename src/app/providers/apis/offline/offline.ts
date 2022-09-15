import { Injectable } from '@angular/core';
import { OfflineClassSettingsModel, UploadSyncStatusModel } from '@app/models/offline/offline';
import { UtilsService } from '@app/providers/service/utils.service';
import { HttpService } from '@providers/apis/http';
import { SYNC_STATUS_MESSAGE } from '@app/constants/download-constants';
import { DatabaseService } from '@providers/service/database.service';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
declare const cordova: any;
@Injectable({
  providedIn: 'root'
})

export class OfflineAPI {

  constructor(
    private utilsService: UtilsService,
    private httpService: HttpService,
    private databaseService: DatabaseService
  ) { }

  private namespace = 'api/offline/v1';

  /**
   * @function uploadOfflineEvents
   * This method is used to upload offline events
   */
  public uploadOfflineEvents(file, fileName) {
    const endpoint = `${this.namespace}/upload`;
    const formData = new FormData();
    formData.append('file', file, fileName);
    return this.httpService.postUsingAxios(endpoint, formData, null);
  }

  /**
   * @function getOfflineClassSettings
   * This method is used to get offline class settings
   */
  public getOfflineClassSettings(): Promise<Array<OfflineClassSettingsModel>> {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/classes/settings`;
        this.httpService.get<Array<OfflineClassSettingsModel>>(endpoint).then((result) => {
          const response = this.normaliseClassSettings(result.data);
          this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_CLASSES_SETTINGS, response);
          resolve(response);
        }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_CLASSES_SETTINGS).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function updateClassSettings
   * This method is used to update offline class settings
   */
  public updateClassSettings(payload) {
    const endpoint = `${this.namespace}/classes/settings`;
    const response = this.normaliseClassSettings(payload);
    this.databaseService.getDocument(DOCUMENT_KEYS.OFFLINE_CLASSES_SETTINGS).then((result) => {
      const items = result.value || [];
      const updatedSettings = response[0];
      const classOfflineSettingsIndex = items.findIndex((item) => item.classId === updatedSettings.classId);
      if(classOfflineSettingsIndex > -1) {
        items[classOfflineSettingsIndex].settings = updatedSettings.settings;
      } else {
        items.push(response[0]);
      }
      this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_CLASSES_SETTINGS, items);
    }).catch(() => {
      this.databaseService.upsertDocument(DOCUMENT_KEYS.OFFLINE_CLASSES_SETTINGS, [response]);
    });
    return this.httpService.post(endpoint, payload);
  }

  /**
   * @function normaliseClassSettings
   * This method is used to normalize class settings
   */
  private normaliseClassSettings(classesSettings) {
    return classesSettings.map((classSettings) => {
      return {
        classId: classSettings.classId || classSettings.class_id,
        settings: {
          isOfflineAccessEnabled: classSettings.settings.is_offline_access_enabled
        }
      } as OfflineClassSettingsModel;
    })
  }
  /* @function fetchUploadSyncStatus
   * This method is used to fetch the offline sync progress status
   */
  public fetchUploadSyncStatus(status) {
    const endpoint = `${this.namespace}/upload/${status}/stats`;
    return this.httpService.get<UploadSyncStatusModel>(endpoint).then((response) => {
      return this.normalizeUploadSyncStatus(response.data.data);
    });
  }

  /**
   * this method is used to normalize the progress status data
   * @returns {syncStatusData}
   */
  public normalizeUploadSyncStatus(payload): UploadSyncStatusModel {
    return {
      fileName: payload.fileName,
      status: payload.status,
      uploadId: payload.uploadId,
      completedPercentage: payload.completedPercentage,
      uploadedAt: payload.uploadedAt,
      syncStatusCode: SYNC_STATUS_MESSAGE[payload.status]
    } as UploadSyncStatusModel;
  }
}
