import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LookupService } from '@app/providers/service/lookup/lookup.service';
import { ASSESSMENT, ATTEMPTED_STATUS } from '@constants/helper-constants';
import { LoadingController, ModalController } from '@ionic/angular';
import { CollectionsModel, CompetencyModel } from '@models/collection/collection';
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
import { AnonymousSubscription } from 'rxjs/Subscription';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { ASSESTMENT_PDF_PREVIEW_STYLES, PDF_OPTIONS } from '@app/constants/pdf-preview-styles';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
@Component({
  selector: 'student-assessment-report',
  templateUrl: './student-assessment-report.component.html',
  styleUrls: ['./student-assessment-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })],
})
export class StudentAssessmentReportComponent implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties

  @Input() public contentId: string;
  @Input() public classId: string;
  @Input() public contentSource: string;
  @Input() public studentId: string;
  @Input() public showCorrectAnswer: boolean;
  @Input() public collectionType: string;
  @Input() public isPreview: boolean;
  @Input() public userPerformance: PerformanceModel;
  @Input() public isClassProgressReport: boolean;
  @Input() public sessionId: string;
  @Input() public competency: CompetencyModel;
  public collection: CollectionsModel;
  public performance: PortfolioPerformanceSummaryModel;
  public isAssessment: boolean;
  public attemptList: Array<PortfolioActivityAttempt>;
  public hideAttemptList: boolean;
  public isDownloadPdf: boolean;
  public currentAttemptDate: string;
  public hideAttempts: boolean;
  private sessionSubscription: AnonymousSubscription;
  private currentAttemptPerformance: PortfolioActivityAttempt;
  public tenantSettings: TenantSettingsModel;
  public pdfPreviewStyles: any;
  public currentDateTime: string;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private modalCtrl: ModalController,
    private collectionProvider: CollectionProvider,
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

  // -------------------------------------------------------------------------
  // Methods
  public ngOnInit() {
    this.isAssessment = this.collectionType === ASSESSMENT;
    this.fetchReportCollection();
    this.fetchTenantSettings();
  }

  /**
   * @function fetchReportCollection
   * This method is used to fetch collection
   */
  public fetchReportCollection() {
    this.collectionProvider.fetchCollectionById(this.contentId, this.collectionType).then((assessmentResponse) => {
      this.collection = assessmentResponse;
      if (!this.isPreview) {
        this.loadReportContent();
      }
    });
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
   * @function loadReportContent
   * This method is used to fetch both attempts and performance
   */
  public loadReportContent() {
    this.portfolioProvider.fetchAllAttemptsByItem(this.contentId, this.studentId).then((attemptsResponse) => {
      const attempts = attemptsResponse.usageData;
      const contentAttempts = attempts.filter(
        (attempt) => attempt.classId === this.classId && attempt.contentSource === this.contentSource
      );
      const completedAttempts = contentAttempts.filter((attempt) => attempt.status === ATTEMPTED_STATUS.COMPLETE);
      const sortedContents = completedAttempts.sort((a, b) => {
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      });
      if (this.isClassProgressReport) {
        const attemptList = attempts;
        let currentAttempt = attemptList.find((attempt) => attempt.sessionId === this.sessionId);
        if (this.isClassProgressReport && attemptList.length) {
          currentAttempt = attemptList[0];
        }
        const sessionId = currentAttempt ? currentAttempt.sessionId : this.sessionId;
        this.contentSource = currentAttempt ? currentAttempt.contentSource : null;
        this.currentAttemptDate = currentAttempt ? currentAttempt.updatedAt : null;
        if (sessionId) {
          this.fetchActivitySummary(sessionId);
        }
      } else {
        this.attemptList = sortedContents;
        this.currentAttemptPerformance = this.attemptList[0];
        const sessionId = this.currentAttemptPerformance.sessionId;
        this.fetchActivitySummary(sessionId);
      }
    });
  }

  /**
   * @function reportRenderBasedOnDate
   * This method is used to render report based on sessionId
   */
  public reportRenderBasedOnDate(sessionId) {
    this.hideAttemptList = true;
    this.fetchActivitySummary(sessionId);
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function downloadPdf
   * This method is used to download the pdf
   */
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
   * This method is used to fetch activity summary
   */
  public fetchActivitySummary(sessionId) {
    if (this.currentAttemptPerformance) {
      this.currentAttemptDate = this.currentAttemptPerformance.updatedAt;
    }
    this.performanceProvider
      .fetchActivitySummary(this.collectionType, this.collection.id, sessionId, this.contentSource, this.studentId)
      .then((performanceResponse) => {
        this.performance = performanceResponse;
      });
  }

  public toggleAttemptList() {
    if (this.attemptList && this.attemptList.length > 1) {
      this.hideAttemptList = !this.hideAttemptList;
    }
  }

  public ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  /**
   * @function onClickExternalURL
   * This method is used to render external assessment url in browser
   */
  public onClickExternalURL() {
    this.collectionPlayerService.openResourceContent(this.collection.id, this.collection);
  }
}
