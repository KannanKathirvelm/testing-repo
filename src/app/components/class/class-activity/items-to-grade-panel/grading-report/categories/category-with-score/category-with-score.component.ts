import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { slideUpAnimation } from '@app/animation';
import { OaRubricCategoryModel, OaStudentRubricLevelModel } from '@models/rubric/rubric';

@Component({
  selector: 'nav-category-with-score',
  templateUrl: './category-with-score.component.html',
  styleUrls: ['./category-with-score.component.scss'],
  animations: [slideUpAnimation]
})
export class CategoryWithScoreComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public isShowComment: boolean;
  public selectedLevel: OaStudentRubricLevelModel;
  public selectedScoreIndex: number;
  @Output() public updateCategoryLevels = new EventEmitter();
  @Input() public categoryIndex: number;
  @Input() public category: OaRubricCategoryModel;
  @Input() public isReadonly: boolean;
  @Input() public totalPoints: number;

  public ngOnInit() {
    this.totalPoints = Math.max(0, ...this.category.levels.map(level => level.score));
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function showGradeComment
   * This method is used to show the comment section
   */
  public showGradeComment() {
    this.isShowComment = !this.isShowComment;
  }

  /**
   * @function showProgressBar
   * This method is used to show progress bar
   */
  public showProgressBar(level, levelIndex) {
    this.selectedLevel = level;
    this.updateLevels(levelIndex, level);
  }

  /**
   * @function updateLevels
   * This method is used to emit the update category levels
   */
  private updateLevels(levelIndex, level) {
    this.selectedScoreIndex = levelIndex;
    this.updateCategoryLevels.emit({
      selectedLevel: this.parseCategoryLevel(level),
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
        allowsScoring: this.category.allowsScoring,
        scoreInPrecentage: level.scoreInPercentage,
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
    this.updateLevels(this.selectedScoreIndex, this.selectedLevel);
  }
}
