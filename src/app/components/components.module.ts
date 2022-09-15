import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { AccountExistsPullupComponent } from '@components/account-exists-pull-up/account-exists-pull-up.component';
import { AtcCaProgressComponent } from '@components/class/atc/atc-ca-progress/atc-ca-progress.component';
import { AtcCalendarComponent } from '@components/class/atc/atc-calendar/atc-calendar.component';
import { AtcChartViewComponent } from '@components/class/atc/atc-chart-view/atc-chart-view.component';
import { AtcClassProgressComponent } from '@components/class/atc/atc-class-progress/atc-class-progress.component';
import { AtcDataByMilestoneComponent } from '@components/class/atc/atc-data-by-milestone/atc-data-by-milestone.component';
import { AtcDiagnosticReportComponent } from '@components/class/atc/atc-diagnostic-report/atc-diagnostic-report.component';
import { AtcLearningStrugglesPanelComponent } from '@components/class/atc/atc-learning-struggles/atc-learning-struggles-panel.component';
import { AtcOpportunitiesForGrowthComponent } from '@components/class/atc/atc-opportunities-for-growth/atc-opportunities-for-growth.component';
import { ATCStudentListReportComponent } from '@components/class/atc/atc-student-list-report/atc-student-list-report.component';
import { ATCStudentPerformanceReportComponent } from '@components/class/atc/atc-student-performance-report/atc-student-performance-report.component';
import { AtcStudentProgressComponent } from '@components/class/atc/atc-student-progress/atc-student-progress.component';
import { NonPremiumAtcChartViewComponent } from '@components/class/atc/non-premium-atc-chart-view/non-premium-atc-chart-view.component';
import { LearningChallengesPullUpComponent } from '@components/class/atc/pullups/learning-challenges/learning-challenges.component';
import { LearningGapsPullUpComponent } from '@components/class/atc/pullups/learning-gaps-pullup/learning-gaps-pullup.component';
import { AddDataAssessmentComponent } from '@components/class/class-activity/add-data/add-data-assessment/add-data-assessment.component';
import { AddDataCollectionComponent } from '@components/class/class-activity/add-data/add-data-collection/add-data-collection.component';
import { AddDataContentComponent } from '@components/class/class-activity/add-data/add-data-content/add-data-content.component';
import { AssignActivityCardComponent } from '@components/class/class-activity/assign-activity/assign-activity-card/assign-activity-card.component';
import { AssignActivityComponent } from '@components/class/class-activity/assign-activity/assign-activity.component';
import { CreateMeetingActivityComponent } from '@components/class/class-activity/assign-activity/create-meeting-activity/create-meeting-activity.component';
import { DefaultScopeAndSequenceComponent } from '@components/class/class-activity/assign-activity/default-scope-and-sequence/default-scope-and-sequence.component';
import { DefaultViewComponent } from '@components/class/class-activity/assign-activity/default-view/default-view.component';
import { ScopeAndSequenceComponent } from '@components/class/class-activity/assign-activity/scope-and-sequence/scope-and-sequence.component';
import { CaAssignCalenderComponent } from '@components/class/class-activity/ca-assign-calender/ca-assign-calender.component';
import { CaCalendarComponent } from '@components/class/class-activity/ca-calendar/ca-calendar.component';
import { CaStudentListComponent } from '@components/class/class-activity/ca-student-list/ca-student-list.component';
import { CaVideoConferenceComponent } from '@components/class/class-activity/ca-video-conference/ca-video-conference.component';
import { CalenderNavbarComponent } from '@components/class/class-activity/calender-navbar/calender-navbar.component';
import { ClassActivityCardComponent } from '@components/class/class-activity/class-activity-card/class-activity-card.component';
import { ClassActivityListItemComponent } from '@components/class/class-activity/class-activity-list-item/class-activity-list-item.component';
import { CategoryWithScoreComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/categories/category-with-score/category-with-score.component';
import { CategoryWithoutScoreComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/categories/category-without-score/category-without-score.component';
import { NumberIncrementComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/categories/number-increment/number-increment.component';
import { ScorePointComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/categories/score-point/score-point.component';
import { FrqGradingReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/frq-grading-report/frq-grading-report.component';
import { FrqQuestionAnswerComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/frq-grading-report/frq-question-answer/frq-question-answer.component';
import { GradingReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/grading-report.component';
import { OaGradingReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/oa-grading-report/oa-grading-report.component';
import { RubricReportComponent } from '@components/class/class-activity/items-to-grade-panel/grading-report/rubric-report/rubric-report.component';
import { ItemsToGradePanelComponent } from '@components/class/class-activity/items-to-grade-panel/items-to-grade-panel.component';
import { MeetingActivitiesComponent } from '@components/class/class-activity/meeting-activities/meeting-activities.component';
import { ClassNavbarComponent } from '@components/class/class-navbar/class-navbar.component';
import { AddClassCollaboratorsComponent } from '@components/class/class-settings/add-class-collaborators/add-class-collaborators.component';
import { AddClassMembersComponent } from '@components/class/class-settings/add-class-members/add-class-members.component';
import { DeleteOrArchiveClassComponent } from '@components/class/class-settings/delete-or-archive-class/delete-or-archive-class.component';
import { DeleteStudentAlertComponent } from '@components/class/class-settings/delete-student-alert/delete-student-alert.component';
import { StudentGradeSelectComponent } from '@components/class/class-settings/student-grade-select/student-grade-select.component';
import { StudentListComponent } from '@components/class/class-settings/student-list/student-list.component';
import { TeacherListComponent } from '@components/class/class-settings/teacher-list/teacher-list.component';
import { CourseMapComponent } from '@components/class/course-map/course-map.component';
import { CreateClassroomComponent } from '@components/class/create-classroom/create-classroom.component';
import { ItemsToGradeListComponent } from '@components/class/items-to-grade-list/items-to-grade-list.component';
import { JourneyStudentListComponent } from '@components/class/journey-student-list/journey-student-list.component';
import { LessonPlanListsComponent } from '@components/class/milestone/lesson-plan/lesson-plan-list/lesson-plan-list.component';
import { LessonPlanSessionsComponent } from '@components/class/milestone/lesson-plan/lesson-plan-session/lesson-plan-session.component';
import { LessonPlanComponent } from '@components/class/milestone/lesson-plan/lesson-plan.component';
import { MilestoneComponent } from '@components/class/milestone/milestone.component';
import { NotificationPanelComponent } from '@components/class/notification/notification-panel/notification-panel.component';
import { NotificationComponent } from '@components/class/notification/notification.component';
import { AggregatedScorePanelComponent } from '@components/class/reports/aggregated-score-panel/aggregated-score-panel.component';
import { AssessmentSummaryReportComponent } from '@components/class/reports/assessment-summary-report/assessment-summary-report.component';
import { CaStudentsAggregatedReportComponent } from '@components/class/reports/ca-students-aggregated-report/ca-students-aggregated-report.component';
import { CollectionSummaryReportComponent } from '@components/class/reports/collection-summary-report/collection-summary-report.component';
import { ContentReportComponent } from '@components/class/reports/content-report/content-report.component';
import { CourseMapLessonReportComponent } from '@components/class/reports/course-map-lesson-report/course-map-lesson-report.component';
import { CourseMapReportComponent } from '@components/class/reports/course-map-report/course-map-report.component';
import { CourseMapUnitReportComponent } from '@components/class/reports/course-map-unit-report/course-map-unit-report.component';
import { MilestoneCollectionReportComponent } from '@components/class/reports/milestone-collection-report/milestone-collection-report.component';
import { MilestoneCourseReportComponent } from '@components/class/reports/milestone-course-report/milestone-course-report.component';
import { MilestoneLessonReportComponent } from '@components/class/reports/milestone-lesson-report/milestone-lesson-report.component';
import { MilestoneReportComponent } from '@components/class/reports/milestone-report/milestone-report.component';
import { OfflineActivityContentReportComponent } from '@components/class/reports/offline-activity-content-report/offline-activity-content-report.component';
import { OfflineActivityReportComponent } from '@components/class/reports/offline-activity-report/offline-activity-report.component';
import { OfflineActivitySummaryReportComponent } from '@components/class/reports/offline-activity-summary-report/offline-activity-summary-report.component';
import { StudentAssessmentReportComponent } from '@components/class/reports/student-assessment-report/student-assessment-report.component';
import { StudentCollectionReportComponent } from '@components/class/reports/student-collection-report/student-collection-report.component';
import { SearchSuggestionsComponent } from '@components/class/search-suggestions/search-suggestions.component';
import { TenantLibraryComponent } from '@components/class/tenant-library/tenant-library.component';
import { IncompleteClassroomsComponent } from '@components/incomplete-classrooms/incomplete-classrooms.component';
import { OaStudentListComponent } from '@components/offline-activity/oa-student-list/oa-student-list.component';
import { OaTaskSubmissionsComponent } from '@components/offline-activity/oa-task-submissions/oa-task-submissions.component';
import { OfflineMessagePreviewComponent } from '@components/offline-message-preview/offline-message-preview.component';
import { DownloadItemComponent } from '@components/offline/download-item/download-item.component';
import { DragAndDropComponent } from '@components/player/questions/drag-and-drop/drag-and-drop.component';
import { FillInTheBlanksComponent } from '@components/player/questions/fill-in-the-blanks/fill-in-the-blanks.component';
import { HotTextHighlightComponent } from '@components/player/questions/hot-text-highlight/hot-text-highlight.component';
import { MultipleAnswerComponent } from '@components/player/questions/multiple-answer/multiple-answer.component';
import { MultipleChoiceComponent } from '@components/player/questions/multiple-choice/multiple-choice.component';
import { MultipleSelectImageComponent } from '@components/player/questions/multiple-select-image/multiple-select-image.component';
import { MultipleSelectTextComponent } from '@components/player/questions/multiple-select-text/multiple-select-text.component';
import { QUESTIONS } from '@components/player/questions/questions.import';
import { TrueOrFalseComponent } from '@components/player/questions/true-or-false/true-or-false.component';
import { AudioResourceComponent } from '@components/player/resources/audio-resource/audio-resource.component';
import { ImageResourceComponent } from '@components/player/resources/image-resource/image-resource.component';
import { InteractiveResourceComponent } from '@components/player/resources/interactive-resource/interactive-resource.component';
import { RESOURCES } from '@components/player/resources/resources.import';
import { TextResourceComponent } from '@components/player/resources/text-resource/text-resource.component';
import { VideoResourceComponent } from '@components/player/resources/video-resource/video-resource.component';
import { WebpageResourceComponent } from '@components/player/resources/webpage-resource/webpage-resource.component';
import { PortfolioCalendarComponent } from '@components/portfolio/portfolio-calendar/portfolio-calendar.component';
import { PortfolioContentCardComponent } from '@components/portfolio/portfolio-content-card/portfolio-content-card.component';
import { PortfolioComponent } from '@components/portfolio/portfolio/portfolio.component';
import { ClassStatisticsComponent } from '@components/proficiency/class-statistics/class-statistics.component';
import { CompetencyInfoComponent } from '@components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainCompetenciesComponent } from '@components/proficiency/domain-competency-progress-bar/domain-competency-progress-bar.component';
import { DomainCoveragePanelComponent } from '@components/proficiency/domain-coverage-panel/domain-coverage-panel.component';
import { DomainInfoComponent } from '@components/proficiency/domain-info/domain-info.component';
import { LearningMapActivityPullUpComponent } from '@components/proficiency/learning-map/learning-map-activity-pull-up/learning-map-activity-pull-up.component';
import { LearningMapPanelComponent } from '@components/proficiency/learning-map/learning-map-panel/learning-map-panel.component';
import { LegendPullUpComponent } from '@components/proficiency/legend-pull-up/legend-pull-up.component';
import { MetaDataComponent } from '@components/proficiency/metadata/metadata.component';
import { ProficiencyChartComponent } from '@components/proficiency/proficiency-chart/proficiency-chart.component';
import { StandardDomainPanelComponent } from '@components/proficiency/standard-domain-panel/standard-domain-panel.component';
import { StudentClassProficiencyCardComponent } from '@components/proficiency/student-class-proficiency-card/student-class-proficiency-card.component';
import { StudentClassProficiencyChartComponent } from '@components/proficiency/student-class-proficiency-chart/student-class-proficiency-chart.component';
import { StudentDomainCompetenciesComponent } from '@components/proficiency/student-competency-progress-bar/student-competency-progress-bar.component';
import { StudentDomainCompetencyPerformancePanelComponent } from '@components/proficiency/student-domain-competency-performance-panel/student-domain-competency-performance-panel.component';
import { StudentDomainPerformancePanelComponent } from '@components/proficiency/student-domain-performance-panel/student-domain-performance-panel.component';
import { StudentStandardListPullUpComponent } from '@components/proficiency/student-standard-list-pull-up/student-standard-list-pull-up.component';
import { TopicInfoComponent } from '@components/proficiency/topic-info/topic-info.component';
import { GeneralPreferenceComponent } from '@components/profile/general-preference/general-preference.component';
import { LanguagePreferenceComponent } from '@components/profile/language-preference/language-preference.component';
import { PreferencesCategoryPanelComponent } from '@components/profile/preferences-category-panel/preferences-category-panel.component';
import { PreferencesFrameworkPanelComponent } from '@components/profile/preferences-framework-panel/preferences-framework-panel.component';
import { PullUpWithDynamicHeightComponent } from '@components/pullup-with-dynamic-height/pullup-with-dynamic-height.component';
import { ReadMoreComponent } from '@components/read-more/read-more.component';
import { SearchByFilterPanelComponent } from '@components/search/search-by-filter-panel/search-by-filter-panel.component';
import { SearchByFilterSubjectPanelComponent } from '@components/search/search-by-filter-subject-panel/search-by-filter-subject-panel.component';
import { SearchByFilterTaxonomyPanelComponent } from '@components/search/search-by-filter-taxonomy-panel/search-by-filter-taxonomy-panel.component';
import { SearchByFilterComponent } from '@components/search/search-by-filter/search-by-filter.component';
import { StudentMilestoneComponent } from '@components/student/milestone/milestone.component';
import { ShowAttemptComponent } from '@components/student/milestone/show-attempt/show-attempt.component';
import { SuggestionPanelComponent } from '@components/suggestion/suggestion-panel/suggestion-panel.component';
import { SuggestionPopUpComponent } from '@components/suggestion/suggestion-pop-up/suggestion-pop-up.component';
import { TaxonomyListComponent } from '@components/taxonomy-list/taxonomy-list.component';
import { ClassroomComponent } from '@components/teacher-home/classroom/classroom.component';
import { NonPremiumClassComponent } from '@components/teacher-home/classroom/non-premium-class/non-premium-class.component';
import { PremiumClassComponent } from '@components/teacher-home/classroom/premium-class/premium-class.component';
import { AllowAccessComponent } from '@components/UI/allow-access/allow-access.component';
import { AudioPlayerComponent } from '@components/UI/audio-player/audio-player.component';
import { AudioRecorderComponent } from '@components/UI/audio-recorder/audio-recorder.component';
import { CaMaxScoreComponent } from '@components/UI/ca-max-score/ca-max-score.component';
import { CalenderComponent } from '@components/UI/calender/calender.component';
import { CustomAlertComponent } from '@components/UI/custom-alert/custom-alert.component';
import { NavInputEmailComponent } from '@components/UI/inputs/nav-input-email/nav-input-email.component';
import { NavInputPasswordComponent } from '@components/UI/inputs/nav-input-password/nav-input-password.component';
import { NavInputTextComponent } from '@components/UI/inputs/nav-input-text/nav-input-text.component';
import { SelectWithSearchBarComponent } from '@components/UI/inputs/select-with-search-bar/select-with-search-bar.component';
import { MathjaxComponent } from '@components/UI/mathjax/mathjax.component';
import { StudentListPopoverComponent } from '@components/UI/popover/student-list-popover/student-list-popover.component';
import { TaxonomyPopoverComponent } from '@components/UI/popover/taxonomy-popover/taxonomy-popover.component';
import { StudentPullUpComponent } from '@components/UI/pull-up/student-pull-up/student-pull-up.component';
import { TimepickerComponent } from '@components/UI/timepicker/timepicker.component';
import { MilestoneHeaderComponent } from '@components/UI/toggle/milestone-header/milestone-header.component';
import { YoutubePlayerFullscreenComponent } from '@components/UI/youtube-player-fullscreen/youtube-player-fullscreen.component';
import { YoutubePlayerComponent } from '@components/UI/youtube-player/youtube-player.component';
import { ApplicationDirectivesModule } from '@directives/application-directives.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { DragulaModule } from 'ng2-dragula';
import { AvatarModule } from 'ngx-avatar';
import { CalendarModule } from 'primeng/calendar';
import { AddCourseCardComponent } from './add-course-card/add-course-card.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { ArchivedClassroomsComponent } from './archived-classrooms/archived-classrooms.component';
import { InitialSkylineLocationComponent } from './class/atc/initial-skyline-location/initial-skyline-location.component';
import { ChangePasswordComponent } from '@components/change-password/change-password.component';
import { CourseSearchPullUpComponent } from './course-search-pull-up/course-search-pull-up.component';
import { DiagnosticReportComponent } from './diagnostic-report/diagnostic-report.component';
import { EvidenceFileUploadComponent } from './evidence-file-upload/evidence-file-upload.component';
import { OfflineActivityGradingComponent } from './grading/offline-activity-grading/offline-activity-grading.component';
import { NavFilePickerComponent } from './nav-file-picker/nav-file-picker.component';
import { OaMultiStudentReportComponent } from './oa-multi-student-report/oa-multi-student-report.component';
import { OfflineActivityTaskComponent } from './offline-activity-task/offline-activity-task.component';
import { StudentClassProgressReportComponent } from './student-class-progress-report/student-class-progress-report.component';
import { StudentOfflineActivityContentReportComponent } from './student-offline-activity-content-report/student-offline-activity-content-report.component';
import { StudentOfflineActivityReportComponent } from './student-offline-activity-report/student-offline-activity-report.component';
import { SyncProgressBarComponent } from './sync-progress-bar/sync-progress-bar.component';

const PAGES_COMPONENTS = [
  AtcCalendarComponent,
  StudentGradeSelectComponent,
  DeleteOrArchiveClassComponent,
  DeleteStudentAlertComponent,
  NonPremiumAtcChartViewComponent,
  CourseMapLessonReportComponent,
  CourseMapUnitReportComponent,
  MilestoneLessonReportComponent,
  MilestoneCollectionReportComponent,
  MilestoneReportComponent,
  CourseMapReportComponent,
  MilestoneCourseReportComponent,
  ShowAttemptComponent,
  NotificationPanelComponent,
  NotificationComponent,
  SearchByFilterTaxonomyPanelComponent,
  SearchByFilterSubjectPanelComponent,
  SearchByFilterPanelComponent,
  SearchByFilterComponent,
  AddDataCollectionComponent,
  TopicInfoComponent,
  ATCStudentListReportComponent,
  ATCStudentPerformanceReportComponent,
  PullUpWithDynamicHeightComponent,
  AtcChartViewComponent,
  AtcDiagnosticReportComponent,
  AtcClassProgressComponent,
  AtcDataByMilestoneComponent,
  AtcStudentProgressComponent,
  AtcCaProgressComponent,
  AtcOpportunitiesForGrowthComponent,
  StudentDomainCompetencyPerformancePanelComponent,
  DomainCoveragePanelComponent,
  StudentDomainCompetenciesComponent,
  StudentDomainPerformancePanelComponent,
  DomainCompetenciesComponent,
  TaxonomyPopoverComponent,
  StudentListPopoverComponent,
  TaxonomyListComponent,
  LearningMapActivityPullUpComponent,
  SuggestionPanelComponent,
  SuggestionPopUpComponent,
  MetaDataComponent,
  LegendPullUpComponent,
  CompetencyInfoComponent,
  DomainInfoComponent,
  LearningMapPanelComponent,
  PortfolioComponent,
  PortfolioContentCardComponent,
  StudentClassProficiencyChartComponent,
  StudentClassProficiencyCardComponent,
  NavInputTextComponent,
  NavInputPasswordComponent,
  NavInputEmailComponent,
  ClassroomComponent,
  TeacherListComponent,
  StudentListComponent,
  AddClassMembersComponent,
  AddClassCollaboratorsComponent,
  PremiumClassComponent,
  ClassNavbarComponent,
  PreferencesCategoryPanelComponent,
  LanguagePreferenceComponent,
  GeneralPreferenceComponent,
  PreferencesFrameworkPanelComponent,
  AtcLearningStrugglesPanelComponent,
  SelectWithSearchBarComponent,
  ProficiencyChartComponent,
  CourseMapComponent,
  CreateClassroomComponent,
  RubricReportComponent,
  SelectWithSearchBarComponent,
  MilestoneComponent,
  LessonPlanComponent,
  LessonPlanListsComponent,
  LessonPlanSessionsComponent,
  CalenderComponent,
  ClassStatisticsComponent,
  JourneyStudentListComponent,
  ItemsToGradeListComponent,
  NonPremiumClassComponent,
  StudentMilestoneComponent,
  StudentPullUpComponent,
  MilestoneHeaderComponent,
  CaCalendarComponent,
  CalenderNavbarComponent,
  ClassActivityCardComponent,
  ClassActivityListItemComponent,
  CaStudentsAggregatedReportComponent,
  StudentAssessmentReportComponent,
  StudentCollectionReportComponent,
  ContentReportComponent,
  AssessmentSummaryReportComponent,
  CollectionSummaryReportComponent,
  DiagnosticReportComponent,
  AggregatedScorePanelComponent,
  DragAndDropComponent,
  MultipleAnswerComponent,
  MultipleChoiceComponent,
  FillInTheBlanksComponent,
  MultipleSelectTextComponent,
  MultipleSelectImageComponent,
  TextResourceComponent,
  WebpageResourceComponent,
  VideoResourceComponent,
  ReadMoreComponent,
  YoutubePlayerComponent,
  YoutubePlayerFullscreenComponent,
  InteractiveResourceComponent,
  ImageResourceComponent,
  AudioResourceComponent,
  TrueOrFalseComponent,
  HotTextHighlightComponent,
  MathjaxComponent,
  CaStudentListComponent,
  PortfolioCalendarComponent,
  ItemsToGradePanelComponent,
  OaGradingReportComponent,
  OaTaskSubmissionsComponent,
  OaStudentListComponent,
  AssignActivityComponent,
  DefaultScopeAndSequenceComponent,
  AssignActivityCardComponent,
  CaAssignCalenderComponent,
  GradingReportComponent,
  FrqGradingReportComponent,
  GradingReportComponent,
  NumberIncrementComponent,
  CategoryWithScoreComponent,
  CategoryWithoutScoreComponent,
  ScorePointComponent,
  FrqQuestionAnswerComponent,
  CustomAlertComponent,
  LearningChallengesPullUpComponent,
  LearningGapsPullUpComponent,
  SearchSuggestionsComponent,
  TenantLibraryComponent,
  CaAssignCalenderComponent,
  TimepickerComponent,
  AddDataAssessmentComponent,
  AddDataContentComponent,
  CaMaxScoreComponent,
  OfflineActivityReportComponent,
  OfflineActivitySummaryReportComponent,
  OfflineActivityContentReportComponent,
  AccountExistsPullupComponent,
  CaVideoConferenceComponent,
  AllowAccessComponent,
  AudioRecorderComponent,
  AudioPlayerComponent,
  MeetingActivitiesComponent,
  CreateMeetingActivityComponent,
  ScopeAndSequenceComponent,
  DefaultViewComponent,
  StudentStandardListPullUpComponent,
  StandardDomainPanelComponent,
  IncompleteClassroomsComponent,
  ArchivedClassroomsComponent,
  EvidenceFileUploadComponent,
  OfflineMessagePreviewComponent,
  DownloadItemComponent,
  StudentOfflineActivityReportComponent,
  StudentOfflineActivityContentReportComponent,
  OfflineActivityTaskComponent,
  OfflineActivityGradingComponent,
  NavFilePickerComponent,
  OaMultiStudentReportComponent,
  SyncProgressBarComponent,
  StudentClassProgressReportComponent,
  AddCourseComponent,
  ChangePasswordComponent,
  AddCourseCardComponent,
  CourseSearchPullUpComponent,
  InitialSkylineLocationComponent,
  QUESTIONS,
  RESOURCES
];

@NgModule({
  declarations: [PAGES_COMPONENTS],
  entryComponents: [
    CourseMapLessonReportComponent,
    CourseMapUnitReportComponent,
    MilestoneLessonReportComponent,
    MilestoneCollectionReportComponent,
    MilestoneReportComponent,
    CourseMapReportComponent,
    MilestoneCourseReportComponent,
    SearchByFilterComponent,
    SelectWithSearchBarComponent,
    CalenderComponent,
    JourneyStudentListComponent,
    StudentPullUpComponent,
    CaStudentListComponent,
    PortfolioCalendarComponent,
    AddClassCollaboratorsComponent,
    AssignActivityComponent,
    CaAssignCalenderComponent,
    GradingReportComponent,
    ScorePointComponent,
    SearchSuggestionsComponent,
    CaAssignCalenderComponent,
    AddDataCollectionComponent,
    AddDataAssessmentComponent,
    OfflineActivityReportComponent,
    CaVideoConferenceComponent,
    AllowAccessComponent,
    StudentClassProgressReportComponent,
    QUESTIONS,
    RESOURCES
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AvatarModule,
    ApplicationPipesModule,
    ApplicationDirectivesModule,
    CalendarModule,
    MatExpansionModule,
    DragulaModule
  ],
  exports: [
    PAGES_COMPONENTS
  ]
})
export class ComponentsModule { }
