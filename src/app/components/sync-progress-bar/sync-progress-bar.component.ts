import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { SYNC_STATUS_CODE } from '@app/constants/download-constants';

@Component({
  selector: 'app-sync-progress-bar',
  templateUrl: './sync-progress-bar.component.html',
  styleUrls: ['./sync-progress-bar.component.scss'],
})
export class SyncProgressBarComponent implements OnInit, AfterViewInit {
  // -------------------------------------------------------------------------
  // Properties

  public readonly MIN_PROGRESS_POINT_GAP = 20;
  public readonly MIN_PROGRESS_COUNT = 12;
  public progressBarWidth: string;
  public progressPointGap: number;
  public progressPercentage: boolean;
  public progressPointWidth: number;
  public maxNumberOfProgress: number;
  public completedPercentage: string;
  public progressBarCount = 20;
  public statusMessage = {
    [SYNC_STATUS_CODE.PENDING]: 'SYNC_PROGRESS',
    [SYNC_STATUS_CODE.COMEPLETED]: 'SYNC_COMPLETED',
    [SYNC_STATUS_CODE.ERROR]: 'SYNC_ERROR',
    [SYNC_STATUS_CODE.QUEUE]: 'SYNC_QUEUE'

  };
  public syncStatusItems = [
    {
      statusCode: SYNC_STATUS_CODE.COMEPLETED,
      className: 'completed-icon',
    },
    {
      statusCode: SYNC_STATUS_CODE.PENDING,
      className: 'pending-icon',
    },
    {
      statusCode: SYNC_STATUS_CODE.ERROR,
      className: 'error-icon',
    },
    {
      statusCode: SYNC_STATUS_CODE.QUEUE,
      className: 'error-icon',
    }
  ]

  @Input() public syncPercentage: number;
  @Input() public syncStatusCode: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private elementRef: ElementRef) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.loadProgressbarData();
  }

  public ngAfterViewInit() {
    if (this.progressPercentage) {
      setTimeout(() => {
        this.getCompletedPercentageAndProgressGap();
      });
    }
  }

  /**
   * @function getCompletedPercentageAndProgressGap
   * This method is used to get completed percentage and progress gap
   */
  public getCompletedPercentageAndProgressGap() {
    // Here we set the progress gap dynamically when there is more data
    const progressBarElement = this.elementRef.nativeElement.querySelector(
      '.progress-bar'
    ) as HTMLElement;
    const progressBarWidth = progressBarElement.offsetWidth - 6;
    this.completedPercentage = `${this.syncPercentage}%`;
    const progressBarCount = Math.round(progressBarWidth / (this.MIN_PROGRESS_POINT_GAP + this.progressPointWidth));
    this.maxNumberOfProgress = progressBarCount - 1;
    this.progressPointGap = this.MIN_PROGRESS_POINT_GAP;
    if (progressBarCount >= this.progressBarCount) {
      this.getCompletedPercentage();
    }
  }

  /**
   * @function loadProgressbarData
   * This method is used to load progress bar data
   */
  public loadProgressbarData() {
    this.maxNumberOfProgress = 25;
    this.progressPointGap = 15;
    this.progressPointWidth = 6;
    // Here we check the progressBarCount is greater than the min percentage count if it is greater then we use the full available width for the progress bar
    if (this.progressBarCount > this.MIN_PROGRESS_COUNT) {
      this.progressPointGap = null;
      this.progressBarWidth = '100%';
      this.progressPercentage = true;
    } else {
      this.progressPercentage = false;
      this.getCompletedPercentage();
    }
  }

  /**
   * @function getCompletedPercentage
   * This method is used to get the completed performance
   */
  private getCompletedPercentage() {
    // Here we set the progress bar width based on the percentage count and progress gap
    const progressBarCount = this.progressBarCount;
    const progressBarWidth = (this.progressPointGap + this.progressPointWidth) * progressBarCount + 6;
    this.progressBarWidth = `${progressBarWidth}px`;
    this.completedPercentage = (progressBarWidth / 100) * this.syncPercentage + 'px';
  }
}