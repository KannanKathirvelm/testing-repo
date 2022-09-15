import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomainCompetencyCoverageModel } from '@models/competency/competency';
import { slideInLeftAnimation, slideInRightAnimation } from 'angular-animations';

@Component({
  selector: 'nav-domain-coverage-panel',
  templateUrl: './domain-coverage-panel.component.html',
  styleUrls: ['./domain-coverage-panel.component.scss'],
  animations: [slideInLeftAnimation({ duration: 300, delay: 0 }), slideInRightAnimation({ duration: 300, delay: 0 })]
})
export class DomainCoveragePanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Output() public slideNextStudent = new EventEmitter();
  @Output() public slidePrevStudent: EventEmitter<number> = new EventEmitter();
  @Output() public selectedDomain = new EventEmitter();
  @Input() public domainCoverageCount: Array<DomainCompetencyCoverageModel>;
  public slideChanged: boolean;
  public showDomainPerformance: boolean;
  public domain: DomainCompetencyCoverageModel;
  public domainSeq: number;
  public domainPrevSlideChanged: boolean;
  public domainNextSlideChanged: boolean;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    if (this.domainCoverageCount) {
      this.domainNextSlideChanged = false;
      this.domainPrevSlideChanged = false;
      this.domain = this.domainCoverageCount[0];
      this.domainSeq = 0;
    }
  }

  /**
   * @function onSlideNextStudent
   * Method to slide next student
   */
  public async onSlideNextStudent() {
    if (this.domainSeq < (this.domainCoverageCount.length - 1)) {
      this.domainSeq++;
      this.onSlideChanged();
      this.getActiveDomainData();
      this.domainNextSlideChanged = true;
      setTimeout(() => {
        this.domainNextSlideChanged = false;
        this.slideNextStudent.emit(this.domainSeq);
      }, 400);
    }
  }

  /**
   * @function getActiveDomainData
   * Method used to get the active domain data
   */
  public getActiveDomainData() {
    this.domain = this.domainCoverageCount[this.domainSeq];
  }

  /**
   * @function onSlideChanged
   * Method triggers when slide changes
   */
  public onSlideChanged() {
    this.slideChanged = !this.slideChanged;
  }

  /**
   * @function onSlidePrevStudent
   * Method triggers when slide changes
   */
  public async onSlidePrevStudent() {
    if (this.domainSeq > 0) {
      this.domainSeq--;
      this.onSlideChanged();
      this.getActiveDomainData();
      this.domainPrevSlideChanged = true;
      setTimeout(() => {
        this.domainPrevSlideChanged = false;
        this.slidePrevStudent.emit(this.domainSeq);
      }, 400);
    }
  }

  /**
   * @function toggleDomainPerformance
   * Method to toggle the domain performance
   */
  public toggleDomainPerformance() {
    this.showDomainPerformance = !this.showDomainPerformance;
    this.selectedDomain.emit();
  }
}
