import { Injectable } from '@angular/core';
import { ScopeAndSequenceProvider } from '@providers/apis/scope-and-sequence/scope-and-sequence';

@Injectable({
  providedIn: 'root'
})

export class ScopeAndSequenceService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private scopeAndSequenceProvider: ScopeAndSequenceProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchScopeAndSequence
   * Method to fetch scope and sequence
   */
  public fetchScopeAndSequence(scopeParams) {
    return this.scopeAndSequenceProvider.fetchScopeAndSequence(scopeParams.subject, scopeParams.fw_code);
  }

  /**
   * @function fetchContentSources
   * Method to fetch content sources
   */
  public fetchContentSources(contentSourceParams) {
    return this.scopeAndSequenceProvider.fetchContentSources(contentSourceParams);
  }

  /**
   * @function fetchModulesByScopeId
   * Method to fetch modules by scope id
   */
  public fetchModulesByScopeId(pathParams, params = {}) {
    return this.scopeAndSequenceProvider.fetchModulesByScopeId(pathParams, params);
  }

  /**
   * @function fetchTopicsByModule
   * Method to fetch topics by module
   */
  public fetchTopicsByModule(pathParams, params = {}) {
    return this.scopeAndSequenceProvider.fetchTopicsByModule(pathParams, params);
  }

  /**
   * @function fetchCompeteciesByTopics
   * Method to fetch competencies by topics
   */
  public fetchCompeteciesByTopics(pathParams, params = {}) {
    return this.scopeAndSequenceProvider.fetchCompeteciesByTopics(pathParams, params);
  }

  /**
   * @function fetchSNSScopeAndSequence
   * Method to fetch SNS scope and sequence
   */
  public fetchSNSScopeAndSequence(classId) {
    return this.scopeAndSequenceProvider.fetchSNSScopeAndSequence(classId);
  }
}
