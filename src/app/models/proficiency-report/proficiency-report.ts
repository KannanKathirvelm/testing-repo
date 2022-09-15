export interface StudentsReportModel {
  class: ClassDetailModel;
  course: CourseDetailModel;
  studentsSummaryData?: Array<StudentSummaryDataModel>;
  teacher: TeacherDetailModel;
}

export interface ClassDetailModel {
  activeStudentCount: number;
  code: string;
  grade?: string;
  id: string;
  title: string;
}

export interface CourseDetailModel {
  id: string;
  title: string;
}

export interface TeacherDetailModel {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  profileImage: string;
}

export interface StudentDetailModel {
  email: string;
  firstName: string;
  fullName: string;
  id: string;
  lastName: string;
  thumbnailUrl: string;
}

export interface StudentSummaryDataModel {
  completedCompetencies: Array<CompetencyModel>;
  endDate: string;
  inferredCompetencies: Array<CompetencyModel>;
  inprogressCompetencies: Array<CompetencyModel>;
  interactionData: InteractionDataModel;
  masteredCompetencies: Array<CompetencyModel>;
  startDate: string;
  suggestionData: InteractionDataModel;
  reInForcedMastery: Array<CompetencyModel>;
  summaryData?: SummaryModel;
}

export interface SummaryModel {
  masteredCompetencies: Array<CompetencyModel>;
  completedCompetencies: Array<CompetencyModel>;
  inprogressCompetencies: Array<CompetencyModel>;
}

export interface CompetencyModel {
  id: string;
  code: string;
  status: number;
  contentSource?: string;
}

export interface InteractionDataModel {
  assessmentData: InteractionsModel;
  collectionData: InteractionsModel;
}

export interface InteractionsModel {
  averageScore: number;
  count: number;
  sessionsCount: number;
  totalMaxScore: number;
  totalTimespent: number;
  isNotStarted: boolean;
}

export interface StudentProgressReportModel {
  student: StudentDetailModel;
  weeklyReportData: SummaryDataModel;
}

export interface SummaryDataModel {
  assessmentTimespent: number;
  averageScore: number;
  badgeEarned: number;
  collectionTimespent: number;
  inferredCompetencies: Array<CompetencyModel>;
  inferredCompetenciesCount: number;
  inprogressCompetencies: Array<CompetencyModel>;
  inprogressCompetenciesCount: number;
  isNotStarted: boolean;
  masteredCompetencies: Array<CompetencyModel>;
  masteredCompetenciesCount: number;
  suggestionTaken: number;
  totalTimespent: number;
  reInForcedMastery:Array<CompetencyModel>;
  diagonticsCompetencies?: number;
}

export interface StudentSummaryTimespentModel {
  firstName: string,
  id: string,
  lastName: string,
  thumbnail: string,
  totalAssessmentTimespent: number,
  totalCollectionTimespent: number,
  totalOaTimespent: number
}
