import { Injectable } from '@angular/core';
import { ContentSourceModel, ScopeAndSequenceCompetencyModuleModel, ScopeAndSequenceModuleModel, ScopeAndSequenceModuleTopicModel, SNSScopeModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { HttpService } from '@providers/apis/http';

@Injectable({
  providedIn: 'root'
})

export class ScopeAndSequenceProvider {

  // -------------------------------------------------------------------------
  // Properties

  private scopeNamespace = 'api/nucleus/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchScopeAndSequence
   * Method to fetch scope and sequence
   */
  public fetchScopeAndSequence(subjectCode, fwCode) {
    const endpoint = `${this.scopeNamespace}/scope-sequences`;
    const params = {
      subjectCode,
      fwCode
    };
    return this.httpService.get(endpoint, params).then((response) => {
      return response.data.scope_and_sequences;
    });
  }

  /**
   * @function fetchContentSources
   * Method to fetch content source
   */
  public fetchContentSources(params = {}) {
    const endpoint = `${this.scopeNamespace}/libraries/class-activities/content-sources`;
    return this.httpService.get<Array<ContentSourceModel>>(endpoint, params).then((response) => {
      return this.normalizeContentSources(response.data);
    });
  }

  /**
   * @function normalizeContentSources
   * Method to normalize content source
   */
  public normalizeContentSources(payload) {
    const result = [];
    payload = payload.ca_content_sources ? payload.ca_content_sources : [];
    if (payload && payload.length) {
      payload.forEach((item) => {
        if (item.key === 'tenant-library' || item.key === 'open-library') {
          const libraries = item.libraries;
          libraries.forEach((library) => {
            library.key = item.key;
            library.seq_id = item.seq_id;
            result.push(library);
          });
          return;
        }
        result.push(item);
      });
    }
    return result;
  }

  /**
   * @function fetchModulesByScopeId
   * Method to fetch modules by scopeId
   */
  public fetchModulesByScopeId(pathParams, params = {}) {
    const endpoint = `${this.scopeNamespace}/scope-sequences/${pathParams.ssId}/modules`;
    return this.httpService.get<Array<ScopeAndSequenceModuleModel>>(endpoint, params).then((response) => {
      return this.normalizeScopeModules(response.data.modules);
    });
  }

  /**
   * @function normalizeScopeModules
   * Method to normalize scope modules
   */
  public normalizeScopeModules(payload): Array<ScopeAndSequenceModuleModel> {
    return payload.map((item) => {
      const module: ScopeAndSequenceModuleModel = {
        description: item.description,
        durationDays: item.durationDays,
        grade: item.grade,
        gradeId: item.gradeId,
        id: item.id,
        sequence: item.sequence,
        title: item.title
      };
      return module;
    });
  }

  /**
   * @function fetchTopicsByModule
   * Method to fetch topics by module
   */
  public fetchTopicsByModule(pathParams, params = {}) {
    const endpoint = `${this.scopeNamespace}/scope-sequences/${pathParams.ssId}/modules/${pathParams.moduleId}/topics`;
    return this.httpService.get<Array<ScopeAndSequenceModuleTopicModel>>(endpoint, params).then((response) => {
      return this.normalizeScopeTopics(response.data.topics);
    });
  }

  /**
   * @function normalizeScopeTopics
   * Method to normalize scope topics
   */
  public normalizeScopeTopics(payload): Array<ScopeAndSequenceModuleTopicModel> {
    return payload.map((item) => {
      const topic: ScopeAndSequenceModuleTopicModel = {
        description: item.description,
        durationDays: item.durationDays,
        id: item.id,
        isActive: item.isActive,
        sequence: item.sequence,
        title: item.title
      };
      return topic;
    });
  }

  /**
   * @function fetchCompeteciesByTopics
   * Method to fetch competencies by topics
   */
  public fetchCompeteciesByTopics(pathParams, params = {}) {
    const endpoint = `${this.scopeNamespace}/scope-sequences/${pathParams.ssId}/topics/${pathParams.topicId}/competencies`;
    return this.httpService.get<Array<ScopeAndSequenceCompetencyModuleModel>>(endpoint, params).then((response) => {
      return this.normalizeScopeCompetencies(response.data.competencies);
    });
  }

  /**
   * @function fetchSNSScopeAndSequence
   * Method to fetch SNS scope and sequence
   */
  public fetchSNSScopeAndSequence(classId) {
    const snsNamespace = 'api/ds/users/v2/ca/domain/topic/competency';
    const endpoint = `${snsNamespace}/report?classId=${classId}`;
    return this.httpService.get(endpoint).then((response) => {
      return this.normalizeSNSScopeAndSequence(response.data);
    });
  }

  /**
   * @function normalizeScopeCompetencies
   * Method to normalize scope competencies
   */
  public normalizeScopeCompetencies(payload): Array<ScopeAndSequenceCompetencyModuleModel> {
    return payload.map((item) => {
      const competency: ScopeAndSequenceCompetencyModuleModel = {
        code: item.code,
        competencyMetadata: item.competencyMetadata,
        description: item.description,
        displayCode: item.displayCode,
        reviewCompetency: item.reviewCompetency,
        sequence: item.sequence,
        title: item.title
      }
      return competency;
    });
  }

  /**
   * @function normalizeSNSScopeAndSequence
   * Method to normalize SNS scope and sequence
   */
  public normalizeSNSScopeAndSequence(payload): SNSScopeModel {
    let domains;
    let topics;
    let competencies;
    if (payload.domains) {
      payload.domains.forEach((item) => {
        domains = {
          ...domains,
          [item.code]: item.status
        }
      });
    }
    if (payload.topics) {
      payload.topics.forEach((item) => {
        topics = {
          ...topics,
          [item.code]: item.status
        }
      });
    }
    if (payload.competencies) {
      payload.competencies.forEach((item) => {
        competencies = {
          ...competencies,
          [item.displayCode]: item.status
        }
      });
    }
    return {
      domains, topics, competencies
    } as SNSScopeModel
  }
}
