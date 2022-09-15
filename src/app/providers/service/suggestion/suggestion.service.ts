import { Injectable } from '@angular/core';
import { COMPETENCY, PROFICIENCY, STUDENT_ROLE, TEACHER_ROLE } from '@constants/helper-constants';
import { SuggestionProvider } from '@providers/apis/suggestion/suggestion';
import { ClassService } from '@providers/service/class/class.service';
import { SessionService } from '@providers/service/session/session.service';
@Injectable({
  providedIn: 'root'
})
export class SuggestionService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private sessionService: SessionService,
    private suggestionProvider: SuggestionProvider
  ) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTeacherSuggestions
   * This Method IS used to fetch the teacher suggestions
   */
  public fetchTeacherSuggestions(competencyCode, params) {
    return this.suggestionProvider.fetchTeacherSuggestions(competencyCode, params);
  }

  /**
   * @function suggestCollection
   * Method to suggest a collection
   */
  public suggestCollection(params) {
    this.suggestionProvider.suggestCollection(params);
  }

  /**
   * @function getSuggestionContext
   * Method to get the suggestion context
   */
  public getSuggestionContext(studentId, collection, competencyCode) {
    const classDetails = this.classService.class;
    const teacherId = this.sessionService.userSession.user_id;
    return {
      user_id: studentId,
      class_id: classDetails.id,
      suggested_content_id: collection.id,
      suggestion_origin: TEACHER_ROLE,
      suggestion_originator_id: teacherId,
      suggestion_criteria: 'performance',
      suggested_content_type: collection.collectionType || collection.contentFormat,
      suggested_to: STUDENT_ROLE,
      suggestion_area: PROFICIENCY,
      tx_code: competencyCode,
      tx_code_type: COMPETENCY
    };
  }
}
