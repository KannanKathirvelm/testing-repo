import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DownloadService } from '@app/providers/service/download.service';
import { DOWNLOAD_STATE } from '@constants/download-constants';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'download-item',
  templateUrl: './download-item.component.html',
  styleUrls: ['./download-item.component.scss'],
})
export class DownloadItemComponent implements OnChanges {

  @Input() public collectionId: string;
  @Input() public collectionType: string;
  @Input() public collectionTitle: string;
  @Output() public clickDownload = new EventEmitter();
  @Input() public isOnline: boolean;
  @Input() public isDownloaded: boolean;
  public downloadState: number;
  public ImageResponse: string
  public networkSubscription: AnonymousSubscription;

  constructor(private downloadService: DownloadService) {
    this.downloadState = DOWNLOAD_STATE.INTIAL;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.isDownloaded) {
      this.downloadState = this.isDownloaded ? DOWNLOAD_STATE.DOWNLOADED : DOWNLOAD_STATE.INTIAL;
    }
  }


  /**
   * @function downloadContent
   * This Method will trigger when user tries to download the content
   */
  public downloadContent() {
    const callback = (downloadResult) => {
      this.downloadState = downloadResult.status;
    };
    this.downloadService.subscribeToDownload(callback);
    this.downloadService.addDownloadContent({
      collectionTitle: this.collectionTitle,
      collectionId: this.collectionId,
      collectionType: this.collectionType,
    });
    this.clickDownload.emit();
  }
}
