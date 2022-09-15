import { Component, OnInit } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { CONTENT_TYPES, STANDARD_LEVEL } from '@constants/helper-constants';
import { ModalController } from '@ionic/angular';
import { ScopeAndSequenceDomainModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { ClassModel } from '@models/class/class';
import { PrerequisitesModel } from '@models/competency/competency';
import { AudiencesAndEducationalModel, LanguageModel, SearchFilterContextModel } from '@models/lookup/lookup';
import { DiagnostictModel, SubjectModel, TaxonomyFwSubjectContent, TaxonomyGrades, TaxonomyModel } from '@models/taxonomy/taxonomy';
import { ClassService } from '@providers/service/class/class.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { PreferencesService } from '@providers/service/preferences/preferences.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { getCategoryCodeFromSubjectId } from '@utils/global';

@Component({
  selector: 'search-by-filter',
  templateUrl: './search-by-filter.component.html',
  styleUrls: ['./search-by-filter.component.scss'],
})
export class SearchByFilterComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public audiences: Array<AudiencesAndEducationalModel>;
  public languages: Array<LanguageModel>;
  public educationalUses: Array<AudiencesAndEducationalModel>;
  public domains: Array<ScopeAndSequenceDomainModel>;
  public competencies: Array<PrerequisitesModel>;
  public diagnostic: Array<DiagnostictModel>;
  public subjects: Array<SubjectModel>;
  public categories: Array<TaxonomyModel>;
  public taxonomyGrades: Array<TaxonomyFwSubjectContent>;
  public class: ClassModel;
  public classSubject: string;
  public profilePreferences: Array<string>;
  public activeCategory: SubjectModel;
  public frameworkId: string;
  public activeFramework: string;
  public activeSubject: SubjectModel;
  public activeGrade: TaxonomyGrades;
  public activeDomain: ScopeAndSequenceDomainModel;
  public selectedAudiences: Array<AudiencesAndEducationalModel>;
  public selectedLanguages: Array<LanguageModel>;
  public selectedEducationalUses: Array<AudiencesAndEducationalModel>;
  public selectedCompetencies: Array<PrerequisitesModel>;
  public selectedDiagnostic: Array<DiagnostictModel>;
  public contentType: string;
  public showDiagnosticToggle: boolean;
  public isCaBaselineWorkflow: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private preferencesService: PreferencesService,
    private profileService: ProfileService,
    private taxonomyService: TaxonomyService,
    private classService: ClassService,
    private lookupService: LookupService,
    private modalController: ModalController,
    private parseService: ParseService) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.class = this.classService.class;
    this.classSubject = this.class.preference ? this.class.preference.subject : null;
    this.profilePreferences = this.profileService.profilePreferences;
    this.loadUserSelectedData();
  }

  /**
   * @function loadUserSelectedData
   * This method is used to load the user selected filters
   */
  public loadUserSelectedData() {
    const userSelectedFilters = this.lookupService.searchFilterContext;
    if (userSelectedFilters) {
      this.setSelectedFilters(userSelectedFilters);
    } else {
      this.frameworkId = this.getFrameworkId();
      this.fetchCategories();
      this.fetchAudiences();
      this.fetchLanguages();
      this.fetchEducationalUse();
      this.fetchDiagnostic();
    }
    if (this.contentType === CONTENT_TYPES.ASSESSMENT && this.isCaBaselineWorkflow) {
      this.showDiagnosticToggle = true;
    }
  }

  /**
   * @function setSelectedFilters
   * This method is used to set selected filters
   */
  public setSelectedFilters(userSelectedFilters) {
    this.frameworkId = userSelectedFilters.frameworkId;
    this.activeSubject = userSelectedFilters.subject;
    this.activeCategory = userSelectedFilters.category;
    this.activeGrade = userSelectedFilters.grade;
    this.activeDomain = userSelectedFilters.domain;
    this.activeFramework = userSelectedFilters.frameworkId;
    this.selectedCompetencies = userSelectedFilters.competencies;
    this.selectedAudiences = userSelectedFilters.audiences;
    this.selectedLanguages = userSelectedFilters.languages;
    this.selectedEducationalUses = userSelectedFilters.educationalUses;
    this.selectedDiagnostic = userSelectedFilters.diagnostic;
    this.audiences = userSelectedFilters.audiencesContext;
    this.languages = userSelectedFilters.languagesContext;
    this.educationalUses = userSelectedFilters.educationalUsesContext;
    this.domains = userSelectedFilters.domainsContext;
    this.competencies = userSelectedFilters.competenciesContext;
    this.subjects = userSelectedFilters.subjectsContext;
    this.categories = userSelectedFilters.categoriesContext;
    this.taxonomyGrades = userSelectedFilters.taxonomyGradesContext;
    this.diagnostic = userSelectedFilters.diagnosticContext;
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      const defaultCategoryCode = this.classSubject ? getCategoryCodeFromSubjectId(this.classSubject)
        : categories[0].code;
      const defaultCategory = categories.find((category) => {
        return category.code === defaultCategoryCode;
      });
      this.categories = categories;
      this.fetchSubjects(defaultCategory.id);
    });
  }

  /**
   * @function fetchSubjects
   * Method to fetch the subjects
   */
  public fetchSubjects(categoryId) {
    this.preferencesService.fetchClassificationType(categoryId).then((subjects) => {
      this.subjects = subjects;
    });
  }

  /**
   * @function onSelectCategory
   * This method is used to load the data based on the selected category
   */
  public onSelectCategory(category) {
    this.activeCategory = category;
    this.fetchSubjects(category.id);
  }

  /**
   * @function onSelectSubject
   * This method is used to load the data based on the selected subject
   */
  public onSelectSubject(subject) {
    this.frameworkId = this.getFrameworkId(subject.code);
    this.loadTaxonomyGrades(subject);
    this.activeSubject = subject;
  }

  /**
   * @function onSelectFramework
   * This method is used to load the data based on the selected framework
   */
  public onSelectFramework(selectedFramework) {
    this.frameworkId = selectedFramework;
    this.activeFramework = selectedFramework;
    this.loadTaxonomyGrades(this.activeSubject);
  }

  /**
   * @function onSelectGrade
   * This method is used to load the data based on the selected grade
   */
  public async onSelectGrade(selectedGrade) {
    this.setSelectedItems(this.taxonomyGrades, selectedGrade)
    this.activeGrade = selectedGrade;
    const filters = {
      fwCode: this.frameworkId,
      subject: this.activeSubject.code,
      gradeId: selectedGrade.id
    }
    this.domains = await this.taxonomyService.fetchTaxonomyDomains(filters);
    this.activeDomain = null;
  }

  /**
   * @function onSelectDomain
   * This method is used to load the data based on the selected domain
   */
  public async onSelectDomain(selectedDomain) {
    this.activeDomain = selectedDomain;
    this.setSelectedItems(this.domains, selectedDomain)
    this.competencies = await this.taxonomyService.fetchMicroCompetency(this.frameworkId,
      this.activeSubject.code, this.activeGrade.id, selectedDomain.id);
    const competencies = this.competencies.filter((competency) => {
      return competency.codeType === STANDARD_LEVEL;
    });
    this.competencies = competencies;
    this.selectedCompetencies = null;
  }

  /**
   * @function loadTaxonomyGrades
   * Method to taxonomy grades
   */
  private loadTaxonomyGrades(subject) {
    const filters = {
      subject: subject.code,
      fw_code: this.frameworkId
    };
    return this.taxonomyService.fetchTaxonomyCourses(filters)
      .then((taxonomyGrades: Array<TaxonomyFwSubjectContent>) => {
        this.taxonomyGrades = taxonomyGrades.sort((grade1, grade2) => grade1.sequenceId - grade2.sequenceId);
        this.activeGrade = null;
      });
  }

  /**
   * @function getFrameworkId
   * Method to get the frameworkId
   */
  public getFrameworkId(subjectCode?) {
    const classFramework = this.class.preference ? this.class.preference.framework : null;
    return subjectCode && subjectCode !== this.classSubject ? this.profilePreferences[`${subjectCode}`] :
      classFramework ? classFramework : this.profilePreferences[`${this.classSubject}`];
  }

  /**
   * @function fetchAudiences
   * This method is used to fetch audiences
   */
  public async fetchAudiences() {
    this.audiences = await this.lookupService.fetchAudiences();
  }

  /**
   * @function fetchLanguages
   * This method is used to fetch languages
   */
  public async fetchLanguages() {
    this.languages = await this.lookupService.fetchLanguages();
  }

  /**
   * @function fetchEducationalUse
   * This method is used to fetch educational use
   */
  public async fetchEducationalUse() {
    this.educationalUses = await this.lookupService.fetchEducationalUse();
  }

  /**
   * @function fetchDiagnostic
   * This method is used to fetch diagnostic use
   */
  public async fetchDiagnostic() {
    this.diagnostic = [{
      isActive: !this.isCaBaselineWorkflow,
      label: 'Yes'
    }];
  }

  /**
   * @function onSelectAudiences
   * This method is used to select audiences
   */
  public async onSelectAudiences(item) {
    item.isActive = !item.isActive;
    this.selectedAudiences = this.filterSelectedItems(this.audiences);
  }

  /**
   * @function onSelectLanguages
   * This method is used to select languages
   */
  public async onSelectLanguages(item) {
    item.isActive = !item.isActive;
    this.selectedLanguages = this.filterSelectedItems(this.languages);
  }

  /**
   * @function onSelectEducationalUse
   * This method is used to select educational use
   */
  public async onSelectEducationalUse(item) {
    item.isActive = !item.isActive;
    this.selectedEducationalUses = this.filterSelectedItems(this.educationalUses);
  }

  /**
   * @function onSelectCompetency
   * This method is used to select competency
   */
  public async onSelectCompetency(item) {
    item.isActive = !item.isActive;
    this.selectedCompetencies = this.filterSelectedItems(this.competencies);
  }

  /**
   * @function onDiagnosticToggle
   * This method is used to select only diagnostic
   */
  public async onDiagnosticToggle(item) {
    item.isActive = !item.isActive;
    this.selectedDiagnostic = this.filterSelectedItems(this.diagnostic);
  }

  /**
   * @function filterSelectedItems
   * This method to filter selected items
   */
  public filterSelectedItems(items) {
    const selectedItems = items.filter((item) => item.isActive);
    return selectedItems.length ? selectedItems : null;
  }

  /**
   * @function setSelectedItems
   * This method to set selected items
   */
  public setSelectedItems(items, selectedItem) {
    items.forEach((item) => {
      item.isActive = item.id === selectedItem.id;
    });;
  }

  /**
   * @function onClickConfirm
   * This method triggered when the user click the confirm.
   */
  public onClickConfirm() {
    const filters = new SearchFilterContextModel();
    filters.frameworkId = this.activeFramework;
    filters.subject = this.activeSubject;
    filters.category = this.activeCategory;
    filters.grade = this.activeGrade;
    filters.domain = this.activeDomain;
    filters.competencies = this.selectedCompetencies;
    filters.audiences = this.selectedAudiences;
    filters.languages = this.selectedLanguages;
    filters.educationalUses = this.selectedEducationalUses;
    filters.diagnostic = this.selectedDiagnostic;
    const context = this.getSearchFilterContext(filters);
    this.lookupService.storeSearchFilterContext(context);
    this.onClosePullUp(filters);
    this.parseService.trackEvent(EVENTS.CLICK_CA_APPLY_FILTER);
  }

  /**
   * @function getSearchFilterContext
   * This method used to get search filter context
   */
  public getSearchFilterContext(filters) {
    let context = new SearchFilterContextModel();
    context = { ...filters };
    context.audiencesContext = this.audiences;
    context.languagesContext = this.languages;
    context.educationalUsesContext = this.educationalUses;
    context.domainsContext = this.domains;
    context.competenciesContext = this.competencies;
    context.subjectsContext = this.subjects;
    context.categoriesContext = this.categories;
    context.taxonomyGradesContext = this.taxonomyGrades;
    context.diagnosticContext = this.diagnostic;
    return context;
  }

  /**
   * @function onClickCancel
   * This method triggered when the user click cancel
   */
  public onClickCancel() {
    this.lookupService.storeSearchFilterContext(null);
    this.onClosePullUp({ isCancel: true });
  }

  /**
   * @function onClosePullUp
   * This method triggered when the user close the model
   */
  public onClosePullUp(params?) {
    this.modalController.dismiss(params);
  }
}
