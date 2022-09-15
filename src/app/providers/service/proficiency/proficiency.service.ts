import { Injectable } from '@angular/core';
import { COMPETENCY_STATUS_VALUE, SORTING_TYPES } from '@constants/helper-constants';
import { sortByNumber } from '@utils/global';

@Injectable({
  providedIn: 'root'
})
export class ProficiencyService {

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function parseStudentsDomainProficiencyData
   * Method to parse students domain proficiency data
   */
  public parseStudentsDomainProficiencyData(classCompetencyReport, classMembers) {
    const controller = this;
    let highestDomainSize = 0;
    const studentCompetencyData = classCompetencyReport.students;
    const overallDomainCompetenciesReport = [];
    const studentsCompetencyReport = [];
    const competencyInitialCount = this.getCompetencyInitialCount();
    const overallCompetenciesReport = competencyInitialCount;
    classMembers.map((member) => {
      const studentMatrix = studentCompetencyData.find((competency) => {
        return competency.id === member.id;
      });
      const userCompetencyMatrix = studentMatrix.userCompetencyMatrix;
      const studentCompetencyReport = controller.generateStudentData(member);
      userCompetencyMatrix.map((domainMatrix) => {
        highestDomainSize =
          highestDomainSize < domainMatrix.competencies.length
            ? domainMatrix.competencies.length
            : highestDomainSize;
        domainMatrix = this.calculateCompetencyCount(domainMatrix, overallCompetenciesReport);
        studentCompetencyReport.domainCompetencies.push(domainMatrix);
        const overallDomainReport = overallDomainCompetenciesReport.find((domainCompetency) => {
          return domainCompetency.domainCode === domainMatrix.domainCode;
        });
        this.getOverallDomainReport(domainMatrix, overallDomainReport, overallDomainCompetenciesReport);
        return domainMatrix;
      });
      studentsCompetencyReport.push(studentCompetencyReport);
    });
    const numberOfStudents = classMembers.length;
    return {
      studentsDomainPerformance: studentsCompetencyReport,
      domainCoverageCount: overallDomainCompetenciesReport,
      courseCoverageCount: overallCompetenciesReport,
      totalCompetencies: overallCompetenciesReport.total,
      maxNumberOfCompetencies: highestDomainSize,
      numberOfStudents
    };
  }

  /**
   * @function getCompetencyInitialCount
   * Method to get the competency initial count
   */
  public getCompetencyInitialCount() {
    return {
      notStarted: 0,
      inProgress: 0,
      inferred: 0,
      completed: 0,
      mastered: 0,
      total: 0
    };
  }

  /**
   * @function getOverallDomainReport
   * Method to get the over all domain report
   */
  public getOverallDomainReport(domainMatrix, overallDomainReport, overallDomainCompetenciesReport) {
    if (overallDomainReport) {
      overallDomainReport.notStarted =
        overallDomainReport.notStarted +
        domainMatrix.notStarted;
      overallDomainReport.inProgress =
        overallDomainReport.inProgress +
        domainMatrix.inProgress;
      overallDomainReport.mastered =
        overallDomainReport.mastered +
        domainMatrix.mastered;
      overallDomainReport.completed =
        overallDomainReport.completed +
        domainMatrix.completed;
      overallDomainReport.total =
        overallDomainReport.total + domainMatrix.total;
    } else {
      overallDomainReport = {
        notStarted: domainMatrix.notStarted,
        inProgress: domainMatrix.inProgress,
        mastered: domainMatrix.mastered,
        completed: domainMatrix.completed,
        total: domainMatrix.total,
        domainSeq: domainMatrix.domainSeq,
        domainCode: domainMatrix.domainCode,
        domainName: domainMatrix.domainName
      };
      overallDomainCompetenciesReport.push(overallDomainReport);
    }
  }

