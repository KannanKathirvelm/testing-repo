import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SNSScopeModel } from '@app/models/class-activity/scope-and-sequence/scope-and-sequence';
import { ClassModel } from '@app/models/class/class';
import { ClassContentModel } from '@models/class-activity/class-activity';

@Component({
  selector: 'nav-default-scope-and-sequence',
  templateUrl: './default-scope-and-sequence.component.html',
  styleUrls: ['./default-scope-and-sequence.component.scss'],
})
export class DefaultScopeAndSequenceComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activeScopeAndSequence: any;
  @Input() public activeSequence: Array<any>;
  @Input() public snsScopeSequence: SNSScopeModel;
  @Input() public isCaBaselineWorkflow: boolean;
  @Input() public activities: Array<ClassContentModel>;
  @Output() public fetchDomainsEvent = new EventEmitter();
  @Output() public toggleDomainEvent = new EventEmitter();
  @Output() public toggleTopicEvent = new EventEmitter();
  @Output() public toggleCompetencyEvent = new EventEmitter();
  @Output() public addActivityEvent = new EventEmitter();
  @Output() public loadMoreData = new EventEmitter();
  @Output() public loadLessData = new EventEmitter();
  @Input() public classDetails: ClassModel;

  // -------------------------------------------------------------------------
  // Lifecycle methods

  public ngOnInit() {
    this.loadDomainDetails();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadDomainDetails
   * This method is used to load domain details
   */
  public loadDomainDetails() {
    if (this.activeScopeAndSequence && !this.activeScopeAndSequence.domainList) {
      this.fetchDomainsEvent.emit();
    }
  }

  /**
   * @function toggleDomains
   * This method is used to load domain
   */
  public toggleDomains(domain) {
    this.toggleDomainEvent.emit(domain);
  }

  /**
   * @function toggleTopics
   * This method is used to load topics
   */
  public toggleTopics(domain, topic) {
    this.toggleTopicEvent.emit({
      domain,
      topic
    });
  }


  /**
   * @function toggleCompetency
   * This method is used to toggle competency
   */
  public toggleCompetency(domainIndex, topicIndex, competencyIndex) {
    this.toggleCompetencyEvent.emit({
      domainIndex,
      topicIndex,
      competencyIndex
    })
  }

  /**
   * @function addActivity
   * This method is used to add activity
   */
  public addActivity(event) {
    this.addActivityEvent.emit(event);
  }

  /**
   * @function loadMore
   * This method is used to load more
   */
  public loadMore(event) {
    this.loadMoreData.emit(event);
  }

  /**
   * @function loadLess
   * This method is used to load less
   */
  public loadLess(event) {
    this.loadLessData.emit(event);
  }
}
