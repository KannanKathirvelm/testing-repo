import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import { TAXONOMY_LEVELS } from '@constants/helper-constants';
import { ScopeAndSequenceCompetencyModel, ScopeAndSequenceDomainModel, ScopeAndSequenceTopicModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { CrossWalkModel, FwCompetencyModel, PrerequisitesModel, TopicsModel } from '@models/competency/competency';
import { GradeBoundaryModel, GradeLevels, SubjectModel, TaxonomyFwSubjectContent, TaxonomyGrades, TaxonomyModel, TaxonomySubjectModel } from '@models/taxonomy/taxonomy';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { UtilsService } from '@providers/service/utils.service';
import { isMicroStandardId } from '@utils/global';

@Injectable({
  providedIn: 'root'
})

export class TaxonomyProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespaceV1 = 'api/nucleus/v1/taxonomy';
  private namespaceV2 = 'api/nucleus/v2/taxonomy';
  private dataScopeNamespace = 'api/ds/users/v2/tx';

  // -------------------------------------------------------------------------
  // API Path

  public getSubjectsAPIPath() {
    return `${this.dataScopeNamespace}/subjects`;
  }

  public fetchCategoriesAPIPath() {
    return `${this.namespaceV2}/classifications`;
  }

  public fetchCrossWalkFWCAPIPath(frameworkCode, subjectCode) {
    return `${this.namespaceV2}/crosswalk/frameworks/${frameworkCode}/subjects/${subjectCode}`;
  }

  public fetchGradesBySubjectAPIPath() {
    return `${this.dataScopeNamespace}/grades`;
  }

  public fetchDomainGradeBoundaryBySubjectIdAPIPath(gradeId) {
    return `${this.dataScopeNamespace}/grade/boundary/${gradeId}`;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCategories
   * Method to fetch categories
   */
  public fetchCategories(): Promise<Array<TaxonomyModel>> {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = this.fetchCategoriesAPIPath()
        this.httpService.get<Array<TaxonomyModel>>(endpoint).then((res) => {
          const normalizeCategories = this.normalizeCategories(res.data.subject_classifications);
          this.databaseService.upsertDocument(DOCUMENT_KEYS.TAXONOMY_CLASSIFICATIONS, normalizeCategories);
          resolve(normalizeCategories);
        }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.TAXONOMY_CLASSIFICATIONS).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function fetchSubjectById
   * This method is used to fetch subject by id
   */
  public fetchSubjectById(code: string): Promise<TaxonomySubjectModel> {
    const endpoint = `${this.namespaceV1}/subjects/${code}`;
    return this.httpService.get<TaxonomySubjectModel>(endpoint).then((res) => {
      const response = res.data;
      return this.normalizeTaxonomySubject(response);
    });
  }

  /**
   * @function normalizeTaxonomySubject
   * This method is used to fetch taxonomy subject
   */
  public normalizeTaxonomySubject(item) {
    const subject: TaxonomySubjectModel = {
      code: item.code,
      description: item.description,
      frameworks: item.frameworks,
      id: item.id,
      standardFrameworkId: item.standard_framework_id,
      title: item.title
    };
    return subject;
  }

  /**
   * @function fetchSubjects
   * Method to fetch categories
   */
  public fetchSubjects(category): Promise<Array<SubjectModel>> {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_PROFICIENCY_STUDENT_SUBJECT, {
      category
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const param = {
          classificationType: category
        };
        const endpoint = this.getSubjectsAPIPath();
        this.httpService.get<Array<SubjectModel>>(endpoint, param).then((res) => {
          const subjects = this.normalizeSubjects(res.data.subjects);
          this.databaseService.upsertDocument(dataBaseKey, subjects);
          resolve(subjects);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeSubjects
   * This method is used to Normalize the Subjects
   */
  private normalizeSubjects(subjects) {
    const data = subjects.map((subject) => {
      const subjectModel: SubjectModel = {
        code: subject.code,
        description: subject.description,
        frameworkId: subject.frameworkId,
        id: subject.id,
        sequenceId: subject.sequenceId,
        title: subject.title
      };
      return subjectModel;
    });
    return data;
  }

  /**
   * @function fetchGradesBySubject
   * This method is used to fetch grades
   */
  public fetchGradesBySubject(filters): Promise<Array<TaxonomyGrades>> {
    const subjectCode = filters.subject;
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_GRADES_BY_SUBJECT, {
      subjectCode
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.fetchGradesBySubjectAPIPath();
        this.httpService.get<Array<TaxonomyGrades>>(endpoint, filters).then((res) => {
          const grades = this.normalizeGrades(res.data);
          this.databaseService.upsertDocument(dataBaseKey, grades);
          resolve(grades);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeGrades
   * This method is used to Normalize the grades
   */
  private normalizeGrades(gradeSubject) {
    return gradeSubject.grades.map((grade) => {
      const gradeModel: TaxonomyGrades = {
        code: grade.code,
        grade: grade.grade,
        description: grade.description,
        id: grade.id,
        sequenceId: grade.sequence,
        showGradeLevel: gradeSubject.grade_levels,
        levels: this.normalizeGradeLevels(grade.levels, grade.id)
      };
      return gradeModel;
    });
  }

  /**
   * @function normalizeGradeLevels
   * This method is used to Normalize the grades based levels
   */
  private normalizeGradeLevels(gradeLevels, id) {
    if (!gradeLevels) {
      return [];
    }
    return gradeLevels.map((level) => {
      const gradeLevelModel: GradeLevels = {
        parentGradeId: id,
        id: level.id,
        description: level.description,
        grade: level.label,
        levelSequence: level.level_sequence
      };
      return gradeLevelModel;
    });
  }

  /**
   * @function fetchDomainGradeBoundaryBySubjectId
   * Method to fetch grade boundaries
   */
  public fetchDomainGradeBoundaryBySubjectId(gradeId): Promise<Array<GradeBoundaryModel>> {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_GRADE_BOUNDARY_BY_SUBJECT, {
      gradeId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.fetchDomainGradeBoundaryBySubjectIdAPIPath(gradeId)
        this.httpService.get<Array<GradeBoundaryModel>>(endpoint, {}).then((res) => {
          const domain = this.normalizeDomains(res.data.domains);
          this.databaseService.upsertDocument(dataBaseKey, domain);
          resolve(domain);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeDomains
   * This method is used to Normalize the domains
   */
  private normalizeDomains(domains) {
    return domains.map((domain) => {
      const domainModel: GradeBoundaryModel = {
        domainCode: domain.domainCode,
        averageComp: domain.averageComp,
        topicAverageComp: domain.topicAverageComp,
        highline: domain.highline || domain.highlineComp,
        highlineTopic: domain.highlineTopic,
        highlineComp: domain.highlineComp,
        topicHighlineComp: domain.topicHighlineComp,
        topicCode: domain.topicCode
      };
      return domainModel;
    });
  }

  /**
   * @function normalizeTaxonomyList
   * This method is used to normalize the taxonomy list
   */
  public normalizeTaxonomyList(taxonomyArray, level?) {
    const taxonomyData = [];
    if (taxonomyArray && taxonomyArray.length) {
      taxonomyArray.forEach((taxonomyObject) => {
        const isMicroStandard = isMicroStandardId(
          taxonomyObject.internalCode
        );
        const taxonomy = {
          id: taxonomyObject.internalCode,
          code: taxonomyObject.code,
          title: taxonomyObject.title,
          parentTitle: taxonomyObject.parentTitle,
          frameworkCode: taxonomyObject.frameworkCode,
          taxonomyLevel: level ? level : isMicroStandard ? TAXONOMY_LEVELS.MICRO : TAXONOMY_LEVELS.STANDARD
        };
        taxonomyData.push(taxonomy);
      });
    }
    return taxonomyData;
  }

  /**
   * @function fetchCodes
   * Method to fetch codes
   */
  public fetchCodes(frameworkId, subjectId, courseId, domainId): Promise<Array<PrerequisitesModel>> {
    const endpoint = `${this.namespaceV1}/frameworks/${frameworkId}/subjects/${subjectId}/courses/${courseId}/domains/${domainId}/codes`;
    return this.httpService.get<Array<PrerequisitesModel>>(endpoint, {}).then((res) => {
      return this.normalizeCodes(res.data.codes);
    });
  }

  /**
   * @function fetchCourses
   * Method to fetch taxonomy courses
   */
  public fetchCourses(fwCode, subjectCode) {
    const endpoint = `${this.namespaceV1}/frameworks/${fwCode}/subjects/${fwCode}.${subjectCode}/courses`;
    return this.httpService.get<Array<TaxonomyFwSubjectContent>>(endpoint).then((response) => {
      return this.normalizeFwSubjectContent(response.data.courses);
    });
  }

  /**
   * @function fetchDomains
   * Method to fetch domains
   */
  public fetchDomains(fwCode, subjectCode, courseId) {
    const endpoint = `${this.namespaceV1}/frameworks/${fwCode}/subjects/${fwCode}.${subjectCode}/courses/${courseId}/domains`;
    return this.httpService.get<Array<ScopeAndSequenceDomainModel>>(endpoint).then((response) => {
      return this.normalizeScopeDomains(response.data.domains);
    });
  }

  /**
   * @function fetchTopicsByDomain
   * Method to fetch topics by domain
   */
  public fetchTopicsByDomain(fwCode, subjectCode, domainId) {
    const endpoint = `${this.namespaceV1}/frameworks/${fwCode}/subjects/${fwCode}.${subjectCode}/domains/${domainId}/topics`;
    return this.httpService.get<Array<ScopeAndSequenceTopicModel>>(endpoint).then((response) => {
      return this.normalizeScopeTopics(response.data.topics);
    });
  }

  /**
   * @function fetchCompetenciesByDomainTopic
   * Method to fetch competencies by domain topic
   */
  public fetchCompetenciesByDomainTopic(fwCode, subjectCode, domainId, topicId) {
    const endpoint = `${this.namespaceV1}/frameworks/${fwCode}/subjects/${fwCode}.${subjectCode}/domains/${domainId}/topics/${topicId}/competencies`;
    return this.httpService.get<Array<ScopeAndSequenceCompetencyModel>>(endpoint).then((response) => {
      return this.normalizeScopeCompetencies(response.data.competencies);
    });
  }

  /**
   * @function normalizeFwSubjectContent
   * Method to normalize fw subject code content
   */
  public normalizeFwSubjectContent(payload): Array<TaxonomyFwSubjectContent> {
    return payload.map((item) => {
      const course: TaxonomyFwSubjectContent = {
        code: item.code,
        defaultTaxonomyCourseId: item.default_taxonomy_course_id,
        id: item.id,
        sequenceId: item.sequence_id,
        title: item.title,
        label: item.title
      };
      return course;
    });
  }

  /**
   * @function normalizeScopeDomains
   * Method to normalize scope domains
   */
  public normalizeScopeDomains(payload): Array<ScopeAndSequenceDomainModel> {
    return payload.map((item) => {
      const domain: ScopeAndSequenceDomainModel = {
        code: item.code,
        defaultTaxonomyDomainId: item.default_taxonomy_domain_id,
        id: item.id,
        sequenceId: item.sequence_id,
        title: item.title,
        isTopicLoaded: false,
        domainCode: item.code.split('-').pop()
      };
      return domain;
    });
  }

  /**
   * @function normalizeScopeTopics
   * Method to normalize scope topics
   */
  public normalizeScopeTopics(payload): Array<ScopeAndSequenceTopicModel> {
    return payload.map((item) => {
      const topic: ScopeAndSequenceTopicModel = {
        code: item.code,
        defaultTaxonomyTopicId: item.default_taxonomy_topic_id,
        description: item.description,
        id: item.id,
        sequenceId: item.sequence_id,
        title: item.title,
        isCompetencyLoaded: false
      };
      return topic;
    });
  }

  /**
   * @function normalizeScopeCompetencies
   * Method to normalize scope competencies
   */
  public normalizeScopeCompetencies(payload): Array<ScopeAndSequenceCompetencyModel> {
    return payload.map((item) => {
      const competency: ScopeAndSequenceCompetencyModel = {
        code: item.code,
        codeType: item.code_type,
        id: item.id,
        isSelectable: item.is_selectable,
        parentTaxonomyCodeId: item.parent_taxonomy_code_id,
        sequenceId: item.sequence_id,
        title: item.title,
        isContentLoaded: false,
        hasContent: false
      }
      return competency;
    });
  }

  /**
   * @function normalizeCodes
   * Normalize the micro competency codes
   */
  private normalizeCodes(payload) {
    return payload.map((code) => {
      const parsedCode: PrerequisitesModel = {
        code: code.code,
        codeType: code.code_type,
        id: code.id,
        isActive: code.isActive,
        isSelectable: code.is_selectable,
        parentTaxonomyCodeId: code.parent_taxonomy_code_id,
        sequenceId: code.sequence_id,
        title: code.title,
        label: code.title
      };
      return parsedCode;
    });
  }

  /**
   * @function normalizeLearningMapsTaxonomyList
   * Normalize the learning maps taxonomy list
   */
  public normalizeLearningMapsTaxonomyList(taxonomyObject, level?): Array<TaxonomyModel> {
    const taxonomyData = [];
    if (taxonomyObject) {
      Object.keys(taxonomyObject).forEach((internalCode) => {
        const isMicroStandard = isMicroStandardId(
          taxonomyObject.internalCode
        );
        const taxonomyInfo = taxonomyObject[internalCode];
        const taxonomy = {
          id: internalCode,
          code: taxonomyInfo.code,
          title: taxonomyInfo.title,
          parentTitle: taxonomyInfo.parentTitle || taxonomyInfo.parent_title,
          description: taxonomyInfo.description ? taxonomyInfo.description : '',
          frameworkCode: taxonomyInfo.frameworkCode ? taxonomyInfo.frameworkCode : taxonomyInfo.framework_code,
          taxonomyLevel: level ? level : isMicroStandard ? TAXONOMY_LEVELS.MICRO : TAXONOMY_LEVELS.STANDARD
        };
        taxonomyData.push(taxonomy);
      });
    }
    return taxonomyData;
  }

  /**
   * @function normalizeGrades
   * This method is used to Normalize the grades
   */
  private normalizeCategories(categories) {
    return categories.map((category) => {
      const categoryModel: TaxonomyModel = {
        code: category.code,
        isDefault: category.is_default,
        frameworkId: category.frameworkId,
        id: category.id,
        title: category.title
      };
      return categoryModel;
    });
  }

  /**
   * @function fetchCrossWalkFWC
   * This Method is used to fetch crosswalk fwcode
   */
  public fetchCrossWalkFWC(frameworkCode, subjectCode): Promise<Array<CrossWalkModel>> {
    const isOnline = this.utilsService.isNetworkOnline();
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_CROSS_WALK_FWC, {
      subjectCode
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.fetchCrossWalkFWCAPIPath(frameworkCode, subjectCode);
        this.httpService.get<Array<CrossWalkModel>>(endpoint).then((res) => {
          const competencyMatrix = this.normalizeCrossWalkFWC(res.data.competencyMatrix);
          this.databaseService.upsertDocument(dataBaseKey, competencyMatrix);
          resolve(competencyMatrix);
        }, reject);
      } else {
        this.databaseService.getDocument(dataBaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeCrossWalkFWC
   * This method is used to Normalize the crosswalk fwc
   */
  private normalizeCrossWalkFWC(crossWalkFWC) {
    return crossWalkFWC.map((crossWalk) => {
      let fwCompetencies = [];
      crossWalk.topics.forEach(topic => {
        fwCompetencies = fwCompetencies.concat(topic.competencies);
      });
      const crossWalkModel: CrossWalkModel = {
        competencies: this.normalizeCompetencies(fwCompetencies),
        domainCode: crossWalk.domainCode,
        domainName: crossWalk.domainName,
        domainSeq: crossWalk.domainSeq,
        fwDomainName: crossWalk.fwDomainName,
        topics: this.normalizeTopicCompetencies(crossWalk.topics)
      };
      return crossWalkModel;
    });
  }

  /**
   * @function normalizeCompetencies
   * This method is used to Normalize the topics competencies
   */
  private normalizeTopicCompetencies(topics) {
    return topics.map((item) => {
      const topicsModel: TopicsModel = {
        fwTopicName: item.fwTopicName,
        competencies: item.competencies,
        completedCompetencies: item.completedCompetencies,
        domainCode: item.domainCode,
        domainSeq: item.domainSeq,
        inferredCompetencies: item.inferredCompetencies,
        inprogressCompetencies: item.inprogressCompetencies,
        masteredCompetencies: item.masteredCompetencies,
        notstartedCompetencies: item.notstartedCompetencies,
        topicCode: item.topicCode,
        topicDesc: item.topicDesc,
        topicName: item.topicName,
        topicSeq: item.topicSeq
      }
      return topicsModel;
    });
  }

  /**
   * @function normalizeCompetencies
   * This method is used to Normalize the competencies
   */
  private normalizeCompetencies(competencies) {
    return competencies.map((competency) => {
      const competencyModel: FwCompetencyModel = {
        competencyCode: competency.competencyCode,
        competencyDesc: competency.competencyDesc,
        competencyName: competency.competencyName,
        competencySeq: competency.competencySeq,
        competencyStudentDesc: competency.competencyStudentDesc,
        frameworkCompetencyCode: competency.frameworkCompetencyCode,
        frameworkCompetencyDisplayCode: competency.frameworkCompetencyDisplayCode,
        frameworkCompetencyName: competency.frameworkCompetencyName,
        loCode: competency.loCode,
        loName: competency.loName
      };
      return competencyModel;
    });
  }

  /**
   * @function fetchClassificationList
   * This method is used to fetch the classification list
   */
  public fetchClassificationList(): Promise<TaxonomyModel> {
    const endpoint = `${this.namespaceV2}/v2/taxonomy/classifications`;
    return this.httpService.get<TaxonomyModel>(endpoint).then((res) => {
      const response = res.data;
      const subjectClassifications = response.subject_classifications;
      subjectClassifications.map((item) => {
        const subject: TaxonomyModel = {
          id: item.id,
          title: item.title,
          code: item.code
        };
        return subject;
      });
      return subjectClassifications;
    });
  }

  /**
   * @function normalizeTaxonomy
   * This method is used to normalize the taxonomy
   */
  public normalizeTaxonomy(taxonomyObject) {
    const taxonomyData = [];
    const taxonomyKeys = Object.keys(taxonomyObject);
    taxonomyKeys.forEach((key) => {
      if (taxonomyObject.hasOwnProperty(key)) {
        const taxonomy = taxonomyObject[key];
        const isMicroStandard = isMicroStandardId(key);
        taxonomyData.push({
          id: key,
          code: taxonomy.code,
          title: taxonomy.title,
          parentTitle: taxonomy.parent_title ? taxonomy.parent_title : '',
          description: taxonomy.description ? taxonomy.description : '',
          frameworkCode: taxonomy.framework_code || taxonomy.frameworkCode,
          taxonomyLevel: isMicroStandard
            ? TAXONOMY_LEVELS.MICRO
            : TAXONOMY_LEVELS.STANDARD
        });
      }
    });
    return taxonomyData;
  }

  /**
   * @function storeCategories
   * This method is used to store categories
   */
  public storeCategories(payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_CLASSIFICATIONS,{});
    const normalizeCategories = this.normalizeCategories(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeCategories);
  }

  /**
   * @function storeProficiencyStudentSubject
   * This method is used to store proficiency student subject data
   */
  public storeProficiencyStudentSubject(category, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_PROFICIENCY_STUDENT_SUBJECT, {
      category
    });
    const normalizeSubjects = this.normalizeSubjects(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeSubjects);
  }

  /**
   * @function storeCrossWalkFWC
   * This method is used to store cross walk FWC data
   */
  public storeCrossWalkFWC(subjectCode, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_CROSS_WALK_FWC, {
      subjectCode
    });
    const normalizeCrossWalkFWC = this.normalizeCrossWalkFWC(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeCrossWalkFWC);
  }

  /**
   * @function storeGradesBySubject
   * This method is used to store grades subject
   */
  public storeGradesBySubject(subjectCode, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_GRADES_BY_SUBJECT, {
      subjectCode
    });
    const normalizeGrades = this.normalizeGrades(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeGrades);
  }

  /**
   * @function storeGradeBoundaryBySubject
   * This method is used to store grade boundary data
   */
  public storeGradeBoundaryBySubject(gradeId, payload) {
    const dataBaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_GRADE_BOUNDARY_BY_SUBJECT, {
      gradeId
    });
    const normalizeDomains = this.normalizeDomains(payload);
    this.databaseService.upsertDocument(dataBaseKey, normalizeDomains);
  }
}