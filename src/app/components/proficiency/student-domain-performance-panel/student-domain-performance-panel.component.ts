import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomainCompetenciesModel, StudentDomainCompetenciesModel } from '@models/competency/competency';
import { slideInLeftAnimation, slideInRightAnimation } from 'angular-animations';

@Component({
  selector: 'nav-student-domain-performance-panel',
  templateUrl: './student-domain-performance-panel.component.html',
  styleUrls: ['./student-domain-performance-panel.component.scss'],
  animations: [slideInLeftAnimation({ duration: 300, delay: 0 }), slideInRightAnimation({ duration: 300, delay: 0 })]
})
export class StudentDomainPerformancePanelComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public studentDomainPerformance: StudentDomainCompetenciesModel;
  @Input() public activeDomainSeq: number;
  @Input() public isSlideNext: boolean;
  @Input() public isSlidePrev: boolean;
  @Input() public studentSeq: number;
  public nextSlideChanged: boolean;
  public prevSlideChanged: boolean;
  public isThumbnailError: boolean;
  public domain: DomainCompetenciesModel;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.nextSlideChanged = false;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.studentDomainPerformance && changes.studentDomainPerformance.currentValue) {
      this.domain = this.studentDomainPerformance.domainCompetencies[0];
    }
    if (changes.activeDomainSeq && changes.activeDomainSeq.currentValue || changes.activeDomainSeq.currentValue === 0) {
      this.slideStudentDomain();
    }
  }

  /**
   * @function onSlideChanged
   * Method triggers when slide changes
   */
  public onSlideChanged() {
    if (this.isSlideNext) {
      this.nextSlideChanged = true;
    }
    if (this.isSlidePrev) {
      this.prevSlideChanged = true;
    }
  }

  /**
   * @function progressBarLoaded
   * Method triggers when the progressBar loaded
   */
  public progressBarLoaded() {
    this.nextSlideChanged = false;
    this.prevSlideChanged = false;
  }

  /**
   * @function slideStudentDomain
   * Method to slide to student domain
   */
  public slideStudentDomain() {
    this.domain = this.studentDomainPerformance.domainCompetencies[this.activeDomainSeq];
    this.onSlideChanged();
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
