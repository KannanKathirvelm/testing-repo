import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ReportService } from '@app/providers/service/report/report.service';
import { ASSESSMENT, COLLECTION, COMPETENCY, CONTENT_TYPES, OFFLINE_ACTIVITY } from '@constants/helper-constants';
import { CompetencyModel } from '@models/competency/competency';
import { PortfolioActivitiesModel, PortfolioModel } from '@models/portfolio/portfolio';
import { PortfolioService } from '@providers/service/portfolio/portfolio.service';
import axios from 'axios';

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public competency: CompetencyModel;
  @Input() public userId: string;
  @Output() public closePortfolioTab = new EventEmitter();
  public showMore: boolean;
  public studiedPortfolioActivities: Array<PortfolioModel>;
  public offset: number;
  public limit: number;
  public isFetchedAllActivities: boolean;
  public hasPortfolioActivities: boolean;
  public portfolioActivities: Array<PortfolioActivitiesModel>;
  public showMoreItems: boolean [] = [];

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private portfolioService: PortfolioService,
    private reportService: ReportService
    ) {
    this.showMore = true;
    this.studiedPortfolioActivities = [];
    this.offset = 0;
    this.limit = 5;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.competency && !changes.competency.firstChange) {
      this.studiedPortfolioActivities = [];
      this.loadData();
    }
  }

  public ngOnInit() {
    this.loadData();
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    return axios.all([
      this.loadPortfolioActivities(this.competency.competencyCode, CONTENT_TYPES.ASSESSMENT),
      this.loadPortfolioActivities(this.competency.competencyCode, CONTENT_TYPES.COLLECTION),
      this.loadPortfolioActivities(this.competency.competencyCode, CONTENT_TYPES.OFFLINE_ACTIVITY)
    ]).then(axios.spread((assessmentActivity: Array<PortfolioModel>, collectionActivity: Array<PortfolioModel>, offlineActivity: Array<PortfolioModel>) => {
      if (assessmentActivity.length || collectionActivity.length || offlineActivity.length) {
        this.hasPortfolioActivities = true;
      }
      this.portfolioActivities = [{
        type: ASSESSMENT,
        label: 'ASSESSMENT',
        portfolioContents: assessmentActivity
      }, {
        type: COLLECTION,
        label: 'COLLECTION',
        portfolioContents: collectionActivity
      }, {
        type: OFFLINE_ACTIVITY,
        label: 'OFFLINE-ACTIVITY',
        portfolioContents: offlineActivity
      }];
    }), (error) => {
      this.studiedPortfolioActivities = [];
    });
  }

  /**
   * @function loadPortfolioActivities
   * This method is used to load the portfolio activities
   */
  private loadPortfolioActivities(gutCode, contentType) {
    return new Promise((resolve, reject) => {
      const userId = this.userId;
      const requestParam = {
        userId,
        activityType: contentType,
        offset: this.offset,
        limit: this.limit,
        gutCode
      };
      return this.portfolioService.fetchUserPortfolioUniqueItems(requestParam, COMPETENCY).then((portfolioContents) => {
        if (portfolioContents.length < this.limit) {
          this.isFetchedAllActivities = true;
        }
        resolve(portfolioContents);
      }, (error) => {
        resolve([]);
      });
    });
  }

  /**
   * @function onPreview
   * This Method is used to preview the collections or assessment
   */
  public onPreview(activity) {
    const context = {
      collectionId: activity.id,
      collectionType: activity.type,
      contentId: activity.id,
      isPreview: true
    };
    this.reportService.showReport(context);
  }
}
