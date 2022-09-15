import { Injectable } from '@angular/core';
import { calculatePercentage, sortByNumber } from '@app/utils/global';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import {
  COMPETENCY_STATUS_VALUE,
  DEFAULT_IMAGES,
  SORTING_TYPES
} from '@constants/helper-constants';
import {
  ClassCompetencySummaryModel,
  CompetenciesStrugglingPerformanceModel,
  CompetencyCompletionStatusModel,
  CompetencyMatrixModel,
  DomainLevelSummaryModel,
  DomainModel,
  DomainTopicCompetencyMatrixModel,
  MatrixCoordinatesModel,
  MatrixCoordinatesTopicsModel,
  StrugglingCompetencyModel,
  StudentCompetencyModel,
  StudentsCompetencyModel,
  TopicMatrixModel,
  TopicsCompetencyModel
} from '@models/competency/competency';
import { UserSignatureCompetenciesModel } from '@models/signature-content/signature-content';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';

@Injectable({
  providedIn: 'root'
})

export class CompetencyProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/ds';

  // -------------------------------------------------------------------------
  // API Path

  public getCompentencyReportAPIPath() {
    return `${this.namespace}/users/v2/users/competency/report`;
  }

  public getSubjectDomainTopicAPIPath() {
    return `${this.namespace}/users/v2/tx/subject/domain/topics`;
  }

  public getDomainTopicCompetencyMatrixAPIPath() {
    return `${this.namespace}/users/v2/tx/competency/matrix/domain/topics`;
  }

  public getCompletionStatusAPIPath() {
    return `${this.namespace}/users/v2/user/competency/status`;
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private session: SessionService,
    private httpService: HttpService,
    private utilsService: UtilsService,
    private databaseService: DatabaseService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCompetencyCompletionStats
   * This method is used to fetch competency stats
   */
  public fetchCompetencyCompletionStats(classIds) {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/users/v4/stats/competency`;
        const request = { classIds };
        this.httpService.post<Array<ClassCompetencySummaryModel>>(endpoint, request).then((res) => {
          const normalizeCompetencySummary = this.normalizeClassCompetencySummary(res.data);
          this.databaseService.upsertDocument(DOCUMENT_KEYS.CLASSES_COMPETENCY_STATS, normalizeCompetencySummary);
          resolve(normalizeCompetencySummary);
        }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.CLASSES_COMPETENCY_STATS).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function fetchDomainTopicCompetencyMatrix
   * Method to fetch the domain topic competency matrix
   */
  public fetchDomainTopicCompetencyMatrix(subject, year, month, classId, user): Promise<Array<DomainTopicCompetencyMatrixModel>> {
    const defaultParams = {
      user,
      subject,
      month,
      year,
      classId
    };
    const subjectId = defaultParams.subject;
    const isOnline = this.utilsService.isNetworkOnline();
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_USER_COMPETENCY_MATRIX, {
      subjectId,
      userId: user
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getDomainTopicCompetencyMatrixAPIPath();
        this.httpService.get<Array<DomainTopicCompetencyMatrixModel>>(endpoint, defaultParams).then((res) => {
          const domainTopicMatrix = this.normalizeDomainTopicMatrix(res.data);
          resolve(domainTopicMatrix);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value.data?.domainCompetencyMatrix);
        }, reject);
      }
    });
  }

  /**
   * @function fetchStrugglingCompetency
   * This method is used to fetch struggling competencies
   */
  public fetchStrugglingCompetency(params): Promise<Array<StrugglingCompetencyModel>> {
    const grade = (params.grade) || null;
    const classId = params.classId || null;
    const month = params.month || null;
    const year = params.year || null;
    const endpoint = `${this.namespace}/users/v2/competencies/struggling?grades=${grade}&class=${classId}&month=${month}&year=${year}`;
    return this.httpService.get<Array<StrugglingCompetencyModel>>(endpoint).then((res) => {
      const strugglingCompetency = this.normalizeStrugglingCompetency(res.data);
      return strugglingCompetency;
    });
  }

  /**
   * @function fetchStudentsPerfomance
   * This method is used to fetch struggling competencies
   */
  public fetchStudentsPerfomance(params): Promise<Array<CompetenciesStrugglingPerformanceModel>> {
    const competency = params.competency || null;
    const classId = params.classId || null;
    const month = params.month || null;
    const year = params.year || null;
    const endpoint = `${this.namespace}/users/v2/competencies/struggling/performance?class=${classId}&competency=${competency}&month=${month}&year=${year}`;
    return this.httpService.get<Array<CompetenciesStrugglingPerformanceModel>>(endpoint).then((res) => {
      return this.normalizeStudentsPerfomance(res.data);
    });
  }

  /**
   * @function fetchCompletionStatus
   * This method is used to fetch lesson competency completion status
   */
  public fetchCompletionStatus(params) {
    const endpoint = this.getCompletionStatusAPIPath();
    Object.assign(params);
    return this.httpService.post<Array<CompetencyCompletionStatusModel>>(endpoint, params).then((res) => {
      return this.normalizeCompetencyStatus(res.data.competencyStatus);
    });
  }

  /**
   * @function normalizeCompetencyStatus
   * This method is used to normalize competency status
   */
  private normalizeCompetencyStatus(payload): Array<CompetencyCompletionStatusModel> {
    return payload.map((item) => {
      const competencyStatus: CompetencyCompletionStatusModel = {
        competencyCode: item.competencyCode,
        competencyDesc: item.competencyDesc,
        competencyName: item.competencyName,
        competencySeq: item.competencySeq,
        competencyStudentDesc: item.competencyStudentDesc,
        domainCode: item.domainCode,
        domainSeq: item.domainSeq,
        source: item.source,
        status: item.status,
        topicCode: item.topicCode,
        topicSeq: item.topicSeq
      };
      return competencyStatus;
    });
  }

  /**
   * @function normalizeStudentsPerfomance
   * This method is used to normalize student performance
   */
  public normalizeStudentsPerfomance(payload) {
    return payload.students.map((student) => {
      const basePath = this.session.userSession.cdn_urls.user_cdn_url;
      const thumbnailUrl = student.thumbnail
        ? basePath + student.thumbnail
        : DEFAULT_IMAGES.PROFILE_IMAGE;
      return {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        displayName: student.display_name,
        thumbnail: thumbnailUrl,
        username: student.username,
        performanceScore: student.performance
      };
    });
  }

  /**
   * @function normalizeStrugglingCompetency
   * This method is used to normalize struggling competency
   */
  public normalizeStrugglingCompetency(payload): Array<StrugglingCompetencyModel> {
    const serialize = this;
    const strugglingCompetency = payload.struggling_competencies ? payload.struggling_competencies : [];
    const strugglingCompetencyPayload = [];
    if (strugglingCompetency && strugglingCompetency.length) {
      strugglingCompetency.forEach(grade => {
        strugglingCompetencyPayload.push(
          {
            gradeId: grade.grade_id,
            grade: grade.grade,
            gradeSeq: grade.grade_Seq,
            description: grade.description,
            fwCode: grade.fw_code,
            domains: serialize.normalizeDomains(grade.domains)
          }
        );
      });
    }
    return strugglingCompetencyPayload;
  }

  /**
   * @function normalizeDomains
   * This method is used to normalize domains
   */
  public normalizeDomains(payload) {
    const domains = payload ? payload : null;
    const domainList = [];
    if (domains && domains.length) {
      domains.map((domain) => {
        domainList.push(
          {
            competencies: this.normalizeStruggleCompetency(domain.competencies),
            domainCode: domain.domain_code,
            domainId: domain.domain_id,
            domainName: domain.domain_name,
            domainSeq: domain.domain_seq
          }
        );
      });
    }
    return domainList;
  }

  /**
   * @function normalizeStruggleCompetency
   * This method is used to normalize struggle competency
   */
  public normalizeStruggleCompetency(payload) {
    const competencies = payload ? payload : null;
    const competencyList = [];
    if (competencies && competencies.length) {
      competencies.map(competency => {
        competencyList.push({
          code: competency.comp_code,
          displayCode: competency.comp_display_code,
          name: competency.comp_name,
          sequence: competency.comp_seq,
          studentsDescription: competency.comp_student_desc,
          studentsCount: competency.student_count
        });
      });
    }
    competencyList.sort((competency1, competency2) => competency1.sequence - competency2.sequence)
    return competencyList;
  }

  /**
   * @function normalizeDomainTopicMatrix
   * Method to normalize the domain topic matrix
   */
  public normalizeDomainTopicMatrix(payload) {
    const serializedMatrix: Array<DomainTopicCompetencyMatrixModel> = [];
    if (payload && payload.userCompetencyMatrix) {
      const userCompetencyMatrix = payload.userCompetencyMatrix;
      userCompetencyMatrix.map((competencyMatrix) => {
        let domainMatrix = {
          domainCode: competencyMatrix.domainCode,
          topics: this.normalizeDomainTopics(competencyMatrix.topics),
        };
        domainMatrix = Object.assign(domainMatrix, this.groupCompetenciesByTopic(domainMatrix.topics));
        serializedMatrix.push(domainMatrix);
      });
    }
    return serializedMatrix;
  }

  /**
   * @function groupCompetenciesByTopic
   * Method to group the competency by topic
   */
  private groupCompetenciesByTopic(topics) {
    let masteredCompetencies = 0;
    let inprogressCompetencies = 0;
    let notstartedCompetencies = 0;
    let inferredCompetencies = 0;
    let completedCompetencies = 0;
    topics.map((topic) => {
      masteredCompetencies += topic.masteredCompetencies;
      completedCompetencies += topic.completedCompetencies;
      inprogressCompetencies += topic.inprogressCompetencies;
      inferredCompetencies += topic.inferredCompetencies;
      notstartedCompetencies += topic.notstartedCompetencies;
    });
    return {
      masteredCompetencies,
      inprogressCompetencies,
      notstartedCompetencies,
      inferredCompetencies,
      completedCompetencies,
      totalCompetencies: (completedCompetencies + inprogressCompetencies + notstartedCompetencies + inferredCompetencies),
    };
  }

  /**
   * @function normalizeDomainTopics
   * Method to normalize the domain topics
   */
  private normalizeDomainTopics(topics) {
    if (topics && topics.length) {
      const normalizedTopics = topics.map((topic) => {
        let normalizedTopic: TopicMatrixModel = {
          topicCode: topic.topicCode,
          topicSeq: topic.topicSeq,
          competencies: this.normalizeDomainTopic(topic),
        };
        normalizedTopic = Object.assign(normalizedTopic, this.groupCompetenciesByStatus(topic.competencies));
        return normalizedTopic;
      });
      return normalizedTopics.sort((topic1, topic2) => topic1.topicSeq - topic2.topicSeq);
    }
    return [];
  }

  /**
   * @function groupCompetenciesByStatus
   * Method to group the competencies by status
   */
  private groupCompetenciesByStatus(competencies) {
    const notStartedList = competencies.filter((competency) => {
      return competency.status === COMPETENCY_STATUS_VALUE.NOT_STARTED;
    });
    const inProgressList = competencies.filter((competency) => {
      return competency.status === COMPETENCY_STATUS_VALUE.IN_PROGRESS;
    });
    const masteredList = competencies.filter((competency) => {
      return competency.status === COMPETENCY_STATUS_VALUE.INFERRED || competency.status === COMPETENCY_STATUS_VALUE.ASSERTED;
    });
    const completedList = competencies.filter((competency) => {
      return competency.status === COMPETENCY_STATUS_VALUE.EARNED || competency.status === COMPETENCY_STATUS_VALUE.DEMONSTRATED;
    });
    const masteredCount = masteredList ? masteredList.length : 0;
    const completedCount = completedList ? completedList.length : 0;
    return {
      masteredCompetencies: masteredCount + completedCount,
      inprogressCompetencies: inProgressList ? inProgressList.length : 0,
      inferredCompetencies: masteredCount,
      notstartedCompetencies: notStartedList ? notStartedList.length : 0,
      completedCompetencies: completedCount
    };
  }

  /**
   * @function normalizeDomainTopic
   * Method to normalize the domain topic
   */
  private normalizeDomainTopic(topic) {
    const competencies = sortByNumber(topic.competencies, 'competencySeq', SORTING_TYPES.ascending);
    if (competencies && competencies.length) {
      return competencies.map((competency) => {
        const normaliedCompetency: TopicsCompetencyModel = {
          competencyCode: competency.competencyCode,
          competencyName: competency.competencyName,
          competencySeq: competency.competencySeq,
          competencyDesc: competency.competencyDesc,
          competencyStudentDesc: competency.competencyStudentDesc,
          status: competency.status,
          source: competency.source,
          isSkylineCompetency: false
        };
        return normaliedCompetency;
      });
    }
    return topic;
  }

  /**
   * @function fetchSubjectDomainTopicMetadata
   * Method to fetch the subject domain topic metadata
   */
  public fetchSubjectDomainTopicMetadata(params): Promise<Array<MatrixCoordinatesModel>> {
    const subjectId = params.subject;
    const isOnline = this.utilsService.isNetworkOnline();
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_SUBJECT_DOMAIN_TOPIC_META_DATA, {
      subjectId
    });
    return new Promise((resolve, reject) => {
      if (isOnline) {
        const endpoint = this.getSubjectDomainTopicAPIPath();
        this.httpService.get<Array<MatrixCoordinatesModel>>(endpoint, params).then((res) => {
          const subjectDomainTopicMetadata = this.normalizeSubjectDomainTopicMetadata(res.data);
          this.databaseService.upsertDocument(databaseKey, subjectDomainTopicMetadata);
          resolve(subjectDomainTopicMetadata);
        }, reject);
      } else {
        this.databaseService.getDocument(databaseKey).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function normalizeSubjectDomainTopicMetadata
   * Method to normalize the subject domain metadata
   */
  public normalizeSubjectDomainTopicMetadata(payload) {
    let serializedMetadata: Array<MatrixCoordinatesModel> = [];
    if (payload && payload.domainTopics) {
      serializedMetadata = payload.domainTopics.map((domain) => {
        const normalizedDomain = {
          domainCode: domain.domainCode,
          domainName: domain.domainName,
          domainSeq: domain.domainSeq,
          topics: this.normalizeDomainTopicMetadata(domain),
        };
        return normalizedDomain;
      });
    }
    return serializedMetadata.sort((a, b) => a.domainSeq - b.domainSeq);
  }

  /**
   * @function normalizeDomainTopicMetadata
   * Method to normalize the domain topic metadata
   */
  private normalizeDomainTopicMetadata(domain) {
    let serializedTopicsMetadata!: Array<MatrixCoordinatesTopicsModel>;
    if (domain.topics && domain.topics.length) {
      serializedTopicsMetadata = domain.topics.map((topic) => {
        const normalizedTopicMetadata: MatrixCoordinatesTopicsModel = {
          topicCode: topic.topicCode,
          topicDesc: topic.topicDesc,
          topicName: topic.topicName,
          topicSeq: topic.topicSeq,
          domainCode: domain.domainCode,
          domainSeq: domain.domainSeq,
        };
        return normalizedTopicMetadata;
      });
    }
    return serializedTopicsMetadata;
  }

  /**
   * @function fetchUserSignatureCompetencies
   * This method is used to fetch signature competencies
   */
  public fetchUserSignatureCompetencies(user, subject): Promise<Array<UserSignatureCompetenciesModel>> {
    const endpoint = `${this.namespace}/users/v2/tx/competency/next`;
    const request = { user, subject };
    return this.httpService.get<Array<UserSignatureCompetenciesModel>>(endpoint, request).then((res) => {
      const signatureContent: Array<UserSignatureCompetenciesModel> = res.data;
      return signatureContent;
    });
  }

  /**
   * @function fetchDomainLevelSummary
   * This method is used to fetch domain level summary of a class
   */
  public fetchDomainLevelSummary(filters): Promise<DomainLevelSummaryModel> {
    const classId = filters.classId;
    const isOnline = this.utilsService.isNetworkOnline();
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_COMPETENCY_REPORT, {
      classId
    });
    return new Promise((resolve, reject) => {
        if (isOnline) {
          const endpoint = this.getCompentencyReportAPIPath();
          this.httpService.get<DomainLevelSummaryModel>(endpoint, filters).then((res) => {
            const domainLevelSummary = this.serializeClassCompetencyReport(res.data);
            this.databaseService.upsertDocument(databaseKey, domainLevelSummary);
            resolve(domainLevelSummary);
          }, reject);
        } else {
          this.databaseService.getDocument(databaseKey).then((result) => {
            resolve(result.value);
          }, reject);
        }
    });
  }

  /**
   * @function getDomainLevelSummaryMatrix
   * Method to fetch domain level summary of a class
   */
  public getDomainLevelSummaryMatrix(user, subject, year, month): Promise<Array<CompetencyMatrixModel>> {
    const defaultParams = {
      user,
      subject,
      month,
      year
    };
    const endpoint = `${this.namespace}/users/v2/tx/competency/matrix/domain`;
    return this.httpService.get<Array<CompetencyMatrixModel>>(endpoint, defaultParams).then((res) => {
      return this.normalizeCompetencyMatrix(res.data.userCompetencyMatrix);
    });
  }

  /**
   * @function getCompetencyMatrixCoordinates
   * Method to fetch the competency matrix coordinates
   */
  public getCompetencyMatrixCoordinates(subject): Promise<Array<DomainModel>> {
    const endpoint = `${this.namespace}/users/v2/tx/competency/matrix/coordinates`;
    return this.httpService.get<Array<DomainModel>>(endpoint, subject).then((res) => {
      return this.normalizeCompetencyMatrixCoordinates(res.data.domains);
    });
  }

  /**
   * @function normalizeCompetencyMatrixCoordinates
   * Normalize the competency coordinates
   */
  private normalizeCompetencyMatrixCoordinates(domains) {
    return domains.map((domain) => {
      const domainModel: DomainModel = {
        domainName: domain.domainName,
        domainSeq: domain.domainSeq,
        domainCode: domain.domainCode,
      };
      return domainModel;
    });
  }

  /**
   * @function normalizeCompetencyMatrix
   * Normalize the domain competencies
   */
  private normalizeCompetencyMatrix(competencies) {
    return competencies.map((competency) => {
      const competencyModel: CompetencyMatrixModel = {
        domainCode: competency.domainCode,
        competencies: competency.competencies,
        domainName: competency.domainName,
        domainSeq: competency.domainSeq
      };
      return competencyModel;
    });
  }

  /**
   * @function normalizeDomainCompetencies
   * Method to normalize th domain competencies
   */
  public normalizeDomainCompetencies(domainCompetencies) {
    domainCompetencies = domainCompetencies.sort((domain1, domain2) => domain1.domainSeq - domain2.domainSeq);
    return domainCompetencies.map(domainCompetency => {
      const { topics, ...domain } = domainCompetency;
      domain.competencies = [];
      domain.topics = [];
      topics.map(domainTopic => {
        const { competencies, ...topic } = domainTopic;
        topic.competencies = [];
        competencies.map((competencyData) => {
          let competency;
          competency = competencyData;
          competency.topicCode = topic.topicCode;
          competency.topicName = topic.topicName;
          competency.topicSeq = topic.topicSeq;
          competency.domainName = domain.domainName;
          competency.domainCode = domain.domainCode;
          competency.domainSeq = domain.domainSeq;
          topic.competencies.push(competency);
        });
        topic.competencies = topic.competencies;
        domain.competencies = domain.competencies.concat(topic.competencies);
        domain.topics.push(topic);
      });
      return domain;
    });
  }

  /**
   * @function normalizeStudentCompetencyMatrix
   * Method to normalize the student competency matrix
   */
  public normalizeStudentCompetencyMatrix(students, dtcInfo) {
    const studentsMatrix = [];
    students.map((student, index) => {
      const studentData = {
        id: student.id,
        userCompetencyMatrix: null
      };
      const userCompetencyMatrix = [];
      student.userCompetencyMatrix.map((stuCompMatrix) => {
        const { topics, ...domainData } = dtcInfo.find((dtc) => {
          return dtc.domainCode === stuCompMatrix.domainCode;
        });
        domainData.topics = [];
        domainData.competencies = [];
        const competencyMatrixTopics = stuCompMatrix.topics.sort((topic1, topic2) => topic1.topicSeq - topic2.topicSeq);
        competencyMatrixTopics.map((stuTopic) => {
          const { competencies, ...topicData } = topics.find((topic) => {
            return topic.topicCode === stuTopic.topicCode;
          })
          topicData.competencies = [];
          const studentTopicCompetencies = stuTopic.competencies.sort((competency1, competency2) => competency1.competencySeq - competency2.competencySeq);
          studentTopicCompetencies.map((stuComp) => {
            const competencyData = competencies.find((competencyObj) => {
              return competencyObj.competencyCode === Object.keys(stuComp)[0];
            })
            const competency = {
              topicCode: topicData.topicCode,
              topicSeq: topicData.topicSeq,
              topicName: topicData.topicName,
              domainCode: domainData.domainCode,
              domainName: domainData.domainName,
              domainSeq: domainData.domainSeq,
              competencyStatus: stuComp[competencyData.competencyCode],
              competencyStudentDesc: competencyData.competencyStudentDesc,
              competencyName: competencyData.competencyName,
              competencySeq: competencyData.competencySeq,
              competencyDesc: competencyData.competencyDesc,
              competencyCode: competencyData.competencyCode,
            }
            topicData.competencies.push(competency);
          });
          const sortedCompetencies = topicData.competencies.sort((competency1, competency2) => competency1.competencySeq - competency2.competencySeq);
          topicData.competencies = sortedCompetencies;
          domainData.topics.push(topicData);
          domainData.competencies = domainData.competencies.concat(sortedCompetencies);
        });
        userCompetencyMatrix.push(domainData);
      });
      studentData.userCompetencyMatrix = userCompetencyMatrix.sort((domain1, domain2) => domain1.domainSeq - domain2.domainSeq);
      studentsMatrix.push(studentData);
    });
    return studentsMatrix;
  }

  /**
   * @function serializeClassCompetencyReport
   * Method to serialize the class competency report
   */
  public serializeClassCompetencyReport(payload) {
    if (payload && payload.students) {
      const dtcInfo = payload.domainCompetencies;
      const students = payload.students;
      const serializedReport: DomainLevelSummaryModel = {
        context: payload.context,
        students: [],
        domainCompetencies: this.normalizeDomainCompetencies(dtcInfo)
      };
      const studentsMatrix = this.normalizeStudentCompetencyMatrix(students, dtcInfo);
      serializedReport.students = studentsMatrix;
      return serializedReport;
    }
    return null;
  }

  /**
   * @function normalizeClassCompetencySummary
   * Normalize class Competency
   */
  private normalizeClassCompetencySummary(payload): Array<ClassCompetencySummaryModel> {
    if (!payload.competencyStats.length) {
      return [];
    }
    return payload.competencyStats.map((item) => {
      const classCompetencySummary: ClassCompetencySummaryModel = {
        classId: item.classId,
        completedCompetencies: item.completedCompetencies,
        totalCompetencies: item.totalCompetencies,
        inprogressCompetencies: item.inprogressCompetencies,
        masteredCompetencies: item.masteredCompetencies,
        completionPercentage: calculatePercentage(item.completedCompetencies,
          item.totalCompetencies),
      };
      return classCompetencySummary;
    });
  }

  /**
   * @function fetchLJCompetency
   * method to fetch learning journey competency
   */
  public fetchLJCompetency(params) {
    const endpoint = `${this.namespace}/users/v2/class/learning-journey/studying/competencies`;
    return this.httpService.get<Array<string>>(endpoint, params).then((res) => {
      return res.data.competencies || [];
    });
  }

  /**
   * @function fetchStudentsByCompetency
   * method to fetch students by completency
   */
  public fetchStudentsByCompetency(classId, competency) {
    const endpoint = `${this.namespace}/users/v2/stats/class/competency`;
    const reqParams = {
      classId,
      competency
    };
    return this.httpService.get(endpoint, reqParams).then((res) => {
      return this.normalizeCompetencyForStudents(res.data.data);
    });
  }

  /**
   * @function normalizeCompetencyForStudents
   * method to normalize completency for students
   */
  public normalizeCompetencyForStudents(payload): StudentsCompetencyModel {
    const competency: StudentsCompetencyModel = {
      competencyCode: payload.competency_code,
      description: payload.description,
      displayCode: payload.display_code,
      students: this.normalizeStudentsCompletency(payload.students),
      title: payload.title
    };
    return competency;
  }

  /**
   * @function normalizeStudentsCompletency
   * method to normalize students competency
   */
  public normalizeStudentsCompletency(payload): Array<StudentCompetencyModel> {
    if (!payload.length) {
      return [];
    }
    return payload.map((item) => {
      const basePath = this.session.userSession.cdn_urls.user_cdn_url;
      const thumbnailUrl = item.thumbnail ? basePath + item.thumbnail : null;
      const student: StudentCompetencyModel = {
        firstName: item.first_name,
        lastName: item.last_name,
        score: item.score,
        status: item.status,
        suggestions: item.suggestions,
        thumbnail: thumbnailUrl,
        userId: item.user_id,
        fullName: `${item.first_name} ${item.last_name}`
      };
      return student;
    });
  }

  /**
   * @function storeCompetencyReport
   * This method is used to store competency report
   */
  public storeCompetencyReport(classId, payload) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.CLASS_COMPETENCY_REPORT, {
      classId
    });
    const normalizeCompetencyReportContents = this.serializeClassCompetencyReport(payload);
    this.databaseService.upsertDocument(databaseKey, normalizeCompetencyReportContents);
  }

  /**
   * @function storeSubjectDomainTopicMetaData
   * This method is used to store the subject domain topic meta data
   */
  public storeSubjectDomainTopicMetaData(subjectId, payload) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_SUBJECT_DOMAIN_TOPIC_META_DATA, {
      subjectId
    });
    const normalizeSubjectDomainTopicMetadata = this.normalizeSubjectDomainTopicMetadata(payload);
    this.databaseService.upsertDocument(databaseKey, normalizeSubjectDomainTopicMetadata);
  }

  /**
   * @function storeUserCompetencyMatrix
   * This method is used to store user competency matrix
   */
  public storeUserCompetencyMatrix(userId, subjectId, payload) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.TAXONOMY_USER_COMPETENCY_MATRIX, {
      subjectId,
      userId
    });
    const normalizeDomainTopicMatrix = this.normalizeDomainTopicMatrix(payload);
    return this.databaseService.upsertDocument(databaseKey, {
      data: { domainCompetencyMatrix: normalizeDomainTopicMatrix, userId }
    });
  }
}
