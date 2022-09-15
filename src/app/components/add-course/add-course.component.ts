import { Component, HostListener, Input, OnInit } from '@angular/core';
import { LIBRARY_CONTENT_SOURCE } from '@app/constants/helper-constants';
import { SessionModel } from '@app/models/auth/session';
import { ClassModel } from '@app/models/class/class';
import { SearchResultsModel } from '@app/models/search/search';
import { TenantLibraryContentModel } from '@app/models/tenant/tenant-settings';
import { ModalService } from '@app/providers/service/modal/modal.service';
import { SearchService } from '@app/providers/service/search/search.service';
import { SessionService } from '@app/providers/service/session/session.service';
import { CourseSearchPullUpComponent } from '../course-search-pull-up/course-search-pull-up.component';

@Component({
  selector: 'app-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss'],
})
export class AddCourseComponent implements OnInit {

  @Input() public classDetail: ClassModel;
  public tenantLibraryContent: Array<TenantLibraryContentModel>;
  public start = 1;
  public length = 20;
  public activeCourseType = 'featured';
  public searchTerms: string;
  public subjectCode: string;
  public frameWorkCode: string;
  public searchContent: Array<SearchResultsModel> = [];
  public contentSources: Array<{ name: string, thumbnail: string, sourceKey: string, shortName?: string, id?: string }> = [];
  public scrollDepthTriggered: boolean;
  public totalCount = 0;
  public isThumbnailError: boolean;
  public sessionDetails: SessionModel;
  public isLoading: boolean;

  constructor(
    private searchService: SearchService,
    private modalService: ModalService,
    private sessionService: SessionService
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
    this.loadData();
  }

  /**
   * @function loadData
   * This method used to load data
   */
  public loadData() {
    this.isLoading = true;
    this.sessionDetails = this.sessionService.userSession;
    this.getSearchContent();
    this.getTenantLibraries();
  }

  /**
   * @function buildRequestPayload
   * This method used to build request payload
   */
  public buildRequestPayload() {
    const preference = this.classDetail.preference;
    const subjectCode = preference && preference.subject ? preference.subject : null;
    const frameWorkCode = preference && preference.framework ? preference.framework : null;
    const activeCourseType = this.activeCourseType;
    const start = this.start;
    const length = this.length;
    const q = this.searchTerms || '*';
    const params = {
      start,
      length,
      q,
      'flt.courseType': activeCourseType
    }
    if (activeCourseType === 'featured' && frameWorkCode && subjectCode) {
      params['flt.subject'] = `${frameWorkCode}.${subjectCode}`
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
   * @function getTenantLibraries
   * This method used to get tenant libraries
   */
  public getTenantLibraries() {
    this.searchService.fetchTenantLibrary().then((libraries) => {
      this.tenantLibraryContent = libraries;
      LIBRARY_CONTENT_SOURCE.forEach(source => {
        this.contentSources.push({
          name: source.name,
          thumbnail: source.sourceKey === 'my-content' ? this.sessionDetails.thumbnail : source.thumbnail,
          sourceKey: source.sourceKey
        })
      })
      libraries.forEach(library => {
        this.contentSources.push({
          name: library.name,
          thumbnail: library.image,
          sourceKey: 'open-library',
          shortName: library.shortName
        })
      })
    });
  }

  /**
   * @function openSearchPullUp
   * This method used to open search pull up
   */
  public openSearchPullUp(source) {
    const params = {
      contentSources: this.contentSources,
      activeSource: source,
      classDetail: this.classDetail
    }
    this.modalService.openModal(CourseSearchPullUpComponent, params, 'search-pull-up', true)
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
   * @function resetProperties
   * This method used to reset the properties
   */
  public resetProperties() {
    this.start = 1;
    this.length = 20;
    this.searchContent = [];
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError(source) {
    source.isThumbnailError = true;
  }
}
