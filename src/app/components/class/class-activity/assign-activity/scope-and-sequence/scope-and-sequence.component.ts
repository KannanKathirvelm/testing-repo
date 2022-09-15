import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClassModel } from '@app/models/class/class';
import { ClassContentModel } from '@models/class-activity/class-activity';

@Component({
  selector: 'nav-scope-and-sequence',
  templateUrl: './scope-and-sequence.component.html',
  styleUrls: ['./scope-and-sequence.component.scss'],
})
export class ScopeAndSequenceComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public activeScopeAndSequence: any;
  @Output() public fetchModulesListEvent = new EventEmitter();
  @Output() public toggleModuleEvent = new EventEmitter();
  @Output() public toggleTopicEvent = new EventEmitter();
  @Output() public toggleCompetencyEvent = new EventEmitter();
  @Output() public addActivityEvent = new EventEmitter();
  @Input() public activities: Array<ClassContentModel>;
  @Output() public loadMoreData = new EventEmitter();
  @Output() public loadLessData = new EventEmitter();
  @Input() public classDetails: ClassModel;

  // -------------------------------------------------------------------------
  // methods

  public ngOnInit() {
    this.loadModulesList();
  }

  /**
   * @function loadModulesList
   * This method is used to load modules list
   */
  public loadModulesList() {
    if (this.activeScopeAndSequence && !this.activeScopeAndSequence.modulesList) {
      this.fetchModulesListEvent.emit();
    }
  }

  /**
   * @function openModule
   * This Method is used to open module
   */
  public openModule(moduleData) {
    this.toggleModuleEvent.emit(moduleData);
  }

  /**
   * @function openTopics
   * This Method is used to open topics
   */
  public openTopics(moduleData, topic) {
    this.toggleTopicEvent.emit({
      moduleData,
      topic
    });
  }

  /**
   * @function openCompetency
   * This method is used to open competency
   */
  public openCompetency(moduleIndex, topicIndex, competencyIndex) {
    this.toggleCompetencyEvent.emit({
      moduleIndex,
      topicIndex,
      competencyIndex
    });
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
   * This method is used to load more data
   */
  public loadMore(event) {
    this.loadMoreData.emit(event);
  }

  /**
   * @function loadLess
   * This method is used to load less data
   */
  public loadLess(event) {
    this.loadLessData.emit(event);
  }
}
