import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { Capacitor } from '@capacitor/core';
import { DOWNLOAD_FILE_EXTENSIONS, DOWNLOAD_STATE } from '@constants/download-constants';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { DatabaseService } from '@providers/service/database.service';
import { LocalNotificationService } from '@providers/service/local-notification.service';
import { UtilsService } from '@providers/service/utils.service';
import { CollectionService } from './collection/collection.service';

interface DownloadContext {
  collectionTitle: string;
  collectionId: string;
  collectionType: string;
};
class DownloadItem {
  public downloadId?: number;
  public context: DownloadContext;
  public status: DOWNLOAD_STATE;
  constructor(args) {
    this.downloadId = args.downloadId;
    this.context = args.context;
    this.status = args.status || DOWNLOAD_STATE.INTIAL;
  }
};
@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private currentDownloadItems: Array<DownloadItem>;
  private downloadCallbacks = [];

  constructor(private collectionService: CollectionService,
    private localNotificationService: LocalNotificationService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService,
    private transfer: FileTransfer,
    private file: File) {
    this.currentDownloadItems = [];
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function addDownloadContent
   * This Method is used to addDownloadContent
   */
  public addDownloadContent(context: DownloadContext) {
    if (this.utilsService.isAndroid()) {
      // permission goes here
      this.initializeDownload(context);
    } else {
      this.initializeDownload(context);
    }
  }

  /**
   * @function initializeDownload
   * This Method is used to initialize the download
   */
  private initializeDownload(context: DownloadContext) {
    const downloadId = this.currentDownloadItems.length + 1;
    const currentDownloadItem = new DownloadItem({
      downloadId,
      context,
      status: DOWNLOAD_STATE.PENDING
    });
    this.currentDownloadItems.push(currentDownloadItem);
    this.downloadContent();
  }

  /**
   * @function downloadContent
   * This Method is used to download the content
   */
  public downloadContent() {
    if (this.isDownloadInQueue()) {
      const currentItem = this.currentDownloadItems[0];
      currentItem.status = DOWNLOAD_STATE.IN_PROGRESS;
      const callback = this.getCurrentCallback().callback;
      callback(currentItem);
      this.localNotificationService.sendNotification(currentItem.downloadId, 'Downloading', currentItem.context.collectionTitle);
      const downloadProgressCb = (progressEvent) => {
        const total = parseFloat(progressEvent.total);
        const current = progressEvent.loaded;
        const percentCompleted = Math.floor(current / total * 100);
        this.localNotificationService.updateNotificationProgress(currentItem.downloadId, percentCompleted, 'Downloading ' + currentItem.context.collectionTitle);
      };
      this.collectionService.fetchCollectionById(currentItem.context.collectionId, currentItem.context.collectionType, true, downloadProgressCb)
        .then((collectionRes) => {
          this.downloadResourceContents(collectionRes.id, collectionRes.content).then(() => {
            currentItem.status = DOWNLOAD_STATE.DOWNLOADED;
            callback(currentItem);
            this.localNotificationService.sendNotification(currentItem.downloadId, 'Download Completed', currentItem.context.collectionTitle);
            this.currentDownloadItems.splice(0, 1);
            this.downloadCallbacks.splice(0, 1);
            this.downloadContent();
          });
        }).catch(() => {
          currentItem.status = DOWNLOAD_STATE.ERROR;
          callback(currentItem);
          this.localNotificationService.sendNotification(currentItem.downloadId, 'Download Failed', currentItem.context.collectionTitle);
          this.currentDownloadItems.splice(0, 1);
          this.downloadCallbacks.splice(0, 1);
        });
    } else {
      this.downloadCallbacks.forEach((value, index) => {
        // skip the first index
        if (index > 0) {
          value.callback(this.currentDownloadItems[index]);
        }
      });
    }
  }

  /**
   * @function downloadResourceContents
   * This Method is used to download the resource content
   */
  private downloadResourceContents(collectionId, resources) {
    const resourceUrls = resources.filter((resource) => this.getSupportedMediaDownload(resource.s3Url || resource.url)).map((res) => {
      return { id: res.id, url: res.s3Url || res.url, type: 'resource_url' };
    });
    const resourceThumbnails = resources.filter((resource) => this.getSupportedMediaDownload(resource.thumbnail)).map((res) => {
      return { id: res.id, url: res.thumbnail, type: 'resource_thumbnail' };
    });
    const medias = [...resourceThumbnails, ...resourceUrls];
    const mediaPromises = medias.map((media) => {
      const extension = this.utilsService.findUrlExtension(media.url);
      const fileName = `${media.id}.${extension}`;
      return this.downloadMediaContents({
        fileName,
        media
      });
    });
    return Promise.all(mediaPromises).then((response) => {
      const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.COLLECTION_MEDIA, {
        collectionId
      });
      return this.databaseService.upsertDocument(databaseKey, response);
    }, (err) => {
      // tslint:disable-next-line
      console.error(err);
    });
  }

  /**
   * @function getSupportedMediaDownload
   * This Method is used to get the supported Media types
   */
  private getSupportedMediaDownload(mediaUrl) {
    const extension = this.utilsService.findUrlExtension(mediaUrl);

    const extensionValue = extension ? extension.toLowerCase() : extension;
    return DOWNLOAD_FILE_EXTENSIONS.includes(extensionValue) && !mediaUrl.includes('assets/images');
  }

  /**
   * @function getMimeType
   * This Method is used to get the MimeType
   */
  private getMimeType(entry) {
    return new Promise((resolve, reject) => {
      entry.file((success) => {
        resolve(success.type)
      }, reject);
    });
  }

  /**
   * @function downloadMediaContents
   * This Method is used to download the media contents
   */
  private downloadMediaContents(context) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const url = context.media.url;
    const fileName = context.fileName;
    return fileTransfer.download(url, `${this.file.dataDirectory}${fileName}`)
      .then(async (entry) => {
        const mimeType = await this.getMimeType(entry);
        const fileUrlPath = Capacitor.convertFileSrc(entry.toURL());
        return {
          ...context.media,
          mimeType,
          fileUrlPath,
          filePath: entry.toURL(),
        };
      }, (error) => {
        // tslint:disable-next-line
        console.error(error);
        return error;
      });
  }

  /**
   * @function getCurrentCallback
   * This Method is used to get current callback
   */
  public getCurrentCallback() {
    return this.downloadCallbacks[0];
  }

  /**
   * @function subscribeToDownload
   * This Method is used for subscribe download
   */
  public subscribeToDownload(callback) {
    this.downloadCallbacks.push({
      callback
    });
  }

  /**
   * @function isDownloadInQueue
   * This Method is used to download in queue
   */
  private isDownloadInQueue() {
    return this.currentDownloadItems?.length >= 1;
  }

  /**
   * @function checkDownloadStatus
   * This Method is used to check the download status
   */
  public checkDownloadStatus(classId, contentId, collectionId) {
    const collectionDatabaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.COLLECTION, {
      collectionId
    });
    const dcaUsersDatabasekey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_DCA_USERS, {
      classId,
      contentId
    });
    return Promise.all([
      this.databaseService.getDocument(dcaUsersDatabasekey),
      this.databaseService.getDocument(collectionDatabaseKey)
    ]).then((results) => {
      const userItem = results[0].value;
      const collectionItem = results[1].value;
      return (userItem && collectionItem) ? DOWNLOAD_STATE.DOWNLOADED : DOWNLOAD_STATE.INTIAL;
    }, () => {
      return DOWNLOAD_STATE.INTIAL;
    });
  }
}