  /**
   * @function calculateCompetencyCount
   * Method to calculate competency count
   */
  public calculateCompetencyCount(domainMatrix, overallCompetenciesReport) {
    const competencyInitialCount = this.getCompetencyInitialCount();
    domainMatrix = { ...domainMatrix, ...competencyInitialCount };
    domainMatrix.topics.map((topic) => {
      const competencyCount = this.filterCompetenciesByStatus(topic.competencies);
      topic.notStarted = competencyCount.notStartedCount;
      topic.inProgress = competencyCount.inProgressCount;
      topic.inferred = competencyCount.masteredCount;
      topic.completed = competencyCount.completedCount;
      topic.mastered = competencyCount.masteredCount;
      topic.total =
        competencyCount.notStartedCount +
        competencyCount.inProgressCount +
        competencyCount.masteredCount;
      domainMatrix.notStarted += competencyCount.notStartedCount;
      domainMatrix.inProgress += competencyCount.inProgressCount;
      domainMatrix.inferred += competencyCount.masteredCount;
      domainMatrix.completed += competencyCount.completedCount;
      domainMatrix.mastered += competencyCount.masteredCount;
      overallCompetenciesReport.notStarted += competencyCount.notStartedCount;
      overallCompetenciesReport.inProgress += competencyCount.inProgressCount;
      overallCompetenciesReport.inferred += competencyCount.masteredCount;
      overallCompetenciesReport.completed += competencyCount.completedCount;
      overallCompetenciesReport.mastered += competencyCount.masteredCount;
    });
    domainMatrix.total =
      domainMatrix.notStarted +
      domainMatrix.inProgress +
      domainMatrix.mastered;
    overallCompetenciesReport.total =
      overallCompetenciesReport.notStarted +
      overallCompetenciesReport.inProgress +
      overallCompetenciesReport.mastered;
    domainMatrix.competencies.sort((competency1, competency2) => competency2.competencyStatus - competency1.competencyStatus);
    return domainMatrix;
  }

  /**
   * @function filterCompetenciesByStatus
   * Method to filter the competency by status
   */
  public filterCompetenciesByStatus(competencies) {
    const notStartedList = competencies.filter((competency) => {
      return competency.competencyStatus === COMPETENCY_STATUS_VALUE.NOT_STARTED;
    });
    const inProgressList = competencies.filter((competency) => {
      return competency.competencyStatus === COMPETENCY_STATUS_VALUE.IN_PROGRESS;
    });
    const masteredList = competencies.filter((competency) => {
      return competency.competencyStatus >= COMPETENCY_STATUS_VALUE.INFERRED && competency.competencyStatus <= COMPETENCY_STATUS_VALUE.ASSERTED;
    });
    const completedList = competencies.filter((competency) => {
      return competency.competencyStatus >= COMPETENCY_STATUS_VALUE.EARNED && competency.competencyStatus <= COMPETENCY_STATUS_VALUE.DEMONSTRATED;
    });
    const masteredCount = masteredList ? masteredList.length : 0;
    const completedCount = completedList ? completedList.length : 0;
    return {
      notStartedCount: notStartedList ? notStartedList.length : 0,
      inProgressCount: inProgressList ? inProgressList.length : 0,
      masteredCount: masteredCount + completedCount,
      completedCount
    };
  }

