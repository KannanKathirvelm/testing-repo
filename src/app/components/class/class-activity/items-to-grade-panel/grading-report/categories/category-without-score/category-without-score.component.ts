import { Component, EventEmitter, Input, Output } from '@angular/core';
import { slideUpAnimation } from '@app/animation';
import { OaRubricCategoryModel, OaStudentRubricLevelModel } from '@models/rubric/rubric';

@Component({
  selector: 'nav-category-without-score',
  templateUrl: './category-without-score.component.html',
  styleUrls: ['./category-without-score.component.scss'],
  animations: [slideUpAnimation]
})
export class CategoryWithoutScoreComponent {

  // -------------------------------------------------------------------------
  // Properties

  public isShowComment: boolean;
  public selectedScoreIndex: number;
  public selectedLevel: OaStudentRubricLevelModel;
  @Output() public updateCategoryLevels = new EventEmitter();
  @Input() public categoryIndex: number;
  @Input() public category: OaRubricCategoryModel;
  @Input() public isReadonly: boolean;

  // -------------------------------------------------------------------------
  // Methods

  get teacherSelectedGrade() {
    const checkedLevel = this.category.levels.find((item) => item.isChecked);
    return checkedLevel ? checkedLevel.name : null;
  }

  /**
   * @function showGradeComment
   * This method is used to show the comment section
   */
  public showGradeComment() {
    this.isShowComment = !this.isShowComment;
  }

  /**
   * @function changeLevel
   * This method is used to change level
   */
  public changeLevel(levelIndex, level) {
    const selectedLevel = this.category.levels[levelIndex];
    this.selectedScoreIndex = levelIndex;
    this.selectedLevel = level;
    this.updateCategoryLevels.emit({
      selectedLevel: this.parseCategoryLevel(selectedLevel),
      selectCategoryIndex: this.categoryIndex,
      selectedLevelIndex: levelIndex,
      allowsScoring: this.category.allowsScoring,
      levelComment: this.category.comment
    });
  }

  /**
   * @function parseCategoryLevel
   * This method is used to parse the level content
   */
  public parseCategoryLevel(level) {
    if (level) {
      return {
        description: level.description,
        name: level.name,
        score: level.score,
        allowsScoring: false,
        scoreInPrecentage: 0,
        categoryTitle: this.category.title,
        maxScore: this.category.maxScore
      };
    }
    return null;
  }

  /**
   * @function enterLevelComments
   * This method is used to get the level comments
   */
  public enterLevelComments() {
    this.changeLevel(this.selectedScoreIndex, this.selectedLevel);
  }
}
