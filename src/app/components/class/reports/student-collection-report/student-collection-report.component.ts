import { Component, Input, OnInit } from '@angular/core';
import { LookupService } from '@app/providers/service/lookup/lookup.service';
import { ATTEMPTED_STATUS, COLLECTION, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { LoadingController, ModalController } from '@ionic/angular';
import { CollectionsModel } from '@models/collection/collection';
import {
  PerformanceModel,
  PortfolioActivityAttempt,
  PortfolioPerformanceSummaryModel,
} from '@models/portfolio/portfolio';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { CollectionProvider } from '@providers/apis/collection/collection';
import { PerformanceProvider } from '@providers/apis/performance/performance';
import { PortfolioProvider } from '@providers/apis/portfolio/portfolio';
import { CollectionPlayerService } from '@providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { ASSESTMENT_PDF_PREVIEW_STYLES, PDF_OPTIONS } from '@app/constants/pdf-preview-styles';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
@Component({
  selector: 'student-collection-report',
  templateUrl: './student-collection-report.component.html',
  styleUrls: ['./student-collection-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })],
})
export class StudentCollectionReportComponent implements OnInit {
  @Input() public contentId: string;
  @Input() public contentSource: string;
  @Input() public isSuggestion: boolean;
  @Input() public context: {
    classId: string;
    courseId: string;
    lessonId: string;
    unitId: string;
    pathId?: number;
    activityDate?: string;
    sessionId: string;
    endDate?: string;
  };
  @Input() public isPreview: boolean;
  @Input() public studentId: string;
  @Input() public collectionType: string;
  @Input() public userPerformance: PerformanceModel;
  @Input() public reportCollection: CollectionsModel;
  @Input() public reportPerformance: PortfolioPerformanceSummaryModel;
  @Input() public isClassProgressReport: boolean;
  public collection: CollectionsModel;
  public performance: PortfolioPerformanceSummaryModel;
  public isCollection: boolean;
  public hideAttemptList: boolean;
  public hideAttempts: boolean;
  public attemptList: Array<PortfolioActivityAttempt>;
  public currentAttemptDate: string;
  public tenantSettings: TenantSettingsModel;
  public isDownloadPdf: boolean;
  public pdfPreviewStyles: any;
  public currentDateTime: string;

  constructor(
    private collectionProvider: CollectionProvider,
    private modalCtrl: ModalController,
    private performanceProvider: PerformanceProvider,
    private portfolioProvider: PortfolioProvider,
    private collectionPlayerService: CollectionPlayerService,
    private lookupService: LookupService,
    private pdfGenerator: PDFGenerator,
    private loadingCtrl: LoadingController,
    private translate: TranslateService
  ) {
    this.hideAttemptList = true;
    this.hideAttempts = false;
    this.isDownloadPdf = false;
    this.pdfPreviewStyles = ASSESTMENT_PDF_PREVIEW_STYLES;
    this.currentDateTime = moment().format('DD/MM/YYYY, h:mm:ss');
  }

  public ngOnInit() {
    this.isCollection = this.collectionType === COLLECTION;
    if (this.reportCollection || this.reportPerformance) {
      this.collection = { ...this.reportCollection };
      this.performance = { ...this.reportPerformance };
      this.hideAttempts = true;
    } else {
      this.fetchReportCollection();
    }
    this.fetchTenantSettings();
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public async fetchTenantSettings() {
    await this.lookupService.fetchTenantSettings().then((tenantSettings) => {
      this.tenantSettings = tenantSettings;
    });
  }

  /**
   * @function fetchReportCollection
   * This method is used to fetch collection
   */
  public fetchReportCollection() {
    this.collectionProvider.fetchCollectionById(this.contentId, this.collectionType).then((collectionResponse) => {
      this.collection = collectionResponse;
      if (!this.isPreview) {
        if (this.isCollection) {
          if (this.context.classId && !this.isClassProgressReport) {
            if (this.contentSource === PLAYER_EVENT_SOURCE.DAILY_CLASS) {
              this.fetchDCACollectionPerformance();
            } else if (
              this.contentSource === PLAYER_EVENT_SOURCE.COURSE_MAP ||
              this.contentSource === PLAYER_EVENT_SOURCE.MASTER_COMPETENCY
            ) {
              this.fetchCollectionPerformanceByContext();
            }
          } else {
            this.loadReportContent();
          }
        } else {
          this.performance = {
            collection: { ...this.userPerformance },
          };
        }
      }
    });
  }

  /**
   * @function loadReportContent
   * This method is used to fetch both attempts and performance
   */
  public loadReportContent() {
    this.portfolioProvider.fetchAllAttemptsByItem(this.contentId, this.studentId).then((attemptsResponse) => {
      let attemptedList = attemptsResponse.usageData;
      if (!this.isClassProgressReport) {
        attemptedList = attemptsResponse.usageData.filter((attempt) => attempt.status === ATTEMPTED_STATUS.COMPLETE);
      }
      this.attemptList = attemptedList;
      this.fetchActivitySummary();
    });
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  public async downloadPdf() {
    const alertCtrl = await this.loadingCtrl.create({
      message: this.translate.instant('DOWNLOAD_PDF'),
      cssClass: 'pdf-previewer',
      backdropDismiss: true,
      translucent: true,
    });
    await alertCtrl.present();
    this.isDownloadPdf = true;
    setTimeout(async () => {
      const content = document.getElementById('pdf-preview').innerHTML;
      const options = {
        documentSize: PDF_OPTIONS.documentSize,
        type: PDF_OPTIONS.type,
        fileName: `${this.collection.title}.pdf`,
      };
      await this.pdfGenerator.fromData(content, options).then((base64) => {
        this.loadingCtrl.dismiss();
        this.isDownloadPdf = false;
      });
    }, 1000);
  }

  /**
   * @function fetchActivitySummary
   * This method is used to fetch performance
   */
  public fetchActivitySummary() {
    const attemptList = this.attemptList;
    let currentAttempt;
    if (this.isClassProgressReport || !this.context.sessionId) {
      currentAttempt = attemptList[0];
    } else {
      currentAttempt = attemptList.find((attempt) => attempt.sessionId === this.context.sessionId);
    }
    const sessionId = currentAttempt ? currentAttempt.sessionId : this.context.sessionId;
    this.currentAttemptDate = currentAttempt ? currentAttempt.updatedAt : null;
    const contentSource = currentAttempt.contentSource || this.contentSource;
    this.performanceProvider
      .fetchActivitySummary(this.collectionType, this.collection.id, sessionId, contentSource, this.studentId)
      .then((performanceResponse) => {
        this.performance = performanceResponse;
      });
  }

  /**
   * @function reportRenderBasedOnDate
   * This method is used to render report based on sessionId
   */
  public reportRenderBasedOnDate(sessionId) {
    this.hideAttemptList = true;
    this.context.sessionId = sessionId;
    this.fetchActivitySummary();
  }

  /**
   * @function toggleAttemptList
   * This method is used to toggle the attempt list
   */
  public toggleAttemptList() {
    if (this.attemptList.length > 1) {
      this.hideAttemptList = !this.hideAttemptList;
    }
  }

  /**
   * @function fetchDCACollectionPerformance
   * This method is used to fetch DCA performance
   */
  public fetchDCACollectionPerformance() {
    const pathId = this.context ? this.context.pathId : null;
    const classId = this.context.classId;
    const params = {
      date: this.context.activityDate,
      classId,
      pathId,
      studentId: this.studentId,
      endDate: this.context.endDate,
      startDate: this.context.activityDate,
    };
    this.performanceProvider
      .fetchDCACollectionPerformance(this.collectionType, this.collection.id, params)
      .then((collectionResponse) => {
        this.performance = collectionResponse;
      });
  }

  /**
   * @function fetchCollectionPerformanceByContext
   * This method is used to fetch activity summary by lesson
   */
  public fetchCollectionPerformanceByContext() {
    const pathId = this.context ? this.context.pathId : null;
    const paramsData = {
      classGooruId: this.context.classId,
      courseGooruId: this.context.courseId,
      unitGooruId: this.context.unitId,
      lessonGooruId: this.context.lessonId,
      pathId,
      studentId: this.studentId,
    };
    this.performanceProvider
      .fetchCollectionPerformanceByContext(this.contentId, this.collectionType, paramsData)
      .then((collectionResponse) => {
        this.performance = collectionResponse;
      });
  }

  /**
   * @function onClickExternalURL
   * This method is used to render external collection url in browser
   */
  public onClickExternalURL() {
    this.collectionPlayerService.openResourceContent(this.collection.id, this.collection);
  }
}
