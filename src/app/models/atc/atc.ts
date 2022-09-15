export interface ClassMembersDetailModel {
  completedCompetencies: number;
  firstName: string;
  fullName: string;
  grade?: string;
  gradeId?: number;
  group?: number;
  id: string;
  inprogressCompetencies?: number;
  isActive: number;
  lastName: string;
  notStartedCompetencies?: number;
  percentCompletion?: number;
  percentScore: number;
  seq?: number;
  thumbnail: string;
  totalCompetencies?: number;
  xAxis?: string;
  yAxis?: string;
  masteredCompetencies?: number;
  inferredCompetencies?: number;
  competenciesNotStarted?: boolean;
}

export interface TimespentModel {
  assessmentTimespent: number;
  caTimespent: number;
  classTd: string;
  collectionTimespent: number;
  destinationEta: number;
  ljTimespent: number;
  totalTimespent: number;
}

export interface DiagnosticDetailModel {
  domains: Array<DomainModel>;
  highestDomain: DomainCodeModel;
  lowestDomain: DomainCodeModel;
}

export interface DomainCodeModel {
  code: string;
  grade: string;
  title: string;
}

export interface DomainModel {
  code: string;
  sequenceId: number;
  students: Array<StudentDetails>;
  title: string;
}

export interface StudentDetails {
  firstName: string;
  id: string;
  lastName: string;
  level: number;
  startingCompetency: string;
  thumbnail: string;
}

export interface ChartFilterModel {
  name: string;
  filterItems: {
    fetchClassStats?: boolean;
    excludeInferred?: boolean;
  },
  filterKey: string;
}

export interface AtcPerformanceModel {
  assertedCompetencies: number;
  completedCompetencies: number;
  grade: string;
  gradeId: number;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  masteredCompetencies: number;
  percentCompletion: number;
  percentScore: number;
  totalCompetencies: number;
  userId: string;
}

export class NonPremiumAtcPerformance {
  public progress: number;
  public score: number;
  public userId?: string;
  public id?: string;
  public thumbnail?: string;
  public fullName?: string;
  public firstName?: string;
  public xAxis?: number;
  public yAxis?: number;
}

export interface InitialPerformance {
  assertedCompetencies: number;
  completedCompetencies: number;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  masteredCompetencies: number;
  userId: string;
}