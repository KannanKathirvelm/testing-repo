import { Injectable } from '@angular/core';
import { CONTENT_TYPES } from '@constants/helper-constants';
import { SuggestionModel } from '@models/suggestion/suggestion';
import { HttpService } from '@providers/apis/http';
import { SessionService } from '@providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})

export class SuggestionProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/stracker/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private sessionService: SessionService, private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTeacherSuggestions
   * This method is used to fetch the teacher suggestion
   */
  public fetchTeacherSuggestions(code, param): Promise<Array<SuggestionModel>> {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.namespace}/user/${userId}/code/${code}/codetype/competency`;
    return this.httpService.get<Array<SuggestionModel>>(endpoint, param).then((res) => {
      return this.normalizeProficiencySuggestionList(res.data.suggestions);
    });
  }

  /**
   * @function suggestCollection
   * This method is used to suggest a collection
   */
  public suggestCollection(param) {
    const endpoint = `${this.namespace}/track`;
    this.httpService.post(endpoint, param);
  }

  /**
   * @function normalizeProficiencySuggestionList
   * This method is used to normalize the proficiency suggestions
   */
  private normalizeProficiencySuggestionList(suggestions) {
    return suggestions.map((suggestion) => {
      const suggestionModel: SuggestionModel = {
        id: suggestion.id,
        unitId: suggestion.unitId,
        lessonId: suggestion.lessonId,
        collectionId: suggestion.collectionId,
        classId: suggestion.classId,
        suggestedContentId: suggestion.suggestedContentId,
        suggestedContentType: suggestion.suggestedContentType.toLowerCase(),
        isCollection: suggestion.suggestedContentType === CONTENT_TYPES.COLLECTION,
        isAssessment: suggestion.suggestedContentType === CONTENT_TYPES.ASSESSMENT,
        isOfflineActivity: suggestion.suggestedContentType === CONTENT_TYPES.OFFLINE_ACTIVITY,
        isExternalAssessment: suggestion.suggestedContentType === CONTENT_TYPES.ASSESSMENT_EXTERNAL,
        isExternalCollection: suggestion.suggestedContentType === CONTENT_TYPES.COLLECTION_EXTERNAL,
        suggestedTo: suggestion.suggestedTo,
        suggestionArea: suggestion.suggestionArea,
        suggestionCriteria: suggestion.suggestionCriteria,
        suggestionOrigin: suggestion.suggestionOrigin,
        suggestionOriginatorId: suggestion.suggestionOriginatorId,
        pathId: suggestion.pathId,
        userId: suggestion.userId,
        questionType: suggestion.question_count,
        resourceCount: suggestion.resource_count,
        questionCount: suggestion.question_count,
        courseId: suggestion.courseId,
        createdAt: suggestion.createdAt,
        txCodeType: suggestion.txCodeType,
        txCode: suggestion.txCode,
        acceptedAt: suggestion.acceptedAt,
        accepted: suggestion.accepted,
        updatedAt: suggestion.updatedAt,
        title: suggestion.title
      };
      return suggestionModel;
    });
  }
}
