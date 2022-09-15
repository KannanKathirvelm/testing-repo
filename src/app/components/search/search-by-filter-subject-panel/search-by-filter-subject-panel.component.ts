import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SubjectModel, TaxonomyFwSubjectContent, TaxonomyModel } from '@models/taxonomy/taxonomy';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'search-by-filter-subject-panel',
  templateUrl: './search-by-filter-subject-panel.component.html',
  styleUrls: ['./search-by-filter-subject-panel.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class SearchByFilterSubjectPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public subjects: Array<SubjectModel>;
  @Input() public activeSubject: SubjectModel;
  @Input() public taxonomyGrades: Array<TaxonomyFwSubjectContent>;
  @Input() public activeCategory: TaxonomyModel;
  @Input() public activeFramework: string;
  @Input() public categories: Array<TaxonomyModel>;
  public activeGrade: TaxonomyFwSubjectContent;
  public isExpand: boolean;
  @Output() public selectCategory: EventEmitter<SubjectModel> = new EventEmitter();
  @Output() public selectSubject: EventEmitter<SubjectModel> = new EventEmitter();
  @Output() public selectFramework: EventEmitter<string> = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.isExpand = false;
  }

  /**
   * @function onSelectCategory
   * Method to set the selected category
   */
  public onSelectCategory(item) {
    const category = item.detail.value;
    this.selectCategory.emit(category);
  }

  /**
   * @function compareWithCode
   * This method is used to check the code
   */
  public compareWithCode(item1, item2) {
    return item1 && item2 ? item1.id === item2.id : false;
  }

  /**
   * @function compareWithFwId
   * This method is used to check the id
   */
  public compareWithFwId(item1, item2) {
    return item1 && item2 ? item1 === item2 : false;
  }

  /**
   * @function onSelectSubject
   * Method to set the selected subjects
   */
  public onSelectSubject(item) {
    const subject = item.detail.value;
    this.selectSubject.emit(subject);
  }

  /**
   * @function selectGrade
   * Method to set the selected grade
   */
  public selectGrade(gradeData) {
    this.activeGrade = gradeData.detail.value;
  }

  /**
   * @function onSelectFramework
   * Method to set the selected framework
   */
  public onSelectFramework(gradeData) {
    const framework = gradeData.detail.value;
    if (this.activeFramework !== framework) {
      this.selectFramework.emit(framework);
    }
  }

  /**
   * @function onClickHeader
   * Method triggers when user click the header to toggle
   */
  public onClickHeader() {
    this.isExpand = !this.isExpand;
  }
}
