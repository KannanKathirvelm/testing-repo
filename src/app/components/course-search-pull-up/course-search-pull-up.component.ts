import { Component, HostListener, OnInit } from '@angular/core';
import { ClassModel } from '@app/models/class/class';
import { SearchResultsModel } from '@app/models/search/search';
import { TenantLibraryContentModel } from '@app/models/tenant/tenant-settings';
import { ModalService } from '@app/providers/service/modal/modal.service';
import { SearchService } from '@app/providers/service/search/search.service';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-course-search-pull-up',
  templateUrl: './course-search-pull-up.component.html',
  styleUrls: ['./course-search-pull-up.component.scss'],
})
export class CourseSearchPullUpComponent implements OnInit {
  public tenantLibraryContent: Array<TenantLibraryContentModel>;
  public contentSources: Array<{ name: string, thumbnail: string, sourceKey: string, shortName?: string }> = [];
  public activeSource: { name: string, thumbnail: string, sourceKey: string, shortName?: string };
  public start = 1;
  public length = 20;
  public searchTerms: string;
  public searchContent: Array<SearchResultsModel> = [];
  public classDetail: ClassModel;
  public scrollDepthTriggered: boolean;
  public totalCount = 0;
  public isRefresh: boolean;
  public isLoading: boolean;

  constructor(
    private modalService: ModalService,
    private searchService: SearchService,
    private navParams: NavParams
  ) { }

  @HostListener('scroll', ['$event'])
  public async onScroll(event) {
    const element = event.target;
    if (element.offsetWidth + Math.round(element.scrollLeft) >= element.scrollWidth) {
      if (this.scrollDepthTriggered) {
        return;
      }
      this.start++;
      this.scrollDepthTriggered = true;
      if (this.totalCount >= this.start * this.length) {
        this.getSearchContent();
      }
    }
  }

  public ngOnInit() {
    this.isLoading = true;
    this.contentSources = this.navParams.get('contentSources')
    this.activeSource = this.navParams.get('activeSource');
    this.classDetail = this.navParams.get('classDetail');
    this.getSearchContent();
  }

  /**
   * @function closePullUP
   * This method used to close pullup
   */
  public closePullUP() {
    this.modalService.dismissModal(true);
  }

  /**
   * @function buildRequestPayload
   * This method used to build request payload
   */
  public buildRequestPayload() {
    const activeCourseType = this.activeSource.sourceKey;
    const start = this.start;
    const length = this.length;
    const q = this.searchTerms || '*';
    const params = {
      start,
      length,
      q,
      scopeKey: activeCourseType
    }
    if (this.activeSource.shortName) {
      params['scopeTargetNames'] = this.activeSource.shortName;
    }
    return params;
  }

  /**
   * @function getSearchContent
   * This method used to get search content
   */
  public getSearchContent() {
    const requestParams = this.buildRequestPayload();
    this.searchService.searchFeaturedCourses(requestParams).then((searchContent) => {
      this.searchContent = this.searchContent.concat(searchContent.searchResults);
      this.totalCount = searchContent.totalCount;
      this.scrollDepthTriggered = false;
      this.isLoading = false;
    })
  }

  /**
   * @function onSearchCourse
   * This method used to search the course
   */
  public onSearchCourse() {
    this.getSearchContent();
    this.resetProperties();
  }

  /**
   * @function changeCourse
   * This method used to change course
   */
  public changeCourse() {
    this.resetProperties();
    this.getSearchContent();
  }

  /**
   * @function resetProperties
   * This method used to reset the properties
   */
  public resetProperties() {
    this.start = 1;
    this.length = 20;
    this.searchContent = [];
  }
}
