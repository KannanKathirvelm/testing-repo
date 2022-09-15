import { Component, Input, OnInit } from '@angular/core';
import { SearchSuggestionsComponent } from '@app/components/class/search-suggestions/search-suggestions.component';
import { SubjectModel } from '@app/models/taxonomy/taxonomy';
import { ModalService } from '@app/providers/service/modal/modal.service';
import { ModalController } from '@ionic/angular';
import { CompetencyModel, StudentsCompetencyModel } from '@models/competency/competency';
import { CompetencyService } from '@providers/service/competency/competency.service';

@Component({
    selector: 'app-student-standard-list-pull-up',
    templateUrl: './student-standard-list-pull-up.component.html',
    styleUrls: ['./student-standard-list-pull-up.component.scss'],
})
export class StudentStandardListPullUpComponent implements OnInit {
    // -------------------------------------------------------------------------
    // Properties

    @Input() public classId: string;
    @Input() public competency: CompetencyModel;
    @Input() public subject: SubjectModel;
    @Input() public framework: string;
    public searchText: string;
    public studentsCompetency: StudentsCompetencyModel;
    public isLoaded: boolean;
    public class: string;

    // -------------------------------------------------------------------------
    // Dependency Injection

    constructor(
        private competencyService: CompetencyService,
        private modalCtrl: ModalController,
        private modalService: ModalService,
    ) {}

    // -------------------------------------------------------------------------
    // Methods

    public ngOnInit() {
      this.loadStudents();
    }

    /**
     * @function loadStudents
     * Method to load students
     */
    public loadStudents() {
      this.isLoaded = false;
      this.competencyService.fetchStudentsByCompetency(this.classId,this.competency.competencyCode).then((response) => {
          this.studentsCompetency = response;
          this.isLoaded = true;
        });
    }

    /**
     * @function closeModal
     * Method to close modal
     */
    public closeModal() {
        this.modalCtrl.dismiss({ isCloseCompetencyReport: true });
    }

    /**
     * @function handleInputEvent
     * Method to handle input event when search functionality
     */
    public handleInputEvent(event) {
        this.searchText = event.target.value.toLowerCase();
    }

    /**
     * @function onClickSuggestion
     * This Method is used to get suggestion data
     */
    public onClickSuggestion(data) {
      const standardCode = [this.competency.competencyCode];
      const params = {
        studentsPerfomance: [data],
        classId: this.classId,
        standardCode,
        isProgressReport: true,
      };
      this.modalService.openModal(SearchSuggestionsComponent,params,'suggstion-pullup');
    }
}