  /**
   * @function generateStudentData
   * Method to generate student data structure
   */
  private generateStudentData(student) {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.lastName} ${student.firstName}`,
      id: student.id,
      email: student.email,
      thumbnail: student.avatarUrl,
      username: student.username,
      domainCompetencies: [],
      isShowLearnerData: student.isShowLearnerData
    };
  }

  /**
   * @function parseStudentsDomainCompetencyPerformance
   * Method to parse student proficiency data
   */
  public parseStudentsDomainCompetencyPerformance(domainLevelSummary, classMembers) {
    const domainLevelStudentSummaryData = [];
    let maxCompetencyLength = 0;
    if (domainLevelSummary && classMembers.length) {
      const domainCompetencies = domainLevelSummary.domainCompetencies;
      const studentsDomainCompetencies = domainLevelSummary.students;
      domainCompetencies.map((domainData) => {
        const numberOfCompetencies = domainData.competencies.length;
        maxCompetencyLength =
          numberOfCompetencies > maxCompetencyLength
            ? numberOfCompetencies
            : maxCompetencyLength;
        domainData.competencyLength = numberOfCompetencies;
        const studentLevelDomainCompetencyData = {
          domainData,
          studentCompetencies: null
        };
        const domainCode = domainData.domainCode;
        const parsedStudentCompetenctData = [];
        classMembers.map(student => {
          const studentDomainCompetencies = studentsDomainCompetencies.find((competency) => {
            return competency.id === student.id;
          });
          const userCompetencyMatrix = studentDomainCompetencies ? studentDomainCompetencies.userCompetencyMatrix : {};
          const currentStudentDomainCompetencies = userCompetencyMatrix.find((competency) => {
            return competency.domainCode === domainCode;
          });
          const userCompetencies = currentStudentDomainCompetencies && currentStudentDomainCompetencies.competencies
            ? currentStudentDomainCompetencies.competencies : null;
          const parsedData = this.parseStudentCompetencyData(student, domainData, userCompetencies);
          parsedStudentCompetenctData.push(parsedData);
        });
        studentLevelDomainCompetencyData.studentCompetencies = parsedStudentCompetenctData;
        domainLevelStudentSummaryData.push(studentLevelDomainCompetencyData);
      });
    }
    return domainLevelStudentSummaryData;
  }

  /**
   * @function parseDomainTopicCompetencyData
   * Method to parse domain topic competency data
   */
  public parseDomainTopicCompetencyData(domainTopicMatrix, domainTopicMetadata, crossWalkFWC) {
    const chartData = [];
    let highestTopicSize = 0;
    const skylinePoints = [];
    let totalTopics = 0;
    domainTopicMetadata.forEach((domainMetadata) => {
      const crossWalkFWDomain = crossWalkFWC.find((fwDomain) => {
        return fwDomain.domainCode === domainMetadata.domainCode
      });
      if (crossWalkFWDomain) {
        domainMetadata.fwDomainName = crossWalkFWDomain.fwDomainName;
      }
      const topicSkylinePoints = [];
      const domainMatrix = domainTopicMatrix.find(
        matrix => matrix.domainCode === domainMetadata.domainCode
      );
      const parsedDomainMatrixData = this.parseCrossWalkFWC(domainMatrix, crossWalkFWC);
      let parsedDomainData = {
        ...domainMetadata,
        ...parsedDomainMatrixData
      };
      highestTopicSize =
        highestTopicSize < domainMetadata.topics.length
          ? domainMetadata.topics.length
          : highestTopicSize;
      let domainCompetenciesCount = 0;
      if (domainMatrix && domainMatrix.topics) {
        const parsedDomainTopicData = [];
        totalTopics += domainMatrix.topics.length;
        parsedDomainMatrixData.topics.map(topicMatrix => {
          const crossWalkFWDomainTopic = crossWalkFWC.find(
            fwDomain => fwDomain.domainCode === domainMetadata.domainCode
          );
          if (crossWalkFWDomainTopic) {
            const crossWalkFWDomains = crossWalkFWDomainTopic.competencies.find(
              fwDomain => fwDomain.topicCode === topicMatrix.topicCode
            );
            if (crossWalkFWDomains) {
              topicMatrix.fwTopicName = crossWalkFWDomains.fwTopicName;
            }
          }
          const topicMetadata = domainMetadata.topics.find(
            topic => topic.topicCode === topicMatrix.topicCode
          );
          if (topicMatrix.competencies) {
            const competencies = topicMatrix.competencies.map(competency => {
              (competency.domainCode = domainMetadata.domainCode),
                (competency.domainSeq = domainMetadata.domainSeq),
                (competency.topicCode = topicMatrix.topicCode),
                (competency.topicSeq = topicMatrix.topicSeq),
                (competency.competencyStatus = competency.status);
              competency.isMastered = competency.status > 1;
              competency.isInferred =
                competency.status === 2 || competency.status === 3;
              competency.competencyName = competency.framework
                ? competency.framework.frameworkCompetencyName
                  ? competency.framework.frameworkCompetencyName
                  : competency.competencyName
                : competency.competencyName;
              competency.framework = competency.framework
                ? competency.framework
                : null;
              competency.isMappedWithFramework = competency.isMappedWithFramework
                ? competency.isMappedWithFramework
                : false;
              competency.isSkyLineCompetency = false;
              competency.isGradeBoundary = false;
              return competency
            });
            topicMatrix.competencies = sortByNumber(competencies, 'competencySeq', SORTING_TYPES.ascending);
            topicMatrix.competencies[0].isSkyLineCompetency = true;
          }
          domainCompetenciesCount += topicMatrix.competencies.length;
          topicMatrix = {
            ...topicMatrix,
            ...topicMetadata,
            ...this.groupCompetenciesByStatus(topicMatrix.competencies),
            ...{
              domainCode: domainMetadata.domainCode,
              domainSeq: domainMetadata.domainSeq
            }
          };
          topicSkylinePoints.push({
            topicSeq: topicMatrix.topicSeq,
            skylineCompetencySeq: topicMatrix.masteredCompetencies
          });
          parsedDomainTopicData.push(topicMatrix);
        });
        parsedDomainData.topics = sortByNumber(parsedDomainTopicData, 'topicSeq', SORTING_TYPES.ascending);
      }
      parsedDomainData.totalCompetencies = domainCompetenciesCount;
      parsedDomainData = {
        ...parsedDomainData,
        ...this.groupCompetenciesByTopic(parsedDomainData.topics)
      };
      skylinePoints.push({
        domainSeq: parsedDomainData.domainSeq,
        skylineCompetencySeq: parsedDomainData.masteredCompetencies,
        topicSkylinePoints: sortByNumber(topicSkylinePoints, 'topicSeq', SORTING_TYPES.ascending)
      });
      chartData.push(parsedDomainData);
    });
    sortByNumber(chartData, 'domainSeq', SORTING_TYPES.ascending);
    return chartData;
  }

  /**
   * @function parseCrossWalkFWC
   * Method to parse cross walk fc
   */
  public parseCrossWalkFWC(domainData, crossWalkFWC) {
    if (crossWalkFWC && crossWalkFWC.length) {
      if (domainData) {
        const fwDomain = crossWalkFWC.find((crossWalkDomain) => crossWalkDomain.domainCode === domainData.domainCode);
        if (fwDomain) {
          domainData.topics.map((topic) => {
              const competencies = topic.competencies;
              const fwCompetencies = fwDomain.competencies || [];
              if (fwCompetencies && fwCompetencies.length) {
                return competencies.map(competency => {
                  const fwCompetency = fwCompetencies.find(fwCompetencyItem => {
                    return (
                      fwCompetencyItem.competencyCode === competency.competencyCode
                    );
                  });
                  const isMappedWithFramework = !!fwCompetency;
                  competency.isMappedWithFramework = isMappedWithFramework;
                  if (fwCompetency) {
                    competency.framework = fwCompetency;
                  }
                  return competency;
                });
              }
          });
        }
      }
    }
    return domainData;
  }

  /**
   * @function parseStudentCompetencyData
   * Method to parse student, domain and user competencies data
   */
  private parseStudentCompetencyData(student, domainData, studentDomainCompetencies) {
    const studentDomainCompetencyData = {
      firstName: student.firstName,
      lastName: student.lastName,
      userId: student.id,
      avatarUrl: student.avatarUrl,
      fullName: `${student.lastName} ${student.firstName}`,
      competencies: []
    };
    if (studentDomainCompetencies) {
      const competencies = [];
      domainData.competencies.map((competency) => {
        const studentDomainCompetency =
          studentDomainCompetencies.find((domainCompetency) => domainCompetency.competencyCode === competency.competencyCode);
        const competencyStatus = studentDomainCompetency.competencyStatus || 0;
        const competencyData = {
          domainCode: domainData.domainCode,
          domainName: domainData.domainName,
          topicName: competency.topicName,
          topicSeq: competency.topicSeq,
          topicCode: competency.topicSeq,
          competencyCode: competency.competencyCode,
          competencySeq: competency.competencySeq,
          competencyName: competency.competencyName,
          competencyDesc: competency.competencyDesc,
          competencyStudentDesc: competency.competencyStudentDesc,
          status: competencyStatus,
          competencyStatus
        };
        competencies.push(competencyData);
      });
      studentDomainCompetencyData.competencies = competencies;
    }
    return studentDomainCompetencyData;
  }

  public groupCompetenciesByStatus(competencies) {
    const competenciesCount = {
      completedCompetencies: 0,
      inprogressCompetencies: 0,
      inferredCompetencies: 0,
      notstartedCompetencies: 0,
      masteredCompetencies: 0
    };
    competencies.map(competency => {
      if (competency.status === 0) {
        competenciesCount.notstartedCompetencies++;
      } else if (competency.status === 1) {
        competenciesCount.inprogressCompetencies++;
      } else if (competency.status === 2 || competency.status === 3) {
        competenciesCount.inferredCompetencies++;
        competenciesCount.masteredCompetencies++;
      } else {
        competenciesCount.completedCompetencies++;
        competenciesCount.masteredCompetencies++;
      }
    });
    return competenciesCount;
  }

  public groupCompetenciesByTopic(topics) {
    let masteredCompetencies = 0;
    let inprogressCompetencies = 0;
    let notstartedCompetencies = 0;
    let inferredCompetencies = 0;
    let completedCompetencies = 0;
    topics.map(topic => {
      completedCompetencies += topic.completedCompetencies;
      masteredCompetencies += topic.masteredCompetencies;
      inprogressCompetencies += topic.inprogressCompetencies;
      inferredCompetencies += topic.inferredCompetencies;
      notstartedCompetencies += topic.notstartedCompetencies;
    });
    return {
      completedCompetencies,
      masteredCompetencies,
      inprogressCompetencies,
      notstartedCompetencies,
      inferredCompetencies,
      totalCompetencies:
        completedCompetencies +
        inprogressCompetencies +
        notstartedCompetencies +
        inferredCompetencies
    };
  }
}
