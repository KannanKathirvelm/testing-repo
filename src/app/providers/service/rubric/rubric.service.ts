import { Injectable } from '@angular/core';
import { ROLES, RUBRIC } from '@constants/helper-constants';
import {
  OaRubricCategoryModel,
  OaStudentRubricLevelModel,
  OaStudentRubricModel
} from '@models/rubric/rubric';
import { RubricProvider } from '@providers/apis/rubric/rubric';
import { ProfileService } from '@providers/service/profile/profile.service';
import { calculateAverageScore } from '@utils/global';

@Injectable({
  providedIn: 'root'
})

export class RubricService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private rubricProvider: RubricProvider,
    private profileService: ProfileService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchRubricItems
   * Method to fetch the rubric items
   */
  public fetchRubricItems(params) {
    return this.rubricProvider.fetchRubricItems(params);
  }

  /**
   * @function fetchRubricQuestionsItems
   * Method to fetch the rubric question
   */
  public fetchRubricQuestionsItems(params, isDca?) {
    return this.rubricProvider.fetchRubricQuestionsItems(params, isDca);
  }

  /**
   * @function getStudentsForQuestion
   * Method to get students for question
   */
  public getStudentsForQuestion(questionId, params, isDca, hasMembers= false) {
    return this.rubricProvider.getStudentsForQuestion(questionId, params, isDca).then((studentList) => {
      return hasMembers ? studentList :  this.profileService.fetchUserProfile(studentList);
    });
  }

  /**
   * @function getAnswerToGrade
   * Method to get answer to grade
   */
  public getAnswerToGrade(questionId, studentId, params, isDca) {
    return this.rubricProvider.getAnswerToGrade(questionId, studentId, params, isDca);
  }

  /**
   * @function fetchRubric
   * Method to fetch rubric
   */
  public fetchRubric(rubricId) {
    return this.rubricProvider.fetchRubric(rubricId);
  }

  /**
   * @function fetchFRQQuestions
   * Method to fetch the items to grade questions
   */
  public fetchFRQQuestions(classId, courseId) {
    return this.rubricProvider.fetchFRQQuestions(classId, courseId);
  }

  /**
   * @function submitOAGrade
   * Method to submit oa grade
   */
  public submitOAGrade(oaGrade) {
    return this.rubricProvider.submitOAGrade(oaGrade);
  }

  /**
   * @function submitAssessmentGrade
   * Method to submit assessment grade
   */
  public submitAssessmentGrade(assessmentGrade) {
    return this.rubricProvider.submitAssessmentGrade(assessmentGrade);
  }

  /**
   * @function parseRubric
   * This method is used to fetch rubric
   */
  public parseRubric(role, rubric, studentGrades?) {
    const newRubric = new OaStudentRubricModel();
    newRubric.isTeacherRubric = role === ROLES.TEACHER;
    newRubric.comment = studentGrades ? studentGrades.overallComment : '';
    newRubric.grader = studentGrades ? studentGrades.grader === RUBRIC.STUDENT.toLowerCase() : false;
    newRubric.gradedScore = studentGrades ? studentGrades.score : null;
    newRubric.gradedScoreInPercentage = studentGrades ? calculateAverageScore(studentGrades.score, studentGrades.maxScore) : null;
    newRubric.maxScore = rubric && rubric.maxScore || 1;
    if (rubric) {
      newRubric.id = rubric.id;
      newRubric.categories = this.parseCategories(rubric.categories, studentGrades);
      newRubric.increment = rubric.increment;
      newRubric.scoring = rubric.scoring;
      newRubric.title = rubric.title;
      newRubric.url = rubric.url;
      newRubric.uploaded = rubric.uploaded;
      newRubric.isRubric = rubric.isRubric === undefined ? true : false;
      newRubric.tenant = rubric.tenant;
      newRubric.taxonomy = rubric.taxonomy;
      newRubric.creatorId = rubric.creatorId;
      newRubric.modifierId = rubric.ownerId;
      newRubric.parentRubricId = rubric.parentRubricId;
      newRubric.originalRubricId = rubric.originalRubricId;
      newRubric.originalCreatorId = rubric.originalCreatorId;
      newRubric.modifierId = rubric.modifierId;
    };
    return newRubric;
  }

  /**
   * @function parseCategories
   * This method is used to parse categories
   */
  public parseCategories(categories, studentGrades?) {
    const newCategories = [];
    categories.map((category, categoryIndex) => {
      const studentGradedItem = studentGrades ? studentGrades.categoryGrade[categoryIndex] : null;
      const newCategory = new OaRubricCategoryModel();
      newCategory.allowsLevels = category.allowsLevels;
      newCategory.allowsScoring = category.allowsScoring;
      newCategory.feedbackGuidance = category.newCategory;
      newCategory.levels = this.parseCategoryLevel(category.levels, studentGradedItem);
      newCategory.requiresFeedback = category.requiresFeedback;
      newCategory.title = category.title;
      newCategory.maxScore = category.maxScore ? category.maxScore : this.getMaxScoreOfLevels(category.levels);
      newCategory.comment = studentGradedItem ? studentGradedItem.levelComment : category.comment;
      newCategory.scoreInPercentage = studentGradedItem ? calculateAverageScore(studentGradedItem.levelScore, studentGradedItem.levelMaxScore) : 0;
      newCategories.push(newCategory);
    });
    return newCategories;
  }

  /**
   * @function getMaxScoreOfLevels
   * This method is used to get max score of levels
   */
  public getMaxScoreOfLevels(levels) {
    let maxScore = 0;
    const levelScore = levels.map((level) => level.score);
    if (levelScore.length) {
      maxScore = maxScore + Math.max(0, ...levelScore);
    }
    return maxScore;
  }

  /**
   * @function parseCategoryLevel
   * This method is used to parse category level
   */
  public parseCategoryLevel(levels, studentGradedItem?) {
    const newLevels = [];
    const singleProgressScore = 100 / (levels.length - 1);
    levels.map((level, levelIndex) => {
      const newLevel = new OaStudentRubricLevelModel();
      newLevel.description = level.description;
      newLevel.name = level.name;
      newLevel.score = level.score;
      newLevel.scoreInPercentage = studentGradedItem ? studentGradedItem.levelScore : levelIndex * singleProgressScore;
      newLevel.isChecked = studentGradedItem ? studentGradedItem.levelObtained === level.name : false;
      newLevels.push(newLevel);
    });
    return newLevels;
  }
}
